import { Server } from "socket.io";
import http from "http";
import express from "express";

import User from "../models/user.model.js";
import Message from "../models/message.model.js";

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

const userSocketMap = {};

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;

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
    socket.broadcast.emit("newMessage", newMessage);
  });

  socket.on("messageRead", async ({ messageId }) => {
    try {
      const message = await Message.findById(messageId);
      if (!message) {
        console.error("Message not found:", messageId);
        return;
      }

      if (!message.isRead) {
        message.isRead = true;
        message.readAt = new Date();
        await message.save();

        io.emit("messageRead", { 
          messageId: message._id.toString(),
          readAt: message.readAt 
        });
        
        console.log(`Message ${messageId} marked as read`);
      }
    } catch (error) {
      console.error("Error updating message read status:", error.message);
    }
  });

  socket.on("disconnect", async () => {
    console.log("A user disconnected", socket.id);

    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    if (userId) {
      try {
        await User.findByIdAndUpdate(userId, { lastSeen: new Date() });
      } catch (error) {
        console.error("Error updating lastSeen:", error.message);
      }
    }
  });
});

export { io, app, server };