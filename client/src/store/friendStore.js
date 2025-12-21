import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useFriendStore = create(
  persist(
    (set, get) => ({
      // State
      searchResults: [],
      friendRequests: [],
      friendsList: [],
      unreadRequestsCount: 0,
      isSearching: false,

      // Search Actions
      setSearchResults: (results) => {
        set({ searchResults: results });
      },

      clearSearchResults: () => {
        set({ searchResults: [] });
      },

      setIsSearching: (isSearching) => {
        set({ isSearching });
      },

      // Friend Requests Actions
      setFriendRequests: (requests) => {
        set({
          friendRequests: requests,
          unreadRequestsCount: requests.length
        });
      },

      addFriendRequest: (request) => {
        set((state) => ({
          friendRequests: [request, ...state.friendRequests],
          unreadRequestsCount: state.unreadRequestsCount + 1
        }));
      },

      removeFriendRequest: (requestId) => {
        set((state) => ({
          friendRequests: state.friendRequests.filter(req => req.id !== requestId),
          unreadRequestsCount: Math.max(0, state.unreadRequestsCount - 1)
        }));
      },

      clearUnreadCount: () => {
        set({ unreadRequestsCount: 0 });
      },

      // Friends List Actions
      setFriendsList: (friends) => {
        set({ friendsList: friends });
      },

      addFriend: (friend) => {
        set((state) => ({
          friendsList: [...state.friendsList, friend]
        }));
      },

      removeFriend: (friendId) => {
        set((state) => ({
          friendsList: state.friendsList.filter(friend => friend.id !== friendId)
        }));
      },

      setIsLoadingFriends: (isLoading) => {
        set({ isLoadingFriends: isLoading });
      },

      // Update search result status after action
      updateSearchResultStatus: (userId, newStatus) => {
        set((state) => ({
          searchResults: state.searchResults.map(user =>
            user.id === userId
              ? { ...user, friendshipStatus: newStatus }
              : user
          )
        }));
      },

      // Clear all data (on logout)
      clearFriendData: () => {
        set({
          searchResults: [],
          friendRequests: [],
          friendsList: [],
          unreadRequestsCount: 0,
          isSearching: false,
          isLoadingRequests: false,
          isLoadingFriends: false
        });
      }
    }),
    {
      name: 'messenger-friend-store',
      partialize: (state) => ({
        friendsList: state.friendsList,
        unreadRequestsCount: state.unreadRequestsCount
      })
    }
  )
);

export default useFriendStore;
