# FinanzApp

FinanzApp — Sistema de gestión de finanzas personales/familiares.

## Estructura del repositorio

- `/backend` — API REST (Node.js + TypeScript + NestJS/Prisma)
- `/frontend` — SPA (Vue 3 + Vite + Pinia)
- `/migrations` — scripts SQL para PostgreSQL
- `README-backend.md`, `README-frontend.md` — instrucciones específicas

## Requisitos
- Node.js 18+ (recomendado 20+)
- npm 8+
- PostgreSQL 12+
- Git

Opcional: Docker y docker-compose.

## Variables de entorno
Copiar `.env.example` y completar.

## Instalación rápida (desarrollo)

### Backend
```bash
cd backend
npm install
cp .env.example .env
# configurar .env (DATABASE_URL, JWT_SECRET, etc.)
# Si tienes Docker:
docker-compose up -d
npx prisma migrate dev
# Si no tienes Docker, asegura que tu DB local esté corriendo y configurada en .env
npm run start:dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Funcionalidades
- Registro y Login de usuarios.
- Gestión de Categorías, Movimientos (Ingresos/Gastos) y Presupuestos.
- Dashboard con resumen mensual.
- Reportes gráficos.