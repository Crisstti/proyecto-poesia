# 📖 Guía Completa de Instalación - Poesia App

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalados:

- **Node.js 16+** (incluye npm)
- **Git** (opcional, para clonar repositorios)

## ✅ Paso 1: Instalar Node.js y npm

### En Linux (Ubuntu/Debian)

```bash
# Opción 1: Usando NodeSource (Recomendado para versión reciente)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Opción 2: Usando apt directo
sudo apt update
sudo apt install nodejs npm
```

### En macOS

```bash
# Usando Homebrew
brew install node

# O descargar desde https://nodejs.org/
```

### En Windows

1. Descarga el instalador desde [nodejs.org](https://nodejs.org/)
2. Ejecuta el instalador y sigue las instrucciones
3. Verifica la instalación en PowerShell o CMD

## ✅ Paso 2: Verificar la Instalación

```bash
node --version
npm --version
```

Deberías ver versiones como `v18.x.x` y `9.x.x` (o superiores)

## ✅ Paso 3: Configurar Appwrite

### 3.1 Crear una cuenta en Appwrite Cloud

1. Ve a [Appwrite Cloud](https://cloud.appwrite.io)
2. Crea una cuenta y inicia sesión
3. Crea un nuevo proyecto

### 3.2 Obtener las Credenciales

En tu proyecto de Appwrite:

1. Ve a **Settings** (Configuración)
2. Copia:
   - **Project ID**
   - **API Key** (crea uno si es necesario)

### 3.3 Crear Base de Datos y Colecciones

1. En el dashboard, ve a **Database**
2. Crea una nueva base de datos llamada `poesia` (anota el ID)
3. En esa base de datos, crea dos colecciones:

#### Colección: poems
Atributos requeridos:
- `userId` - String
- `title` - String
- `content` - String  
- `templateType` - String (enum: blank, haiku, sonnet, free-verse, acrostic, reflection)
- `theme` - String
- `published` - Boolean
- `createdAt` - DateTime
- `updatedAt` - DateTime

#### Colección: users
Atributos requeridos:
- `email` - String
- `name` - String
- `bio` - String (opcional)
- `createdAt` - DateTime

## ✅ Paso 4: Instalar Poesia App

```bash
# 1. Navega a la carpeta del proyecto
cd proyecto_poesia

# 2. Instala las dependencias
npm install

# 3. Copia el archivo de configuración
cp .env.example .env.local
```

## ✅ Paso 5: Configurar Variables de Entorno

Edita el archivo `.env.local` y completa:

```env
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=tu_project_id_aqui
VITE_APPWRITE_API_KEY=tu_api_key_aqui
VITE_APPWRITE_DATABASE_ID=poesia
VITE_APPWRITE_POEMS_COLLECTION_ID=poems
VITE_APPWRITE_USERS_COLLECTION_ID=users
```

## ✅ Paso 6: Ejecutar la Aplicación

### Desarrollo

```bash
npm run dev
```

La aplicación se abrirá automáticamente en `http://localhost:5173`

### Construir para Producción

```bash
npm run build
```

Los archivos compilados estarán en la carpeta `dist/`

## 🧪 Probando la Aplicación

1. **Home**: Visita `http://localhost:5173/`
2. **Registro**: Haz clic en "Comenzar Ahora" o "Regístrate"
   - Completa el formulario con un email válido
   - La contraseña debe tener: 8+ caracteres, mayúscula, minúscula y número
3. **Dashboard**: Después de registrarte, accederás automáticamente
4. **Crear Poesía**: Haz clic en "Nueva Poesía"
   - Elige una plantilla
   - Completa el formulario
   - Guarda como borrador o publica
5. **Gestionar**: En el Dashboard puedes ver, editar y eliminar tus poesías

## 🐛 Solución de Problemas

### "npm: command not found"
- Verifica que Node.js está instalado: `node --version`
- Si no está instalado, sigue nuevamente los pasos en "Paso 1"
- En Windows, reinicia PowerShell o CMD después de instalar Node.js

### "Error de conexión a Appwrite"
- Verifica que las credenciales en `.env.local` son correctas
- Asegúrate que Appwrite Cloud está disponible
- Comprueba tu conexión a internet

### "Colección no encontrada"
- Verifica que creaste las colecciones `poems` y `users` en Appwrite
- Compara los IDs en `.env.local` con los de Appwrite

### "Contraseña débil"
- Requiere: 8+ caracteres, mayúscula, minúscula, número
- Ejemplo válido: `MyPassword123`

### "Error al compilar TypeScript"
```bash
# Limpia el cache
rm -rf node_modules dist
npm install
npm run build
```

## 🔑 Variables de Entorno Explicadas

| Variable | Descripción |
|----------|-------------|
| `VITE_APPWRITE_ENDPOINT` | URL del servidor Appwrite |
| `VITE_APPWRITE_PROJECT_ID` | ID único del proyecto en Appwrite |
| `VITE_APPWRITE_API_KEY` | Clave de API para autenticación |
| `VITE_APPWRITE_DATABASE_ID` | ID de la base de datos |
| `VITE_APPWRITE_POEMS_COLLECTION_ID` | ID de colección de poesías |
| `VITE_APPWRITE_USERS_COLLECTION_ID` | ID de colección de usuarios |

## 📚 Documentación Oficial

- [Node.js Docs](https://nodejs.org/docs/)
- [Appwrite Docs](https://appwrite.io/docs)
- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

## 🆘 Necesitas Ayuda?

Si encuentras problemas:

1. Revisa el archivo `README.md` para más información
2. Consulta la documentación oficial del proyecto o las tecnologías
3. Verifica los logs en la consola del navegador (F12)
4. Revisa los logs del servidor de desarrollo

---

¡Listo! Ya deberías tener Poesia App funcionando. ¡Comienza a crear poesías! ✍️✨
