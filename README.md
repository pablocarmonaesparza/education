# Itera

Itera es una plataforma para aprender AI aplicándola al trabajo real. El producto no vende acceso a más información: vende retención, práctica y ejecución mediante lecciones cortas con ejercicios interactivos.

El usuario puede seguir una ruta completa o describir lo que quiere construir para recibir una ruta personalizada.

## Stack

- Next.js 16 + React 19
- TypeScript
- Tailwind CSS
- Supabase Auth + Postgres
- Stripe
- AgentMail
- OpenAI, Anthropic, Cohere y Google GenAI para generación, tutoría y recuperación de contenido

## Producto

- Landing pública con pricing y FAQ
- Auth con Supabase
- Onboarding e intake de proyecto
- Dashboard de aprendizaje
- Lecciones interactivas renderizadas desde contenido estructurado
- Tutor con contexto de progreso
- Progreso, XP, rachas y badges
- Pagos con Stripe
- Emails transaccionales
- Feedback por slide para reportar problemas de contenido

## Fuentes de verdad

- [docs/CONTEXT.md](docs/CONTEXT.md): contexto de producto, negocio y roadmap
- [docs/METODOLOGIA.md](docs/METODOLOGIA.md): contrato pedagógico de lecciones
- [docs/LESSONS_v1.md](docs/LESSONS_v1.md): outline maestro de 100 lecciones
- [docs/SCHEMA_v1.md](docs/SCHEMA_v1.md): schema conceptual
- [supabase/migrations](supabase/migrations): schema real aplicado por migraciones
- [AGENTS.md](AGENTS.md): reglas del design system y operación del repo

## Desarrollo

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
```

Emails:

```bash
npm run email:preview
```

## Estructura

```txt
app/                    rutas de Next.js
components/ui/          design system base
components/shared/      componentes compartidos
components/landing/     landing pública
components/dashboard/   experiencia de dashboard
components/experiment/  renderer de lecciones interactivas
content/lessons/        lecciones en JSON
docs/                   producto, metodología, schema e investigación
lib/                    integraciones y lógica de dominio
scripts/                utilidades de contenido y carga
supabase/               config, funciones y migraciones
types/                  tipos compartidos
```

## Notas de producto

- El formato principal son ejercicios interactivos, no contenido pasivo.
- La audiencia primaria es LATAM B2B: gente que necesita aplicar AI en su empresa o trabajo.
- La moneda pública se expresa en USD.
- La UI nueva debe usar los componentes y tokens definidos en el design system.
