# Copilot Instructions - Poesia App

## Project Overview
Poesia is a modern web application for poetry writing and sharing, built with React, TypeScript, and Appwrite.

## Technologies Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Appwrite (Authentication, Database, Storage)
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Routing**: React Router v6

## Key Features
- User authentication (login, registration, password recovery)
- Poetry creation with visual templates
- Database integration for storing poems
- User profile management
- Responsive design

## Project Structure
```
src/
├── components/     # Reusable React components
├── pages/          # Page components
├── context/        # Context API for state management
├── services/       # Appwrite services
├── types/          # TypeScript type definitions
├── hooks/          # Custom React hooks
├── utils/          # Utility functions
├── App.tsx         # Main app component
└── main.tsx        # Entry point
```

## Setup Instructions
1. Install dependencies: `npm install`
2. Configure Appwrite credentials in `.env.local`
3. Run development server: `npm run dev`
4. Build for production: `npm run build`

## Environment Variables
Create `.env.local` file:
```
VITE_APPWRITE_ENDPOINT=https://your-appwrite-url
VITE_APPWRITE_PROJECT_ID=your-project-id
VITE_APPWRITE_API_KEY=your-api-key
```

## Development Guidelines
- Use TypeScript for type safety
- Follow React best practices
- Use Tailwind CSS for styling
- Keep components small and reusable
- Use Context API for global state
