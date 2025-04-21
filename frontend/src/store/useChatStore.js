import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  typingUsers: [],

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data }); // теперь каждый user имеет .lastMessage
    } catch (error) {
      toast.error(error.response?.data?.message || "Error fetching users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });

      // После получения сообщений обновляем список пользователей, чтобы убрать индикатор
      const { users } = get();
      const updatedUsers = users.map((user) =>
        user._id === userId ? { ...user, unreadMessagesCount: 0 } : user
      );
      set({ users: updatedUsers });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages, users } = get();
    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData
      );
      const newMessage = res.data;

      // Обновляем messages
      set({ messages: [...messages, newMessage] });

      // Обновляем lastMessage у соответствующего пользователя
      const updatedUsers = users.map((user) => {
        if (
          user._id === newMessage.senderId ||
          user._id === newMessage.receiverId
        ) {
          return { ...user, lastMessage: newMessage };
        }
        return user;
      });

      set({ users: updatedUsers });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const { users, selectedUser } = get();

      // Обновляем lastMessage у соответствующего пользователя в списке
      const updatedUsers = users.map((user) => {
        if (
          user._id === newMessage.senderId ||
          user._id === newMessage.receiverId
        ) {
          return { ...user, lastMessage: newMessage };
        }
        return user;
      });

      set({ users: updatedUsers });

      // Если сообщение связано с текущим диалогом, добавим его в сообщения
      if (
        selectedUser &&
        (newMessage.senderId === selectedUser._id || newMessage.receiverId === selectedUser._id)
      ) {
        set((state) => ({
          messages: [...state.messages, newMessage],
          users: updatedUsers,
        }));
      } else {
        // Обновляем количество непрочитанных сообщений для отправителя
        set((state) => ({
          users: state.users.map((user) => {
            if (user._id === newMessage.senderId) {
              return {
                ...user,
                unreadMessagesCount: (user.unreadMessagesCount || 0) + 1,
                lastMessage: newMessage,
              };
            }
            return user;
          }),
        }));
      }
    });

    socket.on("messageRead", ({ messageId, receiverId }) => {
      // Обновляем статус сообщения как прочитанное
      set((state) => ({
        messages: state.messages.map((message) =>
          message._id === messageId ? { ...message, isRead: true } : message
        ),
      }));

      // Обновляем список пользователей
      set((state) => ({
        users: state.users.map((user) => {
          if (user._id === receiverId) {
            return { ...user, lastMessage: { ...user.lastMessage, isRead: true } };
          }
          return user;
        }),
      }));
    });

    // Подписываемся на событие обновления списка пользователей
    socket.on("updateUserList", ({ userId }) => {
      const { users } = get();

      const userToMove = users.find((user) => user._id === userId);

      if (userToMove) {
        const updatedUsers = [
          userToMove,
          ...users.filter((user) => user._id !== userId),
        ];

        set({ users: updatedUsers });
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
    socket.off("updateUserList"); // Отписываемся от события
    socket.off("messageRead");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),

  setMessages: (messages) => set({ messages }),
  setUsers: (users) => set({ users }),

  addTypingUser: (userId) =>
    set((state) => ({
      typingUsers: [...new Set([...state.typingUsers, userId])],
    })),

  removeTypingUser: (userId) =>
    set((state) => ({
      typingUsers: state.typingUsers.filter((id) => id !== userId),
    })),
}));
