import type { GuideContent } from "./types";

const es: GuideContent = {
  ui: {
    guides: "Guías",
    guidesTitle: "Guías y tutoriales de códigos QR",
    guidesSub: "Tutoriales paso a paso para crear, personalizar, imprimir y compartir códigos QR con QRVAREN.",
    read: "Leer la guía",
    minutes: "{n} min de lectura",
    steps: "Pasos",
    related: "Más guías",
    back: "Todas las guías",
  },
  types: {
    url: {
      title: "Cómo crear un código QR para un enlace",
      intro: [
        "Un código QR de URL abre una página web en cuanto alguien lo escanea con la cámara del móvil. Es el tipo de código QR más común: úsalo para llevar a tu web, una tienda online, una página de reservas, una página de reseñas, un vídeo de YouTube o cualquier enlace.",
        "Con QRVAREN, un código QR de enlace es estático: la dirección se guarda directamente en el patrón. Por eso es gratis, funciona sin cuenta y nunca caduca, incluso años después de imprimirlo.",
      ],
      stepsTitle: "Cómo hacer un código QR de enlace",
      steps: [
        "Pega la dirección completa de tu página en el campo URL, con https://.",
        "Mira la vista previa: el código QR se actualiza mientras escribes.",
        "Abre Diseño para elegir un estilo, tus colores, la forma de los módulos, añadir tu logo y un marco como «SCAN ME».",
        "Descárgalo en PNG para pantallas y redes sociales, SVG para imprimir a cualquier tamaño, o PDF.",
        "Escanea el archivo descargado con tu móvil antes de imprimirlo.",
      ],
      usesTitle: "Usos habituales",
      uses: [
        "Folletos, carteles y escaparates que llevan a tu web",
        "Envases que enlazan a un manual o un vídeo",
        "Mesas de restaurante que enlazan a una carta o página de pedidos",
        "Tarjetas de reseñas que enlazan a tu página de Google",
        "Presentaciones e informes impresos con recursos extra",
      ],
      tipsTitle: "Consejos para un código QR de enlace que siempre se escanee",
      tips: [
        "Usa una URL corta cuando puedas: menos caracteres dan un patrón más simple de escanear.",
        "Comprueba que la página se ve bien en el móvil, porque todos los escaneos vienen de un teléfono.",
        "Mantén un código oscuro sobre fondo claro y un logo pequeño.",
        "Un código estático no se puede cambiar tras imprimirlo: enlaza a una página cuya dirección no vaya a cambiar.",
      ],
      faqTitle: "Preguntas frecuentes del código QR de enlace",
      faq: [
        { q: "¿Caduca un código QR de enlace?", a: "No. La dirección está guardada en el propio código, así que funciona mientras exista la página web." },
        { q: "¿Puedo cambiar el enlace después de imprimir?", a: "No con un código estático. Si el destino puede cambiar, enlaza a una página que controles, como tu web o una tarjeta de visita, y actualiza esa página." },
        { q: "¿Hay un límite de escaneos?", a: "No. Los códigos QR estáticos se escanean sin límite, gratis, también para uso comercial." },
      ],
    },
    wifi: {
      title: "Cómo crear un código QR de WiFi",
      intro: [
        "Un código QR de WiFi permite a tus invitados conectarse a tu red con un escaneo, sin escribir una contraseña larga. El móvil lee el nombre de la red, la contraseña y el tipo de seguridad, y ofrece conectarse.",
        "Es ideal para Airbnb y alquileres, cafeterías, restaurantes, hoteles, oficinas, salas de espera y eventos. El código es estático y funciona sin conexión: nada pasa por nuestros servidores y nunca caduca.",
      ],
      stepsTitle: "Cómo hacer un código QR de WiFi",
      steps: [
        "Escribe el nombre de la red (SSID) exactamente como aparece en tu móvil, con mayúsculas y espacios.",
        "Introduce la contraseña del WiFi.",
        "Elige la seguridad: WPA/WPA2 para casi todos los routers modernos, WEP para los muy antiguos, o ninguna para una red abierta.",
        "Marca Red oculta solo si tu red no aparece en la lista de redes.",
        "Personaliza el diseño, añade un marco como «FREE WIFI», descárgalo e imprímelo.",
      ],
      usesTitle: "Dónde poner un código QR de WiFi",
      uses: [
        "Enmarcado en la pared o en un expositor de mesa en una cafetería",
        "En el libro de bienvenida de un Airbnb o un alquiler vacacional",
        "En la recepción de un hotel o en las tarjetas de habitación",
        "En una sala de reuniones o en la entrada de una oficina",
        "En la nevera de casa para amigos y familia",
      ],
      tipsTitle: "Consejos",
      tips: [
        "Si cambias la contraseña del WiFi, crea e imprime un código nuevo: el anterior dejará de funcionar.",
        "Prueba el código con un iPhone y un Android antes de imprimir varias copias.",
        "Considera una red de invitados separada para que las visitas no usen tu red principal.",
        "Escribe el nombre de la red bajo el código para móviles antiguos.",
      ],
      faqTitle: "Preguntas frecuentes del código QR de WiFi",
      faq: [
        { q: "¿Hace falta una app para escanear un código QR de WiFi?", a: "No. La cámara de los iPhone y Android recientes lee los códigos QR de WiFi y ofrece unirse a la red." },
        { q: "¿Se envía mi contraseña del WiFi a QRVAREN?", a: "No. El código QR se genera en tu navegador y la contraseña solo está dentro de la imagen que descargas." },
        { q: "¿Seguirá funcionando si cambio la contraseña?", a: "No. La contraseña forma parte del código, así que tienes que generar uno nuevo tras cada cambio." },
      ],
    },
    text: {
      title: "Cómo crear un código QR de texto",
      intro: [
        "Un código QR de texto muestra un mensaje en la pantalla del móvil en cuanto se escanea. No hace falta internet ni una web: el texto se guarda entero dentro del código.",
        "Úsalo para instrucciones cortas, un número de serie, una cita, un mensaje secreto en un juego o una búsqueda del tesoro, o cualquier información que deba leerse sin conexión.",
      ],
      stepsTitle: "Cómo hacer un código QR de texto",
      steps: [
        "Escribe o pega tu mensaje en el campo de texto.",
        "Fíjate en la vista previa y los avisos: si el texto es demasiado largo, el generador te lo dice.",
        "Elige colores y estilo en Diseño, y añade un marco como «READ ME».",
        "Descarga el código en PNG, SVG o PDF y pruébalo con tu móvil.",
      ],
      usesTitle: "Usos habituales",
      uses: [
        "Búsquedas del tesoro, escape rooms y actividades en clase",
        "Etiquetas de equipos con número de serie o instrucciones",
        "Mensajes cortos en regalos y tarjetas de felicitación",
        "Información que debe funcionar sin internet",
      ],
      tipsTitle: "Consejos",
      tips: [
        "Sé breve: unas pocas líneas se escanean fácilmente; un texto muy largo da un código denso y difícil de leer.",
        "Para contenido largo, ponlo en una página web y usa un código QR de enlace.",
        "Imprime más grandes los códigos de texto con muchos caracteres.",
      ],
      faqTitle: "Preguntas frecuentes del código QR de texto",
      faq: [
        { q: "¿Cuánto texto cabe en un código QR?", a: "En teoría unos miles de caracteres, pero para un escaneo fiable mantente en unos cientos. El generador te avisa si es demasiado largo." },
        { q: "¿Un código QR de texto necesita internet?", a: "No. El texto está en el código, así que se lee en cualquier lugar, incluso sin conexión." },
        { q: "¿Puedo usar tildes y emojis?", a: "Sí. Están admitidos, pero cada uno ocupa más espacio en el código." },
      ],
    },
    vcard: {
      title: "Cómo crear un código QR vCard",
      intro: [
        "Un código QR vCard comparte tus datos de contacto con un escaneo. El móvil abre una ficha de contacto lista para guardar con tu nombre, teléfono, email, empresa, cargo, web y dirección.",
        "Es la forma más rápida de intercambiar datos en una reunión, una feria o una tarjeta de visita impresa. El código es estático, gratis y nunca caduca.",
      ],
      stepsTitle: "Cómo hacer un código QR vCard",
      steps: [
        "Escribe tu nombre y apellidos.",
        "Añade tu empresa y cargo si quieres que aparezcan.",
        "Introduce tu teléfono con el prefijo del país, tu email y tu web.",
        "Añade tu dirección si la gente debe poder encontrarte.",
        "Personaliza el diseño, añade un marco «SAVE CONTACT» y descarga el código.",
      ],
      usesTitle: "Dónde usarlo",
      uses: [
        "En el reverso de una tarjeta de visita impresa",
        "En una acreditación en congresos y ferias",
        "En la firma de email o al final de una presentación",
        "En el mostrador para que los clientes guarden tu número",
      ],
      tipsTitle: "Consejos",
      tips: [
        "Rellena solo los campos necesarios: menos datos dan un código más simple que se escanea antes.",
        "Escribe los teléfonos en formato internacional, como +34 612 345 678.",
        "Tus datos quedan fijos en el código. Si cambian a menudo, una tarjeta de visita digital alojada es mejor, porque puedes editarla cuando quieras.",
      ],
      faqTitle: "Preguntas frecuentes del código QR vCard",
      faq: [
        { q: "¿Qué pasa cuando alguien escanea un código QR vCard?", a: "Su móvil muestra una ficha con tus datos y un botón para añadirla a sus contactos." },
        { q: "¿Puedo actualizar mis datos más tarde?", a: "No en un código vCard estático. Crea un código nuevo o usa una tarjeta de visita digital QRVAREN, editable sin reimprimir." },
        { q: "¿Funciona en iPhone y Android?", a: "Sí. Ambos leen el formato vCard estándar directamente desde la cámara." },
      ],
    },
    email: {
      title: "Cómo crear un código QR de email",
      intro: [
        "Un código QR de email abre un mensaje nuevo en la app de correo con la dirección, el asunto e incluso el texto ya rellenados. Solo hay que pulsar Enviar.",
        "Es útil para atención al cliente, opiniones, presupuestos, inscripciones a eventos o cuando quieres que te escriban sin teclear tu dirección.",
      ],
      stepsTitle: "Cómo hacer un código QR de email",
      steps: [
        "Introduce la dirección de email que recibirá los mensajes.",
        "Añade un asunto, por ejemplo «Solicitud de presupuesto» u «Opinión».",
        "Si quieres, escribe el inicio del mensaje para orientar a la gente.",
        "Elige un estilo, añade un marco «EMAIL US» y descarga el código.",
      ],
      usesTitle: "Usos habituales",
      uses: [
        "Opiniones y reclamaciones en tiendas y restaurantes",
        "Solicitudes de presupuesto en folletos y vehículos",
        "Inscripciones a eventos y newsletters",
        "Contacto de soporte en los envases",
      ],
      tipsTitle: "Consejos",
      tips: [
        "Usa un asunto claro para ordenar fácilmente los correos recibidos.",
        "Mantén corto el mensaje prerrellenado para que el código sea simple.",
        "Escribe la dirección de email junto al código para quien prefiera teclearla.",
      ],
      faqTitle: "Preguntas frecuentes del código QR de email",
      faq: [
        { q: "¿El email se envía solo?", a: "No. El escaneo abre un borrador. La persona lo revisa y pulsa Enviar." },
        { q: "¿Qué app de correo se abre?", a: "La app de correo predeterminada del móvil, como Mail, Gmail u Outlook." },
        { q: "¿Puedo añadir varios destinatarios?", a: "Usa una dirección por código para la mejor compatibilidad." },
      ],
    },
    sms: {
      title: "Cómo crear un código QR de SMS",
      intro: [
        "Un código QR de SMS abre la app de mensajes con un número y un mensaje ya escritos. Solo hay que pulsar Enviar.",
        "Los negocios lo usan para citas, ofertas por SMS, sorteos, soporte y opiniones rápidas. Como todos los códigos estáticos de QRVAREN, es gratis y nunca caduca.",
      ],
      stepsTitle: "Cómo hacer un código QR de SMS",
      steps: [
        "Introduce el número que recibe los mensajes, con el prefijo del país.",
        "Escribe el mensaje prerrellenado, por ejemplo «Quiero pedir una cita».",
        "Personaliza el diseño y añade un marco «TEXT US».",
        "Descarga el código y pruébalo con tu móvil.",
      ],
      usesTitle: "Usos habituales",
      uses: [
        "Solicitudes de cita y de llamada",
        "Sorteos y promociones por SMS",
        "Atención al cliente en envases y tickets",
        "Opiniones rápidas tras una visita",
      ],
      tipsTitle: "Consejos",
      tips: [
        "Usa siempre el formato internacional, como +34 612 345 678, para que el número funcione desde cualquier país.",
        "Mantén el mensaje corto y claro.",
        "Puede aplicarse la tarifa SMS habitual para quien envía.",
      ],
      faqTitle: "Preguntas frecuentes del código QR de SMS",
      faq: [
        { q: "¿El mensaje se envía solo?", a: "No. La app de mensajes se abre con el texto listo y la persona decide enviarlo." },
        { q: "¿Puedo usar un número de WhatsApp?", a: "Para WhatsApp, usa la plantilla de WhatsApp, que abre un chat directamente en WhatsApp." },
        { q: "¿Funciona en todos los móviles?", a: "Sí. iPhone y Android abren los códigos QR de SMS en su app de mensajes." },
      ],
    },
    pdf: {
      title: "Cómo crear un código QR de PDF",
      intro: [
        "Un código QR de PDF abre un documento, como la carta de un restaurante, un folleto, una lista de precios, un catálogo o un manual, en cuanto se escanea.",
        "En QRVAREN el PDF se aloja por ti, así que necesitas una cuenta gratuita (un clic con Google). El código QR apunta a tu archivo y los escaneos se cuentan en tu panel.",
      ],
      stepsTitle: "Cómo hacer un código QR de PDF",
      steps: [
        "Elige PDF e inicia sesión con Google si aún no lo has hecho.",
        "Sube tu archivo PDF.",
        "Personaliza el diseño y añade un marco como «SEE THE MENU» o «VIEW PDF».",
        "Descarga el código QR e imprímelo en tu carta, mesa, folleto o envase.",
        "Encuentra el código y sus escaneos en tu panel, en Mis códigos QR.",
      ],
      usesTitle: "Usos habituales",
      uses: [
        "Cartas de restaurantes y bares",
        "Folletos, catálogos y listas de precios",
        "Manuales y fichas de seguridad en productos",
        "Programas de eventos y material de cursos",
      ],
      tipsTitle: "Consejos",
      tips: [
        "Comprime los PDF grandes para que se abran rápido con datos móviles.",
        "Diseña el PDF para la pantalla de un móvil: letra grande y una sola columna.",
        "Prueba el escaneo con datos móviles, no solo con tu WiFi.",
      ],
      faqTitle: "Preguntas frecuentes del código QR de PDF",
      faq: [
        { q: "¿Por qué necesito una cuenta para un código QR de PDF?", a: "Porque el archivo tiene que guardarse en línea. La cuenta es gratuita y te permite ver tus códigos y escaneos." },
        { q: "¿Hace falta una app para abrir el PDF?", a: "No. El PDF se abre en el navegador del móvil." },
        { q: "¿Puedo ver cuántas personas lo escanearon?", a: "Sí. Los escaneos de los códigos alojados se cuentan en tu panel." },
      ],
    },
    card: {
      title: "Cómo crear una tarjeta de visita digital con código QR",
      intro: [
        "Una tarjeta de visita digital es una página móvil para ti o tu negocio, con logo, foto, teléfono, email, dirección con mapa, horario, web, redes sociales y galería. Los visitantes tienen tres botones grandes: Llamar, Guardar contacto y Cómo llegar.",
        "Su código QR nunca cambia. Puedes editar la tarjeta cuando quieras y todos los que escaneen tu código impreso verán la nueva versión, sin reimprimir nada.",
      ],
      stepsTitle: "Cómo crear tu tarjeta",
      steps: [
        "Inicia sesión con Google y abre tu panel.",
        "Abre el editor de la tarjeta y rellena tus datos: nombre, eslogan, teléfono, email, dirección, horario y enlaces.",
        "Añade tu logo, una foto y algunas imágenes de galería.",
        "Elige un plan mensual o anual para publicar la tarjeta en su propia dirección.",
        "Descarga su código QR o diseña una tarjeta de visita impresa en el panel.",
      ],
      usesTitle: "Para quién es",
      uses: [
        "Autónomos y consultores",
        "Tiendas, restaurantes, peluquerías y comercios locales",
        "Agentes inmobiliarios y equipos comerciales",
        "Profesionales de oficios que trabajan a domicilio",
      ],
      tipsTitle: "Consejos",
      tips: [
        "Escribe un eslogan corto que diga a qué te dedicas en pocas palabras.",
        "Añade tu horario y dirección para que los clientes te visiten.",
        "Revisa tus estadísticas de escaneos para ver qué folletos y lugares funcionan mejor.",
      ],
      faqTitle: "Preguntas frecuentes de la tarjeta de visita digital",
      faq: [
        { q: "¿Puedo cambiar mi tarjeta después de imprimir el código QR?", a: "Sí. El código QR apunta a la dirección de tu tarjeta, así que cada cambio aparece al instante para todos." },
        { q: "¿Cuánto cuesta?", a: "El generador de códigos QR es gratis. La tarjeta alojada es una suscripción mensual o anual que puedes cancelar cuando quieras. Consulta la página de precios." },
        { q: "¿Los visitantes necesitan una app?", a: "No. La tarjeta se abre en el navegador y Guardar contacto te añade a sus contactos con un toque." },
      ],
    },
  },
  tutorials: [
    {
      slug: "how-to-create-a-qr-code",
      title: "Cómo crear un código QR gratis (paso a paso)",
      desc: "La guía completa para principiantes: crea tu primer código QR con QRVAREN, desde elegir el tipo hasta descargar el archivo.",
      minutes: 4,
      cta: { href: "/create", label: "Crear un código QR" },
      sections: [
        {
          h: "Lo que necesitas",
          p: [
            "Solo un navegador. QRVAREN funciona en ordenador, tablet o móvil, sin instalar nada y sin cuenta para los códigos de enlace, WiFi, texto, vCard, email y SMS.",
            "Tu código QR se genera directamente en tu navegador, y los códigos descargados son estáticos: nunca caducan y no tienen límite de escaneos.",
          ],
        },
        {
          h: "Crea tu primer código QR",
          steps: [
            "Abre el generador con el botón Crear en la parte superior de cualquier página.",
            "Elige un tipo: URL, WiFi, Texto, vCard, Email, SMS, PDF o Tarjeta de visita. También puedes empezar con una plantilla como WhatsApp, Spotify o Google Maps.",
            "Rellena el contenido. La vista previa aparece y se actualiza mientras escribes.",
            "Pasa a Diseño para cambiar colores y formas, añadir un logo y un marco (lo vemos en la guía de personalización).",
            "Haz clic en Descargar y elige PNG, SVG o PDF.",
          ],
        },
        {
          h: "¿Qué tipo elegir?",
          list: [
            "URL: llevar a una web, una tienda, un formulario o un vídeo.",
            "WiFi: que tus invitados se conecten sin teclear la contraseña.",
            "vCard: compartir tus datos de contacto con un escaneo.",
            "Email y SMS: abrir un mensaje prerrellenado.",
            "Texto: mostrar un mensaje que funciona sin conexión.",
            "PDF: abrir una carta, un folleto o un documento (requiere cuenta gratuita).",
            "Tarjeta de visita: una página móvil alojada que puedes editar cuando quieras.",
          ],
        },
        {
          h: "Antes de imprimir",
          p: [
            "Escanea siempre el archivo descargado con tu móvil. Comprueba que abre la página o acción correcta y que se escanea desde la distancia a la que estará la gente.",
            "Si el generador muestra un aviso de contraste, longitud o tamaño del logo, síguelo: algunos móviles no pueden leer esos códigos.",
          ],
        },
      ],
    },
    {
      slug: "customize-qr-code-logo-colors",
      title: "Cómo personalizar tu código QR: logo, colores y marco",
      desc: "Adapta tu código QR a tu marca con estilos, colores, formas, un logo central y un marco «Scan me», sin romper el escaneo.",
      minutes: 5,
      cta: { href: "/create", label: "Diseñar mi código QR" },
      sections: [
        {
          h: "Empieza con un estilo",
          p: [
            "En la pestaña Diseño, la fila Estilos ofrece combinaciones de colores listas, como Classic, Midnight, Ocean o Gold. Elige una como punto de partida y luego ajústala.",
          ],
        },
        {
          h: "Personaliza paso a paso",
          steps: [
            "Color del código: elige el color de los módulos. Los colores oscuros se escanean mejor.",
            "Fondo: elige un color claro o deja el blanco.",
            "Forma de los módulos: cuadrados, puntos, redondeados o classy.",
            "Logo central: sube tu logo. Se coloca en el centro del código.",
            "Marco: añade un marco y una llamada a la acción, como SCAN ME, FREE WIFI o SEE THE MENU, o escribe tu propio texto.",
          ],
        },
        {
          h: "Reglas para que tu código se pueda escanear",
          list: [
            "Mantén un contraste fuerte: código oscuro sobre fondo claro.",
            "Evita un código claro sobre fondo oscuro; algunos lectores no leen códigos invertidos.",
            "Mantén el logo pequeño. El generador te avisa si cubre demasiado el código.",
            "Deja el margen blanco alrededor del código en tu diseño.",
          ],
        },
        {
          h: "Por qué ayuda un marco",
          p: [
            "La gente escanea más cuando sabe qué va a obtener. Una llamada a la acción corta como «SEE THE MENU» o «SCAN FOR WIFI» da un motivo para sacar el móvil y hace que el código destaque en un folleto cargado.",
          ],
        },
      ],
    },
    {
      slug: "download-and-print-qr-code",
      title: "Cómo descargar e imprimir un código QR (PNG, SVG o PDF)",
      desc: "Qué formato elegir, a qué tamaño imprimir y cómo probar tu código QR para que se escanee siempre.",
      minutes: 4,
      cta: { href: "/create", label: "Crear y descargar" },
      sections: [
        {
          h: "Elige el formato adecuado",
          list: [
            "PNG: una imagen para webs, redes sociales, emails y documentos.",
            "SVG: un archivo vectorial nítido a cualquier tamaño. Ideal para imprentas, rótulos y herramientas como Canva, Illustrator o Figma.",
            "PDF: listo para imprimir o enviar a una imprenta.",
          ],
        },
        {
          h: "A qué tamaño imprimir",
          p: [
            "Regla sencilla: el código debe medir al menos una décima parte de la distancia de escaneo. Para una tarjeta de visita o una mesa bastan 2 o 3 cm. Para un cartel leído a 2 metros, apunta a 20 cm.",
            "Los códigos con más contenido, como textos largos o vCards completas, son más densos y deben imprimirse más grandes.",
          ],
        },
        {
          h: "Prueba antes de imprimir",
          steps: [
            "Abre el archivo descargado en otra pantalla o imprime una sola copia de prueba.",
            "Escanéalo con un iPhone y un Android.",
            "Comprueba que abre el enlace, la red, el contacto o el mensaje correcto.",
            "Prueba desde la distancia y la iluminación del lugar donde se usará.",
          ],
        },
        {
          h: "Consejos de impresión",
          list: [
            "Usa papel mate si puedes: las superficies brillantes reflejan la luz.",
            "No deformes el código; cámbialo de tamaño proporcionalmente.",
            "Mantén el margen blanco alrededor del código.",
            "Evita colocar el código sobre una curva o un pliegue.",
          ],
        },
      ],
    },
    {
      slug: "create-digital-business-card",
      title: "Cómo crear una tarjeta de visita digital con QRVAREN",
      desc: "Configura tu tarjeta de visita alojada, añade tus datos, publícala y compártela con un código QR que nunca cambia.",
      minutes: 5,
      cta: { href: "/business-card", label: "Ver la tarjeta de visita" },
      sections: [
        {
          h: "¿Qué es una tarjeta de visita digital?",
          p: [
            "Es una página móvil para ti o tu negocio, con logo, foto, datos de contacto, dirección y mapa, horario, redes sociales, galería y enlaces. Los visitantes tienen tres botones: Llamar, Guardar contacto y Cómo llegar.",
            "A diferencia de un código QR vCard, puedes editarla cuando quieras. El código QR sigue siendo el mismo, así que nunca tienes que reimprimir.",
          ],
        },
        {
          h: "Crea tu tarjeta",
          steps: [
            "Haz clic en Iniciar sesión y entra con Google. Debes tener 18 años o más.",
            "En tu panel, abre Mi tarjeta de visita e inicia el editor.",
            "Rellena tu nombre, eslogan, teléfono, email, dirección, horario y enlaces.",
            "Sube tu logo, una foto de perfil e imágenes de galería.",
            "Elige un plan mensual o anual para publicar la tarjeta en su propia dirección.",
          ],
        },
        {
          h: "Compártela",
          list: [
            "Descarga el código QR de la tarjeta y añádelo a folletos, escaparates y envases.",
            "Diseña una tarjeta de visita impresa en el panel, con el código QR.",
            "Comparte el enlace de la tarjeta en tu firma de email y en redes sociales.",
          ],
        },
        {
          h: "Sigue tus escaneos",
          p: [
            "Tu panel muestra cuántas veces se escaneó el código QR de tu tarjeta en los últimos 30 días, para que veas qué funciona. Los escaneos se cuentan sin vender los datos de nadie.",
          ],
        },
      ],
    },
    {
      slug: "design-printed-business-card",
      title: "Cómo diseñar e imprimir una tarjeta de visita con código QR",
      desc: "Usa el diseñador de tarjetas de QRVAREN para crear una tarjeta de visita en papel con tu código QR y descargar un PDF listo para imprimir.",
      minutes: 4,
      cta: { href: "/login", label: "Abrir mi panel" },
      sections: [
        {
          h: "Abre el diseñador",
          p: [
            "El diseñador de tarjetas impresas está en tu panel, en Tarjeta impresa. Inicia sesión con Google para acceder.",
          ],
        },
        {
          h: "Diseña tu tarjeta",
          steps: [
            "Elige una plantilla, como Classic, Bold, Minimal o Elegant. Rellena las dos caras con tus datos.",
            "Edita tus datos en el panel lateral o haz clic en cualquier texto de la tarjeta.",
            "Añade texto, imágenes, tu logo, formas y un código QR. Arrastra para mover y usa el tirador redondo para cambiar el tamaño.",
            "Elige qué abre el código QR: tu tarjeta online, cualquier enlace o tu propia imagen de código QR.",
            "Mantén todo dentro de la línea discontinua para que nada se corte.",
          ],
        },
        {
          h: "Descarga e imprime",
          list: [
            "PDF para la imprenta: anverso y reverso con sangrado, a 300 ppp, listo para una imprenta.",
            "Imprimir en casa: una hoja de 10 tarjetas con marcas de corte. Imprime a doble cara, volteando por el borde largo.",
            "Elige el tamaño de tarjeta de EE. UU. o europeo antes de exportar.",
          ],
        },
        {
          h: "Tamaño del código QR en una tarjeta",
          p: [
            "Mantén el código QR de al menos 2 cm de ancho. El diseñador te avisa cuando es demasiado pequeño para algunos móviles.",
          ],
        },
      ],
    },
  ],
};

export default es;
