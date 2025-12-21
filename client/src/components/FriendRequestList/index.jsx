import { useEffect, useState } from 'react';
import { UserPlus, Loader2, X } from 'lucide-react';
import useFriendStore from '../../store/friendStore';
import useChatStore from '../../store/chatStore';
import { friendAPI } from '../../services/friendApi';
import { getSocket } from '../../utils/socket';
import FriendRequestItem from '../FriendRequestItem';
import styles from './styles.module.css';

const FriendRequestList = ({ isOpen, onClose }) => {
  const {
    friendRequests,
    setFriendRequests,
    removeFriendRequest,
    addFriend,
    clearUnreadCount
  } = useFriendStore();

  const [isLoading, setIsLoading] = useState(false);
  const { currentUser } = useChatStore();
  const socket = getSocket();

  useEffect(() => {
    loadFriendRequests();
    clearUnreadCount();
  }, []);

  const loadFriendRequests = async () => {
    setIsLoading(true);
    try {
      const response = await friendAPI.getFriendRequests();
      if (response.success) {
        setFriendRequests(response.data);
      }
    } catch (error) {
      console.error('Error loading friend requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (request) => {
    try {
      const response = await friendAPI.acceptFriendRequest(request.id);
      if (response.success) {
        removeFriendRequest(request.id);
        addFriend(request.sender);
        
        if (socket) {
          socket.emit('friend-request-accepted', {
            senderId: request.senderId,
            acceptor: {
              id: currentUser.id,
              username: currentUser.username,
              email: currentUser.email,
              avatarImage: currentUser.avatarImage,
              isAvatarImageSet: currentUser.isAvatarImageSet
            }
          });
        }
      }
    } catch (error) {
      console.error('Error accepting request:', error);
      alert(error.response?.data?.message || 'Failed to accept request');
    }
  };

  const handleReject = async (requestId) => {
    try {
      const response = await friendAPI.rejectFriendRequest(requestId);
      if (response.success) {
        removeFriendRequest(requestId);
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert(error.response?.data?.message || 'Failed to reject request');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Modal Overlay */}
      <div 
        className={styles.overlay}
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className={styles.modalWrapper}>
        <div className={styles.modal}>
          {/* Modal Header */}
          <div className={styles.header}>
            <div>
              <h2 className={styles.title}>
                Friend Requests
              </h2>
              <p className={styles.subtitle}>
                {friendRequests.length} {friendRequests.length === 1 ? 'request' : 'requests'} waiting
              </p>
            </div>
            <button
              onClick={onClose}
              className={styles.closeBtn}
            >
              <X className={styles.closeIcon} />
            </button>
          </div>

          {/* Modal Body */}
          <div className={styles.body}>
            {isLoading ? (
              <div className={styles.loading}>
                <Loader2 className={styles.spinner} />
              </div>
            ) : friendRequests.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  <UserPlus className={styles.emptyIconSize} />
                </div>
                <h3 className={styles.emptyTitle}>
                  No Friend Requests
                </h3>
                <p className={styles.emptyText}>
                  You have no pending friend requests at the moment
                </p>
              </div>
            ) : (
              <div className={styles.requestsList}>
                {friendRequests.map((request) => (
                  <FriendRequestItem
                    key={request.id}
                    request={request}
                    onAccept={handleAccept}
                    onReject={handleReject}
                    isLoading={isLoading}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default FriendRequestList;
