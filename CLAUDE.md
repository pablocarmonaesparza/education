# Itera — Reglas del Design System

> **Regla absoluta:** Todo nuevo UI debe usar SOLO estos componentes y tokens.
> Nunca escribir colores hex inline, depth effects manuales, ni clases Tailwind sueltas para UI que ya tiene componente.

---

## Tokens de Diseno (`lib/design-tokens.ts`)

### Depth (profundidad 3D)

| Token              | Valor                                                              |
| ------------------ | ------------------------------------------------------------------ |
| `depthBase`        | `border-2 border-b-4 active:border-b-2 active:mt-[2px] ...`       |
| `depthStructure`   | `border-2 border-b-4 transition-all duration-150` (sin active)     |
| `depthActiveGroup` | `group-active:border-b-2 group-active:mt-[2px]`                   |

### Botones (constantes)

| Token                 | Valor           |
| --------------------- | --------------- |
| `DEPTH_BUTTON_HEIGHT` | `min-h-[40px]`  |
| `DEPTH_BUTTON_PADDING`| `px-4 py-2`     |
| `DEPTH_BUTTON_TEXT`   | `text-sm`       |

---

## Colores permitidos

Solo usar estos colores. Nunca inventar tonos ni usar otros hex.

| Nombre            | Hex        | Uso                                      |
| ----------------- | ---------- | ---------------------------------------- |
| Primary           | `#1472FF`  | Botones, acentos, links, iconos activos  |
| Primary Dark      | `#0E5FCC`  | Borders de depth, hover oscuro           |
| Completado        | `#22c55e`  | Badges y cards de estado completado      |
| Completado Dark   | `#16a34a`  | Borders de depth en completado           |
| Text Main (light) | `#4b4b4b`  | Texto principal en modo claro            |
| Text Muted        | `#777777`  | Texto secundario, captions               |
| Text Main (dark)  | `white`    | Texto principal en modo oscuro           |
| Text Muted (dark) | `gray-300` / `gray-400` | Texto secundario en modo oscuro |

**Fondos:** `white` / `gray-50` / `gray-100` (light) · `gray-800` / `gray-900` / `gray-950` (dark)
**Bordes:** `gray-200` / `gray-300` (light) · `gray-950` (dark)

---

## Tipografia

| Nivel     | Componente    | Size       | Weight      | Case       | Tag por defecto |
| --------- | ------------- | ---------- | ----------- | ---------- | --------------- |
| title     | `<Title>`     | `text-2xl` | extrabold   | lowercase  | `h1`            |
| subtitle  | `<Subtitle>`  | `text-lg`  | bold        | lowercase  | `h2`            |
| headline  | `<Headline>`  | `text-sm`  | bold        | UPPERCASE  | `h3`            |
| body      | `<Body>`      | `text-base`| normal      | normal     | `p`             |
| caption   | `<Caption>`   | `text-xs`  | normal      | normal     | `p`             |

**Fuente:** Darker Grotesque (headings), Inter (body heredado del layout).
**Regla:** Titulos y subtitulos siempre en minusculas, excepto nombres propios.

```tsx
import { Title, Subtitle, Headline, Body, Caption } from '@/components/ui/Typography';

<Title>curso personalizado para tu proyecto</Title>
<Subtitle>videos a medida con ia</Subtitle>
<Headline>seccion</Headline>
<Body>Texto de parrafo normal.</Body>
<Caption>Texto secundario o pie.</Caption>
```

---

## Componentes UI (`components/ui/`)

### Button

```tsx
import Button from '@/components/ui/Button';

// Variantes: primary, outline, secondary, ghost, nav-active, nav-inactive, completado, danger
// Sizes: sm, md, lg, xl, none
// Depth: 'full' (default, border en todos lados) | 'bottom' (solo border inferior, estilo landing)

<Button variant="primary">Guardar</Button>
<Button variant="outline" href="/dashboard">Volver</Button>
<Button variant="ghost">Cancelar</Button>
<Button variant="completado" disabled>Completado</Button>
```

**Regla:** Todos los botones usan este componente. Nunca crear botones con clases manuales.

### Card

