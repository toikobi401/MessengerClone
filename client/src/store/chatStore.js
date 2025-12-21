import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useChatStore = create(
  persist(
    (set, get) => ({
      // State
      currentUser: null,
      selectedChat: null,
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

      changeChat: (user) => {
        set({ selectedChat: user, messages: [] });
      },

      setMessages: (messages) => {
        set({ messages });
      },

      addMessage: (message) => {
        set((state) => ({
          messages: [...state.messages, message]
        }));
      },

      setOnlineUsers: (users) => {
        set({ onlineUsers: users });
      },

      setLoading: (isLoading) => {
        set({ isLoading });
      },

      clearChat: () => {
        set({
          selectedChat: null,
          messages: []
        });
      },

      logout: () => {
        set({
          currentUser: null,
          selectedChat: null,
          contacts: [],
          messages: [],
          onlineUsers: [],
          isLoading: false
        });
        localStorage.removeItem('messenger-user');
      },

      // Computed
      isUserOnline: (userId) => {
        return get().onlineUsers.includes(userId);
      }
    }),
    {
      name: 'messenger-chat-store',
      partialize: (state) => ({
        currentUser: state.currentUser
      })
    }
  )
);

export default useChatStore;
