# README - Poesia App

Una aplicación web moderna para escribir, crear y compartir poesías con autenticación segura y bases de datos en la nube.

## 🚀 Características

- **Autenticación Segura**: Registro, inicio de sesión y recuperación de contraseña
- **Plantillas Visuales**: 6 tipos de plantillas (Haiku, Soneto, Verso Libre, Acróstico, etc.)
- **Base de Datos en la Nube**: Almacenamiento seguro con Appwrite
- **Gestión de Poesías**: Crear, editar, eliminar y publicar poesías
- **Perfil de Usuario**: Gestiona tu perfil y preferencias
- **Diseño Responsivo**: Funciona en cualquier dispositivo
- **Interfaz Moderna**: Tecnologías actuales (React 18, TypeScript, Tailwind CSS)

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Appwrite (Base de datos, Autenticación, Almacenamiento)
- **Estilos**: Tailwind CSS
- **Routing**: React Router v6
- **Estado**: React Context API

## 📦 Instalación

### Requisitos Previos
- Node.js 16+ y npm
- Cuenta en [Appwrite Cloud](https://cloud.appwrite.io) o instancia local

### Pasos

1. **Clona el repositorio**
```bash
cd proyecto_poesia
```

2. **Instala las dependencias**
```bash
npm install
```

3. **Configura las variables de entorno**

Copia el archivo `.env.example` a `.env.local` y completa los valores:
```bash
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales de Appwrite:
```
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id
VITE_APPWRITE_API_KEY=your_api_key
VITE_APPWRITE_DATABASE_ID=your_database_id
VITE_APPWRITE_POEMS_COLLECTION_ID=your_poems_collection_id
VITE_APPWRITE_USERS_COLLECTION_ID=your_users_collection_id
```

4. **Inicia el servidor de desarrollo**
```bash
npm run dev
```

La aplicación se abrirá en [http://localhost:5173](http://localhost:5173)

## 🎯 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── RegisterForm.tsx
│   ├── LoginForm.tsx
│   ├── ForgotPasswordForm.tsx
│   ├── Navbar.tsx
│   ├── PoemEditor.tsx
│   ├── PoemCard.tsx
│   └── PoemView.tsx
├── pages/              # Páginas principales
│   ├── Home.tsx
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── ForgotPassword.tsx
│   ├── Dashboard.tsx
│   └── Editor.tsx
├── context/            # Context API para estado global
│   ├── AuthContext.tsx
│   └── PoemsContext.tsx
├── services/           # Servicios de Appwrite
│   ├── appwrite.ts
│   └── index.ts
├── types/              # Definiciones TypeScript
│   └── index.ts
├── hooks/              # Hooks personalizados (próximamente)
├── utils/              # Funciones utilitarias
│   ├── templates.ts
│   ├── validation.ts
│   └── index.ts
├── App.tsx             # Componente principal
├── main.tsx            # Punto de entrada
└── index.css           # Estilos globales
```

## 🔧 Configuración de Appwrite

### Crear base de datos y colecciones

1. **Base de Datos**
   - Nombre: `poesia_db`
   - ID: `poesia`

2. **Colección de Poesías** (`poems`)
   - Atributos:
     - `userId` (String, requerido)
     - `title` (String, requerido)
     - `content` (String, requerido)
     - `templateType` (String, requerido)
     - `theme` (String, requerido)
     - `createdAt` (DateTime)
     - `updatedAt` (DateTime)
     - `published` (Boolean)

3. **Colección de Usuarios** (`users`)
   - Atributos:
     - `email` (String, requerido)
     - `name` (String, requerido)
     - `bio` (String)
     - `createdAt` (DateTime)

## 📝 Cómo Usar

1. **Registro**: Crea una nueva cuenta con email y contraseña
2. **Dashboard**: Visualiza tus poesías (borradores y publicadas)
3. **Crear Poesía**: 
   - Haz clic en "Nueva Poesía"
   - Elige una plantilla
   - Completa el formulario
   - Guarda como borrador o publica
4. **Editar**: Modifica tus poesías desde el Dashboard
5. **Eliminar**: Borra poesías que no quieras

## 🎨 Plantillas Disponibles

- **Lienzo Blanco**: Escribe libremente sin restricciones
- **Haiku**: 3 versos (5-7-5 sílabas)
- **Soneto**: 14 versos con rima estructurada
- **Verso Libre**: Sin métricas ni rimas obligatorias
- **Acróstico**: Primera letra de cada verso forma una palabra
- **Reflexión Poética**: Texto libre y emotivo

## 🔐 Seguridad

- Contraseñas hasheadas con Appwrite
- Autenticación basada en sesiones
- Recuperación de contraseña segura
- Variables de entorno para credenciales

## 🚀 Despliegue

### Build para Producción
```bash
npm run build
```

### Requisitos de Despliegue
- Node.js 16+
- Servidor web (Vercel, Netlify, etc.)
- Credenciales de Appwrite

## 📚 Conceptos de Tecnologías Actuales

Este proyecto implementa:

- **React Hooks**: useState, useContext, useEffect
- **TypeScript**: Tipado estático para mayor confiabilidad
- **Context API**: Gestión de estado sin Redux
- **Routing**: Navegación moderna con React Router
- **API REST**: Integración con Appwrite
- **Tailwind CSS**: Utilidades para estilos rápidos
- **Componentes Funcionales**: Enfoque moderno de React
- **Custom Hooks**: Reutilización de lógica

## 🐛 Solución de Problemas

### Error de conexión a Appwrite
- Verifica que el endpoint y credentials sean correctos
- Asegúrate que la API está disponible

### Contraseña débil
- Debe tener 8+ caracteres, mayúscula, minúscula y número

### Base de datos no encontrada
- Crea la base de datos y colecciones en Appwrite
- Verifica los IDs en .env.local

## 📖 Documentación Útil

- [Documentación de Appwrite](https://appwrite.io/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

## 📜 Licencia

Proyecto de estudio para ADSO - 2024

## ✍️ Autor

Cristian - Estudiante ADSO

---

¡Disfruta creando poesías! 🎭✨