```tsx
import Card, { CardFlat } from '@/components/ui/Card';

// Variantes: neutral, primary, completado
// Padding: none, sm, md (default), lg
// interactive: agrega hover/active depth

<Card variant="neutral" padding="lg">Contenido</Card>
<Card variant="primary" interactive>Card clickeable</Card>
<Card variant="completado">Listo!</Card>
<CardFlat>Card sin profundidad</CardFlat>
```

### Input / Textarea / SearchInput

```tsx
import { Input, Textarea, SearchInput } from '@/components/ui/Input';

// Input variantes: 'default' (depth borders) | 'flat' (auth pages, sin depth)

<Input placeholder="Tu nombre" />
<Input variant="flat" placeholder="Correo" type="email" />
<Textarea placeholder="Describe tu proyecto..." rows={4} />
<SearchInput placeholder="Buscar cursos..." />
```

### ProgressBar

```tsx
import ProgressBar from '@/components/ui/ProgressBar';

// Sizes: sm, md (default), lg
// Colors: primary (default), white, green, yellow

<ProgressBar value={65} />
<ProgressBar value={100} color="green" size="lg" />
```

### Tag

```tsx
import Tag from '@/components/ui/Tag';

// Variantes: primary, outline, success, warning, neutral

<Tag variant="primary">Next.js</Tag>
<Tag variant="success">Completado</Tag>
<Tag variant="neutral">Basico</Tag>
```

### IconButton

```tsx
import IconButton from '@/components/ui/IconButton';

// Variantes: primary (depth), outline (depth), ghost (flat)
// Sizes: sm (42x42, default), md (42x42), lg (48x48)
// as: 'button' (default) | 'div' (cuando esta dentro de otro interactivo)

<IconButton variant="primary" aria-label="Anadir"><PlusIcon /></IconButton>
<IconButton variant="outline" aria-label="Config"><GearIcon /></IconButton>
<IconButton variant="ghost" aria-label="Menu"><MenuIcon /></IconButton>
```

### Spinner

```tsx
import Spinner, { SpinnerPage } from '@/components/ui/Spinner';

// Sizes: sm, md (default), lg

<Spinner />
<Spinner size="lg" />
<SpinnerPage />  // Spinner centrado a pagina completa
```

### SectionHeader

```tsx
import SectionHeader from '@/components/ui/SectionHeader';

<SectionHeader title="retos" subtitle="Practica lo que aprendes" />
<SectionHeader
  title="todos los cursos"
  action={<Button variant="primary" size="sm">Nuevo</Button>}
/>
```

### StatCard

```tsx
import StatCard from '@/components/ui/StatCard';

// Colors: blue, orange, green, neutral

<StatCard icon="🔥" value={5} label="Racha Dias" color="orange" />
```

### Divider

```tsx
import Divider from '@/components/ui/Divider';

<Divider />
<Divider title="Seccion" />
```

### EmptyState

```tsx
import EmptyState from '@/components/ui/EmptyState';

<EmptyState
  icon={<IconoRayo className="w-10 h-10 text-white" />}
  title="Aun no tienes retos"
  description="Los retos se generan automaticamente al crear tu curso."
  action={<Button variant="primary">Crear mi curso</Button>}
/>
```

---

## Componentes Compartidos (`components/shared/`)

### CompositeCard

Caja con 3 slots: leading (izquierda) | content (centro) | trailing (derecha).

```tsx
import CompositeCard from '@/components/shared/CompositeCard';

<CompositeCard
  leading={<IconButton variant="outline" aria-label="Anterior"><ChevronLeft /></IconButton>}
  trailing={<IconButton variant="outline" aria-label="Siguiente"><ChevronRight /></IconButton>}
>
  <Headline>Fase 1</Headline>
  <Caption>Fundamentos</Caption>
</CompositeCard>
```

### HorizontalScroll

```tsx
import HorizontalScroll from '@/components/shared/HorizontalScroll';

// fadeEdges: gradientes en los bordes (default false)

<HorizontalScroll fadeEdges>
  {items.map(item => <Tag key={item.id}>{item.name}</Tag>)}
</HorizontalScroll>
```

### VerticalScroll

