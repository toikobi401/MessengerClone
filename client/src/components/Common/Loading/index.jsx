import styles from './styles.module.css';

const Loading = ({ message = 'Loading...', fullscreen = true }) => {
  if (fullscreen) {
    return (
      <div className={styles.fullscreenContainer}>
        <div className={styles.loadingContent}>
          {/* Pulsing Orbit Animation */}
          <div className={styles.orbitContainer}>
            <div className={`${styles.orbitDot} ${styles.dot1}`}></div>
            <div className={`${styles.orbitDot} ${styles.dot2}`}></div>
            <div className={`${styles.orbitDot} ${styles.dot3}`}></div>
          </div>

          {/* Loading Text */}
          <p className={styles.loadingText}>{message}</p>
        </div>
      </div>
    );
  }

  // Inline loading (for use inside components)
  return (
    <div className={styles.inlineContainer}>
      <div className={styles.orbitContainer}>
        <div className={`${styles.orbitDot} ${styles.dot1}`}></div>
        <div className={`${styles.orbitDot} ${styles.dot2}`}></div>
        <div className={`${styles.orbitDot} ${styles.dot3}`}></div>
      </div>
      <p className={styles.loadingText}>{message}</p>
    </div>
  );
};

export default Loading;
