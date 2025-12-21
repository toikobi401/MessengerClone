import { MessageSquare } from 'lucide-react';
import useChatStore from '../../store/chatStore';
import styles from './styles.module.css';

const Welcome = () => {
  const currentUser = useChatStore((state) => state.currentUser);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.iconWrapper}>
          <MessageSquare className={styles.icon} />
        </div>
        <h1 className={styles.title}>
          Welcome, {currentUser?.username}!
        </h1>
        <p className={styles.subtitle}>
          Select a chat to start messaging
        </p>
      </div>
    </div>
  );
};

export default Welcome;