```tsx
import VerticalScroll from '@/components/shared/VerticalScroll';

// flex1: llena el espacio en flex containers

<VerticalScroll flex1>
  {messages.map(msg => <ChatBubble key={msg.id} {...msg} />)}
</VerticalScroll>
```

---

## Reglas de Depth (profundidad 3D)

Toda la UI interactiva usa el sistema de depth:

```
Estado normal:   border-2 (todos lados) + border-b-4 (sombra 3D)
Estado activo:   border-b-2 (colapsa) + mt-[2px] (empuja hacia abajo)
Transicion:      transition-all duration-150
```

- **Botones:** Usan `<Button>` que ya incluye depth.
- **Cards interactivas:** Usan `<Card interactive>`.
- **Custom elements:** Importar `depthBase` de `lib/design-tokens.ts`.
- **Dentro de `group`:** Usar `depthStructure` + `depthActiveGroup`.

**Nunca escribir `border-2 border-b-4 active:border-b-2 active:mt-[2px]` manualmente.** Siempre usar el componente o el token.

---

## Reglas de Border Radius

| Elemento           | Radius         |
| ------------------ | -------------- |
| Botones, inputs    | `rounded-xl`   |
| Cards, containers  | `rounded-2xl`  |
| Tags, pills        | `rounded-full` |
| Progress bars      | `rounded-full` |

---

## Reglas de Spacing

Usar multiplos de 4px (escala de Tailwind):

| Token  | Pixeles | Uso comun                  |
| ------ | ------- | -------------------------- |
| `1`    | 4px     | Micro gaps                 |
| `2`    | 8px     | Gaps entre elementos       |
| `3`    | 12px    | Padding interno cards (sm) |
| `4`    | 16px    | Padding estandar           |
| `6`    | 24px    | Padding grande             |
| `8`    | 32px    | Separacion entre secciones |

Patrones comunes: `p-4`, `px-6 py-4`, `gap-3`, `space-y-4`

---

## Modo Oscuro

- Siempre usar prefijo `dark:` de Tailwind.
- Los componentes del design system ya incluyen soporte dark mode.
- Nunca hardcodear colores de modo oscuro fuera de los componentes.

---

## Animaciones

- **Framer Motion:** Para transiciones de entrada/salida, accordions, modales.
- **GSAP:** Para animaciones complejas del background.
- **requestAnimationFrame:** Para carouseles de rendimiento critico.
- **Regla:** Las animaciones se aplican ENCIMA de los componentes del design system, nunca reemplazandolos.

---

## Prohibiciones

1. **Nunca** usar colores hex inline fuera de los componentes UI (`bg-[#1472FF]`, `text-[#4b4b4b]`, etc.)
2. **Nunca** reimplementar depth effects manualmente (`border-2 border-b-4 active:...`)
3. **Nunca** crear botones, cards, inputs o progress bars con clases Tailwind sueltas
4. **Nunca** usar `bg-blue-500`, `bg-green-500` u otros colores de Tailwind no definidos en el sistema
5. **Nunca** hardcodear font sizes o weights para texto que tiene nivel tipografico (usar Typography)
6. **Nunca** crear componentes nuevos que dupliquen funcionalidad existente

---

## Imports rapidos

```tsx
// UI Components
import Button from '@/components/ui/Button';
import Card, { CardFlat } from '@/components/ui/Card';
import { Input, Textarea, SearchInput } from '@/components/ui/Input';
import ProgressBar from '@/components/ui/ProgressBar';
import { Title, Subtitle, Headline, Body, Caption } from '@/components/ui/Typography';
import Tag from '@/components/ui/Tag';
import IconButton from '@/components/ui/IconButton';
import Spinner, { SpinnerPage } from '@/components/ui/Spinner';
import SectionHeader from '@/components/ui/SectionHeader';
import StatCard from '@/components/ui/StatCard';
import Divider from '@/components/ui/Divider';
import EmptyState from '@/components/ui/EmptyState';

// Shared Components
import CompositeCard from '@/components/shared/CompositeCard';
import HorizontalScroll from '@/components/shared/HorizontalScroll';
import VerticalScroll from '@/components/shared/VerticalScroll';

// Design Tokens (solo cuando necesites depth en elementos custom)
import { depthBase, depthStructure, depthActiveGroup } from '@/lib/design-tokens';
```
