# Itera — Sistema de Diseño

Documentación de los componentes reutilizables y tokens de diseño de Itera.

Todos los componentes viven en `components/ui/` y se exportan desde `components/ui/index.ts`.

La referencia visual activa vive en las superficies del simulador: landing, field-test, runtime, dashboard y reporte.

---

## Tokens de diseño

### Colores de acento

| Nombre        | Hex       | Uso                                    |
|---------------|-----------|----------------------------------------|
| **Primary**   | `#1472FF` | Botones, links, badges, fills          |
| **Primary hover** | `#1265e0` | Hover sobre primary                |
| **Primary depth** | `#0E5FCC` | border-b en depth buttons/cards    |
| **Completado**    | `#22c55e` | Cards/estados completados          |
| **Completado depth** | `#16a34a` | border-b en completado          |

### Texto

| Contexto        | Light       | Dark         |
|-----------------|-------------|--------------|
| Primario        | `#4b4b4b`   | `white`      |
| Secundario      | `#777777`   | `gray-400`   |
| Acento          | `#1472FF`   | `#1472FF`    |

### Fondos

| Contexto        | Light         | Dark          |
|-----------------|---------------|---------------|
| Página          | `gray-50/30`  | `gray-900`    |
| Card            | `white`       | `gray-900`    |
| Depth/profundidad | `gray-300`  | `gray-950`    |

### Bordes

| Contexto          | Light           | Dark           |
|-------------------|-----------------|----------------|
| Card neutral      | `gray-200`      | `gray-950`     |
| Card neutral (b)  | `gray-300`      | `gray-950`     |
| Primary           | `#0E5FCC`       | `#0E5FCC`      |
| Completado        | `#16a34a`       | `#16a34a`      |

### Radios

- `rounded-xl` (0.75rem) — botones, inputs, icon buttons
- `rounded-2xl` (1rem) — cards, nav buttons, search inputs

### Espaciado común

- Padding de cards: `p-4` a `p-6`
- Gaps: `gap-2` a `gap-4`
- Vertical: `space-y-4` a `space-y-8`

---

## Componentes

### `<Button>`

Botón con efecto de profundidad (border-b-4, active presses down).

```tsx
import { Button } from '@/components/ui';

<Button variant="primary">Guardar</Button>
<Button variant="outline">Cancelar</Button>
<Button variant="secondary">Alternativo</Button>
<Button variant="ghost">Cerrar</Button>
<Button variant="completado">Completado</Button>
<Button variant="nav-active">Inicio</Button>
<Button variant="nav-inactive">Casos</Button>
<Button variant="danger">Eliminar</Button>

// Como link
<Button variant="primary" href="/dashboard">Ir al dashboard</Button>

// Tamaños
<Button size="sm">Pequeño</Button>
<Button size="md">Normal</Button>   // default
<Button size="lg">Grande</Button>
<Button size="xl">Extra</Button>

// Rounded-2xl (para nav buttons)
<Button variant="nav-active" rounded2xl>Inicio</Button>
```

**Props:**

| Prop        | Tipo                  | Default     | Descripción                      |
|-------------|-----------------------|-------------|----------------------------------|
| `variant`   | `ButtonVariant`       | `'primary'` | Estilo visual                    |
| `size`      | `ButtonSize`          | `'md'`      | Tamaño de padding/texto          |
| `href`      | `string?`             | —           | Renderiza como Next.js Link      |
| `rounded2xl`| `boolean`             | `false`     | Usa rounded-2xl en vez de xl     |
| `disabled`  | `boolean`             | `false`     | Estado deshabilitado             |

**Variants:** `primary`, `outline`, `secondary`, `ghost`, `nav-active`, `nav-inactive`, `completado`, `danger`

**Exports auxiliares:**
- `depthClasses` — clases bare de profundidad sin colores
- `depthPrimaryColors` — colores de profundidad primary
- `depthOutlineColors` — colores de profundidad outline

---

### `<IconButton>`

Botón de icono de 42×42px con variantes primary/outline/ghost.

```tsx
import { IconButton } from '@/components/ui';

<IconButton variant="primary" aria-label="Añadir"><PlusIcon /></IconButton>
<IconButton variant="outline" aria-label="Ajustes"><GearIcon /></IconButton>
<IconButton variant="ghost" aria-label="Menú"><MenuIcon /></IconButton>

// Como div (dentro de otro botón, ej: avatar)
<IconButton as="div" variant="primary">PC</IconButton>
```

