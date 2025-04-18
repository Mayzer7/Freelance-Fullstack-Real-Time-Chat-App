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
      const { users, selectedUser, messages } = get();
  
      // Если сообщение связано с текущим диалогом, добавим его в сообщения
      if (
        selectedUser &&
        (newMessage.senderId === selectedUser._id || newMessage.receiverId === selectedUser._id)
      ) {
        set({ messages: [...messages, newMessage] });
      }
  
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
    });
  },  

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),

  setMessages: (messages) => set({ messages }),
  setUsers: (users) => set({ users }),

  // 👇 Добавляем печатает
  addTypingUser: (userId) =>
    set((state) => ({
      typingUsers: [...new Set([...state.typingUsers, userId])],
    })),

  removeTypingUser: (userId) =>
    set((state) => ({
      typingUsers: state.typingUsers.filter((id) => id !== userId),
    })),
}));
