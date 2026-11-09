import { Client, Databases, Users, Query, ID, Permission, Role } from 'node-appwrite';

const ENV = process.env;
const DB = ENV.DATABASE_ID;
const C = {
  poems: ENV.POEMS_COLLECTION_ID,
  likes: ENV.LIKES_COLLECTION_ID,
  comments: ENV.COMMENTS_COLLECTION_ID,
  favorites: ENV.FAVORITES_COLLECTION_ID,
  friendships: ENV.FRIENDSHIPS_COLLECTION_ID,
  messages: ENV.MESSAGES_COLLECTION_ID,
  reports: ENV.REPORTS_COLLECTION_ID,
  notifications: ENV.NOTIFICATIONS_COLLECTION_ID,
  users: ENV.USERS_COLLECTION_ID
};
const ADMIN_USER_ID = ENV.ADMIN_USER_ID;
const PLATFORM_NAME = 'Palabras en Poemas';

const REPORT_REASONS = [
  'Contenido ofensivo o discurso de odio',
  'Contenido sexual o inapropiado',
  'Acoso o intimidación',
  'Spam o publicidad no deseada',
  'Información falsa o engañosa',
  'Otro motivo'
];

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const fail = (status, message) => {
  throw new HttpError(status, message);
};

export default async ({ req, res, log, error }) => {
  const callerId = req.headers['x-appwrite-user-id'];
  if (!callerId) return res.json({ success: false, message: 'No autenticado' }, 401);

  let body = {};
  try {
    body = req.bodyJson ?? (req.body ? JSON.parse(req.body) : {});
  } catch {
    return res.json({ success: false, message: 'Solicitud inválida' }, 400);
  }

  const client = new Client()
    .setEndpoint(ENV.APPWRITE_FUNCTION_API_ENDPOINT || 'https://tor.cloud.appwrite.io/v1')
    .setProject(ENV.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(ENV.APPWRITE_API_KEY);

  const db = new Databases(client);
  const users = new Users(client);

  const now = () => new Date().toISOString();

  // Las notificaciones son de mejor esfuerzo: si fallan, la acción principal no se rompe
  const createNotification = async ({
    userId, type, fromUserId, fromUserName, message, linkTo = '', urgent = false
  }) => {
    if (!userId || userId === fromUserId) return;
    const permissions = [
      Permission.read(Role.user(userId)),
      Permission.update(Role.user(userId)),
      Permission.delete(Role.user(userId))
    ];

    try {
      await db.createDocument(
        DB, C.notifications, ID.unique(),
        {
          userId,
          type,
          fromUserId,
          fromUserName: String(fromUserName).slice(0, 100),
          message: String(message).slice(0, 200),
          read: false,
          createdAt: now(),
          linkTo: String(linkTo).slice(0, 200),
          urgent
        },
        permissions
      );
    } catch (err) {
      error(`No se pudo crear la notificación: ${err.message}`);
    }
  };

  const areFriends = async (a, b) => {
    const [x, y] = await Promise.all([
      db.listDocuments(DB, C.friendships, [
        Query.equal('senderId', a), Query.equal('receiverId', b),
        Query.equal('status', 'accepted'), Query.limit(1)
      ]),
      db.listDocuments(DB, C.friendships, [
        Query.equal('senderId', b), Query.equal('receiverId', a),
        Query.equal('status', 'accepted'), Query.limit(1)
      ])
    ]);
    return x.total + y.total > 0;
  };

  // Borra todos los documentos que cumplan las condiciones (con tope de seguridad)
  const deleteWhere = async (collectionId, queries) => {
    let total = 0;
    for (let i = 0; i < 50; i++) {
      const page = await db.listDocuments(DB, collectionId, [...queries, Query.limit(100)]);
      if (page.documents.length === 0) break;
      const results = await Promise.allSettled(
        page.documents.map(d => db.deleteDocument(DB, collectionId, d.$id))
      );
      const ok = results.filter(r => r.status === 'fulfilled').length;
      total += ok;
      if (ok === 0) break; // si nada se pudo borrar, no insistir
    }
    return total;
  };

  // Elimina TODO lo asociado a un usuario y, al final, su cuenta de acceso
  const purgeUserData = async (targetId) => {
    // 1. Sus poesías y todo lo que cuelga de ellas
    for (let i = 0; i < 20; i++) {
      const poems = await db.listDocuments(DB, C.poems, [
        Query.equal('userId', targetId), Query.limit(100)
      ]);
      if (poems.documents.length === 0) break;

      let removed = 0;
      for (const poem of poems.documents) {
        try {
          await deleteWhere(C.likes, [Query.equal('poemId', poem.$id)]);
          await deleteWhere(C.comments, [Query.equal('poemId', poem.$id)]);
          await deleteWhere(C.favorites, [Query.equal('poemId', poem.$id)]);
          await deleteWhere(C.reports, [Query.equal('poemId', poem.$id)]);
          await db.deleteDocument(DB, C.poems, poem.$id);
          removed++;
        } catch (err) {
          error(`No se pudo borrar la poesía ${poem.$id}: ${err.message}`);
        }
      }
      if (removed === 0) break;
    }

    // 2. Lo que el usuario hizo en poesías de otros
    await deleteWhere(C.likes, [Query.equal('userId', targetId)]);
    await deleteWhere(C.comments, [Query.equal('userId', targetId)]);
    await deleteWhere(C.favorites, [Query.equal('userId', targetId)]);

    // 3. Amistades, mensajes y notificaciones (enviados y recibidos)
    await deleteWhere(C.friendships, [Query.equal('senderId', targetId)]);
    await deleteWhere(C.friendships, [Query.equal('receiverId', targetId)]);
    await deleteWhere(C.messages, [Query.equal('senderId', targetId)]);
    await deleteWhere(C.messages, [Query.equal('receiverId', targetId)]);
    await deleteWhere(C.notifications, [Query.equal('userId', targetId)]);
    await deleteWhere(C.notifications, [Query.equal('fromUserId', targetId)]);

    // 4. Reportes hechos por él o sobre sus poesías
    await deleteWhere(C.reports, [Query.equal('reporterId', targetId)]);
    await deleteWhere(C.reports, [Query.equal('poemAuthorId', targetId)]);

    // 5. Perfil público
    try {
      await db.deleteDocument(DB, C.users, targetId);
    } catch (err) {
      if (!err || err.code !== 404) error(`No se pudo borrar el perfil: ${err && err.message}`);
    }

    // 6. Cuenta de acceso (si ya no existía, se ignora)
    try {
      await users.delete(targetId);
    } catch (err) {
      if (!err || err.code !== 404) throw err;
    }
  };

  try {
    const caller = await users.get(callerId);
    const isAdmin = (caller.labels || []).includes('admin');
    const callerName = isAdmin ? PLATFORM_NAME : caller.name;

    switch (body.action) {
      case 'sendMessage': {
        const receiverId = String(body.receiverId || '');
        const text = String(body.content || '').trim();

        if (!receiverId || !text) fail(400, 'Faltan datos del mensaje');
        if (text.length > 2000) fail(400, 'El mensaje es demasiado largo');
        if (receiverId === callerId) fail(400, 'No puedes escribirte a ti mismo');

        try {
          await users.get(receiverId);
        } catch {
          fail(404, 'El destinatario no existe');
        }

        if (!isAdmin && !(await areFriends(callerId, receiverId))) {
          fail(403, 'Solo puedes escribir a tus amigos');
        }

        const message = await db.createDocument(
          DB, C.messages, ID.unique(),
          {
            senderId: callerId,
            receiverId,
            content: text,
            createdAt: now(),
            read: false
          },
          [
            Permission.read(Role.user(callerId)),
            Permission.read(Role.user(receiverId)),
            Permission.delete(Role.user(callerId)),
            Permission.delete(Role.user(receiverId))
          ]
        );

        // Notificación agrupada: una sola por conversación mientras no se lea
        let unreadTotal = 1;
        try {
          const unreadMessages = await db.listDocuments(DB, C.messages, [
            Query.equal('senderId', callerId),
            Query.equal('receiverId', receiverId),
            Query.equal('read', false),
            Query.limit(100)
          ]);
          unreadTotal = Math.max(1, unreadMessages.total);
        } catch (err) {
          error(`No se pudo contar mensajes sin leer: ${err.message}`);
        }

        const summary =
          unreadTotal <= 1
            ? `${callerName} te envió un mensaje`
            : `${callerName} te envió ${unreadTotal} mensajes`;

        let grouped = false;
        try {
          const existing = await db.listDocuments(DB, C.notifications, [
            Query.equal('userId', receiverId),
            Query.equal('type', 'message'),
            Query.equal('fromUserId', callerId),
            Query.equal('read', false),
            Query.limit(1)
          ]);
          if (existing.total > 0) {
            await db.updateDocument(DB, C.notifications, existing.documents[0].$id, {
              message: summary,
              createdAt: now()
            });
            grouped = true;
          }
        } catch (err) {
          error(`No se pudo agrupar la notificación: ${err.message}`);
        }

        if (!grouped) {
          await createNotification({
            userId: receiverId,
            type: 'message',
            fromUserId: callerId,
            fromUserName: callerName,
            message: summary,
            linkTo: `/messages/${callerId}`
          });
        }

        return res.json({ success: true, message });
      }

      case 'markMessagesRead': {
        const otherUserId = String(body.otherUserId || '');
        if (!otherUserId) fail(400, 'Falta el usuario');

        const unread = await db.listDocuments(DB, C.messages, [
          Query.equal('senderId', otherUserId),
          Query.equal('receiverId', callerId),
          Query.equal('read', false),
          Query.limit(100)
        ]);

        await Promise.allSettled(
          unread.documents.map(d =>
            db.updateDocument(DB, C.messages, d.$id, { read: true })
          )
        );

        try {
          const notifs = await db.listDocuments(DB, C.notifications, [
            Query.equal('userId', callerId),
            Query.equal('type', 'message'),
            Query.equal('fromUserId', otherUserId),
            Query.equal('read', false),
            Query.limit(100)
          ]);
          await Promise.allSettled(
            notifs.documents.map(n =>
              db.updateDocument(DB, C.notifications, n.$id, { read: true })
            )
          );
        } catch (err) {
          error(`No se pudieron marcar las notificaciones: ${err.message}`);
        }

        return res.json({ success: true, updated: unread.total });
      }

      case 'notifyLike': {
        const poemId = String(body.poemId || '');
        if (!poemId) fail(400, 'Falta la poesía');

        const like = await db.listDocuments(DB, C.likes, [
          Query.equal('poemId', poemId),
          Query.equal('userId', callerId),
          Query.limit(1)
        ]);
        if (like.total === 0) fail(400, 'El like no existe');

        const poem = await db.getDocument(DB, C.poems, poemId);

        try {
          const dup = await db.listDocuments(DB, C.notifications, [
            Query.equal('userId', poem.userId),
            Query.equal('fromUserId', callerId),
            Query.equal('type', 'like'),
            Query.equal('linkTo', `/poem/${poemId}`),
            Query.limit(1)
          ]);
          if (dup.total > 0) return res.json({ success: true, skipped: true });
        } catch {}

        await createNotification({
          userId: poem.userId,
          type: 'like',
          fromUserId: callerId,
          fromUserName: callerName,
          message: `A ${callerName} le encantó tu poesía "${poem.title}"`,
          linkTo: `/poem/${poemId}`
        });
        return res.json({ success: true });
      }

      case 'notifyComment': {
        const commentId = String(body.commentId || '');
        if (!commentId) fail(400, 'Falta el comentario');

        const comment = await db.getDocument(DB, C.comments, commentId);
        if (comment.userId !== callerId) fail(403, 'No autorizado');

        const poem = await db.getDocument(DB, C.poems, comment.poemId);
        await createNotification({
          userId: poem.userId,
          type: 'comment',
          fromUserId: callerId,
          fromUserName: callerName,
          message: `${callerName} comentó tu poesía "${poem.title}"`,
          linkTo: `/poem/${poem.$id}`
        });
        return res.json({ success: true });
      }

      case 'notifyFriendRequest': {
        const friendshipId = String(body.friendshipId || '');
        if (!friendshipId) fail(400, 'Falta la solicitud');

        const f = await db.getDocument(DB, C.friendships, friendshipId);
        if (f.senderId !== callerId || f.status !== 'pending') fail(403, 'No autorizado');

        await createNotification({
          userId: f.receiverId,
          type: 'friend_request',
          fromUserId: callerId,
          fromUserName: callerName,
          message: `${callerName} te envió una solicitud de amistad`,
          linkTo: '/contacts'
        });
        return res.json({ success: true });
      }

      case 'notifyFriendAccepted': {
        const friendshipId = String(body.friendshipId || '');
        if (!friendshipId) fail(400, 'Falta la solicitud');

        const f = await db.getDocument(DB, C.friendships, friendshipId);
        if (f.receiverId !== callerId || f.status !== 'accepted') fail(403, 'No autorizado');

        await createNotification({
          userId: f.senderId,
          type: 'friend_request',
          fromUserId: callerId,
          fromUserName: callerName,
          message: `${callerName} aceptó tu solicitud de amistad`,
          linkTo: '/contacts'
        });
        return res.json({ success: true });
      }

      case 'reportPoem': {
        const poemId = String(body.poemId || '');
        const reason = String(body.reason || '');
        if (!poemId) fail(400, 'Falta la poesía');
        if (!REPORT_REASONS.includes(reason)) fail(400, 'Motivo inválido');

        const poem = await db.getDocument(DB, C.poems, poemId);
        if (poem.userId === callerId) fail(400, 'No puedes reportar tu propia poesía');

        const existing = await db.listDocuments(DB, C.reports, [
          Query.equal('poemId', poemId),
          Query.equal('reporterId', callerId),
          Query.limit(1)
        ]);
        if (existing.total > 0) fail(409, 'Ya reportaste esta poesía');

        await db.createDocument(
          DB, C.reports, ID.unique(),
          {
            poemId,
            reporterId: callerId,
            reason,
            poemAuthorId: poem.userId,
            poemTitle: String(poem.title).slice(0, 200),
            createdAt: now()
          },
          [Permission.read(Role.user(callerId))]
        );

        const adminNote = (message, urgent = false) =>
          createNotification({
            userId: ADMIN_USER_ID,
            type: 'report',
            fromUserId: callerId,
            fromUserName: 'Sistema',
            message,
            linkTo: '/admin',
            urgent
          });

        await adminNote(`Nueva denuncia: "${reason}" en la poesía "${poem.title}"`);

        const byPoem = await db.listDocuments(DB, C.reports, [
          Query.equal('poemId', poemId), Query.limit(100)
        ]);
        if (byPoem.total >= 2) {
          await adminNote(
            `⚠️ Reincidente por poesía: "${poem.title}" acumula ${byPoem.total} reportes`,
            true
          );
        }

        const byAuthor = await db.listDocuments(DB, C.reports, [
          Query.equal('poemAuthorId', poem.userId), Query.limit(100)
        ]);
        const distinctPoems = new Set(byAuthor.documents.map(r => r.poemId));
        if (distinctPoems.size >= 2) {
          await adminNote(
            `⚠️ Reincidente por autor: ${poem.authorName || 'un usuario'} tiene reportes en ${distinctPoems.size} poesías distintas`,
            true
          );
        }

        return res.json({ success: true });
      }

      // El usuario elimina su propia cuenta (datos + credenciales)
      case 'deleteMyAccount': {
        if (isAdmin || callerId === ADMIN_USER_ID) {
          fail(403, 'La cuenta de administrador no se puede eliminar desde aquí');
        }
        const confirmEmail = String(body.confirmEmail || '').trim().toLowerCase();
        if (confirmEmail !== String(caller.email || '').toLowerCase()) {
          fail(400, 'El email de confirmación no coincide');
        }

        await purgeUserData(callerId);
        return res.json({ success: true });
      }

      // El admin elimina a otro usuario (datos + credenciales)
      case 'adminDeleteUser': {
        if (!isAdmin) fail(403, 'No autorizado');
        const targetId = String(body.userId || '');
        if (!targetId) fail(400, 'Falta el usuario');
        if (targetId === callerId || targetId === ADMIN_USER_ID) {
          fail(400, 'No se puede eliminar la cuenta de administrador');
        }

        await purgeUserData(targetId);
        return res.json({ success: true });
      }

      default:
        fail(400, 'Acción desconocida');
    }
  } catch (err) {
    if (err instanceof HttpError) {
      return res.json({ success: false, message: err.message }, err.status);
    }
    if (err && err.code === 404) {
      return res.json({ success: false, message: 'No encontrado' }, 404);
    }
    error(`Error interno: ${err && err.message}`);
    return res.json({ success: false, message: 'Error interno' }, 500);
  }
};
