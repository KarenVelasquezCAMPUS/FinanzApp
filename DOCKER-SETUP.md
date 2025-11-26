# Guía de Instalación de Docker para FinanzApp

## 📋 Requisitos del Sistema

- Windows 10/11 (64-bit)
- Virtualización habilitada en BIOS (generalmente ya está habilitada)
- Al menos 4GB de RAM

## 🚀 Paso 1: Descargar Docker Desktop

1. **Ir al sitio oficial**:
   - Abre tu navegador y ve a: https://www.docker.com/products/docker-desktop/

2. **Descargar**:
   - Haz clic en "Download for Windows"
   - Se descargará un archivo llamado `Docker Desktop Installer.exe`

## 🔧 Paso 2: Instalar Docker Desktop

1. **Ejecutar el instalador**:
   - Haz doble clic en `Docker Desktop Installer.exe`
   - Si Windows pregunta, permite que la aplicación haga cambios

2. **Configuración durante instalación**:
   - ✅ Marca "Use WSL 2 instead of Hyper-V" (recomendado)
   - ✅ Marca "Add shortcut to desktop"
   - Haz clic en "Ok"

3. **Esperar la instalación**:
   - Tomará unos minutos (descarga componentes adicionales)

4. **Reiniciar**:
   - Al finalizar, te pedirá reiniciar tu computadora
   - **Guarda todo tu trabajo y reinicia**

## ✅ Paso 3: Verificar Instalación

1. **Abrir Docker Desktop**:
   - Busca "Docker Desktop" en el menú inicio
   - Ábrelo (puede tardar 1-2 minutos en iniciar la primera vez)

2. **Esperar que inicie**:
   - Verás un ícono de ballena en la barra de tareas
   - Espera a que diga "Docker Desktop is running"

3. **Verificar en PowerShell**:
   ```powershell
   docker --version
   docker-compose --version
   ```
   
   Deberías ver algo como:
   ```
   Docker version 24.0.x
   Docker Compose version v2.x.x
   ```

## 🐘 Paso 4: Iniciar PostgreSQL

1. **Abrir PowerShell en la carpeta del proyecto**:
   ```powershell
   cd C:\Users\karen.velasquez\Downloads\FinanzApp
   ```

2. **Iniciar PostgreSQL con Docker**:
   ```powershell
   docker-compose up -d
   ```
   
   Verás algo como:
   ```
   [+] Running 2/2
   ✔ Network finanzapp_default      Created
   ✔ Container finanzapp-postgres-1 Started
   ```

3. **Verificar que está corriendo**:
   ```powershell
   docker ps
   ```
   
   Deberías ver:
   ```
   CONTAINER ID   IMAGE         STATUS         PORTS
   xxxxx          postgres:15   Up 10 seconds  0.0.0.0:5432->5432/tcp
   ```

## 🗄️ Paso 5: Ejecutar Migraciones de Prisma

1. **Ir a la carpeta backend**:
   ```powershell
   cd backend
   ```

2. **Ejecutar migraciones**:
   ```powershell
   npx prisma migrate dev
   ```
   
   Verás:
   ```
   ✔ Generated Prisma Client
   Applying migration `20231126_init`
   Database is now in sync with your schema.
   ```

## 🚀 Paso 6: Iniciar el Backend

```powershell
npm run start:dev
```

Deberías ver:
```
[Nest] LOG [NestFactory] Starting Nest application...
[Nest] LOG [NestApplication] Nest application successfully started +2ms
```

## 🎉 ¡Listo!

Tu aplicación está corriendo:
- **Backend**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/docs
- **Frontend**: http://localhost:5174 (ya está corriendo)
- **PostgreSQL**: localhost:5432

## 🛠️ Comandos Útiles de Docker

### Ver contenedores corriendo:
```powershell
docker ps
```

### Ver logs de PostgreSQL:
```powershell
docker-compose logs postgres
```

### Detener PostgreSQL:
```powershell
docker-compose down
```

### Iniciar PostgreSQL de nuevo:
```powershell
docker-compose up -d
```

### Reiniciar PostgreSQL:
```powershell
docker-compose restart
```

### Eliminar todo (base de datos incluida):
```powershell
docker-compose down -v
```

## 🔍 Troubleshooting

### "Docker daemon is not running"
- Abre Docker Desktop desde el menú inicio
- Espera a que inicie completamente

### "Port 5432 is already in use"
- Tienes PostgreSQL instalado localmente
- Opciones:
  1. Detener PostgreSQL local
  2. Cambiar el puerto en `docker-compose.yml` a `5433:5432`

### "WSL 2 installation is incomplete"
- Sigue las instrucciones que Docker Desktop te muestre
- Generalmente requiere actualizar WSL:
  ```powershell
  wsl --update
  ```

### Error al ejecutar migraciones
- Verifica que Docker esté corriendo: `docker ps`
- Verifica el `.env` en backend:
  ```env
  DATABASE_URL="postgresql://postgres:postgres@localhost:5432/finanzapp?schema=public"
  ```

## 📝 Notas Importantes

1. **Docker Desktop debe estar corriendo** para que PostgreSQL funcione
2. **Los datos persisten** incluso si detienes el contenedor
3. **Para desarrollo**, deja Docker Desktop corriendo en segundo plano
4. **Para producción**, considera usar servicios administrados (AWS RDS, Neon, etc.)

## 🎯 Próximos Pasos

Una vez que todo esté corriendo:

1. Abre http://localhost:3000/docs para ver la documentación Swagger
2. Registra un usuario en el frontend (http://localhost:5174)
3. Prueba crear categorías, movimientos y presupuestos
4. Revisa los reportes gráficos

¡Disfruta tu aplicación FinanzApp! 🎊
