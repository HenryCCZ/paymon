# Project Status

## Estructura relevante

```text
app/
  api/
    actions/
      cancel/route.ts
      confirm/route.ts
    chat/route.ts
  globals.css
  layout.tsx
  page.tsx
lib/
  ai/agent.ts
  banking/data.ts
  banking/tools.ts
  db.ts
prisma/
  migrations/
    20260926184931_init/migration.sql
    migration_lock.toml
  schema.prisma
  seed.ts
```

No existe una carpeta `components/` actualmente.

## Archivos clave

- `app/page.tsx`: pantalla principal con la interfaz del chat y el envío de mensajes a `/api/chat`. La tarjeta de saldo todavía muestra un valor fijo.
- `app/layout.tsx`: layout raíz, fuentes Geist y metadatos de la aplicación.
- `app/globals.css`: estilos globales de la aplicación.
- `app/api/chat/route.ts`: recibe mensajes por POST y los pasa al agente Paymon.
- `app/api/actions/confirm/route.ts`: confirma una acción pendiente de crear un pago recurrente, crea el pago y marca la acción como completada.
- `app/api/actions/cancel/route.ts`: cancela una acción pendiente de crear un pago recurrente.
- `lib/ai/agent.ts`: integra Gemini `gemini-3.8-flash`, declara las herramientas del agente y procesa sus llamadas. El prompt indica que todavía no ejecute transferencias.
- `lib/banking/tools.ts`: consultas bancarias con Prisma, mapeo de categorías y creación de propuestas de pagos recurrentes pendientes de confirmación.
- `lib/banking/data.ts`: contiene datos financieros de muestra; actualmente `tools.ts` no lo importa.
- `lib/db.ts`: crea y exporta el cliente singleton de Prisma.
- `prisma/schema.prisma`: define los modelos y enums de usuarios, cuentas, transacciones, pagos recurrentes y acciones de IA; obtiene la URL con `DATABASE_URL`.
- `prisma/seed.ts`: borra y vuelve a crear los datos de demostración, incluyendo usuario, cuenta, destinatarios, pagos recurrentes y transacciones.
- `prisma/migrations/20260926184931_init/migration.sql`: migración inicial del esquema.
- `prisma/migrations/migration_lock.toml`: proveedor configurado para las migraciones.

## Variables de entorno

Nombres declarados en los archivos `.env` y `.env.local` (sin valores):

- `DATABASE_URL`
- `GEMINI_API_KEY`
- `GOOGLE_GENERATIVE_AI_API_KEY`
- `POLLAR_API_KEY`
- `STELLAR_HORIZON_URL`
- `STELLAR_NETWORK`

Referenciadas actualmente en código:

- `DATABASE_URL`
- `GEMINI_API_KEY`
- `NODE_ENV`

## Pendientes

- No se encontraron comentarios marcados `TODO`, `FIXME` o `XXX`.
- `proposeRecurringPayment` existe, pero no está registrada como herramienta en `lib/ai/agent.ts`; el agente todavía no puede proponer esos pagos desde el chat.
- La interfaz no llama todavía a `/api/actions/confirm` ni a `/api/actions/cancel`; falta el flujo de presentación y confirmación/cancelación explícita al usuario.
- La tarjeta de saldo en `app/page.tsx` es estática. `lib/banking/data.ts` también conserva datos de muestra, aunque las herramientas bancarias ya consultan Prisma.
- `lib/banking/tools.ts` usa un `DEMO_USER_ID` fijo. `prisma/seed.ts` crea el usuario con un ID generado, por lo que hay que asegurar que ambos IDs correspondan al mismo usuario después de ejecutar el seed.
- Las transferencias están explícitamente fuera del alcance actual, según las instrucciones del agente.

## Versiones

- Prisma CLI: `6.19.3`
- `@prisma/client`: `6.19.3`
- Next.js: `16.3.6`
- Modelo Gemini: `gemini-3.8-flash`