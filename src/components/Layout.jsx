import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import SyncIndicator from './SyncIndicator';
import './Layout.css';

const Layout = () => {
  return (
    <div className="app-layout">
      <Sidebar />
      <SyncIndicator />
      <main className="main-content">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};

export default Layout;