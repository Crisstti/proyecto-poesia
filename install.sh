#!/bin/bash

# Script de instalación de Poesia App

echo "🚀 Iniciando instalación de Poesia App..."
echo ""

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado"
    echo "📝 Por favor, instala Node.js desde: https://nodejs.org/"
    echo "   O ejecuta:"
    echo "   sudo apt update && sudo apt install nodejs npm"
    exit 1
fi

echo "✅ Node.js detectado: $(node --version)"
echo "✅ npm detectado: $(npm --version)"
echo ""

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ ¡Instalación completada!"
    echo ""
    echo "📋 Próximos pasos:"
    echo "1. Copia el archivo .env.example a .env.local"
    echo "   cp .env.example .env.local"
    echo ""
    echo "2. Configura tus credenciales de Appwrite en .env.local"
    echo ""
    echo "3. Inicia el servidor de desarrollo:"
    echo "   npm run dev"
    echo ""
else
    echo "❌ Error durante la instalación de dependencias"
    exit 1
fi
