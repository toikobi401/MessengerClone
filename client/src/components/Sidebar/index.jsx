import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Users, Bell, Moon, Sun, Settings } from 'lucide-react';
import useChatStore from '../../store/chatStore';
import useFriendStore from '../../store/friendStore';
import SearchBar from '../SearchBar';
import FriendRequestList from '../FriendRequestList';
import ContactsList from '../ContactsList';
import styles from './styles.module.css';

const Sidebar = ({ onRequestsClick }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('chats'); // 'chats' or 'find'
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });
  
  const { selectedChat } = useChatStore();
  const { unreadRequestsCount } = useFriendStore();

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  return (
    <div className={styles.sidebar}>
      {/* Sidebar Header */}
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <h1 className={styles.title}>Messenger</h1>
          
          <div className={styles.actionButtons}>
            {/* Friend Requests Button */}
            <button
              onClick={onRequestsClick}
              className={styles.iconBtn}
              title="Friend Requests"
            >
              <Bell className={styles.icon} />
              {unreadRequestsCount > 0 && (
                <span className={styles.badge}>
                  {unreadRequestsCount > 9 ? '9+' : unreadRequestsCount}
                </span>
              )}
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className={styles.iconBtn}
              title="Toggle Theme"
            >
              {darkMode ? (
                <Sun className={styles.iconSun} />
              ) : (
                <Moon className={styles.iconMoon} />
              )}
            </button>

            {/* Settings Button */}
            <button
              onClick={handleSettingsClick}
              className={styles.iconBtn}
              title="Settings"
            >
              <Settings className={styles.icon} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className={styles.tabNavigation}>
          <button
            onClick={() => setActiveTab('chats')}
            className={`${styles.tab} ${activeTab === 'chats' ? styles.tabActive : styles.tabInactive}`}
          >
            <MessageSquare className={styles.tabIcon} />
            <span>Chats</span>
          </button>
          
          <button
            onClick={() => setActiveTab('find')}
            className={`${styles.tab} ${activeTab === 'find' ? styles.tabActive : styles.tabInactive}`}
          >
            <Users className={styles.tabIcon} />
            <span>Find People</span>
          </button>
        </div>

        {/* Search Bar (Always Visible) */}
        <SearchBar />
      </div>

      {/* Content Area */}
      <div className={styles.content}>
        {activeTab === 'chats' ? (
          <ContactsList />
        ) : (
          <div className={styles.findPeopleContent}>
            <div className={styles.infoBox}>
              <div className={styles.infoBoxContent}>
                <Users className={styles.infoIcon} />
                <div>
                  <h3 className={styles.infoTitle}>
                    Discover Friends
                  </h3>
                  <p className={styles.infoText}>
                    Use the search bar above to find people by name or email. Send them a friend request to connect!
                  </p>
                </div>
              </div>
            </div>
            
            {/* Search results will appear here via SearchBar component */}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
