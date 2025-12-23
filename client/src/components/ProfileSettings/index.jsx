import { useState, useEffect } from 'react';
import { Camera, User, Mail, CheckCircle, Save, X, Eye, EyeOff, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useChatStore from '../../store/chatStore';
import { userAPI } from '../../services/api';
import styles from './styles.module.css';

const ProfileSettings = () => {
  const navigate = useNavigate();
  const currentUser = useChatStore((state) => state.currentUser);
  const setCurrentUser = useChatStore((state) => state.setCurrentUser);

  // Form states
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    avatarImage: ''
  });
  
  // Avatar preview and file
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');

  // Password change states
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Initialize form with current user data
  useEffect(() => {
    if (currentUser) {
      setFormData({
        username: currentUser.username || '',
        email: currentUser.email || '',
        avatarImage: currentUser.avatarImage || ''
      });
      setAvatarPreview(currentUser.avatarImage || '');
    }
  }, [currentUser]);

  // Handle avatar file selection
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB for avatars)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    // Store file and create preview
    setAvatarFile(file);
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
    setError('');
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  // Handle password input changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  // Validate form
  const validateForm = () => {
    if (!formData.username.trim()) {
      setError('Username is required');
      return false;
    }

    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters long');
      return false;
    }

    // Password validation (if changing password)
    if (showPasswordSection) {
      if (!passwordData.newPassword && !passwordData.confirmPassword) {
        // It's okay to not change password
        return true;
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }

      if (passwordData.newPassword.length < 6) {
        setError('Password must be at least 6 characters long');
        return false;
      }
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      // Create FormData for multipart/form-data
      const formDataToSend = new FormData();
      
      // Add username
      formDataToSend.append('username', formData.username);
      
      // Add avatar file if new one selected
      if (avatarFile) {
        formDataToSend.append('avatar', avatarFile);
      }
      
      // Add password if changed
      if (showPasswordSection && passwordData.newPassword) {
        formDataToSend.append('password', passwordData.newPassword);
      }

      // Call API to update profile
      const response = await userAPI.updateProfile(currentUser.id, formDataToSend);

      if (response.success) {
        // Update global state with new user data
        setCurrentUser(response.data);
        
        // Update localStorage
        const storedData = JSON.parse(localStorage.getItem('messenger-user'));
        if (storedData) {
          storedData.user = response.data;
          localStorage.setItem('messenger-user', JSON.stringify(storedData));
        }

        setSuccessMessage('Profile updated successfully!');
        
        // Reset password fields and avatar file
        setPasswordData({ newPassword: '', confirmPassword: '' });
        setShowPasswordSection(false);
        setAvatarFile(null);

        // Navigate back to chat after 2 seconds
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setError(error.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate('/');
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>Profile Settings</h1>
          <p className={styles.subtitle}>Manage your account information</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Avatar Section */}
          <div className={styles.avatarSection}>
            <div className={styles.avatarWrapper}>
              <img
                src={avatarPreview || `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.username}`}
                alt="Profile Avatar"
                className={styles.avatar}
              />
              <label htmlFor="avatarInput" className={styles.avatarOverlay}>
                <Camera size={32} />
                <span>Change Photo</span>
              </label>
              <input
                id="avatarInput"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className={styles.avatarInput}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className={styles.successMessage}>
              <CheckCircle size={18} />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className={styles.errorMessage}>
              <X size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* Form Fields */}
          <div className={styles.inputGroup}>
            <label htmlFor="username" className={styles.label}>
              <User size={18} />
              Display Name
            </label>
            <input
              id="username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Enter your display name"
              className={styles.input}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>
              <Mail size={18} />
              Email Address
              <span className={styles.verifiedBadge}>
                <CheckCircle size={14} />
                Verified
              </span>
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              className={`${styles.input} ${styles.inputReadonly}`}
              readOnly
              disabled
            />
          </div>

          {/* Password Change Section */}
          <div className={styles.passwordSection}>
            <button
              type="button"
              onClick={() => setShowPasswordSection(!showPasswordSection)}
              className={styles.togglePasswordButton}
            >
              <Lock size={18} />
              Change Password
              <span className={styles.toggleIcon}>
                {showPasswordSection ? '▲' : '▼'}
              </span>
            </button>

            {showPasswordSection && (
              <div className={styles.passwordFields}>
                <div className={styles.inputGroup}>
                  <label htmlFor="newPassword" className={styles.label}>
                    New Password
                  </label>
                  <div className={styles.passwordInputWrapper}>
                    <input
                      id="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter new password"
                      className={styles.input}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className={styles.eyeButton}
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="confirmPassword" className={styles.label}>
                    Confirm Password
                  </label>
                  <div className={styles.passwordInputWrapper}>
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder="Confirm new password"
                      className={styles.input}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className={styles.eyeButton}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className={styles.actions}>
            <button
              type="button"
              onClick={handleCancel}
              className={styles.cancelButton}
              disabled={isLoading}
            >
              <X size={18} />
              Cancel
            </button>
            <button
              type="submit"
              className={styles.saveButton}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className={styles.spinner}></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileSettings;
