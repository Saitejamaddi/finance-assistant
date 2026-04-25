import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budget from './pages/Budget';
import Goals from './pages/Goals';
import Reports from './pages/Reports';
import Categories from './pages/Categories';
import NotFound from './pages/NotFound';
import LoginPage from './pages/LoginPage';
import { GoogleAuthProvider, useGoogleAuth } from './context/GoogleAuthContext';
import { TransactionProvider } from './context/TransactionContext';
import { BudgetProvider } from './context/BudgetContext';
import { CategoryProvider } from './context/CategoryContext';
import { BalanceProvider } from './context/BalanceContext';

const AppRoutes = () => {
  const { user, loading } = useGoogleAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f4f8' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>💰</div>
          <p style={{ color: '#6b7280', fontSize: '15px' }}>Loading Finance Assistant...</p>
        </div>
      </div>
    );
  }

  if (!user) return <LoginPage />;

  return (
    <TransactionProvider>
      <BalanceProvider>
        <BudgetProvider>
          <CategoryProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="transactions" element={<Transactions />} />
                  <Route path="budget" element={<Budget />} />
                  <Route path="goals" element={<Goals />} />
                  <Route path="reports" element={<Reports />} />
                  <Route path="categories" element={<Categories />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </CategoryProvider>
        </BudgetProvider>
      </BalanceProvider>
    </TransactionProvider>
  );
};

const App = () => (
  <GoogleAuthProvider>
    <AppRoutes />
  </GoogleAuthProvider>
);

export default App;