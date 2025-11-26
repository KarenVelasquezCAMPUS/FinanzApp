# Configuración de Supabase para FinanzApp

## 🚀 Paso 1: Crear Cuenta en Supabase

1. Ve a: https://supabase.com
2. Haz clic en "Start your project"
3. Regístrate con:
   - GitHub (recomendado)
   - O con email

## 📦 Paso 2: Crear Nuevo Proyecto

1. Una vez dentro, haz clic en **"New Project"**

2. Completa los datos:
   - **Name**: `FinanzApp`
   - **Database Password**: Elige una contraseña segura (¡guárdala!)
     - Ejemplo: `FinanzApp2024!Secure`
   - **Region**: Elige la más cercana a Colombia
     - Recomendado: `South America (São Paulo)`
   - **Pricing Plan**: Free (suficiente para desarrollo)

3. Haz clic en **"Create new project"**
   - Tardará 1-2 minutos en crear el proyecto

## 🗄️ Paso 3: Ejecutar el Script SQL

1. **Ir al SQL Editor**:
   - En el menú lateral izquierdo, haz clic en el ícono **"SQL Editor"**

2. **Crear nueva query**:
   - Haz clic en **"New query"**

3. **Copiar y pegar el siguiente SQL**:

```sql
-- CreateEnum
CREATE TYPE "MovementType" AS ENUM ('INGRESO', 'GASTO');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Movement" (
    "id" SERIAL NOT NULL,
    "type" "MovementType" NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "categoryId" INTEGER,
    "date" TIMESTAMP(3) NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "note" TEXT,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Movement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Budget" (
    "id" SERIAL NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "limit" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Budget_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movement" ADD CONSTRAINT "Movement_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movement" ADD CONSTRAINT "Movement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
```

4. **Ejecutar el script**:
   - Haz clic en **"Run"** (o presiona Ctrl+Enter)
   - Deberías ver: `Success. No rows returned`

5. **Verificar las tablas**:
   - Ve a **"Table Editor"** en el menú lateral
   - Deberías ver las tablas: `User`, `Category`, `Movement`, `Budget`

## 🔗 Paso 4: Obtener Connection String

1. **Ir a Project Settings**:
   - Haz clic en el ícono de engranaje ⚙️ en la parte inferior izquierda
   - O ve a: Settings → Database

2. **Copiar Connection String**:
   - Busca la sección **"Connection string"**
   - Selecciona la pestaña **"URI"**
   - Copia el string completo
   - Se verá algo como:
     ```
     postgresql://postgres.xxxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
     ```

3. **Reemplazar [YOUR-PASSWORD]**:
   - Reemplaza `[YOUR-PASSWORD]` con la contraseña que elegiste en el Paso 2
   - Ejemplo final:
     ```
     postgresql://postgres.xxxxxxxxxxxxx:FinanzApp2024!Secure@aws-0-us-east-1.pooler.supabase.com:6543/postgres
     ```

## ⚙️ Paso 5: Configurar Backend

1. **Abrir el archivo `.env`** en la carpeta `backend`:
   ```
   C:\Users\karen.velasquez\Downloads\FinanzApp\backend\.env
   ```

2. **Actualizar las variables**:
   ```env
   DATABASE_URL="postgresql://postgres.xxxxxxxxxxxxx:TU-PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
   JWT_SECRET="tu-secreto-jwt-super-seguro-cambiar-en-produccion-123"
   PORT=3000
   ```

3. **Guardar el archivo**

## 🔄 Paso 6: Generar Prisma Client

```powershell
cd C:\Users\karen.velasquez\Downloads\FinanzApp\backend
npx prisma generate
```

Deberías ver:
```
✔ Generated Prisma Client
```

## 🚀 Paso 7: Iniciar el Backend

```powershell
npm run start:dev
```

Deberías ver:
```
[Nest] LOG [NestFactory] Starting Nest application...
[Nest] LOG [NestApplication] Nest application successfully started
```

## ✅ Paso 8: Verificar que Todo Funciona

1. **Abrir Swagger**:
   - Ve a: http://localhost:3000/docs

2. **Probar el endpoint de registro**:
   - Busca `POST /auth/register`
   - Haz clic en "Try it out"
   - Ingresa datos de prueba:
     ```json
     {
       "name": "Test User",
       "email": "test@example.com",
       "password": "password123"
     }
     ```
   - Haz clic en "Execute"
   - Deberías recibir un token JWT

3. **Verificar en Supabase**:
   - Ve a Supabase → Table Editor → User
   - Deberías ver el usuario que acabas de crear

## 🎉 ¡Listo!

Tu aplicación está completamente funcional con Supabase:

- ✅ Base de datos PostgreSQL en la nube
- ✅ Backend conectado y funcionando
- ✅ Frontend listo (http://localhost:5174)
- ✅ Sin necesidad de Docker o PostgreSQL local

## 🛠️ Comandos Útiles

### Ver datos en Supabase:
- Ve a: https://supabase.com/dashboard
- Table Editor → Selecciona la tabla

### Ejecutar queries SQL:
- SQL Editor → New query → Escribe tu SQL

### Ver logs de la base de datos:
- Logs → Database

## 🔍 Troubleshooting

### Error: "Can't reach database server"
- Verifica que el `DATABASE_URL` en `.env` sea correcto
- Asegúrate de haber reemplazado `[YOUR-PASSWORD]` con tu contraseña real
- Verifica que no haya espacios extra en el connection string

### Error: "Invalid connection string"
- El formato debe ser exactamente:
  ```
  postgresql://usuario:password@host:puerto/database
  ```
- No debe tener espacios ni saltos de línea

### Error: "Authentication failed"
- Verifica que la contraseña sea correcta
- Puedes resetear la contraseña en: Settings → Database → Reset database password

## 📊 Límites del Plan Gratuito de Supabase

- ✅ 500 MB de almacenamiento
- ✅ 2 GB de transferencia mensual
- ✅ 50,000 usuarios activos mensuales
- ✅ Perfecto para desarrollo y proyectos pequeños

## 🚀 Próximos Pasos

1. Abre el frontend: http://localhost:5174
2. Regístrate como usuario
3. Crea categorías
4. Registra movimientos
5. Configura presupuestos
6. Revisa los reportes

¡Disfruta tu aplicación FinanzApp con Supabase! 🎊
