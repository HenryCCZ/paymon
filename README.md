<div align="center">

# PAYVAT

### Habla con tu dinero.

Payvat es una plataforma financiera conversacional que combina Inteligencia Artificial, wallets y tecnología blockchain para ofrecer una nueva forma de interactuar con las finanzas.

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Stellar](https://img.shields.io/badge/Stellar-7D00FF?style=flat&logo=stellar&logoColor=white)](https://stellar.org/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

</div>

---

## Tabla de contenidos

- [Qué es Payvat](#qué-es-payvat)
- [Paymon, el agente financiero](#paymon)
- [Funcionalidades](#funcionalidades)
- [Seguridad](#seguridad)
- [Arquitectura](#arquitectura)
- [Tecnologías](#tecnologías)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Instalación](#instalación)
- [Variables de entorno](#variables-de-entorno)
- [Licencia](#licencia)

---

## Qué es Payvat

En el centro de Payvat está Paymon, un agente financiero impulsado por IA que permite al usuario consultar su información financiera y preparar operaciones utilizando lenguaje natural.

En lugar de navegar por múltiples pantallas, el usuario simplemente puede hablar con Paymon y preguntarle qué necesita saber o hacer con su dinero.

## Paymon

Paymon es el agente financiero de Payvat. El usuario puede realizar consultas como:

> "¿Cuánto dinero tengo?"
>
> "¿En qué estoy gastando más?"
>
> "Muéstrame mis últimos movimientos."
>
> "¿Cuánto gasté este mes?"

Paymon interpreta la intención del usuario y utiliza las herramientas financieras disponibles para obtener información real del sistema.

También puede preparar determinadas operaciones financieras, pero no ejecuta operaciones sensibles sin la confirmación del usuario.

---

## Funcionalidades

<table>
<tr>
<td width="33%" valign="top">

### Finanzas

- Consulta de saldo
- Consulta de movimientos
- Resumen de gastos
- Gastos por categoría
- Consulta de pagos recurrentes
- Propuestas de pagos recurrentes

</td>
<td width="33%" valign="top">

### Inteligencia Artificial

- Agente financiero conversacional
- Comprensión de lenguaje natural
- Function calling con herramientas financieras
- Respuestas contextualizadas
- Historial de conversación
- Confirmación explícita antes de operar

</td>
<td width="33%" valign="top">

### Blockchain

- Integración con Stellar
- Transferencias de XLM
- Wallets para operar
- Consulta y registro de transacciones

</td>
</tr>
</table>

### Voz

Paymon también cuenta con interacción mediante síntesis de voz, permitiendo que sus respuestas sean reproducidas por el navegador.

---

## Seguridad

Paymon utiliza un modelo de operaciones basado en propuestas y confirmaciones. Cuando una acción requiere mover dinero:

```text
Usuario
   ↓
Paymon interpreta la solicitud
   ↓
Paymon genera una propuesta
   ↓
Usuario revisa la operación
   ↓
Usuario confirma
   ↓
Se ejecuta la operación
```

Las operaciones financieras sensibles requieren confirmación explícita del usuario antes de ejecutarse.

---

## Arquitectura

Payvat está construido como una aplicación web utilizando una arquitectura cliente-servidor.

```text
┌──────────────────────────────┐
│          Usuario             │
│      Web / Navegador         │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│       Next.js / React        │
│          Frontend            │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│        API Routes            │
│          Backend             │
└───────┬──────────┬───────────┘
        │          │
        ▼          ▼
┌────────────┐ ┌───────────────┐
│   Paymon   │ │    Prisma     │
│    AI      │ │   Database    │
└─────┬──────┘ └───────────────┘
      │
      ├──────────────► Gemini
      │
      ├──────────────► Pollar
      │
      └──────────────► Stellar
```

---

## Tecnologías

| Tecnología | Uso |
|---|---|
| Next.js | Framework principal de la aplicación |
| React | Interfaz de usuario |
| TypeScript | Desarrollo tipado |
| Gemini | Inteligencia Artificial de Paymon |
| Pollar | Wallet y autenticación |
| Stellar | Blockchain y transferencias de XLM |
| Prisma | ORM y acceso a base de datos |
| Tailwind CSS | Diseño de la interfaz |
| Web Speech API | Voz de Paymon |

---
---

## Hackathon

Payvat combina Inteligencia Artificial y tecnología Web3 para crear una experiencia financiera conversacional.

### Tracks

-  AI — CriptoUNAM
-  Blockchain — Stellar
-  Wallet — Pollar

## Estructura del proyecto

```text
paymon/
│
├── app/
│   ├── api/             # API Routes y lógica del backend
│   └── ...              # Interfaz principal
│
├── lib/
│   ├── ai/              # Agente Paymon e integración con Gemini
│   └── ...              # Lógica y herramientas financieras
│
├── prisma/              # Esquema y configuración de base de datos
│
├── public/              # Recursos e imágenes
│
├── package.json
├── package-lock.json
├── PROJECT_STATUS.md
└── README.md
```

---

## Instalación

### Requisitos

- Node.js
- npm
- Una cuenta/configuración de Gemini
- Una cuenta/configuración de Pollar
- Configuración de Stellar

### 1. Clonar el repositorio

```bash
git clone https://github.com/HenryCCZ/paymon.git
cd paymon
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crear un archivo `.env.local` en la raíz del proyecto. Las credenciales y claves privadas deben mantenerse únicamente en variables de entorno.

```bash
GEMINI_API_KEY=tu_clave
POLLAR_SECRET_KEY=tu_clave
NEXT_PUBLIC_POLLAR_PUBLISHABLE_KEY=tu_clave
```

No coloques claves reales directamente en el código ni en el repositorio.

### 4. Ejecutar el proyecto

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

---

## Variables de entorno

Las variables de entorno se utilizan para mantener las credenciales fuera del código fuente. Entre ellas se encuentran las utilizadas para:

- Gemini
- Pollar
- Stellar
- Base de datos
- Configuración pública del cliente

Los archivos de variables de entorno (`.env`, `.env.local`, etc.) están excluidos del control de versiones mediante `.gitignore`.

Las credenciales sensibles deben configurarse localmente o mediante las variables de entorno del servicio de despliegue.
Nunca deben publicarse credenciales reales en GitHub.

---

## Licencia

<!-- Agrega aquí el tipo de licencia de tu proyecto, por ejemplo MIT, si aún no la tienes. -->

<div align="center">

Desarrollado por el equipo de Payvat

</div>
