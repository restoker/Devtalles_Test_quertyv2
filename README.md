# Qwerty V2 — Generador de rutas de aprendizaje

**DevTalles Code Quest #3** · Mission `DEV-CQ03-2026` · Equipo **#05: Qwerty V2**

Frontend de la aplicación que ayuda a estudiantes de [DevTalles](https://devtalles.com)
a descubrir una **ruta de aprendizaje** basada en sus intereses, metas profesionales
y nivel actual, usando los cursos disponibles en la plataforma.

> **Nota:** este frontend no funciona solo: consume la API del backend.
> Para levantarlo necesitás ambos proyectos (ver [Backend](#backend)).

## Qué hace

1. **Cuestionario** de evaluación de habilidades e intereses (responder, completar, reseteo).
2. **Generación de rutas dinámicas**: al completar un cuestionario, el backend arma
   una ruta con los cursos de DevTalles y el frontend la muestra.
3. **Múltiples rutas por usuario**: rutas globales compartidas (se copian a "mis rutas")
   o rutas personales creadas a mano eligiendo cursos.
4. **Progreso**: marcar el avance curso por curso dentro de cada ruta.
5. **Auth**: registro e inicio de sesión con email/password y **Discord**.
6. **Panel diferenciado**: dashboard de administración (usuarios, cursos, cuestionarios,
   roadmaps) y vista de estudiante sobre las mismas rutas.

| Requerimiento del brief | Dónde |
| --- | --- |
| Cuestionario de habilidades e intereses | `app/admin/assessments`, `app/admin/questionnaires` |
| Rutas dinámicas con cursos de DevTalles | `server/actions/roadmaps/generate-roadmap-action.ts` |
| Guardar y generar múltiples rutas | `app/admin/roadmaps/{globales,mios}`, `copy-roadmap-action.ts` |
| Marcar progreso | `update-roadmap-progress-action.ts`, `RoadmapProgress` |
| Login/registro + Discord | `app/(auth)`, `server/actions/auth/*`, `server/auth.ts` |
| Stack de cursos DevTalles | Next.js + React + TypeScript + Tailwind |

## Stack

- **Framework:** [Next.js](https://nextjs.org) 16 (App Router) + React 19 + TypeScript
- **Estilos:** Tailwind CSS 4, shadcn, Hugeicons, Motion
- **Auth:** NextAuth.js v5 (Credentials + Discord, sesión JWT)
- **Data fetching:** Server Actions + `next-safe-action`, validación con Zod
- **Gestor de paquetes:** [pnpm](https://pnpm.io)

## Requisitos

- Node.js 22+
- pnpm (`npm install -g pnpm` si no lo tenés)
- El [backend corriendo](#backend) (NestJS + PostgreSQL)
- (Opcional) App OAuth en Discord para el login social

## Instalación

```bash
git clone <url-de-este-repo>
cd code-quest-front
pnpm install
cp .env.example .env
```

Completá el `.env` (ver [`.env.example`](.env.example)):

| Variable | Qué es |
| --- | --- |
| `ADDRESS_SERVER` | URL base del backend, sin `/api` (local: `http://localhost:3000`) |
| `AUTH_SECRET` | Secreto de sesión (`openssl rand -base64 32`) |
| `DISCORD_CLIENT_ID` / `DISCORD_CLIENT_SECRET` | Credenciales de tu app en el [portal de Discord](https://discord.com/developers/applications) |

**Discord:** en la app del portal, la Redirect URI debe ser la del backend
(`http://localhost:3000/api/auth/discord/callback` en local), porque el
intercambio del código OAuth lo hace la API. Detalle en el README del backend.

## Cómo ejecutar

El frontend corre en el puerto **8080** (el backend ya lo tiene permitido en CORS).

```bash
pnpm dev -- --port 8080
```

Abrí [http://localhost:8080](http://localhost:8080).

```bash
pnpm build   # build de producción (además valida tipos y rutas)
pnpm start -- --port 8080
pnpm lint    # ESLint
```

## Backend

Repo: [Joaco2603/code-quest-backend](https://github.com/Joaco2603/code-quest-backend)
(NestJS 12 + PostgreSQL + TypeORM). Su README explica cómo levantar la DB con
Docker, correr migraciones e importar el catálogo de cursos y el cuestionario
inicial — pasos necesarios para que este frontend tenga datos.

```bash
git clone https://github.com/Joaco2603/code-quest-backend.git
cd code-quest-backend
pnpm install && cp .env.example .env   # completar JWT_SECRET, ENCRYPTION_KEY, Discord
docker compose -p codequest-dev -f compose.dev.yml up -d --wait
pnpm migration:run
pnpm start:dev   # API en http://localhost:3000/api
```

## Estructura

```text
app/
  (auth)/            login, register y callback de Discord
  (home)/            landing pública
  admin/             dashboard, usuarios, cursos, questionnaires, assessments, roadmaps
  panel/             vista del estudiante (se sirve vía /admin según el rol)
server/
  actions/           server actions por dominio (auth, users, cursos, roadmaps…)
  auth.ts            configuración NextAuth.js
types/               esquemas Zod y tipos de cada dominio
components/ui/       primitivas de UI
proxy.ts             guard de rutas /admin y /panel por sesión y rol
```

## Equipo

| Discord | Rol |
| --- | --- |
| restoker12 | Integrante |
| n.rodriguez | Integrante |
| pappagamer2603 | Integrante |

## Entrega (Code Quest)

| Recurso | Enlace |
| --- | --- |
| Video demo (1–1:30 min) | _URL del video / canal de Discord del equipo_ |
| App desplegada | _URL de producción_ |

## Licencia

[MIT](LICENSE) © 2026 Qwerty V2.
