import useChatStore from '../../store/chatStore';
import useFriendStore from '../../store/friendStore';
import styles from './styles.module.css';

const Contacts = () => {
  const { selectedChat, changeChat, onlineUsers } = useChatStore();
  const { friendsList } = useFriendStore();

  const handleChatChange = (contact) => {
    changeChat(contact);
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h2 className={styles.title}>Friends</h2>
        <p className={styles.count}>
          {friendsList.length} {friendsList.length === 1 ? 'friend' : 'friends'}
        </p>
      </div>

      {/* Contacts List */}
      <div className={styles.listContainer}>
        {friendsList.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>No friends yet</p>
            <p className={styles.emptyHint}>Add friends to start chatting!</p>
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
                  className={`${styles.contactItem} ${isActive ? styles.active : ''}`}
                >
                  {/* Avatar */}
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
                    {/* Online indicator */}
                    {isOnline && <span className={styles.onlineBadge} />}
                  </div>

                  {/* Contact Info */}
                  <div className={styles.info}>
                    <h3 className={styles.username}>
                      {contact.username}
                    </h3>
                    <p className={styles.status}>
                      {isOnline ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Contacts;
