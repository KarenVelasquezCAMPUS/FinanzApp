# Configuración de PostgreSQL sin Docker

## Opción 1: PostgreSQL Local (Recomendado para desarrollo)

### Instalación en Windows

1. **Descargar PostgreSQL**:
   - Visita: https://www.postgresql.org/download/windows/
   - Descarga el instalador de PostgreSQL (versión 12 o superior)

2. **Instalar PostgreSQL**:
   - Ejecuta el instalador
   - Durante la instalación:
     - Usuario: `postgres`
     - Contraseña: Elige una (ejemplo: `postgres123`)
     - Puerto: `5432` (por defecto)
     - Locale: Spanish, Colombia

3. **Crear la base de datos**:
   ```bash
   # Abre PowerShell como administrador
   # Navega a la carpeta de PostgreSQL (ejemplo):
   cd "C:\Program Files\PostgreSQL\16\bin"
   
   # Conéctate a PostgreSQL
   .\psql -U postgres
   
   # Dentro de psql, ejecuta:
   CREATE DATABASE finanzapp;
   \q
   ```

4. **Actualizar .env en backend**:
   ```env
   DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/finanzapp?schema=public"
   JWT_SECRET="tu-secreto-jwt-super-seguro-cambiar-en-produccion"
   PORT=3000
   ```

5. **Ejecutar migraciones**:
   ```bash
   cd backend
   npx prisma migrate dev
   ```

## Opción 2: Neon (PostgreSQL en la nube - GRATIS)

1. **Crear cuenta en Neon**:
   - Visita: https://neon.tech
   - Regístrate gratis (no requiere tarjeta de crédito)

2. **Crear proyecto**:
   - Crea un nuevo proyecto llamado "FinanzApp"
   - Región: Elige la más cercana
   - PostgreSQL version: 16

3. **Obtener connection string**:
   - En el dashboard, copia el "Connection String"
   - Ejemplo: `postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require`

4. **Actualizar .env en backend**:
   ```env
   DATABASE_URL="postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"
   JWT_SECRET="tu-secreto-jwt-super-seguro"
   PORT=3000
   ```

5. **Ejecutar migraciones**:
   ```bash
   cd backend
   npx prisma migrate dev
   ```

## Opción 3: Supabase (PostgreSQL en la nube - GRATIS)

1. **Crear cuenta en Supabase**:
   - Visita: https://supabase.com
   - Regístrate gratis

2. **Crear proyecto**:
   - New Project → "FinanzApp"
   - Database Password: Elige una contraseña segura
   - Region: Elige la más cercana

3. **Obtener connection string**:
   - Settings → Database → Connection String → URI
   - Copia el string y reemplaza `[YOUR-PASSWORD]` con tu contraseña

4. **Actualizar .env en backend**:
   ```env
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres"
   JWT_SECRET="tu-secreto-jwt-super-seguro"
   PORT=3000
   ```

5. **Ejecutar migraciones**:
   ```bash
   cd backend
   npx prisma migrate dev
   ```

## Verificar Conexión

Después de configurar cualquiera de las opciones, verifica la conexión:

```bash
cd backend
npx prisma db push
```

Si todo está bien, deberías ver:
```
✔ Generated Prisma Client
The database is now in sync with your Prisma schema.
```

## Iniciar el Backend

```bash
npm run start:dev
```

Deberías ver:
```
[Nest] LOG [NestFactory] Starting Nest application...
[Nest] LOG [NestApplication] Nest application successfully started
```

## Troubleshooting

### Error: "Can't reach database server"
- Verifica que PostgreSQL esté corriendo (si es local)
- Verifica que el `DATABASE_URL` en `.env` sea correcto
- Verifica que el puerto 5432 no esté bloqueado por firewall

### Error: "Authentication failed"
- Verifica usuario y contraseña en `DATABASE_URL`
- Para PostgreSQL local, el usuario por defecto es `postgres`

### Error: "Database does not exist"
- Crea la base de datos manualmente (ver paso 3 de Opción 1)