**Props:**

| Prop        | Tipo                     | Default     | Descripción                      |
|-------------|--------------------------|-------------|----------------------------------|
| `variant`   | `IconButtonVariant`      | `'primary'` | `primary` / `outline` / `ghost`  |
| `size`      | `IconButtonSize`         | `'sm'`      | `sm` (42px), `md` (42px), `lg` (48px) |
| `as`        | `'button'` \| `'div'`   | `'button'`  | Elemento HTML a renderizar       |

---

### `<Card>`

Card con borde de profundidad (border-b-4).

```tsx
import { Card, CardFlat } from '@/components/ui';

<Card variant="neutral" padding="lg">Contenido neutro</Card>
<Card variant="primary" interactive>Card clickeable azul</Card>
<Card variant="completado">Tarea completada</Card>

// Card sin profundidad (solo border-2)
<CardFlat className="shadow-sm p-6">Contenido plano</CardFlat>
```

**Props:**

| Prop          | Tipo                    | Default     | Descripción                      |
|---------------|-------------------------|-------------|----------------------------------|
| `variant`     | `CardVariant`           | `'neutral'` | `neutral` / `primary` / `completado` |
| `interactive` | `boolean`               | `false`     | Agrega hover + active depth      |
| `padding`     | `'none'` \| `'sm'` \| `'md'` \| `'lg'` | `'md'` | Padding interno |

---

### `<Input>` / `<Textarea>` / `<SearchInput>`

Inputs con borde de profundidad y focus ring azul.

```tsx
import { Input, Textarea, SearchInput } from '@/components/ui';

<Input placeholder="Tu nombre" />
<Input type="email" placeholder="correo@ejemplo.com" />
<Textarea placeholder="Describe tu proyecto..." rows={4} />
<SearchInput placeholder="Buscar por nombre, tema..." />
```

**Estilos base:**
- `border-2 border-b-4` (depth)
- `focus:ring-2 focus:ring-[#1472FF]/20 focus:border-[#1472FF]`
- Light: `border-gray-200 / border-b-gray-300 / bg-white`
- Dark: `border-gray-950 / bg-gray-900`

---

### `<Divider>`

Línea divisora con título opcional centrado.

```tsx
import { Divider } from '@/components/ui';

<Divider />
<Divider title="Sección" />
```

**Estilos:** `h-[2px]`, `bg-gray-300` (light) / `bg-gray-600` (dark), `rounded-full`.

---

### `<Typography>`

Texto con niveles tipográficos del design system.

```tsx
import { Typography, Title, Subtitle, Headline, Body, Caption } from '@/components/ui';

<Title>diagnóstico de criterio operativo</Title>
<Subtitle>simulaciones para equipos que usan IA</Subtitle>
<Headline>Sección</Headline>
<Body>Texto de párrafo normal.</Body>
<Caption>Texto secundario o pie.</Caption>

// O con el componente genérico:
<Typography level="title" as="h2">título como h2</Typography>
```

**Niveles:**

| Nivel      | Tamaño    | Peso       | Case       | Color light | Color dark |
|------------|-----------|------------|------------|-------------|------------|
| `title`    | 1.5rem    | extrabold  | lowercase  | `#4b4b4b`   | white      |
| `subtitle` | 1.125rem  | bold       | lowercase  | `#4b4b4b`   | gray-300   |
| `headline` | 0.875rem  | bold       | UPPERCASE  | `#4b4b4b`   | gray-300   |
| `body`     | 1rem      | normal     | normal     | `#4b4b4b`   | gray-300   |
| `caption`  | 0.75rem   | normal     | normal     | `#777777`   | gray-400   |

---

### `<ProgressBar>`

Barra de progreso reutilizable.

```tsx
import { ProgressBar } from '@/components/ui';

<ProgressBar value={65} />
<ProgressBar value={40} size="lg" color="green" />
<ProgressBar value={80} size="sm" color="primary" />
```

**Props:**

| Prop             | Tipo                          | Default     |
|------------------|-------------------------------|-------------|
| `value`          | `number` (0–100)              | —           |
| `size`           | `'sm'` \| `'md'` \| `'lg'`   | `'md'`      |
| `color`          | `'primary'` \| `'white'` \| `'green'` \| `'yellow'` | `'primary'` |
| `trackClassName` | `string?`                     | automático  |
| `animate`        | `boolean`                     | `true`      |

