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



## 🎨 Plantillas Disponibles

- **Lienzo Blanco**: Escribe libremente sin restricciones
- **Haiku**: 3 versos (5-7-5 sílabas)
- **Soneto**: 14 versos con rima estructurada
- **Verso Libre**: Sin métricas ni rimas obligatorias
- **Acróstico**: Primera letra de cada verso forma una palabra
- **Reflexión Poética**: Texto libre y emotivo


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


## 📜 Licencia

Proyecto de estudio ADSO - 2026

## ✍️ Autor

Cristian - Estudiante ADSO

---

¡Disfruta creando poesías! 🎭✨
