# 🚀 Inicio Rápido - Poesia App

## ⚡ 5 Pasos para Empezar

### 1️⃣ Instalar Node.js

Si no lo tienes instalado:
```bash
# Linux (Ubuntu/Debian)
sudo apt update && sudo apt install nodejs npm

# macOS
brew install node

# Windows: Descarga de https://nodejs.org/
```

Verifica:
```bash
node --version  # Debe mostrar v16+
npm --version   # Debe mostrar 8+
```

### 2️⃣ Instalar Dependencias

```bash
cd /home/cristian/proyecto_poesia
npm install
```

### 3️⃣ Configurar Appwrite

**3a. Crear cuenta en Appwrite Cloud**
- Ve a: https://cloud.appwrite.io
- Crea una cuenta
- Crea un nuevo proyecto

**3b. Obtener credenciales**
- En Settings, copia el **Project ID**
- Crea una API Key y cópiala

**3c. Crear base de datos**
- Ve a Database
- Crea una base de datos llamada `poesia`
- Anota su ID

**3d. Crear colecciones**
Crea dos colecciones en esa base de datos:

**Colección: poems**
```
- userId (String)
- title (String)
- content (String)
- templateType (String)
- theme (String)
- published (Boolean)
- createdAt (DateTime)
- updatedAt (DateTime)
```

**Colección: users**
```
- email (String)
- name (String)
- bio (String)
- createdAt (DateTime)
```

### 4️⃣ Configurar Variables de Entorno

Crea o edita `.env.local`:

```bash
cp .env.example .env.local
```

Completa con tus datos:
```env
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_id_here
VITE_APPWRITE_API_KEY=your_key_here
VITE_APPWRITE_DATABASE_ID=poesia
VITE_APPWRITE_POEMS_COLLECTION_ID=poems
VITE_APPWRITE_USERS_COLLECTION_ID=users
```

### 5️⃣ Ejecutar la Aplicación

```bash
npm run dev
```

¡La aplicación se abrirá automáticamente en tu navegador! 🎉

## 🎮 Primera Sesión

1. Haz clic en **"Comenzar Ahora"** o ve a `/register`
2. Completa el formulario de registro:
   - Email: `tu@email.com`
   - Nombre: `Tu Nombre`
   - Contraseña: `Password123` (debe tener mayúsculas, minúsculas y números)

3. ¡Serás dirigido automáticamente al Dashboard!

4. Haz clic en **"Nueva Poesía"**

5. Crea tu primera poesía:
   - **Título**: Dale un nombre
   - **Plantilla**: Elige una (ej: Haiku para empezar)
   - **Tema**: Selecciona uno
   - **Contenido**: Escribe tu poesía
   - **Guardar**: Como borrador o publicar

6. Verás tu poesía en el Dashboard

## 📁 Estructura de Carpetas

```
proyecto_poesia/
├── src/
│   ├── components/         # Componentes reutilizables
│   ├── pages/             # Páginas principales
│   ├── context/           # Estado global (Auth, Poems)
│   ├── services/          # Servicios de Appwrite
│   ├── types/             # Tipos TypeScript
│   ├── utils/             # Funciones utilitarias
│   ├── App.tsx            # Componente principal
│   ├── main.tsx           # Entrada de la app
│   └── index.css          # Estilos globales
├── .env.example           # Ejemplo de variables
├── .env.local             # Variables locales (no commits)
├── package.json           # Dependencias
├── tsconfig.json          # Configuración TypeScript
├── tailwind.config.js     # Configuración Tailwind
└── vite.config.ts         # Configuración Vite
```

## 📚 Documentación Completa

- [INSTALLATION.md](./INSTALLATION.md) - Guía detallada de instalación
- [TECHNOLOGIES.md](./TECHNOLOGIES.md) - Tecnologías y conceptos
- [README.md](./README.md) - Documentación del proyecto

## 🔗 URLs Importantes

Cuando la app esté corriendo:

- **Home**: http://localhost:5173/
- **Login**: http://localhost:5173/login
- **Register**: http://localhost:5173/register
- **Dashboard**: http://localhost:5173/dashboard
- **Crear Poesía**: http://localhost:5173/editor

## 🛠️ Comandos Útiles

```bash
# Desarrollo
npm run dev          # Inicia servidor con hot reload

# Build
npm run build        # Crea versión para producción
npm run preview      # Previsualiza el build

# Linting
npm run lint         # Verifica calidad de código

# Limpieza
rm -rf node_modules dist  # Limpia cache
npm install               # Reinstala dependencias
```

## 🔐 Credenciales de Prueba

Puedes crear tu propia cuenta, pero si necesitas pruebas rápidas:

**Usuario de Ejemplo:**
```
Email: test@poesia.com
Contraseña: TestPass123
```

⚠️ **Nota**: La contraseña debe cumplir requisitos de seguridad:
- Mínimo 8 caracteres
- Al menos 1 mayúscula
- Al menos 1 minúscula  
- Al menos 1 número

## 🐛 Si Algo No Funciona

1. **Revisa la consola del navegador** (F12 → Console)
2. **Verifica `.env.local`** - Asegúrate que todos los valores son correctos
3. **Revisa el servidor** - ¿Está Appwrite en línea?
4. **Limpia cache**:
   ```bash
   rm -rf node_modules dist .vite
   npm install
   npm run dev
   ```

5. **Lee los errores** - El mensaje de error muchas veces dice qué está mal

## 🎯 Próximos Pasos

Después de que funcione todo:

1. **Personaliza la aplicación**:
   - Cambia colores en `tailwind.config.js`
   - Modifica plantillas en `src/utils/templates.ts`
   - Agrega nuevas funcionalidades

2. **Aprende TypeScript**:
   - Entiende los tipos definidos
   - Crea nuevas interfaces
   - Experimenta con tipos complejos

3. **Mejora el código**:
   - Lee sobre React Hooks
   - Aprende Context API profundamente
   - Entiende el flujo de autenticación

4. **Despliegue**:
   - Sube a GitHub
   - Despliega en Vercel/Netlify
   - Comparte con otros

## ✅ Checklist de Setup

- [ ] Node.js instalado (`node --version`)
- [ ] npm instalado (`npm --version`)
- [ ] Repositorio clonado/descargado
- [ ] Dependencias instaladas (`npm install`)
- [ ] Cuenta Appwrite Cloud creada
- [ ] Proyecto Appwrite creado
- [ ] Base de datos creada
- [ ] Colecciones creadas (poems, users)
- [ ] API Key obtenida
- [ ] `.env.local` configurado
- [ ] `npm run dev` ejecutándose sin errores
- [ ] Aplicación abierta en navegador
- [ ] Registro funcionando
- [ ] Primera poesía creada

## 📞 Ayuda Rápida

**¿Contraseña rechazada?**
→ Debe tener mayúscula, minúscula y número

**¿No se conecta a Appwrite?**
→ Verifica que los IDs en `.env.local` son correctos

**¿La app no carga?**
→ Abre F12, revisa Console, busca errores de red

**¿npm install falla?**
→ Intenta: `npm cache clean --force && npm install`

---

🎉 **¡Listo! Ya tienes tu primera aplicación web funcional con React, TypeScript y Appwrite!**

**Próximo paso**: Lee [TECHNOLOGIES.md](./TECHNOLOGIES.md) para entender qué aprendiste.
