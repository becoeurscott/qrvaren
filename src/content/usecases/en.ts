import type { UseCaseContent } from "./types";

const content: UseCaseContent = {
  related: "QR codes by use case",
  items: [
    {
      slug: "restaurant-menu-qr-code",
      type: "pdf",
      title: "Free restaurant menu QR code generator",
      h1: "Restaurant menu QR code",
      desc: "Put your menu on every table. Guests scan, the menu opens on their phone: no app, no reprinting.",
      guide: {
        title: "How to make a QR code for your restaurant menu",
        intro: [
          "A menu QR code opens your menu on the guest's phone the moment they point the camera at it. No app to install, no sticky laminated pages, and no reprinting every time the soup of the day changes its mind.",
          "Upload your menu as a PDF, or paste the link to your online menu or ordering page, and print the code on table tents, stickers, the window or the bill folder. Static QR codes are free and never expire.",
        ],
        stepsTitle: "Create your menu QR code in 4 steps",
        steps: [
          "Export your menu as a PDF (one file, phone-friendly, ideally under 5 MB), or copy the link to your online menu.",
          "Add it to the generator above: upload the PDF or paste the link.",
          "Open Design: use your brand colors, add your logo and a frame such as “SCAN FOR MENU”.",
          "Download as SVG or PDF for print, test it with two different phones, then print it at least 3 cm (1.2 in) wide.",
        ],
        usesTitle: "Where to put it",
        uses: [
          "Table tents and table stickers",
          "The front window, so passers-by can read the menu before coming in",
          "Takeaway bags and flyers for repeat orders",
          "The bill folder, linking to your Google review page",
          "Bar counters and terrace tables",
        ],
        tipsTitle: "Tips that save you from awkward moments",
        tips: [
          "Name your PDF with the date and keep the same link if you host it yourself: you can swap the menu without reprinting.",
          "Make the PDF readable on a small screen: large text, one column, no tiny prices.",
          "Keep a few printed menus for guests without a smartphone.",
          "Print on matte material: glossy lamination reflects light and makes scanning harder.",
        ],
        faqTitle: "Restaurant menu QR code FAQ",
        faq: [
          { q: "Is a menu QR code free?", a: "Yes. Creating, downloading and printing a static menu QR code is free, with unlimited scans, including for commercial use." },
          { q: "Can I update my menu without reprinting the QR code?", a: "Yes, if the code points to a link you control (your website or a hosted file whose address stays the same). Replace the file at that address and the printed code shows the new menu." },
          { q: "What size should a table QR code be?", a: "At least 3 cm (1.2 in) wide for a table at arm's length. For a window or wall read from a distance, make it about one tenth of the scanning distance." },
          { q: "Do guests need an app?", a: "No. The built-in camera on iPhone and Android phones reads QR codes directly." },
        ],
      },
    },
    {
      slug: "google-review-qr-code",
      type: "url",
      title: "Google review QR code generator (free)",
      h1: "Google review QR code",
      desc: "Get more Google reviews: one scan opens your review form, ready for five stars.",
      guide: {
        title: "How to make a QR code for Google reviews",
        intro: [
          "Happy customers rarely leave reviews because finding your page takes effort. A Google review QR code removes that effort: scan, and the review window opens straight away.",
          "More reviews help you rank higher in Google Maps and local search, and they convince the next customer. Place the code where customers are happiest: at the counter, on the receipt, or on a thank-you card.",
        ],
        stepsTitle: "Get your review link and turn it into a QR code",
        steps: [
          "Open your Google Business Profile (search your business name on Google while signed in, or go to business.google.com).",
          "Click “Ask for reviews” (or “Get more reviews”) and copy the short review link, which looks like g.page/r/… .",
          "Paste that link in the Website URL field of the generator above.",
          "Add a frame like “REVIEW US” and your logo, download it, then test the scan: the review window should open.",
        ],
        usesTitle: "Where review QR codes work best",
        uses: [
          "Counter displays and checkout stands",
          "Receipts, invoices and delivery notes",
          "Thank-you cards in packages",
          "Restaurant bill folders and table tents",
          "Business cards of service workers after a job well done",
        ],
        tipsTitle: "Tips to get more reviews",
        tips: [
          "Ask in person: “If you liked it, a quick review would really help us.” The QR code makes it a 20-second job.",
          "Never offer rewards in exchange for reviews: it breaks Google's rules and can get reviews removed.",
          "Reply to every review, good or bad. It shows you care and encourages others to write.",
          "Use the official review link, not a search URL: it opens the review form directly.",
        ],
        faqTitle: "Google review QR code FAQ",
        faq: [
          { q: "Where do I find my Google review link?", a: "In your Google Business Profile, under “Ask for reviews” or “Get more reviews”. Copy the short link and paste it here." },
          { q: "Does the QR code expire?", a: "No. It is a static code that contains your review link, so it works as long as your Google Business Profile exists." },
          { q: "Can I use one code for several locations?", a: "Each location has its own review link, so create one QR code per location to collect reviews on the right listing." },
        ],
      },
    },
    {
      slug: "airbnb-wifi-qr-code",
      type: "wifi",
      title: "Airbnb WiFi QR code generator for hosts",
      h1: "Airbnb WiFi QR code",
      desc: "Guests join your WiFi with one scan. No more spelling out a 16-character password at 11 p.m.",
      guide: {
        title: "How to make a WiFi QR code for your Airbnb or rental",
        intro: [
          "“What's the WiFi password?” is the most common question hosts get. A WiFi QR code answers it before it's asked: guests scan the code and their phone connects automatically.",
          "It works with any rental, guest house, B&B or holiday home, and for any WiFi network. The code is created on your device and never sent to our servers.",
        ],
        stepsTitle: "Make your rental WiFi QR code",
        steps: [
          "Type your network name (SSID) exactly as it appears, capitals and spaces included.",
          "Enter the password and pick the security type (usually WPA/WPA2).",
          "Add a frame like “FREE WIFI” and your colors, then download the code.",
          "Print it, frame it, and place it by the entrance or in your welcome book. Test it with your own phone first.",
        ],
        usesTitle: "Where to put it in your rental",
        uses: [
          "A small frame at the entrance or on the router shelf",
          "The first page of your welcome book or house manual",
          "The fridge, next to the house rules",
          "Bedrooms in multi-room guest houses",
        ],
        tipsTitle: "Host tips",
        tips: [
          "Use a guest network so guests never have access to your own devices.",
          "If you change the password between stays, print a new code: a WiFi QR code holds the password itself.",
          "Pair it with a second code that links to your digital guidebook or check-out instructions.",
          "Write the network name and password under the code too, for laptops that cannot scan.",
        ],
        faqTitle: "Airbnb WiFi QR code FAQ",
        faq: [
          { q: "Does it work on iPhone and Android?", a: "Yes. iPhone (iOS 11+) and Android phones connect to a WiFi QR code from the camera app." },
          { q: "Is my WiFi password safe?", a: "The code is generated in your browser and is not stored on our servers. Anyone who scans the printed code can join, so only place it where guests are." },
          { q: "What if I change my password?", a: "Generate a new code with the new password and replace the printed one. The old code will no longer connect." },
        ],
      },
    },
    {
      slug: "wedding-qr-code",
      type: "url",
      title: "Wedding QR code generator: RSVP, photos, website",
      h1: "Wedding QR code",
      desc: "Link your invitations to your RSVP page, your wedding website or a shared photo album, in one scan.",
      guide: {
        title: "How to use QR codes for your wedding",
        intro: [
          "A wedding QR code turns paper into a shortcut: guests scan the invitation to RSVP, check the schedule, find the venue or upload their photos on the day.",
          "Make it match your theme with your colors and a small monogram, and it looks like part of the design rather than an afterthought.",
        ],
        stepsTitle: "Create your wedding QR code",
        steps: [
          "Copy the link you want guests to open: RSVP form, wedding website, registry or shared photo album.",
          "Paste it in the Website URL field above.",
          "Open Design: match your wedding colors, choose rounded dots, and add a frame like “RSVP HERE”.",
          "Download SVG or PDF for your printer, and test a printed proof before ordering all invitations.",
        ],
        usesTitle: "Wedding ideas",
        uses: [
          "Invitations and save-the-dates linking to the RSVP form",
          "Welcome signs linking to the day's schedule",
          "Table cards linking to a shared photo album",
          "Thank-you cards linking to the photo gallery",
          "Maps to the venue for guests coming from far away",
        ],
        tipsTitle: "Tips",
        tips: [
          "Choose a link that won't change: invitations are printed weeks or months in advance.",
          "Keep enough contrast: pale gold on cream looks lovely and scans badly.",
          "Print the code at least 2 cm (0.8 in) wide, and add a short line explaining what it opens.",
        ],
        faqTitle: "Wedding QR code FAQ",
        faq: [
          { q: "Is it free?", a: "Yes. Static QR codes are free, never expire and can be scanned without limit." },
          { q: "Can I use one QR code for several things?", a: "A QR code opens one link. Point it to your wedding website and put the RSVP, schedule and photos there." },
          { q: "Will it work on old phones?", a: "Almost every smartphone from the last several years scans QR codes with the camera. Older ones can use any free scanner app." },
        ],
      },
    },
    {
      slug: "real-estate-qr-code",
      type: "url",
      title: "Real estate QR code generator for signs and flyers",
      h1: "Real estate QR code",
      desc: "Turn “For Sale” signs into listings: one scan opens photos, price and a way to book a visit.",
      guide: {
        title: "How to use QR codes in real estate",
        intro: [
          "Buyers drive past your sign at 7 p.m. when the agency is closed. A real estate QR code lets them see the full listing on the spot, with photos, price, floor plan and a button to book a visit.",
          "Put one on signs, window displays, flyers and open-house sheets, and link each one to the right listing page.",
        ],
        stepsTitle: "Create a listing QR code",
        steps: [
          "Copy the URL of the listing page (or a virtual tour, or your agent page).",
          "Paste it in the Website URL field above.",
          "Add your agency colors and logo, and a frame like “SCAN FOR DETAILS”.",
          "Download as SVG for large-format printing and scan it from a few meters away to check it reads.",
        ],
        usesTitle: "Popular real estate uses",
        uses: [
          "For-sale and to-let signs",
          "Agency window displays",
          "Open-house flyers and brochures",
          "Business cards that open your contact card",
          "Virtual tour links on printed listings",
        ],
        tipsTitle: "Tips for signs",
        tips: [
          "Size the code for the distance: about 1 cm for every 10 cm of distance (roughly 1:10). A sign read from 3 m needs a 30 cm code.",
          "Link to a page that stays online after the sale, such as your agent page, if you reuse the sign.",
          "Use dark code on a white background and avoid placing it near the edge of the sign.",
        ],
        faqTitle: "Real estate QR code FAQ",
        faq: [
          { q: "How big should a QR code be on a sign?", a: "About one tenth of the scanning distance. For a sign seen from the sidewalk at 3 m (10 ft), aim for 30 cm (12 in)." },
          { q: "Can I reuse the code for another property?", a: "A static code always opens the same link. Point it to a page you can update, such as your agent page or a “current listing” page." },
          { q: "Can I share my contact details instead?", a: "Yes, use the vCard or digital business card option to save your number and email straight to the buyer's phone." },
        ],
      },
    },
    {
      slug: "flyer-qr-code",
      type: "url",
      title: "Flyer and poster QR code generator",
      h1: "QR code for flyers and posters",
      desc: "Make print clickable. Add a QR code to flyers, posters and brochures that opens your site, offer or tickets.",
      guide: {
        title: "How to add a QR code to a flyer or poster",
        intro: [
          "A flyer has a few seconds to make someone act. A QR code turns that interest into a visit on the spot: tickets, a sign-up form, a discount or your website, one scan away.",
          "Static QR codes are free, unlimited and never expire, so your flyers keep working as long as they're on the wall.",
        ],
        stepsTitle: "Add a QR code to your flyer",
        steps: [
          "Decide the one action you want: buy tickets, sign up, see the offer, visit the site.",
          "Paste that page's link in the Website URL field above.",
          "Match the flyer's colors, add a frame with a clear call to action like “GET TICKETS”.",
          "Download SVG or PDF, place it in your design, and test a printed proof.",
        ],
        usesTitle: "Ideas",
        uses: [
          "Event posters linking to tickets",
          "Shop flyers linking to a discount code page",
          "Brochures linking to a video demo",
          "Job posters linking to the application form",
          "Menus and price lists linking to online ordering",
        ],
        tipsTitle: "Tips for print",
        tips: [
          "Tell people why to scan: “Scan for 20% off” beats a bare code.",
          "Keep a quiet margin around the code, about 4 modules wide, with nothing printed in it.",
          "Minimum size for a flyer held in hand: 2 to 3 cm (about 1 in). For a poster, use about one tenth of the viewing distance.",
          "Use the mobile version of your page: every visitor arrives on a phone.",
        ],
        faqTitle: "Flyer QR code FAQ",
        faq: [
          { q: "Which file format should I use for print?", a: "SVG or PDF. They are vector formats, so the code stays sharp at any size." },
          { q: "Can I track how many people scanned my flyer?", a: "Add UTM parameters to your link (for example ?utm_source=flyer) and the visits appear in your website analytics." },
          { q: "Do QR codes on flyers expire?", a: "No. Static codes keep working forever as long as the page they open exists." },
        ],
      },
    },
    {
      "slug": "google-form-qr-code",
      "type": "url",
      "title": "Google Form QR code generator (free, never expires)",
      "h1": "Google Form QR code",
      "desc": "Turn any Google Form into a QR code for surveys, sign-ups, attendance and feedback. One scan opens the form.",
      "guide": {
        "title": "How to make a QR code for a Google Form",
        "intro": [
          "A Google Form QR code opens your form the moment someone points their phone at it. No typing a long docs.google.com address, no “can you email me the link?”. Perfect for surveys, event sign-ups, class attendance, feedback and quizzes.",
          "The code holds your form's link, so it is static, free and never expires. Responses still land in your Google Form and Sheets exactly as usual."
        ],
        "stepsTitle": "Create a QR code for your Google Form",
        "steps": [
          "Open your form in Google Forms and click Send (top right).",
          "Choose the link tab (the chain icon), tick “Shorten URL” and click Copy.",
          "Paste the link in the Website URL field of the generator above.",
          "Add a frame like “SCAN TO SIGN UP” and your colors, then download PNG for slides or SVG/PDF for print.",
          "Scan it with your phone and submit a test response to make sure everything works."
        ],
        "usesTitle": "Popular uses",
        "uses": [
          "Class or meeting attendance: put the code on the first slide",
          "Event registration on posters and flyers",
          "Customer feedback cards on tables and counters",
          "Surveys at the end of a presentation or on a receipt",
          "Volunteer, contest and newsletter sign-ups"
        ],
        "tipsTitle": "Tips for more responses",
        "tips": [
          "In the form settings, turn off “Restrict to users in your organization” if outsiders must answer, or they'll hit a sign-in wall.",
          "Keep the form short and phone-friendly: one question per line, few required fields.",
          "Say what's in it for them next to the code: “2-minute survey, win a coffee”.",
          "For attendance, turn on “Collect email addresses” or add a name question, and close the form after the session.",
          "Don't delete and recreate the form: a new form has a new link, and the printed code would point to the old one."
        ],
        "faqTitle": "Google Form QR code FAQ",
        "faq": [
          {
            "q": "Does Google Forms have a built-in QR code?",
            "a": "Not as a download. Copy the form's share link and paste it into the generator above to get a QR code you can style and print."
          },
          {
            "q": "Does the QR code expire?",
            "a": "No. It contains your form's link, so it works as long as the form exists, even if you edit the questions."
          },
          {
            "q": "Can I edit the form after printing the QR code?",
            "a": "Yes. Editing questions doesn't change the link. Only creating a new form gives a new link."
          },
          {
            "q": "Do people need a Google account to answer?",
            "a": "Only if the form requires sign-in. In Settings, turn off the options that restrict responses to signed-in or organization users."
          },
          {
            "q": "Can I stop responses after an event?",
            "a": "Yes. In the Responses tab, switch off “Accepting responses”. Anyone scanning then sees a closed-form message."
          }
        ]
      }
    },
  ],
};

export default content;
