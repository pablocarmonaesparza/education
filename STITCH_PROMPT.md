# Prompt para Stitch (Gemini) — Landing Page de Itera

> **Instrucciones de uso:** Copia el prompt de abajo en Stitch (stitch.withgoogle.com).
> Usa **Experimental Mode** para mejor fidelidad. Si necesitas ajustes, haz cambios incrementales uno a uno.

---

## Prompt

```
Design a single-page landing page for "Itera", an AI-powered education platform that generates personalized courses based on the user's project idea. The page is in Spanish. Use a modern, clean, minimalist aesthetic with playful 3D depth effects on interactive elements.

BRAND & COLORS:
- Primary blue: #1472FF (buttons, accents, links, active icons)
- Primary dark blue: #0E5FCC (depth borders, hover states)
- Success green: #22c55e (checkmarks, completed states)
- Main text: #4b4b4b (headings and body in light mode)
- Muted text: #777777 (secondary text, captions)
- Backgrounds: white and gray-50 for light mode
- Borders: light gray (#e5e7eb)
- Font for headings: a geometric sans-serif (bold/extrabold, lowercase style)
- Font for body: clean sans-serif (Inter style)
- All titles and subtitles in lowercase except proper nouns

3D DEPTH EFFECT (apply to ALL buttons, interactive cards, and form elements):
- Normal state: 2px border on all sides + 4px border on bottom (creates a raised 3D look)
- Active/pressed state: bottom border collapses to 2px and element shifts down 2px (press-in effect)
- Use smooth 150ms transitions
- Border radius: rounded-xl for buttons/inputs, rounded-2xl for cards, rounded-full for tags/pills

LAYOUT — 6 full-height sections, vertically stacked:

SECTION 1 — HERO (full viewport height, centered content, white background):
- Large heading: "un curso a partir de tu idea" (lowercase, extrabold, responsive: ~text-6xl desktop / text-3xl mobile)
- Below the heading: a textarea input field with placeholder "Describe tu idea y haremos un curso personalizado para ti." — 3 rows, rounded-2xl, with a subtle 3D depth shadow on the bottom border (not the full depth effect, just a box-shadow simulating it)
- Character counter in bottom-right of textarea showing "0/100" format, turns green when >= 100 characters
- Below textarea (appears on focus): a label "O elige una idea para inspirarte" and 5 horizontally-wrapped suggestion pills/chips with emojis: "💬 Chatbot de atención al cliente", "⚙️ Automatización de procesos", "📊 Análisis de datos con IA", "🛒 E-commerce inteligente", "🤖 Asistente virtual" — each pill has the 3D depth effect, rounded-xl, and when selected turns solid #1472FF with white text
- CTA button below: "Generar mi curso →" (primary blue #1472FF, white text, 3D depth effect with bottom-only border style, rounded-2xl, generous padding). Disabled state when textarea is empty or under 100 chars
- At very bottom: a small scroll indicator "Cómo Funciona" with a bouncing chevron-down icon

SECTION 2 — HOW IT WORKS (full viewport height, white background):
- Section heading: "cómo funciona" (same style as hero heading, centered)
- Desktop layout: 3-column grid — left 1/3 has 3 stacked text blocks, right 2/3 has an image area
- The 3 steps shown vertically on the left:
  1. "el problema" — "Los cursos genéricos te hacen recorrer caminos interminables..."
  2. "cuéntanos tu idea" — "Describe el proyecto que quieres crear..."
  3. "tu camino directo" — "Recibe un curso personalizado con videos ordenados paso a paso..."
- Step titles in #1472FF (bold), descriptions in #4b4b4b
- Active step has full opacity, inactive steps are at 30% opacity
- Right side: placeholder image area (rounded-2xl, light gray background) showing a mockup or illustration
- Mobile: horizontal swipeable carousel with pagination dots at bottom (active dot = #1472FF elongated pill, inactive = small gray circle)

SECTION 3 — AVAILABLE COURSES (full viewport height, background transitions to #1472FF as you scroll into it):
- Heading: "posibilidades infinitas" (white text, extrabold, centered)
- Subheading: "con nuestros más de 1,000 videos, generamos cursos personalizados para cualquier proyecto de IA y automatización" (white/90% opacity)
- Two horizontal auto-scrolling carousel rows of course cards:
  - Row 1 scrolls left, Row 2 scrolls right (opposite directions)
  - Each card: dark navy background (#0a1e3d), rounded-2xl, 3D depth border (gray-600 borders), width ~280px
  - Card content: large emoji icon, bold white title, and 2-3 topic tags (white text on white/20% background, rounded-full pills)
  - Example cards: "💬 Chatbots Inteligentes" [LLMs, APIs, Automatización], "⚙️ Automatización de Procesos" [n8n, Workflows, APIs], "📊 Análisis de Datos con IA" [Data & Analytics, Visualización], "🚀 Productos con IA" [Vibe-Coding, Deployment], "🤖 Agentes Autónomos" [Agentes, LLMs, MCP], "🧠 Sistemas RAG" [RAG, Vector Stores, Embeddings]
- Below carousels: "Comenzar →" button (outline style, white background, #1472FF text, 3D depth, rounded-2xl)
- Scroll indicator: "Precios" with bouncing chevron (white/60% opacity)

SECTION 4 — PRICING (full viewport height, white background):
- Heading: "nuestros planes" (centered, same heading style)
- 3 pricing cards in a horizontal grid (stacks vertically on mobile):

  Card 1 — "básico" (neutral card):
  - Price: "Gratis" in #1472FF, large bold
  - Subtitle: "Sin tarjeta de crédito"
  - Description: "Acceso completo para aprender a tu ritmo."
  - 5 features with green checkmark icons
  - CTA: "COMENZAR GRATIS" (outline button, #1472FF border and text, 3D depth)

  Card 2 — "plus" (highlighted card, most popular):
  - "más popular" badge: small rounded-full pill at top, solid #1472FF background, white text, uppercase
  - Card has a subtle #1472FF/10% tinted background and #1472FF border
  - Price: "$19/mes" in #1472FF, large bold + "USD" label
  - Subtitle: "Cancela cuando quieras"
  - Description: "La experiencia completa con IA personalizada."
  - 5 features with green checkmarks
  - CTA: "COMENZAR CON PLUS" (solid primary button, #1472FF, white text, 3D depth with bottom-only border)

  Card 3 — "pro" (neutral card):
  - Price: "$199/mes" in #1472FF + "USD"
  - Subtitle: "Cancela cuando quieras"
  - Description: "Experiencia premium con tutoría personalizada."
  - 5 features with green checkmarks
  - CTA: "COMENZAR CON PRO" (outline button)

- All cards same height, features list grows with flex-1
- Scroll indicator: "FAQ" with bouncing chevron

SECTION 5 — FAQ (full viewport height, white background):
- Heading: "preguntas frecuentes" (centered)
- Subheading: "encuentra respuestas a tus dudas más comunes" (muted gray #777777)
- 4 accordion items, each inside a card with 3D depth:
  - Question text: bold, uppercase, tracking-wide
  - Chevron icon on right inside a small gray circle, rotates 180° when open
  - Answer text: muted gray, appears with height animation when expanded
  - Questions:
    1. "¿Necesito experiencia previa en programación o IA?"
    2. "¿Cuánto tiempo me tomará completar el curso?"
    3. "¿Qué pasa si el curso no me funciona?"
    4. "¿Cómo funciona la personalización con IA?"

SECTION 6 — FOOTER (compact, gray-50 background):
- Left: "© 2026 Itera. Todos los derechos reservados." (muted gray)
- Right: two links "Términos" and "Privacidad" (muted gray, hover turns #1472FF)

NAVBAR (fixed at top, transparent initially, gains subtle background on scroll):
- Logo "Itera" on the left
- Desktop: centered navigation links — "Cómo Funciona", "Cursos", "Precios", "FAQ" — with a sliding pill indicator behind the active link
- Right side: "Iniciar sesión" and "Crear cuenta" buttons
- Mobile: hamburger menu that opens a fullscreen overlay with the same links
- Navbar hides when the "Available Courses" section (blue background) is in view

RESPONSIVE DESIGN:
- Mobile-first approach
- Hero textarea grows on mobile, suggestion pills wrap naturally
- Pricing cards stack vertically on mobile
- How It Works becomes a horizontal swipeable carousel on mobile
- Touch-friendly: minimum 44px touch targets on mobile
- Reduce padding on mobile (px-3 instead of px-6)

ANIMATIONS (describe for reference, Stitch will render static):
- Hero content fades in with staggered timing (heading first, then textarea, then button)
- Suggestion pills scale-in with slight delay between each
- Section headings fade in and slide up when scrolling into view
- FAQ accordions expand/collapse smoothly
- Background color smoothly transitions from white → #1472FF when the courses section enters the viewport
```

---

## Tips para iterar en Stitch

1. **Un cambio a la vez.** Si algo no queda bien, pide un ajuste especifico: "Make the pricing cards equal height" o "Change the hero heading to lowercase."
2. **Usa adjetivos de estilo.** Si el resultado se ve muy plano, agrega: "Make the design more playful with pronounced 3D depth borders on all interactive elements."
3. **Exporta a Figma** para refinar detalles como spacing exacto, iconos, e imagenes reales.
4. **El efecto de depth 3D** es el diferenciador visual de Itera. Enfatizalo si Stitch no lo captura bien: "Add a 4px bottom border that collapses on press to all buttons and cards, creating a tactile 3D effect."
5. **Modo oscuro** no esta incluido en el prompt (Stitch maneja mejor un solo tema). Agregar dark mode como iteracion posterior.
