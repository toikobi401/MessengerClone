import { useState, useEffect } from 'react';
import { Search, UserPlus, Check, Clock, MessageSquare, Loader2, X } from 'lucide-react';
import useFriendStore from '../../store/friendStore';
import useChatStore from '../../store/chatStore';
import { friendAPI } from '../../services/friendApi';
import { getSocket } from '../../utils/socket';
import styles from './styles.module.css';
import { debounceSearch } from './animations';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState('');

  const { currentUser, changeChat } = useChatStore();
  const socket = getSocket();

  useEffect(() => {
    // Close results when clicking outside
    const handleClickOutside = (e) => {
      if (!e.target.closest(`.${styles.container}`)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (searchQuery) => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    setError('');
    setShowResults(true);

    try {
      const response = await friendAPI.searchUsers(searchQuery);
      
      if (response.success) {
        setSearchResults(response.data);
      } else {
        setError(response.message || 'Search failed');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search users');
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    
    // Debounce search
    debounceSearch(() => handleSearch(value), 500);
  };

  const handleSendRequest = async (receiverId, receiverUsername) => {
    try {
      const response = await friendAPI.sendFriendRequest(receiverId);
      
      if (response.success) {
        // Update local result status
        setSearchResults(prev =>
          prev.map(user =>
            user.id === receiverId
              ? { ...user, friendshipStatus: 'pending_sent' }
              : user
          )
        );

        // Emit socket event
        socket.emit('friend-request-sent', {
          receiverId,
          sender: {
            id: currentUser.id,
            username: currentUser.username,
            email: currentUser.email,
            avatarImage: currentUser.avatarImage
          }
        });

        // Success feedback
        console.log(`Friend request sent to ${receiverUsername}`);
      }
    } catch (err) {
      console.error('Failed to send friend request:', err);
    }
  };

  const handleMessage = (user) => {
    changeChat(user);
    setShowResults(false);
    setQuery('');
  };

  const getActionButton = (user) => {
    switch (user.friendshipStatus) {
      case 'friends':
        return (
          <button
            onClick={() => handleMessage(user)}
            className={styles.messageBtn}
            title="Send Message"
          >
            <MessageSquare className={styles.btnIcon} />
            <span className={styles.btnText}>Message</span>
          </button>
        );

      case 'pending_sent':
        return (
          <button
            disabled
            className={styles.pendingBtn}
            title="Request Sent"
          >
            <Clock className={styles.btnIcon} />
            <span className={styles.btnText}>Pending</span>
          </button>
        );

      case 'pending_received':
        return (
          <span className={styles.checkRequestsText}>
            Check Requests
          </span>
        );

      default: // 'not_friends'
        return (
          <button
            onClick={() => handleSendRequest(user.id, user.username)}
            className={styles.addBtn}
            title="Add Friend"
          >
            <UserPlus className={styles.btnIcon} />
            <span className={styles.btnText}>Add</span>
          </button>
        );
    }
  };

  return (
    <div className={styles.container}>
      {/* Search Input */}
      <div className={styles.inputWrapper}>
        <Search className={styles.searchIcon} />
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => query.length >= 2 && setShowResults(true)}
          placeholder="Search friends by name..."
          className={styles.input}
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setSearchResults([]);
              setShowResults(false);
            }}
            className={styles.clearBtn}
          >
            <X className={styles.clearIcon} />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && (
        <div className={styles.dropdown}>
          {isSearching ? (
            <div className={styles.loadingContainer}>
              <Loader2 className={styles.spinner} />
            </div>
          ) : error ? (
            <div className={styles.errorContainer}>
              <p className={styles.errorText}>{error}</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className={styles.emptyContainer}>
              <Search className={styles.emptyIcon} />
              <p className={styles.emptyText}>
                {query.length < 2 ? 'Type at least 2 characters' : 'No users found'}
              </p>
            </div>
          ) : (
            <div className={styles.resultsWrapper}>
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  className={styles.resultItem}
                >
                  {/* Avatar */}
                  <div className={styles.avatarWrapper}>
                    {user.avatarImage && user.isAvatarImageSet ? (
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

                  {/* User Info */}
                  <div className={styles.userInfo}>
                    <h4 className={styles.username}>
                      {user.username}
                    </h4>
                    <p className={styles.email}>
                      {user.email}
                    </p>
                  </div>

                  {/* Action Button */}
                  {getActionButton(user)}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