---

### `<StatCard>`

Tarjeta de estadística (emoji + valor + label).

```tsx
import { StatCard } from '@/components/ui';

<StatCard icon="⚑" value={5} label="Casos completos" color="orange" />
<StatCard icon="✓" value={3} label="Prácticas hechas" color="green" />
<StatCard icon="↑" value={1} label="Nivel" color="blue" />
<StatCard icon="•" value={150} label="Evidencias" color="blue" />
```

**Props:**

| Prop    | Tipo                                      | Default     |
|---------|-------------------------------------------|-------------|
| `icon`  | `ReactNode`                               | —           |
| `value` | `ReactNode`                               | —           |
| `label` | `string`                                  | —           |
| `color` | `'blue'` \| `'orange'` \| `'green'` \| `'neutral'` | `'neutral'` |

---

### `<Tag>`

Pill / tag para labels, skills, categorías.

```tsx
import { Tag } from '@/components/ui';

<Tag variant="primary">Next.js</Tag>
<Tag variant="success">Completado</Tag>
<Tag variant="warning">En progreso</Tag>
<Tag variant="neutral">Básico</Tag>
```

**Variants:** `primary`, `outline`, `success`, `warning`, `neutral`

---

### `<Spinner>` / `<SpinnerPage>`

Indicador de carga.

```tsx
import { Spinner, SpinnerPage } from '@/components/ui';

<Spinner />                    // 32px inline
<Spinner size="lg" />          // 48px
<SpinnerPage />                // Centrado en página completa
```

---

### `<SectionHeader>`

Encabezado de página/sección consistente.

```tsx
import { SectionHeader } from '@/components/ui';

<SectionHeader title="casos" subtitle="Practica decisiones con IA bajo presión" />
<SectionHeader
  title="casos asignados"
  subtitle="Revisa el trabajo pendiente de tu equipo"
  action={<Button variant="primary" size="sm">Nuevo</Button>}
/>
```

---

### `<EmptyState>`

Card de estado vacío / zero-state.

```tsx
import { EmptyState, Button } from '@/components/ui';

<EmptyState
  icon={<LightningIcon className="w-10 h-10 text-white" />}
  title="Aún no tienes casos"
  description="Los casos aparecerán cuando tu manager active un sprint."
  action={<Button variant="primary">Ver field-test</Button>}
/>
```

---

## Reglas del sistema

1. **Títulos en minúsculas** — Títulos y subtítulos siempre en minúsculas, salvo nombres propios de usuario.
2. **Nunca usar `#5BA0FF`** ni otros tonos de azul. Solo `#1472FF` (primary) y `#0E5FCC` (depth).
3. **Siempre depth borders en elementos interactivos** — Botones y cards clickeables usan `border-2 border-b-4` con el efecto `active:border-b-2 active:mt-[2px]`.
4. **Focus rings** — Inputs y textareas usan `focus:ring-2 focus:ring-[#1472FF]/20 focus:border-[#1472FF]`.
5. **Radios consistentes** — Botones e inputs: `rounded-xl`. Cards, search inputs, nav buttons: `rounded-2xl`.
6. **Texto secundario** — Light: `text-[#777777]`. Dark: `text-gray-400`. Nunca otros grises para texto secundario.
7. **Dark mode** — Todos los componentes soportan dark mode vía clases `dark:`.
8. **Font** — Darker Grotesque (configurado globalmente en layout). No se necesita especificar font-family.
9. **Espaciado con sistema Tailwind** — Usar la escala estándar (4, 8, 12, 16, 24, 32, 40, 48px). No pixeles arbitrarios salvo las excepciones documentadas (42px icon buttons, 2px dividers).
10. **Uppercase tracking** — Headlines y labels: `font-bold uppercase tracking-wider`. Botones: `font-bold uppercase tracking-wide`.

---

## Import rápido

```tsx
import {
  Button,
  IconButton,
  Card, CardFlat,
  Input, Textarea, SearchInput,
  Divider,
  Typography, Title, Subtitle, Headline, Body, Caption,
  ProgressBar,
  StatCard,
  Tag,
  Spinner, SpinnerPage,
  SectionHeader,
  EmptyState,
} from '@/components/ui';
```
