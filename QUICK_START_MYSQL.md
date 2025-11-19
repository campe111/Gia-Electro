# 🚀 Inicio Rápido - MySQL

Guía rápida para configurar el proyecto con MySQL.

## Pasos Rápidos

### 1. Instalar Dependencias del Backend

```bash
cd server
npm install
```

### 2. Configurar MySQL

**Opción A: PlanetScale (Recomendado - Gratis)**

1. Crear cuenta en [PlanetScale](https://planetscale.com)
2. Crear base de datos `gia-electro`
3. Obtener connection string
4. Usar en `.env` como `MYSQL_URI`

**Opción B: MySQL Local**

1. Instalar MySQL localmente
2. Crear base de datos:
   ```sql
   CREATE DATABASE gia_electro;
   ```
3. Configurar en `.env` con variables individuales

### 3. Crear archivo `.env` en `server/`

```env
# Para PlanetScale
MYSQL_URI=mysql://xxxxx:xxxxx@xxxxx.psdb.cloud/gia-electro?sslaccept=strict

# O para MySQL local
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=tu_password
MYSQL_DATABASE=gia_electro

# JWT
JWT_SECRET=generar_secreto_seguro
JWT_EXPIRE=7d
SESSION_SECRET=generar_otro_secreto

# Frontend
FRONTEND_URL=http://localhost:5173
```

**Generar secretos:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Iniciar el Servidor

```bash
cd server
npm run dev
```

El servidor creará automáticamente las tablas necesarias.

### 5. Verificar

1. Visitar: `http://localhost:5000/api/health`
2. Deberías ver: `{"success": true, "message": "Servidor funcionando correctamente"}`

### 6. Probar Registro

1. Abrir frontend: `http://localhost:5173`
2. Click en "Registrarse"
3. Completar formulario
4. Debería funcionar correctamente

## 🗄️ Verificar Base de Datos

### En PlanetScale

1. Ir a tu base de datos
2. Click en "Console"
3. Ejecutar:
   ```sql
   SHOW TABLES;
   SELECT * FROM users;
   ```

### En MySQL Local

```bash
mysql -u root -p
USE gia_electro;
SHOW TABLES;
SELECT * FROM users;
```

## 🚀 Desplegar

Ver guía completa en `DEPLOY_MYSQL.md`

