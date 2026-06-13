# 🗺️ Mapa Visual de la Aplicación Poesia

## 🌐 Estructura de Rutas

```
┌─────────────────────────────────────────────────────────────┐
│                        POESIA APP                            │
│                   React 18 + Appwrite                        │
└─────────────────────────────────────────────────────────────┘

                            HOME /
                              │
                    ┌─────────┼─────────┐
                    │         │         │
                    ↓         ↓         ↓
               [Registrarse] [Iniciar Sesión] [Invitado]
                    │         │         │
                    └────┬────┴────┬────┘
                         ↓        ↓
                    ┌──────────────────┐
                    │  AUTENTICACIÓN   │
                    │  (AuthContext)   │
                    └──────────────────┘
                         ↓
        ┌────────────────┼────────────────┐
        ↓                ↓                 ↓
    [LOGIN]        [REGISTER]     [RESET PASSWORD]
   /login          /register      /forgot-password
        │                │                 │
        └────────┬───────┴────────┬────────┘
                 ↓
        ┌──────────────────┐
        │    DASHBOARD     │
        │  /dashboard      │
        │  (Protegida)     │
        └──────────────────┘
                 │
        ┌────────┼────────┐
        ↓        ↓        ↓
    [Ver]  [Editar] [Nueva]
        │        │        │
        │        │        ↓
        │        │    ┌────────────┐
        │        │    │  EDITOR    │
        │        │    │ /editor    │
        │        │    │(Protegida) │
        │        └─→ /editor/:id  │
        │            └────────────┘
        │                 │
        └─────────────────┼────────→ [Guardar/Publicar]
                          │
                          ↓
            ┌─────────────────────────┐
            │    POESÍA GUARDADA      │
            │   (PoemsContext)        │
            │   (Appwrite Database)   │
            └─────────────────────────┘
                          │
                          ↓
                ┌─────────────────────┐
                │  VOLVER DASHBOARD   │
                │   (Lista actualizada)
                └─────────────────────┘
```

---

## 🏗️ Arquitectura de Componentes

```
┌─────────────────────────────────────────────────────────────┐
│                      App.tsx                                 │
│              (Router + Providers)                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │        AuthProvider (AuthContext)                      │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │    PoemsProvider (PoemsContext)                  │  │ │
│  │  │                                                   │  │ │
│  │  │  ┌────────────────────────────────────────────┐  │  │ │
│  │  │  │           Navbar                          │  │  │ │
│  │  │  │   (Usuario, Logout, Navegación)          │  │  │ │
│  │  │  └────────────────────────────────────────────┘  │  │ │
│  │  │                                                   │  │ │
│  │  │  ┌────────────────────────────────────────────┐  │  │ │
│  │  │  │      Router (Routes)                       │  │  │ │
│  │  │  │                                             │  │  │ │
│  │  │  │  Home          Login       Register         │  │  │ │
│  │  │  │  │             │           │                │  │  │ │
│  │  │  │  └─ LoginForm  └─ RegisterForm            │  │  │ │
│  │  │  │                                             │  │  │ │
│  │  │  │  ForgotPassword  Dashboard   Editor        │  │  │ │
│  │  │  │  │                │          │              │  │  │ │
│  │  │  │  └─ForgotPasswordForm       PoemEditor    │  │  │ │
│  │  │  │                  │          │              │  │  │ │
│  │  │  │              PoemCard   PoemView          │  │  │ │
│  │  │  └────────────────────────────────────────────┘  │  │ │
│  │  │                                                   │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  │                                                          │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Flujo de Datos

```
┌──────────────────┐
│   User Input     │
│  (Formularios)   │
└────────┬─────────┘
         │
         ↓
┌──────────────────────────────────────┐
│   Validación                         │
│  (validation.ts)                     │
├──────────────────────────────────────┤
│  • Email válido                      │
│  • Contraseña fuerte                 │
│  • Campos requeridos                 │
└────────┬─────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│   Servicios (services/index.ts)      │
├──────────────────────────────────────┤
│  • authService                       │
│  • poemsService                      │
│  • userService                       │
└────────┬─────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│   Appwrite SDK                       │
│  (services/appwrite.ts)              │
├──────────────────────────────────────┤
│  • Account (Autenticación)           │
│  • Databases (Base de datos)         │
└────────┬─────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│  APPWRITE CLOUD                      │
├──────────────────────────────────────┤
│  • Base de Datos                     │
│  • Colecciones (poems, users)        │
│  • Autenticación                     │
└────────┬─────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│   Context API Update                 │
│  (AuthContext/PoemsContext)          │
└────────┬─────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│   Component Re-render                │
│  (useAuth / usePoems hooks)          │
└────────┬─────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│   UI Update                          │
│  (Reactiva con Tailwind CSS)         │
└──────────────────────────────────────┘
```

---

## 📊 Estructura de Estado

```
GLOBAL STATE (Context API)

