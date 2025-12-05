# Próximos Pasos - Plan de Desarrollo

## ✅ Lo que está listo

1. **Landing Page Completa**
   - Hero section con CTAs
   - Sección problema/solución
   - Diferenciadores clave
   - Estructura del curso (12 módulos)
   - Precios (3 tiers con conversión de moneda)
   - FAQs completos
   - Navbar y Footer

2. **Infraestructura Base**
   - Next.js 14+ configurado con TypeScript
   - Tailwind CSS funcionando
   - Supabase configurado (cliente + servidor + middleware)
   - Schema de base de datos listo para ejecutar
   - Tipos TypeScript definidos

## 🚀 Prioridades para MVP (Semana 1-2)

### 1. Sistema de AI Intake (CRÍTICO - es tu diferenciador)

**Archivos a crear:**
- `app/intake/page.tsx` - Página principal del intake
- `components/intake/ChatInterface.tsx` - Chat con el usuario
- `components/intake/PathVisualization.tsx` - Muestra la ruta generada
- `app/api/generate-path/route.ts` - API que llama a Claude

**Pasos:**
1. Crear interfaz de chat conversacional
2. Definir las 5-7 preguntas clave
3. Integrar Claude API para análisis
4. Generar JSON de ruta personalizada
5. Visualizar la ruta en formato timeline/roadmap
6. Guardar en Supabase (tabla `intake_responses`)

**Prompt para Claude (ejemplo):**
```
Eres un experto en IA y automatización. Analiza las siguientes respuestas del usuario:
- Proyecto: {project}
- Experiencia: {experience}
- Meta: {goal}
- Industria: {industry}
- Tiempo disponible: {timeCommitment}

Basándote en el siguiente catálogo de módulos:
{syllabus_json}

Genera una ruta personalizada en JSON con:
1. Módulos recomendados en orden
2. Estimación de tiempo
3. Checkpoints clave
4. Artefactos a crear
```

### 2. Sistema de Autenticación

**Archivos a crear:**
- `app/auth/login/page.tsx`
- `app/auth/signup/page.tsx`
- `app/auth/callback/route.ts` - Para OAuth callback

**Usar:**
- Supabase Auth UI (pre-construido)
- Email + Password
- Opcional: Google/GitHub OAuth

**Documentación:**
https://supabase.com/docs/guides/auth/auth-helpers/nextjs

### 3. Integración de Stripe (Pagos Internacionales)

**Archivos a crear:**
- `app/api/create-checkout/route.ts`
- `app/api/webhooks/stripe/route.ts`
- `app/checkout/page.tsx`

**Productos a crear en Stripe:**
- Basic - $147 USD
- Personalized - $247 USD
- Premium - $497 USD

**Webhooks necesarios:**
- `checkout.session.completed`
- `payment_intent.succeeded`

## 📋 Prioridades para Fase 2 (Semana 3-4)

### 4. Dashboard del Estudiante (LMS Básico)

**Archivos a crear:**
- `app/dashboard/page.tsx` - Vista principal
- `app/dashboard/progress/page.tsx`
- `components/dashboard/ProgressCard.tsx`
- `components/dashboard/VideoPlayer.tsx`
- `app/dashboard/module/[id]/page.tsx`

**Funcionalidades:**
1. Mostrar progreso general (%)
2. "Continuar donde lo dejé"
3. Ruta personalizada visible
4. Acceso a biblioteca completa

### 5. Reproductor de Video

**Opciones:**
- Vimeo Player (embeds)
- YouTube Private videos
- Video.js para videos self-hosted

**Tracking:**
- Guardar `last_position` cada 5 segundos
- Marcar como completado al llegar a 90%
- Auto-avanzar a siguiente video

### 6. Mercado Pago (Pagos LatAm)

**Similar a Stripe pero para:**
- Pix (Brasil)
- OXXO (México)
- Transferencias locales

## 🎨 Mejoras de Diseño (Opcional)

### Fase 3
- Agregar animaciones (Framer Motion)
- Mejorar loading states
- Añadir skeleton loaders
- Dark mode
- Mejor responsive mobile

## 📝 Contenido a Completar

### Páginas Estáticas
1. `/about` - Sobre Pablo y Leap
2. `/syllabus` - Syllabus completo detallado
3. `/terms` - Términos y condiciones
4. `/privacy` - Política de privacidad
5. `/refund` - Política de reembolso
6. `/blog` - Blog (opcional)

### Datos del Curso
- Reemplazar datos hardcodeados en `CourseStructureSection.tsx`
- Importar tu syllabus JSON real
- Agregar metadata de cada video:
  - Skills aprendidos
  - Herramientas usadas
  - Prerequisitos
  - Tipo de proyecto aplicable

## 🔧 Configuración Pendiente

### Supabase
1. Crear proyecto en supabase.com
2. Ejecutar `supabase-schema.sql` en SQL Editor
3. Copiar URL y Anon Key a `.env.local`
4. Configurar Auth providers si usas OAuth
5. Configurar Storage si subes archivos

### Stripe
1. Crear cuenta en stripe.com
2. Crear 3 productos (Basic, Personalized, Premium)
3. Configurar webhooks
4. Copiar keys a `.env.local`

### Anthropic
1. Crear cuenta en console.anthropic.com
2. Obtener API key
3. Agregar a `.env.local`

### Vercel (Deploy)
1. Push a GitHub
2. Conectar repo en vercel.com
3. Agregar variables de entorno
4. Deploy automático en cada push

## 📊 Métricas Importantes

### Para Analytics (Fase 3)
- Conversión de visitas → intake iniciado
- Conversión de intake → compra
- Tier más popular
- Módulo más visto
- Tasa de abandono por módulo
- Tiempo promedio de completación

## 🐛 Testing

### Antes de Lanzar
- [ ] Registro y login funcionan
- [ ] Intake genera rutas correctas
- [ ] Pagos procesan correctamente
- [ ] Videos cargan y trackean progreso
- [ ] Responsive en mobile
- [ ] Emails se envían correctamente
- [ ] Links de navegación funcionan
- [ ] Webhooks de pago funcionan

## 💡 Ideas Adicionales

### Gamificación
- Badges por completar módulos
- Streaks de días consecutivos
- Leaderboard (opcional)

### Social
- Compartir progreso en LinkedIn
- Referral program
- Demo Days para presentar proyectos

### Soporte
- Chat en vivo (Intercom/Crisp)
- Discord community
- Office hours semanales

## 🎯 Hitos Clave

**MVP Lanzable (2 semanas):**
- ✅ Landing page
- ⏳ AI Intake funcional
- ⏳ Auth completo
- ⏳ Stripe funcionando
- ⏳ Dashboard básico con 1 módulo de prueba

**Versión Beta (4 semanas):**
- Todo lo anterior +
- Mercado Pago
- Todos los módulos cargados
- Sistema de checkpoints
- Emails automáticos

**Versión 1.0 (6-8 semanas):**
- Todo lo anterior +
- Mentoría grupal (para Premium)
- Certificados
- Analytics completos
- Blog con contenido

---

**¿Por dónde empezar AHORA?**

1. Configura Supabase (10 min)
2. Crea el sistema de AI Intake (esto es CLAVE) (2-3 días)
3. Agrega autenticación básica (1 día)
4. Integra Stripe para un tier (1-2 días)
5. Dashboard básico con video player (2 días)

Total para MVP funcional: **1-2 semanas de trabajo enfocado**
