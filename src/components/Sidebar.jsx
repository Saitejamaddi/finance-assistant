import { NavLink } from 'react-router-dom';
import { useGoogleAuth } from '../context/GoogleAuthContext';
import './Sidebar.css';

const navItems = [
  { path: '/',             label: 'Dashboard',    icon: '📊' },
  { path: '/transactions', label: 'Transactions', icon: '💳' },
  { path: '/budget',       label: 'Budget',       icon: '📋' },
  { path: '/goals',        label: 'Goals',        icon: '🎯' },
  { path: '/reports',      label: 'Reports',      icon: '📈' },
  { path: '/categories',   label: 'Categories',   icon: '🏷️' },
];

const Sidebar = () => {
  const { logout, user } = useGoogleAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-icon">💰</span>
        <span className="logo-text">FinanceAI</span>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink key={item.path} to={item.path} end={item.path === '/'} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-bot-hint">
        <span>🤖</span>
        <span className="bot-label">AI Assistant</span>
        <span className="bot-status">● Online</span>
      </div>
      {user && (
        <button className="logout-btn" onClick={logout}>
          🚪 Sign Out
        </button>
      )}
    </aside>
  );
};

export default Sidebar;