┌─────────────────────────────────────────────────────────┐
│                   AuthContext                           │
├─────────────────────────────────────────────────────────┤
│ • user: User | null                                     │
│ • loading: boolean                                      │
│ • isAuthenticated: boolean                              │
│                                                         │
│ Funciones:                                              │
│ • login(email, password)                                │
│ • register(email, password, name)                       │
│ • logout()                                              │
│ • resetPassword(email)                                  │
│ • updateProfile(name)                                   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                   PoemsContext                          │
├─────────────────────────────────────────────────────────┤
│ • poems: Poem[]                                         │
│ • loading: boolean                                      │
│                                                         │
│ Funciones:                                              │
│ • createPoem(poem)                                      │
│ • updatePoem(id, updates)                               │
│ • deletePoem(id)                                        │
│ • fetchUserPoems()                                      │
│ • getPoem(id)                                           │
└─────────────────────────────────────────────────────────┘

LOCAL STATE (Component State)

┌─────────────────────────────────────────┐
│        LoginForm Component              │
├─────────────────────────────────────────┤
│ • email (useState)                      │
│ • password (useState)                   │
│ • error (useState)                      │
│ • loading (useState)                    │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│        PoemEditor Component             │
├─────────────────────────────────────────┤
│ • title (useState)                      │
│ • content (useState)                    │
│ • templateType (useState)               │
│ • theme (useState)                      │
│ • error (useState)                      │
│ • loading (useState)                    │
└─────────────────────────────────────────┘
```

---

## 🗂️ Estructura de Base de Datos

```
APPWRITE DATABASE: poesia

┌─────────────────────────────────────────────────────────┐
│              Colección: users                           │
├─────────────────────────────────────────────────────────┤
│ Document ID: [user_id]                                  │
│                                                         │
│ Atributos:                                              │
│ • $id: string (user ID from Auth)                       │
│ • email: string                                         │
│ • name: string                                          │
│ • bio: string (opcional)                                │
│ • createdAt: DateTime                                   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│              Colección: poems                           │
├─────────────────────────────────────────────────────────┤
│ Document ID: [uuid]                                     │
│                                                         │
│ Atributos:                                              │
│ • userId: string (referencia a users)                   │
│ • title: string                                         │
│ • content: string (el texto de la poesía)              │
│ • templateType: string (blank|haiku|sonnet|...)        │
│ • theme: string (Amor, Naturaleza, etc.)               │
│ • published: boolean                                    │
│ • createdAt: DateTime                                   │
│ • updatedAt: DateTime                                   │
└─────────────────────────────────────────────────────────┘

Relación:
poems.userId → users.$id (One-to-Many)
```

---

## 🎯 Flujo de Autenticación

```
START: Usuario sin sesión
   │
   ├─→ [Ir a /register]
   │   │
   │   ├─→ Llenar formulario
   │   │   • Email
   │   │   • Contraseña (validar fuerte)
   │   │   • Nombre
   │   │
   │   ├─→ authService.register()
   │   │   └─→ Appwrite.account.create()
   │   │       ├─→ Crear usuario en Auth
   │   │       └─→ userService.createUserProfile()
   │   │           └─→ Crear documento en BD
   │   │
   │   └─→ ✅ Usuario creado
   │       └─→ Redirigir a /dashboard
   │
   └─→ [Ir a /login]
       │
       ├─→ Llenar formulario
       │   • Email
       │   • Contraseña
       │
       ├─→ authService.login()
       │   └─→ Appwrite.account.createEmailPasswordSession()
       │       └─→ Sesión creada
       │
       └─→ ✅ Sesión activa
           └─→ Redirigir a /dashboard

RECUPERAR CONTRASEÑA:

