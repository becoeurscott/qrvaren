import type { GuideContent } from "./types";

const en: GuideContent = {
  ui: {
    guides: "Guides",
    guidesTitle: "QR code guides & tutorials",
    guidesSub: "Step-by-step tutorials to create, customize, print and share QR codes with QRVAREN.",
    read: "Read the guide",
    minutes: "{n} min read",
    steps: "Steps",
    related: "More guides",
    back: "All guides",
  },
  types: {
    url: {
      title: "How to create a QR code for a link",
      intro: [
        "A URL QR code opens a web page as soon as someone scans it with their phone camera. It is the most common type of QR code: use it to send people to your website, an online shop, a booking page, a review page, a YouTube video or any other link.",
        "With QRVAREN, a link QR code is static: the address is stored directly inside the pattern. That means it is free, works without an account and never expires, even years after you print it.",
      ],
      stepsTitle: "How to make a link QR code",
      steps: [
        "Paste the full address of your page in the Website URL field, including https://.",
        "Check the live preview: the QR code updates as you type.",
        "Open Design to pick a style, your colors, the module shape, add your logo and a frame such as “SCAN ME”.",
        "Download it as PNG for screens and social media, SVG for print at any size, or PDF.",
        "Scan the downloaded file with your own phone before printing it.",
      ],
      usesTitle: "Popular uses",
      uses: [
        "Flyers, posters and shop windows that lead to your website",
        "Product packaging linking to a manual or a video",
        "Restaurant tables linking to an online menu or ordering page",
        "Review cards linking to your Google review page",
        "Slides and printed reports linking to extra resources",
      ],
      tipsTitle: "Tips for a link QR code that always scans",
      tips: [
        "Use a short URL when you can: fewer characters make a simpler, easier-to-scan pattern.",
        "Make sure the page loads well on mobile, since every scan comes from a phone.",
        "Keep a dark code on a light background, and keep the logo small.",
        "Because a static code can't be changed after printing, link to a page whose address will stay the same.",
      ],
      faqTitle: "Link QR code FAQ",
      faq: [
        { q: "Does a link QR code expire?", a: "No. The address is stored in the code itself, so it keeps working as long as the web page exists." },
        { q: "Can I change the link after printing?", a: "Not with a static code. If the destination may change, link to a page you control, such as your homepage or a business card page, and update that page instead." },
        { q: "Is there a scan limit?", a: "No. Static QR codes can be scanned an unlimited number of times, for free, including for commercial use." },
      ],
    },
    wifi: {
      title: "How to create a WiFi QR code",
      intro: [
        "A WiFi QR code lets guests join your wireless network with one scan, without typing a long password. The phone reads the network name, the password and the security type, then offers to connect.",
        "It is ideal for Airbnbs and rentals, cafés, restaurants, hotels, offices, waiting rooms and events. The code is static and works offline: nothing goes through our servers, and it never expires.",
      ],
      stepsTitle: "How to make a WiFi QR code",
      steps: [
        "Type your network name (SSID) exactly as it appears on your phone, including capitals and spaces.",
        "Enter the WiFi password.",
        "Choose the security type: WPA/WPA2 for almost all modern routers, WEP for very old ones, or none for an open network.",
        "Tick Hidden network only if your network doesn't show up in the list of networks.",
        "Customize the design, add a frame like “FREE WIFI”, then download and print it.",
      ],
      usesTitle: "Where to put a WiFi QR code",
      uses: [
        "Framed on a wall or a table tent in a café or restaurant",
        "In the welcome book of an Airbnb or a holiday rental",
        "At a hotel reception or on room key cards",
        "In a meeting room or an office lobby for visitors",
        "On the fridge at home for friends and family",
      ],
      tipsTitle: "Tips",
      tips: [
        "If you change your WiFi password, create and print a new QR code: the old one will stop working.",
        "Test the code with both an iPhone and an Android phone before printing several copies.",
        "Consider a separate guest network so visitors don't share your main network.",
        "Write the network name under the code as a fallback for older phones.",
      ],
      faqTitle: "WiFi QR code FAQ",
      faq: [
        { q: "Do phones need an app to scan a WiFi QR code?", a: "No. The camera app on recent iPhones and Android phones reads WiFi QR codes and offers to join the network." },
        { q: "Is my WiFi password sent to QRVAREN?", a: "No. The QR code is generated in your browser and the password is only stored inside the image you download." },
        { q: "Will the code still work if I change my password?", a: "No. The password is part of the code, so you need to generate a new one after any change." },
      ],
    },
    text: {
      title: "How to create a text QR code",
      intro: [
        "A text QR code shows a message on the phone screen as soon as it is scanned. No internet connection and no website are needed: the text is stored entirely inside the code.",
        "Use it for short instructions, a serial number, a quote, a secret message in a game or a treasure hunt, or any information that should be readable offline.",
      ],
      stepsTitle: "How to make a text QR code",
      steps: [
        "Type or paste your message in the text field.",
        "Watch the preview and the warnings: if the text is too long, the generator tells you so.",
        "Pick your colors and style in Design, and add a frame like “READ ME”.",
        "Download the code as PNG, SVG or PDF and test it with your phone.",
      ],
      usesTitle: "Popular uses",
      uses: [
        "Treasure hunts, escape games and classroom activities",
        "Equipment labels with a serial number or instructions",
        "Short messages on gifts and greeting cards",
        "Information that must work without internet access",
      ],
      tipsTitle: "Tips",
      tips: [
        "Keep it short: a few lines scan easily, while very long texts produce dense codes that are hard to read.",
        "For long content, put it on a web page and use a link QR code instead.",
        "Print text QR codes larger than usual if they contain a lot of characters.",
      ],
      faqTitle: "Text QR code FAQ",
      faq: [
        { q: "How much text can a QR code hold?", a: "In theory a few thousand characters, but for reliable scanning keep it to a few hundred. The generator warns you when it gets too long." },
        { q: "Does a text QR code need internet?", a: "No. The text is inside the code, so it can be read anywhere, even offline." },
        { q: "Can I use emojis and accents?", a: "Yes. Accented letters and emojis are supported, but each one takes more space in the code." },
      ],
    },
    vcard: {
      title: "How to create a vCard QR code",
      intro: [
        "A vCard QR code shares your contact details in one scan. The phone opens a ready-to-save contact card with your name, phone, email, company, job title, website and address.",
        "It is the fastest way to exchange details at a meeting, a trade show or on a printed business card. The code is static and free, and it never expires.",
      ],
      stepsTitle: "How to make a vCard QR code",
      steps: [
        "Fill in your first name and last name.",
        "Add your company and job title if you want them on the contact card.",
        "Enter your phone number with the country code, your email and your website.",
        "Add your address if people should be able to find you.",
        "Customize the design, add a “SAVE CONTACT” frame and download the code.",
      ],
      usesTitle: "Where to use it",
      uses: [
        "On the back of a printed business card",
        "On a badge or lanyard at conferences and trade shows",
        "In an email signature or at the end of a presentation",
        "On a shop counter so customers can save your number",
      ],
      tipsTitle: "Tips",
      tips: [
        "Only fill in the fields you need: fewer details make a simpler code that scans faster.",
        "Write phone numbers in international format, like +1 555 123 4567.",
        "Your details are fixed in the code. If they change often, a hosted digital business card is a better fit, because you can edit it at any time.",
      ],
      faqTitle: "vCard QR code FAQ",
      faq: [
        { q: "What happens when someone scans a vCard QR code?", a: "Their phone shows a contact card with your details and a button to add it to their contacts." },
        { q: "Can I update my details later?", a: "Not in a static vCard code. Create a new code, or use a QRVAREN digital business card, which you can edit without reprinting." },
        { q: "Does it work on iPhone and Android?", a: "Yes. Both read the standard vCard format directly from the camera app." },
      ],
    },
    email: {
      title: "How to create an email QR code",
      intro: [
        "An email QR code opens a new message in the mail app, with the address, the subject and even the text already filled in. The person only has to tap Send.",
        "It is useful for customer support, feedback, quotes, event registration or any situation where you want people to contact you without typing your address.",
      ],
      stepsTitle: "How to make an email QR code",
      steps: [
        "Enter the email address that should receive the messages.",
        "Add a subject, for example “Quote request” or “Feedback”.",
        "Optionally write the start of the message so people know what to send.",
        "Pick a style, add an “EMAIL US” frame and download the code.",
      ],
      usesTitle: "Popular uses",
      uses: [
        "Feedback and complaint forms in shops and restaurants",
        "Quote or information requests on flyers and vehicles",
        "Registration for events and newsletters",
        "Support contact on product packaging",
      ],
      tipsTitle: "Tips",
      tips: [
        "Use a clear subject so you can sort incoming emails easily.",
        "Keep the pre-filled message short to keep the code simple.",
        "Add the email address in plain text near the code for people who prefer to type it.",
      ],
      faqTitle: "Email QR code FAQ",
      faq: [
        { q: "Does the email send automatically?", a: "No. Scanning opens a draft. The person always reviews it and taps Send themselves." },
        { q: "Which mail app opens?", a: "The default mail app on the phone, such as Mail, Gmail or Outlook." },
        { q: "Can I add several recipients?", a: "Use one address per code for the best compatibility across phones." },
      ],
    },
    sms: {
      title: "How to create an SMS QR code",
      intro: [
        "An SMS QR code opens the messaging app with a phone number and a message already written. The person just taps Send.",
        "Businesses use it for appointment requests, text-to-join offers, contests, support and quick feedback. Like all static codes on QRVAREN, it is free and never expires.",
      ],
      stepsTitle: "How to make an SMS QR code",
      steps: [
        "Enter the phone number that receives the messages, with the country code.",
        "Write the pre-filled message, for example “I'd like to book an appointment”.",
        "Customize the design and add a “TEXT US” frame.",
        "Download the code and test it with your phone.",
      ],
      usesTitle: "Popular uses",
      uses: [
        "Appointment and callback requests",
        "Contests and text-to-join promotions",
        "Customer support on packaging and receipts",
        "Quick feedback after a visit",
      ],
      tipsTitle: "Tips",
      tips: [
        "Always use the international format, like +44 7700 900123, so the number works from any country.",
        "Keep the message short and clear.",
        "Remember that standard SMS rates may apply for the sender.",
      ],
      faqTitle: "SMS QR code FAQ",
      faq: [
        { q: "Is the message sent automatically?", a: "No. The messaging app opens with the text ready, and the person chooses to send it." },
        { q: "Can I use a WhatsApp number?", a: "For WhatsApp, use the WhatsApp template, which opens a chat directly in WhatsApp." },
        { q: "Does it work on all phones?", a: "Yes. iPhone and Android phones both open SMS QR codes in their messaging app." },
      ],
    },
    pdf: {
      title: "How to create a PDF QR code",
      intro: [
        "A PDF QR code opens a document, such as a restaurant menu, a brochure, a price list, a catalogue or a user manual, as soon as it is scanned.",
        "On QRVAREN the PDF is hosted for you, so you need a free account (one click with Google). The QR code points to your file, and scans are counted in your dashboard.",
      ],
      stepsTitle: "How to make a PDF QR code",
      steps: [
        "Choose PDF and sign in with Google if you haven't yet.",
        "Upload your PDF file.",
        "Customize the design and add a frame like “SEE THE MENU” or “VIEW PDF”.",
        "Download the QR code and print it on your menu, table, flyer or packaging.",
        "Find the code and its scans later in your dashboard under My QR codes.",
      ],
      usesTitle: "Popular uses",
      uses: [
        "Restaurant and bar menus",
        "Brochures, catalogues and price lists",
        "User manuals and safety sheets on products",
        "Event programmes and course material",
      ],
      tipsTitle: "Tips",
      tips: [
        "Compress large PDFs so they open quickly on mobile data.",
        "Design the PDF for a phone screen: large text, one column.",
        "Test the scan on mobile data, not only on your WiFi.",
      ],
      faqTitle: "PDF QR code FAQ",
      faq: [
        { q: "Why do I need an account for a PDF QR code?", a: "Because the file has to be stored online. The account is free and lets you find your codes and scans in your dashboard." },
        { q: "Do people need an app to open the PDF?", a: "No. The PDF opens in the phone's browser." },
        { q: "Can I see how many people scanned it?", a: "Yes. Scans of hosted codes are counted in your dashboard." },
      ],
    },
    card: {
      title: "How to create a digital business card with a QR code",
      intro: [
        "A digital business card is a mobile page for you or your business, with your logo, photo, phone, email, address with a map, opening hours, website, socials and gallery. Visitors get three big buttons: Call, Save contact and Directions.",
        "Its QR code never changes. You can edit the card at any time, and everyone who scans your printed code sees the new version, without reprinting anything.",
      ],
      stepsTitle: "How to create your card",
      steps: [
        "Sign in with Google and open your dashboard.",
        "Open the card editor and fill in your details: name, tagline, phone, email, address, hours and links.",
        "Add your logo, a photo and a few gallery pictures.",
        "Choose a monthly or yearly plan to publish the card on its own address.",
        "Download its QR code, or design a printed business card in the dashboard.",
      ],
      usesTitle: "Who it's for",
      uses: [
        "Freelancers and consultants",
        "Shops, restaurants, salons and local businesses",
        "Real estate agents and sales teams",
        "Artisans and trades who work on site",
      ],
      tipsTitle: "Tips",
      tips: [
        "Write a short tagline that says what you do in a few words.",
        "Add your opening hours and address so customers can visit you.",
        "Check your scan statistics in the dashboard to see which flyers and places work best.",
      ],
      faqTitle: "Digital business card FAQ",
      faq: [
        { q: "Can I change my card after printing the QR code?", a: "Yes. The QR code points to your card's address, so every change appears immediately for everyone who scans it." },
        { q: "How much does it cost?", a: "The QR generator is free. The hosted business card is a monthly or yearly subscription you can cancel at any time. See the pricing page." },
        { q: "Do visitors need an app?", a: "No. The card opens in the phone's browser, and Save contact adds you to their contacts in one tap." },
      ],
    },
  },
  tutorials: [
    {
      slug: "how-to-create-a-qr-code",
      title: "How to create a QR code for free (step by step)",
      desc: "The complete beginner's guide to making your first QR code with QRVAREN, from choosing a type to downloading the file.",
      minutes: 4,
      cta: { href: "/create", label: "Create a QR code" },
      sections: [
        {
          h: "What you need",
          p: [
            "Just a browser. QRVAREN works on a computer, a tablet or a phone, with no app to install and no account to create for link, WiFi, text, vCard, email and SMS codes.",
            "Your QR code is generated directly in your browser, and the codes you download are static: they never expire and have no scan limit.",
          ],
        },
        {
          h: "Create your first QR code",
          steps: [
            "Open the generator from the Create button at the top of any page.",
            "Pick a type: URL, WiFi, Text, vCard, Email, SMS, PDF or Business card. You can also start from a template such as WhatsApp, Spotify or Google Maps.",
            "Fill in the content fields. The preview appears and updates as you type.",
            "Switch to Design to change colors, shapes, add a logo and a frame (we cover this in the customization guide).",
            "Click Download and choose PNG, SVG or PDF.",
          ],
        },
        {
          h: "Which type should I choose?",
          list: [
            "URL: send people to a website, a shop, a form or a video.",
            "WiFi: let guests join your network without typing the password.",
            "vCard: share your contact details in one scan.",
            "Email and SMS: open a pre-filled message.",
            "Text: show a message that works offline.",
            "PDF: open a menu, brochure or document (free account needed).",
            "Business card: a hosted mobile page you can edit at any time.",
          ],
        },
        {
          h: "Before you print",
          p: [
            "Always scan the downloaded file with your own phone. Check that it opens the right page or action, and that it scans from the distance people will stand at.",
            "If the generator shows a warning about contrast, length or logo size, follow it: these warnings exist because some phones can't read those codes.",
          ],
        },
      ],
    },
    {
      slug: "customize-qr-code-logo-colors",
      title: "How to customize your QR code: logo, colors and frame",
      desc: "Make your QR code match your brand with styles, colors, module shapes, a center logo and a “Scan me” frame, without breaking the scan.",
      minutes: 5,
      cta: { href: "/create", label: "Design my QR code" },
      sections: [
        {
          h: "Start from a style",
          p: [
            "In the Design tab, the Styles row gives you ready-made color combinations such as Classic, Midnight, Ocean or Gold. Pick one as a starting point, then fine-tune it.",
          ],
        },
        {
          h: "Customize step by step",
          steps: [
            "Code color: choose the color of the modules. Dark colors scan best.",
            "Background: choose a light color, or keep white.",
            "Module shape: square, dots, rounded or classy.",
            "Center logo: upload your logo. It is placed in the middle of the code.",
            "Frame: add a frame and a call to action, such as SCAN ME, FREE WIFI or SEE THE MENU, or type your own text.",
          ],
        },
        {
          h: "Rules that keep your code scannable",
          list: [
            "Keep strong contrast: a dark code on a light background.",
            "Avoid a light code on a dark background; some scanners can't read inverted codes.",
            "Keep the logo small. The generator warns you if it covers too much of the code.",
            "Leave the white margin around the code when you place it in your design.",
          ],
        },
        {
          h: "Why a frame helps",
          p: [
            "People scan more when they know what they'll get. A short call to action like “SEE THE MENU” or “SCAN FOR WIFI” tells them why to pull out their phone, and makes your code stand out on a busy flyer.",
          ],
        },
      ],
    },
    {
      slug: "download-and-print-qr-code",
      title: "How to download and print a QR code (PNG, SVG or PDF)",
      desc: "Which file format to choose, what size to print, and how to test your QR code so it scans every time.",
      minutes: 4,
      cta: { href: "/create", label: "Create and download" },
      sections: [
        {
          h: "Choose the right format",
          list: [
            "PNG: an image for websites, social media, emails and documents.",
            "SVG: a vector file that stays sharp at any size. Best for print shops, signs and design tools like Canva, Illustrator or Figma.",
            "PDF: ready to print, or to send to a printer.",
          ],
        },
        {
          h: "What size to print",
          p: [
            "A simple rule: the code should be at least one tenth of the scanning distance. For a business card or a table, 2 to 3 cm (about 1 inch) is enough. For a poster read from 2 meters away, aim for 20 cm.",
            "Codes with more content, such as long texts or full vCards, are denser and need to be printed larger.",
          ],
        },
        {
          h: "Test before printing",
          steps: [
            "Open the downloaded file on another screen, or print a single test copy.",
            "Scan it with an iPhone and an Android phone.",
            "Check that it opens the right link, network, contact or message.",
            "Try scanning from the distance and the lighting where it will be used.",
          ],
        },
        {
          h: "Printing tips",
          list: [
            "Use matte paper when possible: glossy surfaces reflect light.",
            "Don't stretch the code; resize it proportionally.",
            "Keep the white margin around the code.",
            "Avoid placing the code on a curve or a fold.",
          ],
        },
      ],
    },
    {
      slug: "create-digital-business-card",
      title: "How to create a digital business card with QRVAREN",
      desc: "Set up your hosted business card, add your details, publish it and share it with a QR code that never changes.",
      minutes: 5,
      cta: { href: "/business-card", label: "See the business card" },
      sections: [
        {
          h: "What is a digital business card?",
          p: [
            "It is a mobile page for you or your business, with your logo, photo, contact details, address and map, opening hours, socials, gallery and links. Visitors get three buttons: Call, Save contact and Directions.",
            "Unlike a vCard QR code, you can edit it at any time. The QR code stays the same, so you never need to reprint.",
          ],
        },
        {
          h: "Create your card",
          steps: [
            "Click Log in and sign in with Google. You must be 18 or older.",
            "In your dashboard, open My business card and start the editor.",
            "Fill in your name, tagline, phone, email, address, opening hours and links.",
            "Upload your logo, a profile photo and gallery pictures.",
            "Choose a monthly or yearly plan to publish the card on its own address.",
          ],
        },
        {
          h: "Share it",
          list: [
            "Download the card's QR code and add it to flyers, windows and packaging.",
            "Design a printed business card in the dashboard, with the QR code on it.",
            "Share the card's link in your email signature and on social media.",
          ],
        },
        {
          h: "Follow your scans",
          p: [
            "Your dashboard shows how many times your card's QR code was scanned over the last 30 days, so you can see what works. Scan statistics are counted without selling anyone's data.",
          ],
        },
      ],
    },
    {
      slug: "design-printed-business-card",
      title: "How to design and print a business card with a QR code",
      desc: "Use the QRVAREN card designer to create a paper business card with your QR code, then download a print-ready PDF.",
      minutes: 4,
      cta: { href: "/login", label: "Open my dashboard" },
      sections: [
        {
          h: "Open the designer",
          p: [
            "The printed card designer is in your dashboard, under Printed card. Sign in with Google to access it.",
          ],
        },
        {
          h: "Design your card",
          steps: [
            "Pick a template, such as Classic, Bold, Minimal or Elegant. It fills both sides with your details.",
            "Edit your details in the side panel, or click any text directly on the card.",
            "Add text, images, your logo, shapes and a QR code. Drag to move, use the round handle to resize.",
            "Choose what the QR code opens: your online card, any link, or your own uploaded QR picture.",
            "Keep everything inside the dashed line, so nothing gets cut off.",
          ],
        },
        {
          h: "Download and print",
          list: [
            "Download PDF for the printer: front and back with bleed, at 300 dpi, ready for a print shop.",
            "Print at home: a sheet of 10 cards with cut marks. Print double-sided and flip on the long edge.",
            "Choose the US or European card size before you export.",
          ],
        },
        {
          h: "QR code size on a card",
          p: [
            "Keep the QR code at least 0.75 inch (about 2 cm) wide. The designer warns you when it is too small for some phones to scan.",
          ],
        },
      ],
    },
  ],
};

export default en;
