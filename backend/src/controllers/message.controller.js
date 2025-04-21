import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    // Находим всех пользователей, кроме залогиненного
    const users = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    // Получаем последние сообщения для каждого пользователя
    const usersWithLastMessage = await Promise.all(
      users.map(async (user) => {
        const lastMessage = await Message.findOne({
          $or: [
            { senderId: loggedInUserId, receiverId: user._id },
            { senderId: user._id, receiverId: loggedInUserId },
          ],
        })
          .sort({ createdAt: -1 })
          .limit(1);

        // Получаем количество непрочитанных сообщений
        const unreadMessagesCount = await Message.countDocuments({
          senderId: user._id,
          receiverId: loggedInUserId,
          isRead: false, // Добавляем условие для непрочитанных сообщений
        });

        return {
          ...user.toObject(),
          lastMessage: lastMessage || null,
          unreadMessagesCount: unreadMessagesCount, // Добавляем количество непрочитанных сообщений
        };
      })
    );

    // Сортируем пользователей по дате последнего сообщения (сначала самые новые)
    usersWithLastMessage.sort((a, b) => {
      if (!a.lastMessage && !b.lastMessage) return 0; // Если у обоих нет сообщений - не меняем порядок
      if (!a.lastMessage) return 1; // b выше, если у a нет сообщений
      if (!b.lastMessage) return -1; // a выше, если у b нет сообщений

      return new Date(b.lastMessage?.createdAt).getTime() - new Date(a.lastMessage?.createdAt).getTime(); // Сортируем по убыванию даты
    });

    res.status(200).json(usersWithLastMessage);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    // Помечаем сообщения как прочитанные
    await Message.updateMany(
      { senderId: userToChatId, receiverId: myId, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      // Upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    // Отправляем событие об обновлении списка пользователей всем клиентам, передавая ID пользователя, которого нужно переместить
    io.emit("updateUserList", { userId: senderId });

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const markMessageAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const loggedInUserId = req.user._id;

    // Находим сообщение
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Обновляем статус и время прочтения
    if (message.receiverId.toString() === loggedInUserId.toString() && !message.isRead) {
      message.isRead = true;
      message.readAt = new Date();  // Устанавливаем время прочтения
      await message.save(); // Сохраняем обновление в базе данных

      // Отправляем уведомление через сокеты всем подключенным пользователям (отправитель и получатель)
      const senderSocketId = getReceiverSocketId(message.senderId);
      const receiverSocketId = getReceiverSocketId(message.receiverId);

      // Проверяем, отправляем ли мы уведомление отправителю
      if (senderSocketId) {
        io.to(senderSocketId).emit("messageRead", { messageId, readAt: message.readAt });
      }

      // Отправляем уведомление получателю
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("messageRead", { messageId, readAt: message.readAt });
      }

      res.status(200).json({ message: "Message marked as read" });
    } else {
      res.status(400).json({ message: "You cannot mark this message as read" });
    }
  } catch (error) {
    console.log("Error in markMessageAsRead controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
