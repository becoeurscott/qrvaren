import { createRefreshAuthRouter } from "@insforge/sdk/ssr";

// Browser client refreshes its short-lived access token here; the refresh token stays httpOnly.
export const { POST } = createRefreshAuthRouter();
