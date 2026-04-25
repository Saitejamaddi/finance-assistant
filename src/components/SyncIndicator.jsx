import { useGoogleAuth } from '../context/GoogleAuthContext';
import './SyncIndicator.css';

const SyncIndicator = () => {
  const { syncing, user } = useGoogleAuth();

  if (!user) return null;

  return (
    <div className="sync-bar">
      <div className="sync-user">
        <img src={user.picture} alt={user.name} className="sync-avatar" />
        <span className="sync-name">{user.name}</span>
      </div>
      {syncing ? (
        <span className="sync-status syncing">⟳ Saving to Sheets...</span>
      ) : (
        <span className="sync-status saved">✓ Synced</span>
      )}
    </div>
  );
};

export default SyncIndicator;