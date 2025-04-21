import { Server } from "socket.io";
import http from "http";
import express from "express";

import User from "../models/user.model.js";
import Message from "../models/message.model.js"; // Импортируем модель Message

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// used to store online users
const userSocketMap = {}; // {userId: socketId}

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;

  // io.emit() is used to send events to all the connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("typing", ({ receiverId }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("userTyping", { senderId: userId });
    }
  });

  socket.on("stopTyping", ({ receiverId }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("userStopTyping", { senderId: userId });
    }
  });

  socket.on("newMessage", (newMessage) => {
    // Отправляем новое сообщение всем, кроме отправителя
    socket.broadcast.emit("newMessage", newMessage);
  });

  // Событие для "прочитано"
  socket.on("messageRead", async ({ messageId, receiverId }) => {
    try {
      // Обновляем статус сообщения как прочитанное в базе данных
      await Message.findByIdAndUpdate(messageId, { isRead: true });

      // Теперь уведомляем всех клиентов, кроме отправителя сообщения
      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("messageRead", { messageId });
      }
      
      // Отправляем всем другим пользователям, кто не является получателем
      socket.broadcast.emit("messageRead", { messageId });

    } catch (error) {
      console.error("Error updating message read status: ", error.message);
    }
  });

  socket.on("disconnect", async () => {
    console.log("A user disconnected", socket.id);

    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    // ✅ Обновляем lastSeen в MongoDB
    if (userId) {
      try {
        await User.findByIdAndUpdate(userId, { lastSeen: new Date() });
      } catch (error) {
        console.error("Ошибка при обновлении lastSeen:", error.message);
      }
    }
  });
});

export { io, app, server };
