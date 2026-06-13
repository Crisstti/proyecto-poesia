export const translateAppwriteError = (error: unknown): string => {
  const message = error instanceof Error ? error.message : String(error);

  const translations: Record<string, string> = {
    'Invalid credentials. Please check the email and password.':
      'Email o contraseña incorrectos.',
    'A user with the same email already exists in the current project.':
      'Ya existe una cuenta registrada con este email.',
    'A user with the same id, email, or phone already exists in this project.':
      'Ya existe una cuenta registrada con este email.',
    'Rate limit for the current endpoint has been exceeded. Please try again after some time.':
      'Demasiados intentos. Por favor espera un momento e intenta de nuevo.',
    'User (role: guests) missing scope (account)':
      'Debes iniciar sesión para realizar esta acción.',
    'Password must be between 8 and 256 characters long.':
      'La contraseña debe tener entre 8 y 256 caracteres.',
    'Invalid `email` param: Value must be a valid email address':
      'El email ingresado no es válido.'
  };

  // Coincidencia exacta
  if (translations[message]) {
    return translations[message];
  }

  // Coincidencia parcial (por si Appwrite agrega detalles extra al mensaje)
  for (const key in translations) {
    if (message.includes(key)) {
      return translations[key];
    }
  }

  // Si no se encuentra traducción, devolver el mensaje original
  return message;
};
