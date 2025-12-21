import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Pencil, X, Check } from 'lucide-react';
import styles from './styles.module.css';
import { formatMessageTime } from './animations';

const MessageBubble = ({ 
  message, 
  isMyMessage, 
  friendAvatar, 
  friendUsername,
  onEditMessage 
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.message);
  const inputRef = useRef(null);
  const menuRef = useRef(null);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenu]);

  const handleEditClick = () => {
    setIsEditing(true);
    setShowMenu(false);
  };

  const handleSaveEdit = () => {
    if (editedContent.trim() && editedContent !== message.message) {
      onEditMessage(message.id, editedContent.trim());
    }
    setIsEditing(false);
    setEditedContent(message.message);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedContent(message.message);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  // Render message content based on type
  const renderMessageContent = () => {
    const messageType = message.type || 'text';

    switch (messageType) {
      case 'image':
        return (
          <img
            src={message.message}
            alt="sent image"
            className={styles.mediaImage}
            onClick={() => window.open(message.message, '_blank')}
          />
        );
      
      case 'video':
        return (
          <video
            src={message.message}
            controls
            className={styles.mediaVideo}
          />
        );
      
      case 'text':
      default:
        return <p className={styles.messageText}>{message.message}</p>;
    }
  };

  return (
    <div 
      className={`${styles.messageRow} ${isMyMessage ? styles.messageRowSent : styles.messageRowReceived}`}
    >
      {/* Friend Avatar (left side) */}
      {!isMyMessage && (
        <div className={styles.friendAvatar}>
          {friendAvatar ? (
            <img
              src={friendAvatar}
              alt={friendUsername}
              className={styles.friendAvatarImg}
            />
          ) : (
            <div className={styles.friendAvatarPlaceholder}>
              {friendUsername?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      )}

      {/* Message Bubble */}
      <div 
        className={`${styles.messageBubbleWrapper} ${isMyMessage ? styles.sentWrapper : styles.receivedWrapper}`}
        onMouseEnter={() => isMyMessage && !isEditing && setShowMenu(true)}
        onMouseLeave={() => !isEditing && setShowMenu(false)}
      >
        <div className={isMyMessage ? styles.messageBubbleSent : styles.messageBubbleReceived}>
          {isEditing ? (
            // Edit Mode
            <div className={styles.editMode}>
              <textarea
                ref={inputRef}
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                onKeyDown={handleKeyDown}
                className={styles.editInput}
                rows={3}
              />
              <div className={styles.editActions}>
                <button
                  onClick={handleSaveEdit}
                  className={styles.saveBtn}
                  title="Save (Enter)"
                >
                  <Check className={styles.actionIcon} />
                </button>
                <button
                  onClick={handleCancelEdit}
                  className={styles.cancelBtn}
                  title="Cancel (Esc)"
                >
                  <X className={styles.actionIcon} />
                </button>
              </div>
            </div>
          ) : (
            // Display Mode
            <>
              {renderMessageContent()}
              <div className={styles.messageFooter}>
                <span className={styles.timestamp}>
                  {formatMessageTime(message.createdAt)}
                </span>
                {message.isEdited && (
                  <span className={styles.editedLabel}>(edited)</span>
                )}
              </div>
            </>
          )}
        </div>

        {/* Three Dots Menu (Only for my messages) */}
        {isMyMessage && !isEditing && showMenu && (
          <div className={styles.menuWrapper} ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className={styles.menuTrigger}
            >
              <MoreVertical className={styles.menuIcon} />
            </button>
            
            {showMenu && (
              <div className={styles.menuDropdown}>
                <button
                  onClick={handleEditClick}
                  className={styles.menuItem}
                >
                  <Pencil className={styles.menuItemIcon} />
                  <span>Edit</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
