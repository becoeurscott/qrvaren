-- Moves the card billing rules out of the webhook trigger into a function that can be run on its own
-- (payments.webhook_events is managed and can't receive test rows). Behavior is unchanged.

CREATE OR REPLACE FUNCTION public.apply_card_billing_event(
  p_provider TEXT, p_environment TEXT, p_event_id TEXT, p_event_type TEXT, p_payload JSONB
)
RETURNS TEXT
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
DECLARE
  o JSONB := p_payload -> 'data' -> 'object';
  v_type TEXT;
  v_user TEXT;
  v_end BIGINT;
  v_interval TEXT;
  v_grace INT;
  v_rows INT;
BEGIN
  IF p_provider <> 'stripe' OR p_event_type NOT IN ('invoice.paid', 'customer.subscription.deleted', 'customer.subscription.updated') THEN
    RETURN 'ignored';
  END IF;

  -- Billing subject: subscription metadata on the event first, then the customer mapping.
  v_type := COALESCE(o -> 'parent' -> 'subscription_details' -> 'metadata' ->> 'insforge_subject_type',
                     o -> 'metadata' ->> 'insforge_subject_type');
  v_user := COALESCE(o -> 'parent' -> 'subscription_details' -> 'metadata' ->> 'insforge_subject_id',
                     o -> 'metadata' ->> 'insforge_subject_id');
  IF v_user IS NULL THEN
    SELECT m.subject_type, m.subject_id INTO v_type, v_user
    FROM payments.customer_mappings m
    WHERE m.provider = p_provider AND m.environment = p_environment AND m.provider_customer_id = o ->> 'customer';
  END IF;
  IF v_user IS NULL OR v_type IS DISTINCT FROM 'user' THEN
    INSERT INTO public.billing_dead_letters (provider_event_id, event_type, reason) VALUES (p_event_id, p_event_type, 'no user billing subject');
    RETURN 'dead_letter';
  END IF;

  IF p_event_type = 'invoice.paid' THEN
    v_end := (o -> 'lines' -> 'data' -> 0 -> 'period' ->> 'end')::BIGINT;
    v_interval := COALESCE(o -> 'lines' -> 'data' -> 0 -> 'pricing' -> 'price_details' ->> 'interval',
                           o -> 'lines' -> 'data' -> 0 -> 'price' -> 'recurring' ->> 'interval');
    UPDATE public.cards SET
      status = CASE WHEN status = 'hidden' THEN 'hidden' ELSE 'active' END,
      plan = CASE WHEN v_interval = 'year' THEN 'yearly' WHEN v_interval = 'month' THEN 'monthly' ELSE plan END,
      paid_until = CASE WHEN v_end IS NOT NULL THEN to_timestamp(v_end) ELSE paid_until END,
      suspended_at = NULL,
      expires_at = NULL
    WHERE owner_id::text = v_user;
    GET DIAGNOSTICS v_rows = ROW_COUNT;
    RETURN CASE WHEN v_rows > 0 THEN 'activated' ELSE 'no_card' END;
  ELSIF p_event_type = 'customer.subscription.deleted'
     OR (p_event_type = 'customer.subscription.updated' AND o ->> 'status' IN ('canceled', 'unpaid', 'incomplete_expired')) THEN
    SELECT COALESCE((value #>> '{}')::INT, 30) INTO v_grace FROM public.settings WHERE key = 'card.grace_days';
    UPDATE public.cards SET
      status = CASE WHEN status = 'active' THEN 'suspended' ELSE status END,
      suspended_at = COALESCE(suspended_at, NOW()),
      expires_at = COALESCE(expires_at, NOW() + make_interval(days => COALESCE(v_grace, 30)))
    WHERE owner_id::text = v_user AND status IN ('active', 'draft');
    GET DIAGNOSTICS v_rows = ROW_COUNT;
    RETURN CASE WHEN v_rows > 0 THEN 'suspended' ELSE 'no_card' END;
  END IF;
  RETURN 'ignored';
END $$;
REVOKE ALL ON FUNCTION public.apply_card_billing_event(TEXT, TEXT, TEXT, TEXT, JSONB) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.card_billing_from_stripe()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
BEGIN
  IF NEW.processing_status = 'processed' THEN
    PERFORM public.apply_card_billing_event(NEW.provider, NEW.environment, NEW.provider_event_id, NEW.event_type, NEW.payload);
  END IF;
  RETURN NEW;
END $$;
