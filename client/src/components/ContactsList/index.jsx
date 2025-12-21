import { Users } from 'lucide-react';
import useChatStore from '../../store/chatStore';
import useFriendStore from '../../store/friendStore';
import styles from './styles.module.css';

const ContactsList = () => {
  const { selectedChat, changeChat, onlineUsers } = useChatStore();
  const { friendsList } = useFriendStore();

  const handleChatChange = (contact) => {
    changeChat(contact);
  };

  return (
    <div className={styles.container}>
      {friendsList.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <Users className={styles.iconSize} />
          </div>
          <p className={styles.emptyTitle}>No friends yet</p>
          <p className={styles.emptyHint}>
            Search and add friends to start chatting!
          </p>
        </div>
      ) : (
        <div className={styles.list}>
          {friendsList.map((contact) => {
            const isOnline = onlineUsers.includes(contact.id);
            const isActive = selectedChat?.id === contact.id;

            return (
              <div
                key={contact.id}
                onClick={() => handleChatChange(contact)}
                className={`${styles.contactItem} ${
                  isActive ? styles.active : ''
                }`}
              >
                {/* Avatar with Online Status */}
                <div className={styles.avatarWrapper}>
                  {contact.avatarImage && contact.isAvatarImageSet ? (
                    <img
                      src={contact.avatarImage}
                      alt={contact.username}
                      className={styles.avatar}
                    />
                  ) : (
                    <div className={styles.avatarPlaceholder}>
                      {contact.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  
                  {/* Online Indicator */}
                  {isOnline && (
                    <span className={styles.onlineBadge} />
                  )}
                </div>

                {/* Contact Info */}
                <div className={styles.info}>
                  <h3 className={styles.username}>
                    {contact.username}
                  </h3>
                  <p className={`${styles.status} ${isOnline ? styles.online : ''}`}>
                    {isOnline ? 'Online' : 'Offline'}
                  </p>
                </div>

                {/* Active Indicator */}
                {isActive && (
                  <div className={styles.activeIndicator} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ContactsList;
