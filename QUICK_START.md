# 🚀 Inicio Rápido - Backend OAuth

## Pasos Rápidos para Configurar

### 1. Instalar Dependencias del Backend

```bash
cd server
npm install
```

### 2. Configurar MongoDB

**Opción A: Local**
- Instalar MongoDB desde [mongodb.com](https://www.mongodb.com/try/download/community)
- Asegurarse de que esté corriendo

**Opción B: MongoDB Atlas (Recomendado)**
- Crear cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Crear cluster gratuito
- Obtener URI de conexión

### 3. Crear archivo `.env`

```bash
cd server
cp .env.example .env
```

Editar `server/.env` y configurar:

```env
MONGODB_URI=mongodb://localhost:27017/gia-electro
# O para Atlas: mongodb+srv://usuario:password@cluster.mongodb.net/gia-electro

JWT_SECRET=generar_secreto_seguro_aqui
SESSION_SECRET=generar_secreto_seguro_aqui
```

**Generar secretos:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Configurar OAuth (Opcional - para probar OAuth)

Seguir instrucciones detalladas en `OAUTH_SETUP.md`

**Nota:** Puedes probar el sistema sin OAuth primero usando registro/login normal.

### 5. Iniciar el Servidor

```bash
cd server
npm run dev
```

El servidor estará en `http://localhost:5000`

### 6. Configurar Frontend

Crear archivo `.env` en la raíz del proyecto:

```env
VITE_API_URL=http://localhost:5000/api
```

### 7. Iniciar Frontend

```bash
npm run dev
```

## ✅ Verificar que Funciona

1. Abrir `http://localhost:5173`
2. Click en "Registrarse"
3. Completar formulario
4. Debería registrarse y autenticarse automáticamente

## 🔧 Solución de Problemas

### Error: "Cannot find module"
```bash
cd server
npm install
```

### Error: "MongoDB connection failed"
- Verificar que MongoDB esté corriendo
- Verificar URI en `.env`

### Error: "CORS error"
- Verificar `FRONTEND_URL` en `server/.env`
- Verificar `VITE_API_URL` en `.env` del frontend

## 📚 Documentación Completa

- `OAUTH_SETUP.md` - Configuración detallada de OAuth
- `README_BACKEND.md` - Documentación completa del backend

