# Itera — setup DNS para envío transaccional vía AgentMail

> Guía para (a) usar AgentMail con su inbox default `itera@agentmail.to` — zero DNS — y (b) opcionalmente apuntar a dominio custom `hola@mail.itera.la` para branding completo.

---

## Estado actual del DNS (snapshot 2026-04-23)

`dig` revela:

```
NS:     ns01.domaincontrol.com., ns02.domaincontrol.com.  → GoDaddy
MX:     *.aspmx.l.google.com.                              → Google Workspace (correo humano)
SPF:    v=spf1 include:dc-aa8e722993._spfm.itera.la ~all   → GoDaddy SPFM
DMARC:  v=DMARC1; p=quarantine; adkim=r; aspf=r; rua=mailto:dmarc_rua@onsecureserver.net
DKIM:   google._domainkey configurado (Google Workspace)
        agentmail._domainkey → VACÍO
```

---

## Opción A (inmediata, sin DNS) — usar `itera@agentmail.to`

Esta es la ruta **default** del repo. El inbox ya existe en AgentMail desde 2026-04-22.

**Pros:**
- Zero config DNS.
- Reputación de AgentMail (inbox placement razonable out-of-the-box).
- Deliverability OK para el volumen transaccional B2B.

**Cons:**
- El `from` visible es `Itera <itera@agentmail.to>` — cliente de correo puede mostrar "external" o badge de "unverified sender" en Gmail.
- Marca menos fuerte que `hola@itera.la`.

**Setup:**
```bash
AGENTMAIL_API_KEY=<tu-api-key-del-dashboard>
AGENTMAIL_INBOX_ID=itera@agentmail.to
AGENTMAIL_REPLY_TO=hola@itera.la
```

Listo. Los correos ya salen.

---

## Opción B — custom domain `mail.itera.la` en AgentMail

Para branding full. Requiere 15 min: 5 en AgentMail + 5 en GoDaddy + 5 verificando.

### Paso 1 — Añadir custom domain en AgentMail

1. Dashboard AgentMail → **Domains** → Add Custom Domain.
2. Nombre: `mail.itera.la` (subdomain — **NO** usar `itera.la` root para no chocar con Google Workspace).
3. AgentMail te mostrará los records DNS a pegar. Los típicos son:

```
# DKIM
agentmail._domainkey.mail  CNAME  agentmail._domainkey.agentmail.to.

# SPF del subdomain (TXT)
mail                       TXT    "v=spf1 include:_spf.agentmail.to ~all"

# MX (para bounces y replies al subdomain)
mail                       MX  10 inbound.agentmail.to.
```

> ⚠️ Los valores exactos cambian — **usar los que te dé el dashboard de AgentMail**, no los de arriba textualmente.

### Paso 2 — Pegar en GoDaddy DNS

UI manual:
1. https://dcc.godaddy.com/manage/itera.la/dns
2. Por cada record:
   - **Type:** CNAME / TXT / MX (según lo que diga AgentMail).
   - **Name:** solo la parte izquierda, GoDaddy añade `.itera.la` automático. Ej: `agentmail._domainkey.mail` (NO pegar `agentmail._domainkey.mail.itera.la` — duplicaría el dominio).
   - **Value:** exacto del dashboard AgentMail.
   - **TTL:** 3600s (1h).
3. Guardar. Esperar 5-10 min.
4. AgentMail Dashboard → Domains → click **Verify**.

API GoDaddy (si tiene key):
```bash
export GD_KEY="your-key"
export GD_SECRET="your-secret"

curl -X PATCH "https://api.godaddy.com/v1/domains/itera.la/records" \
  -H "Authorization: sso-key $GD_KEY:$GD_SECRET" \
  -H "Content-Type: application/json" \
  -d '[{
    "type": "CNAME",
    "name": "agentmail._domainkey.mail",
    "data": "agentmail._domainkey.agentmail.to",
    "ttl": 3600
  }]'
```

### Paso 3 — Cambiar el inbox en AgentMail

Una vez verified, crear un inbox nuevo que use el custom domain:
- Nombre visible: `Itera`
- Email: `hola@mail.itera.la`

Copiar el nuevo `inboxId` y actualizar env var:
```bash
AGENTMAIL_INBOX_ID=hola@mail.itera.la  # o el ID literal que AgentMail dé
```

### Paso 4 — DMARC del root (opcional)

El DMARC actual (`p=quarantine; rua=mailto:dmarc_rua@onsecureserver.net`) cubre el subdomain. Considerar:
1. Cambiar `rua` a una dirección tuya: `rua=mailto:dmarc@itera.la`. Recibirás reportes agregados de envíos que fallaron autenticación.
2. No subir a `p=reject` hasta tener ≥2 semanas de reportes limpios.

---

## Verificación

```bash
# DKIM del custom domain debe resolver (si usaste Opción B)
dig +short agentmail._domainkey.mail.itera.la CNAME

# SPF del subdomain
dig +short mail.itera.la TXT

# Test end-to-end — mandar welcome a un inbox personal
curl -X POST http://localhost:3000/api/email/welcome \
  -H "Cookie: <sb-session-cookie>"

# O desde el MCP de AgentMail (desde Claude):
mcp__agentmail__send_message(
  inboxId="itera@agentmail.to",
  to=["test@gmail.com"],
  subject="test",
  html="<p>test</p>",
  text="test"
)

# Ver headers del correo recibido en Gmail → "Show original"
#   dkim=pass   ← debe aparecer (auto con @agentmail.to; requiere Opción B para custom)
#   spf=pass    ← debe aparecer
#   dmarc=pass  ← ideal

# Test de reputación
# → https://mail-tester.com (manda correo a la dirección que te dan, score 10/10)
```

---

## Troubleshooting

### "Domain verification failed" en AgentMail después de 30min
- Verificar que pegaste el record SIN duplicar el dominio. GoDaddy añade `.itera.la` automático.
- Borrar y volver a pegar solo la parte izquierda.

### Correos llegan a spam (Opción A, `@agentmail.to`)
- Normal si `agentmail.to` no está en whitelist del cliente de correo.
- Mitigar: mover a Opción B (custom domain).
- Añadir reply-to `hola@itera.la` para que respuestas humanas caigan en Google Workspace (ya configurado por default).

### Supabase Auth emails siguen viniendo de `@supabase.co`
- AgentMail NO expone SMTP — no puedes apuntar Supabase SMTP custom a AgentMail.
- Solución: activar **Send Email Hook** en Supabase → `/api/auth/email-hook`. Ver `docs/EMAIL_TRANSACTIONAL.md` §4.

---

## Resumen — qué necesita hacer Pablo

### Mínimo viable (5 min, zero DNS)
1. **Dashboard AgentMail → API Keys** → copiar key a `AGENTMAIL_API_KEY` en `.env.local` y Vercel Production.
2. Confirmar que `AGENTMAIL_INBOX_ID=itera@agentmail.to` está seteado (default del repo).
3. Probar: `curl -X POST http://localhost:3000/api/email/welcome -H "Cookie: <sb-...>"`.

### Full branding (Opción B, +10 min)
4. AgentMail Dashboard → Add Custom Domain `mail.itera.la`.
5. Pegar DNS records en GoDaddy.
6. Crear inbox con custom domain y actualizar `AGENTMAIL_INBOX_ID`.

### Supabase Auth password reset (5 min)
7. Supabase Dashboard → Authentication → Hooks → Send Email Hook → URL `https://itera.la/api/auth/email-hook`, guardar secret en `SUPABASE_AUTH_HOOK_SECRET`.
