import { Check, X, Clock } from 'lucide-react';
import styles from './styles.module.css';
import { formatDate } from './animations';

const FriendRequestItem = ({ request, onAccept, onReject, isLoading }) => {
  const { sender, createdAt } = request;

  return (
    <div className={styles.container}>
      {/* Avatar with Badge */}
      <div className={styles.avatarWrapper}>
        {sender.avatarImage && sender.isAvatarImageSet ? (
          <img
            src={sender.avatarImage}
            alt={sender.username}
            className={styles.avatar}
          />
        ) : (
          <div className={styles.avatarPlaceholder}>
            {sender.username.charAt(0).toUpperCase()}
          </div>
        )}
        
        {/* New Badge */}
        <span className={styles.badge}>!</span>
      </div>

      {/* User Info */}
      <div className={styles.userInfo}>
        <h4 className={styles.username}>
          {sender.username}
        </h4>
        <p className={styles.email}>
          {sender.email}
        </p>
        <div className={styles.timestamp}>
          <Clock className={styles.clockIcon} />
          <span>{formatDate(createdAt)}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className={styles.actions}>
        <button
          onClick={() => onAccept(request)}
          disabled={isLoading}
          className={styles.acceptBtn}
          title="Accept"
        >
          <Check className={styles.btnIcon} />
        </button>
        
        <button
          onClick={() => onReject(request.id)}
          disabled={isLoading}
          className={styles.rejectBtn}
          title="Reject"
        >
          <X className={styles.btnIcon} />
        </button>
      </div>
    </div>
  );
};

export default FriendRequestItem;