START: Usuario olvidó contraseña
   │
   ├─→ [Ir a /forgot-password]
   │
   ├─→ Ingresar email
   │
   ├─→ authService.sendPasswordResetEmail()
   │   └─→ Appwrite.account.createRecovery()
   │       └─→ Email enviado al usuario
   │
   ├─→ Usuario revisa email
   │
   ├─→ Hacer clic en link de recuperación
   │   └─→ Va a /reset-password?token=xxx
   │
   ├─→ authService.confirmPasswordReset()
   │   └─→ Appwrite.account.updateRecovery()
   │       └─→ Contraseña actualizada
   │
   └─→ ✅ Contraseña nueva configurada
       └─→ Redirigir a /login
```

---

## 📱 Flujo de Poesía

```
Usuario autenticado en /dashboard
   │
   ├─→ [Nueva Poesía]
   │   │
   │   ├─→ Ir a /editor
   │   │
   │   ├─→ Seleccionar plantilla
   │   │   (Haiku, Soneto, etc.)
   │   │
   │   ├─→ Llenar formulario
   │   │   • Título
   │   │   • Contenido
   │   │   • Tema
   │   │
   │   ├─→ [Guardar como Borrador]
   │   │   └─→ poemsService.createPoem()
   │   │       └─→ Documento guardado en BD
   │   │           (published: false)
   │   │
   │   ├─→ [Guardar y Publicar]
   │   │   └─→ poemsService.createPoem()
   │   │       └─→ Documento guardado en BD
   │   │           (published: true)
   │   │
   │   └─→ ✅ Poesía guardada
   │       └─→ Volver a /dashboard
   │
   ├─→ Ver poesía en Dashboard
   │   │
   │   ├─→ Filtrar por: Todas | Publicadas | Borradores
   │   │
   │   ├─→ Mostrar PoemCards
   │   │   (Título, Tema, Plantilla, Fecha)
   │   │
   │   ├─→ [Editar]
   │   │   └─→ Ir a /editor/:id
   │   │       └─→ Cargar datos existentes
   │   │       └─→ poemsService.updatePoem()
   │   │
   │   ├─→ [Eliminar]
   │   │   └─→ Confirmación
   │   │       └─→ poemsService.deletePoem()
   │   │
   │   ├─→ [Ver Detalles]
   │   │   └─→ Mostrar modal PoemView
   │   │       (Contenido completo)
   │   │
   │   └─→ [Compartir/Me encanta]
   │       └─→ (Funcionalidades futuras)
   │
   └─→ Volver a dashboard
       └─→ Ciclo continúa
```

---

## 🔐 Protección de Rutas

```
┌────────────────────────────────────┐
│      Todas las rutas              │
├────────────────────────────────────┤
│                                    │
│  PÚBLICAS (no requieren login)     │
│  ✓ /                    (Home)     │
│  ✓ /login                          │
│  ✓ /register                       │
│  ✓ /forgot-password                │
│                                    │
│  PROTEGIDAS (requieren login)      │
│  ✓ /dashboard          (ProtectedRoute)
│  ✓ /editor             (ProtectedRoute)
│  ✓ /editor/:id         (ProtectedRoute)
│                                    │
│  Ruta 404              (Redirige a /)
│                                    │
└────────────────────────────────────┘

Usuario NO autenticado intenta /dashboard
        │
        ↓
    ProtectedRoute verifica
        │
        ├─→ isAuthenticated === false
        │
        └─→ <Navigate to="/login" />
            (Redirige a login)


Usuario autenticado intenta /dashboard
        │
        ↓
    ProtectedRoute verifica
        │
        ├─→ isAuthenticated === true
        │
        └─→ <Dashboard /> (Renderiza)
```

---

## 🎨 Componentes y Sus Props

```
RegisterForm
├─ Props: ninguno
├─ State: email, password, confirmPassword, name, error, loading
└─ Acciones: register (AuthContext)

LoginForm
├─ Props: ninguno
├─ State: email, password, error, loading
└─ Acciones: login (AuthContext)

ForgotPasswordForm
├─ Props: ninguno
├─ State: email, error, success, loading
└─ Acciones: resetPassword (AuthContext)

Navbar
├─ Props: ninguno
├─ State: showMenu (local)
├─ Usa: useAuth, useNavigate
└─ Renderiza: usuario o botones de login/register

PoemEditor (props: poemId?: string)
├─ Props: poemId (opcional para editar)
├─ State: title, content, templateType, theme, error, loading
├─ Usa: usePoems, useAuth, useNavigate
└─ Acciones: createPoem, updatePoem

