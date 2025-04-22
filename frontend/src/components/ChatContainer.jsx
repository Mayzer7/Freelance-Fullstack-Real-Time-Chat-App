import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import axios from "axios"; // Добавляем axios для отправки запроса о прочтении

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    setMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  // Обработчик прокрутки, который будет помечать сообщения как прочитанные
  const handleScroll = () => {
    const messageElements = document.querySelectorAll('.chat');
    messageElements.forEach((message) => {
      const rect = message.getBoundingClientRect();
      if (rect.top >= 0 && rect.bottom <= window.innerHeight) {
        // Помечаем сообщение как прочитанное, если оно видно
        if (!message.dataset.read) {
          message.dataset.read = 'true';
          markMessageAsRead(message.dataset.messageId);
        }
      }
    });
  };

  useEffect(() => {
    getMessages(selectedUser._id);
    subscribeToMessages();

    return () => unsubscribeFromMessages();
  }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const markMessageAsRead = (messageId) => {
    // Отправляем на сервер информацию о прочтении сообщения
    axios.post(`/messages/markAsRead/${messageId}`).then(() => {
      // Здесь можно обновить состояние на фронте, если необходимо
    });
  };

  // Подписка на событие, которое обновляет статус прочтения сообщений через сокет
  useEffect(() => {
    const handleMessageRead = (messageId) => {
      // Обновляем статус прочтения на фронте
      const updatedMessages = messages.map((message) => 
        message._id === messageId ? { ...message, isRead: true } : message
      );
      // Обновляем состояние
      setMessages(updatedMessages);
    };

    subscribeToMessages(handleMessageRead);

    return () => unsubscribeFromMessages();
  }, [messages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
            data-message-id={message._id}
            data-read={message.isRead ? 'true' : 'false'}
            ref={messageEndRef}
          >
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={message.senderId === authUser._id ? authUser.profilePic || "/avatar.png" : selectedUser.profilePic || "/avatar.png"}
                  alt="profile pic"
                />
              </div>
            </div>
            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>
            <div className="chat-bubble flex flex-col">
              {message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className="sm:max-w-[200px] rounded-md mb-2"
                />
              )}
              {message.text && <p>{message.text}</p>}
              {message.isRead && <span className="text-xs text-gray-500">Просмотрено</span>}
            </div>
          </div>
        ))}
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;
