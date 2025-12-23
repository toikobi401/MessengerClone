import { useNavigate } from 'react-router-dom';
import { Home, Ghost } from 'lucide-react';
import styles from './styles.module.css';

const NotFound = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Floating Ghost Icon */}
        <div className={styles.iconWrapper}>
          <Ghost className={styles.icon} size={96} strokeWidth={1.5} />
          <div className={styles.iconGlow}></div>
        </div>

        {/* Error Code */}
        <div className={styles.errorCode}>404</div>

        {/* Headline */}
        <h1 className={styles.headline}>Lost in the Void</h1>

        {/* Subtext */}
        <p className={styles.subtext}>
          The conversation you are looking for does not exist.<br />
          It may have been deleted or you don't have permission to access it.
        </p>

        {/* Action Button */}
        <button onClick={handleGoHome} className={styles.homeButton}>
          <Home size={20} />
          <span>Return Home</span>
        </button>

        {/* Decorative Elements */}
        <div className={styles.stars}>
          <div className={`${styles.star} ${styles.star1}`}></div>
          <div className={`${styles.star} ${styles.star2}`}></div>
          <div className={`${styles.star} ${styles.star3}`}></div>
          <div className={`${styles.star} ${styles.star4}`}></div>
          <div className={`${styles.star} ${styles.star5}`}></div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