PoemCard (props: poem, onDelete, onEdit)
├─ Props: Poem, callbacks
├─ Renderiza: tarjeta con poesía
└─ Acciones: Ver, Editar, Eliminar

PoemView (props: poem, onClose)
├─ Props: Poem, callback onClose
├─ State: liked (local)
├─ Renderiza: modal con detalles completos
└─ Acciones: Me encanta, Compartir

Dashboard
├─ Props: ninguno
├─ State: filter (all|published|drafts)
├─ Usa: usePoems, useNavigate
└─ Renderiza: lista de poesías filtradas

Editor
├─ Props: ninguno
├─ Renderiza: PoemEditor component
└─ Usa: Datos de rutas
```

---

## 🚀 Flujo Completo de Usuario Nuevo

```
1. LLEGA A LA APP
   usuario → http://localhost:5173
   └─→ Ve Home page (Landing)

2. DECIDE REGISTRARSE
   Haz clic en "Comenzar Ahora"
   └─→ Va a /register

3. COMPLETA REGISTRO
   Formulario con: nombre, email, contraseña
   └─→ Validación de datos

4. CREA CUENTA
   RegisterForm → authService.register()
   └─→ Appwrite crea usuario

5. REDIRIGE A DASHBOARD
   Automático post-registro
   └─→ Ve /dashboard vacío

6. CREA PRIMERA POESÍA
   Botón "Nueva Poesía"
   └─→ Va a /editor

7. ESCRIBE POESÍA
   Elige plantilla, rellena formulario
   └─→ Contenido en textarea

8. GUARDA O PUBLICA
   Botón "Guardar" o "Guardar y Publicar"
   └─→ poemsService.createPoem()

9. VUELVE AL DASHBOARD
   Automático post-guardado
   └─→ Ve su poesía en lista

10. GESTIONA POESÍAS
    Editar, Eliminar, Ver, Filtrar
    └─→ Controla su biblioteca

11. CIERRA SESIÓN
    Menú usuario → "Cerrar Sesión"
    └─→ logout()
    └─→ Vuelve a /login
```

---

## 💾 Ciclo de Vida de una Poesía

```
CREAR:
  PoemEditor → [Guardar] → createPoem()
  └─→ Poem nuevo en estado PoemsContext
  └─→ Guardado en Appwrite
  └─→ Visible en Dashboard

LEER:
  Dashboard → PoemCard
  └─→ Datos de Poem en memoria
  └─→ Renderizado en UI
  └─→ Usuario puede ver detalles

ACTUALIZAR:
  Dashboard → [Editar] → /editor/:id
  └─→ PoemEditor carga datos existentes
  └─→ Usuario modifica
  └─→ updatePoem()
  └─→ Actualizado en Appwrite
  └─→ Estado PoemsContext actualizado

ELIMINAR:
  Dashboard → [Eliminar]
  └─→ Confirmación
  └─→ deletePoem()
  └─→ Eliminado de Appwrite
  └─→ Removido del estado
  └─→ UI actualizada (ya no aparece)

FILTRAR:
  Dashboard → [Todas|Publicadas|Borradores]
  └─→ Filter local en componente
  └─→ Filtra array de poems
  └─→ Renderiza solo coincidencias
```

---

## 📈 Escalabilidad Futura

```
VERSIÓN 1.0 (ACTUAL)
└─ Autenticación básica
└─ CRUD de poesías
└─ Plantillas
└─ Dashboard

VERSIÓN 2.0 (PRÓXIMA)
├─ Comentarios en poesías
├─ Sistema de likes/ratings
├─ Seguir otros usuarios
├─ Feed social
└─ Notificaciones

VERSIÓN 3.0 (FUTURO)
├─ Búsqueda avanzada
├─ Etiquetas y categorías
├─ Exportar a PDF/Word
├─ Compartir públicamente
├─ Modo oscuro
└─ Mobile app

ENTERPRISE (LARGO PLAZO)
├─ Analytics
├─ Premium features
├─ Colaboración real-time
├─ API pública
└─ Marketplace de templates
```

---

## 🎯 Este Mapa te Ayuda a:

✅ Entender la estructura completa  
✅ Visualizar el flujo de datos  
✅ Ver cómo se conectan componentes  
✅ Comprender la autenticación  
✅ Ver protección de rutas  
✅ Entender ciclo de vida de poesías  
✅ Planificar expansiones futuras  

---

*Consult este mapa mientras desarrollas para entender mejor cómo funciona todo* 🗺️
