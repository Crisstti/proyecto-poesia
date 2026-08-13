import { Client, Users } from 'node-appwrite';

export default async ({ req, res, log, error }) => {
  // Verificar que venga el userId
  const body = req.body ? JSON.parse(req.body) : {};
  const { userId } = body;

  if (!userId) {
    return res.json({ success: false, message: 'userId es requerido' }, 400);
  }

  // Inicializar cliente con API Key
  const client = new Client()
    .setEndpoint('https://tor.cloud.appwrite.io/v1')
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  const users = new Users(client);

  try {
    await users.delete(userId);
    log(`Usuario ${userId} eliminado correctamente`);
    return res.json({ success: true, message: 'Usuario eliminado correctamente' });
  } catch (err) {
    error(`Error eliminando usuario: ${err.message}`);
    return res.json({ success: false, message: err.message }, 500);
  }
};
