import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useChatStore = create(
  persist(
    (set, get) => ({
      // State
      currentUser: null,
      selectedChat: null,
      currentConversationId: null, // New
      contacts: [],
      messages: [],
      onlineUsers: [],
      isLoading: false,

      // Actions
      setCurrentUser: (user) => {
        set({ currentUser: user });
      },

      setContacts: (contacts) => {
        set({ contacts });
      },

      changeChat: (user, conversationId = null) => {
        set({ 
          selectedChat: user, 
          currentConversationId: conversationId,
          messages: [] 
        });
      },

      setConversationId: (conversationId) => {
        set({ currentConversationId: conversationId });
      },

      setMessages: (messages) => {
        set({ messages });
      },

      addMessage: (message) => {
        set((state) => ({
          messages: [...state.messages, message]
        }));
      },

      updateMessage: (messageId, newContent) => {
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === messageId
              ? { ...msg, message: newContent, isEdited: true }
              : msg
          )
        }));
      },

      setOnlineUsers: (users) => {
        set({ onlineUsers: users });
      },

      logout: () => {
        set({
          currentUser: null,
          selectedChat: null,
          currentConversationId: null,
          contacts: [],
          messages: [],
          onlineUsers: [],
          isLoading: false
        });
        localStorage.removeItem('messenger-user');
        localStorage.removeItem('messenger-chat-store');
        localStorage.removeItem('messenger-friend-store');
      },

      // Computed
      isUserOnline: (userId) => {
        return get().onlineUsers.includes(userId);
      }
    }), // ← Added comma here
    {
      name: 'messenger-chat-store',
      partialize: (state) => ({
        currentUser: state.currentUser
      })
    }
  )
);

export default useChatStore;
