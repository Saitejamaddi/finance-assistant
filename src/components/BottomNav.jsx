import { NavLink } from 'react-router-dom';
//import { useGoogleAuth } from '../context/GoogleAuthContext';
import './BottomNav.css';

const navItems = [
  { path: '/',             label: 'Home',    icon: '📊' },
  { path: '/transactions', label: 'Txns',    icon: '💳' },
  { path: '/budget',       label: 'Budget',  icon: '📋' },
  { path: '/goals',        label: 'Goals',   icon: '🎯' },
  { path: '/reports',      label: 'Reports', icon: '📈' },
  { path: '/categories',   label: 'More',    icon: '🏷️' },
];

const BottomNav = () => {
  return (
    <nav className="bottom-nav">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === '/'}
          className={({ isActive }) =>
            isActive ? 'bottom-nav-item active' : 'bottom-nav-item'
          }
        >
          <span className="bottom-nav-icon">{item.icon}</span>
          <span className="bottom-nav-label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNav;