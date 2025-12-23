import { useEffect, useState } from 'react';
import styles from './styles.module.css';

const UploadProgressBar = ({ progress, fileName, onCancel }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Fade in animation
    setIsVisible(true);
  }, []);

  return (
    <div className={`${styles.progressContainer} ${isVisible ? styles.visible : ''}`}>
      <div className={styles.progressHeader}>
        <div className={styles.fileInfo}>
          <span className={styles.fileIcon}>📎</span>
          <div className={styles.fileDetails}>
            <span className={styles.fileName}>{fileName}</span>
            <span className={styles.progressText}>
              {progress < 100 ? `Uploading... ${progress}%` : 'Processing...'}
            </span>
          </div>
        </div>
        {progress < 100 && onCancel && (
          <button 
            className={styles.cancelButton}
            onClick={onCancel}
            title="Cancel upload"
          >
            ✕
          </button>
        )}
      </div>
      
      <div className={styles.progressBarContainer}>
        <div 
          className={styles.progressBar}
          style={{ width: `${progress}%` }}
        >
          <div className={styles.progressBarGlow}></div>
        </div>
      </div>
      
      {progress === 100 && (
        <div className={styles.processingIndicator}>
          <div className={styles.spinner}></div>
          <span>Finalizing upload...</span>
        </div>
      )}
    </div>
  );
};

export default UploadProgressBar;
