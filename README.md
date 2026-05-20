# Itera

Itera es un simulador corporativo para medir y entrenar criterio operativo al usar IA en trabajo real.

La versión activa ya no contiene producto de cursos. El flujo central es:

`simulación -> diagnóstico -> práctica -> re-simulación -> evidencia -> acción manager`

## Stack

- Next.js 16 + React 19
- TypeScript
- Tailwind CSS
- Supabase Auth + Postgres, schema `simulador`
- Stripe para billing B2B
- AgentMail para emails transaccionales
- Anthropic / providers compatibles para judge y beats de IA

## Superficie activa

- `/` landing pública
- `/auth/login`
- `/auth/signup`
- `/field-test/marketing-urgent-campaign-pii`
- `/dashboard`
- `/case/[case_id]`
- `/report/[session_id]`
- `/admin`

## Fuentes de verdad

- [AGENTS.md](AGENTS.md): reglas operativas del repo
- [docs/simulador/front/FRONT_CONTRACT.md](docs/simulador/front/FRONT_CONTRACT.md): rutas y roles activos
- [docs/simulador/front/PRODUCT_VISION_ONE_PAGER.md](docs/simulador/front/PRODUCT_VISION_ONE_PAGER.md): visión de producto y experiencia
- [docs/simulador/contrato_v0](docs/simulador/contrato_v0): contrato de casos, rúbricas, variantes y field-test
- [docs/coord](docs/coord): coordinación Codex / Claude Code

## Desarrollo

```bash
npm install
npm run dev:simulador
```

Validación principal:

```bash
npm run check:simulador
npm run lint:simulador
npm run build
```

## Estructura

```txt
app/                    rutas activas de Next.js
components/simulador/   superficies del simulador
components/ui/          sistema visual base
docs/simulador/         contrato de producto
docs/coord/             coordinación multiagente
lib/simulador/          dominio, judge, billing, copy y runtime helpers
scripts/simulador/      validadores, seeds y QA del simulador
supabase/migrations/    migraciones activas del schema simulador
```

## Regla de limpieza

Nada del producto anterior debe vivir en el árbol activo. Si aparece como ruta, componente, lib, script, doc operativo o tabla `public.*`, es regresión.
