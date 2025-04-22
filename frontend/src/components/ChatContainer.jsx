import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import axios from "axios";

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
  const containerRef = useRef(null);
  const observerRef = useRef(null);
  const readMessagesRef = useRef(new Set()); // Track already processed messages

  // Initial message loading and socket subscription
  useEffect(() => {
    getMessages(selectedUser._id);
    
    const handleNewMessage = (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    };
    
    const handleMessageRead = ({ messageId }) => {
      setMessages((prevMessages) => 
        prevMessages.map((message) => 
          message._id === messageId ? { ...message, isRead: true } : message
        )
      );
    };
    
    subscribeToMessages(handleNewMessage, handleMessageRead);
    
    return () => {
      unsubscribeFromMessages();
      readMessagesRef.current.clear();
    };
  }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages, setMessages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messageEndRef.current && messages?.length > 0) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Setup intersection observer for message visibility
  useEffect(() => {
    // Clear the set when messages change
    readMessagesRef.current.clear();
    
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const messageId = entry.target.dataset.messageId;
            const senderId = entry.target.dataset.senderId;
            const isRead = entry.target.dataset.read === 'true';
            
            // Only process if: 
            // 1. Message is from another user
            // 2. Message is not already read
            // 3. Message hasn't been processed in this session
            if (
              messageId && 
              senderId !== authUser._id && 
              !isRead && 
              !readMessagesRef.current.has(messageId)
            ) {
              // Mark as processed to avoid duplicate requests
              readMessagesRef.current.add(messageId);
              entry.target.dataset.read = 'true';
              markMessageAsRead(messageId);
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    const messageElements = document.querySelectorAll('[data-message-id]');
    messageElements.forEach(message => observerRef.current.observe(message));

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [messages, authUser._id]);

  const markMessageAsRead = async (messageId) => {
    try {
      await axios.post(`/messages/markAsRead/${messageId}`);
      // Note: We don't need to manually update the UI here,
      // as the socket will emit the messageRead event which will update all clients
    } catch (error) {
      console.error("Error marking message as read:", error);
      // Remove from processed set if request fails to allow retry
      readMessagesRef.current.delete(messageId);
    }
  };

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
    <div className="flex-1 flex flex-col overflow-auto" ref={containerRef}>
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => {
          const isLastMessage = index === messages.length - 1;
          const isSender = message.senderId === authUser._id;
          
          return (
            <div
              key={message._id}
              className={`chat ${isSender ? "chat-end" : "chat-start"}`}
              data-message-id={message._id}
              data-sender-id={message.senderId}
              data-read={message.isRead ? 'true' : 'false'}
              ref={isLastMessage ? messageEndRef : null}
            >
              <div className="chat-image avatar">
                <div className="size-10 rounded-full border">
                  <img
                    src={isSender ? authUser.profilePic || "/avatar.png" : selectedUser.profilePic || "/avatar.png"}
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
              </div>
              {isSender && (
                <div className="chat-footer text-xs mt-1">
                  {message.isRead ? (
                    <span className="text-blue-500 font-medium">Просмотрено</span>
                  ) : (
                    <span className="text-gray-400">Отправлено</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;