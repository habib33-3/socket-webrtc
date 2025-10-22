
export const onlineUsers = new Map<string, string[]>();

export const addUserSocket = (userId: string, socketId: string) => {
  const sockets = onlineUsers.get(userId) || [];
  if (!sockets.includes(socketId)) sockets.push(socketId);
  onlineUsers.set(userId, sockets);
};

export const removeUserSocket = (socketId: string) => {
  for (const [userId, sockets] of onlineUsers.entries()) {
    const index = sockets.indexOf(socketId);
    if (index !== -1) {
      sockets.splice(index, 1);
      if (sockets.length === 0) onlineUsers.delete(userId);
      break;
    }
  }
};

export const getOnlineUserIds = () => Array.from(onlineUsers.keys());
