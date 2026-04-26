import { useState } from 'react';
import { useGoogleAuth } from '../context/GoogleAuthContext';
import './SyncIndicator.css';

const SyncIndicator = () => {
  const { syncing, user, logout } = useGoogleAuth();
  const [showMenu, setShowMenu] = useState(false);

  if (!user) return null;

  return (
    <>
      <div className="sync-bar">
        {/* User info — click to show menu on mobile */}
        <div
          className="sync-user"
          onClick={() => setShowMenu(!showMenu)}
          style={{ cursor: 'pointer' }}
        >
          <img src={user.picture} alt={user.name} className="sync-avatar" />
          <div className="sync-user-info">
            <span className="sync-name">{user.name}</span>
            <span className="sync-email">{user.email}</span>
          </div>
          <span className="sync-chevron">▾</span>
        </div>

        {/* Sync status */}
        {syncing ? (
          <span className="sync-status syncing">⟳ Saving...</span>
        ) : (
          <span className="sync-status saved">✓ Synced</span>
        )}
      </div>

      {/* Dropdown menu */}
      {showMenu && (
        <>
          <div className="sync-menu-overlay" onClick={() => setShowMenu(false)} />
          <div className="sync-menu">
            <div className="sync-menu-user">
              <img src={user.picture} alt={user.name} className="sync-menu-avatar" />
              <div>
                <p className="sync-menu-name">{user.name}</p>
                <p className="sync-menu-email">{user.email}</p>
              </div>
            </div>
            <hr className="sync-menu-divider" />
            <button
              className="sync-menu-signout"
              onClick={() => { setShowMenu(false); logout(); }}
            >
              🚪 Sign Out
            </button>
          </div>
        </>
      )}
    </>
  );
};

export default SyncIndicator;