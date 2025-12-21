import { useState, useEffect } from 'react';
import { X, Search, UserPlus, Loader2, Users, MessageSquare, Check } from 'lucide-react';
import useFriendStore from '../../store/friendStore';
import useChatStore from '../../store/chatStore';
import { friendAPI } from '../../services/friendApi';
import { getSocket } from '../../utils/socket';
import styles from './styles.module.css';

const AddFriendModal = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');

  const { searchResults, setSearchResults, updateSearchResultStatus } = useFriendStore();
  const { currentUser, changeChat } = useChatStore();
  const socket = getSocket();

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setSearchResults([]);
      setError('');
    }
  }, [isOpen, setSearchResults]);

  const handleSearch = async () => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setError('Please enter at least 2 characters');
      return;
    }

    setError('');
    setIsSearching(true);

    try {
      const response = await friendAPI.searchUsers(searchQuery.trim());
      if (response.success) {
        setSearchResults(response.data);
        if (response.data.length === 0) {
          setError('No users found');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error searching users');
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSendRequest = async (receiverId) => {
    try {
      const response = await friendAPI.sendFriendRequest(receiverId);
      if (response.success) {
        updateSearchResultStatus(receiverId, 'pending_sent');
        
        if (socket) {
          socket.emit('friend-request-sent', {
            receiverId,
            sender: {
              id: currentUser.id,
              username: currentUser.username,
              email: currentUser.email,
              avatarImage: currentUser.avatarImage,
              isAvatarImageSet: currentUser.isAvatarImageSet
            }
          });
        }
      }
    } catch (err) {
      console.error('Send request error:', err);
      alert(err.response?.data?.message || 'Failed to send friend request');
    }
  };

  const handleMessage = (user) => {
    changeChat(user);
    onClose();
  };

  const getButtonContent = (user) => {
    switch (user.friendshipStatus) {
      case 'friends':
        return (
          <button
            onClick={() => handleMessage(user)}
            className={styles.messageBtn}
          >
            <MessageSquare className={styles.btnIcon} />
            Message
          </button>
        );
      
      case 'pending_sent':
        return (
          <button
            disabled
            className={styles.pendingBtn}
          >
            <Check className={styles.btnIcon} />
            Request Sent
          </button>
        );
      
      case 'pending_received':
        return (
          <div className={styles.pendingText}>
            Pending (Check Requests)
          </div>
        );
      
      default:
        return (
          <button
            onClick={() => handleSendRequest(user.id)}
            className={styles.addBtn}
          >
            <UserPlus className={styles.btnIcon} />
            Add Friend
          </button>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.iconWrapper}>
              <Users className={styles.headerIcon} />
            </div>
            <h2 className={styles.title}>Add Friends</h2>
          </div>
          <button
            onClick={onClose}
            className={styles.closeBtn}
          >
            <X className={styles.closeIcon} />
          </button>
        </div>

        {/* Search Bar */}
        <div className={styles.searchSection}>
          <div className={styles.searchBar}>
            <div className={styles.searchInputWrapper}>
              <Search className={styles.searchIcon} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search by name or email..."
                className={styles.searchInput}
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={isSearching || searchQuery.trim().length < 2}
              className={styles.searchBtn}
            >
              {isSearching ? (
                <>
                  <Loader2 className={styles.spinner} />
                  Searching...
                </>
              ) : (
                <>
                  <Search className={styles.btnIcon} />
                  Search
                </>
              )}
            </button>
          </div>
          
          {error && (
            <p className={styles.errorMessage}>{error}</p>
          )}
        </div>

        {/* Results */}
        <div className={styles.resultsSection}>
          {searchResults.length === 0 && !error ? (
            <div className={styles.emptyState}>
              <Users className={styles.emptyIcon} />
              <p className={styles.emptyTitle}>Search for users to add as friends</p>
              <p className={styles.emptyHint}>Enter a username or email to get started</p>
            </div>
          ) : (
            <div className={styles.resultsList}>
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  className={styles.userCard}
                >
                  <div className={styles.userInfo}>
                    {/* Avatar */}
                    <div className={styles.avatarWrapper}>
                      {user.isAvatarImageSet && user.avatarImage ? (
                        <img
                          src={user.avatarImage}
                          alt={user.username}
                          className={styles.avatar}
                        />
                      ) : (
                        <div className={styles.avatarPlaceholder}>
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* User Details */}
                    <div className={styles.userDetails}>
                      <h3 className={styles.username}>{user.username}</h3>
                      <p className={styles.email}>{user.email}</p>
                    </div>
                  </div>

                  {/* Action Button */}
                  {getButtonContent(user)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddFriendModal;
