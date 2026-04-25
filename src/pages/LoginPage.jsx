import { useGoogleAuth } from '../context/GoogleAuthContext';
import './LoginPage.css';

const LoginPage = () => {
  const { login, loading } = useGoogleAuth();

  return (
    <div className="login-page">
      <div className="login-card">

        <div className="login-logo">💰</div>
        <h1 className="login-title">Finance Assistant</h1>
        <p className="login-subtitle">
          Track your expenses, budgets & goals.<br />
          Your data stays in <strong>your own Google Sheet</strong>.
        </p>

        <div className="login-features">
          <div className="feature-item">
            <span>📊</span>
            <span>Your private Google Sheet — no shared servers</span>
          </div>
          <div className="feature-item">
            <span>📱</span>
            <span>Works on phone, tablet & desktop</span>
          </div>
          <div className="feature-item">
            <span>🔒</span>
            <span>Only you can access your data</span>
          </div>
          <div className="feature-item">
            <span>🆓</span>
            <span>Completely free forever</span>
          </div>
        </div>

        <button
          className="google-signin-btn"
          onClick={login}
          disabled={loading}
        >
          {loading ? (
            <span className="login-loading">Connecting...</span>
          ) : (
            <>
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                className="google-icon"
              />
              Sign in with Google
            </>
          )}
        </button>

        <p className="login-note">
          We'll create a Google Sheet called <strong>"Finances"</strong> in your Drive.
          You can view and edit it directly anytime.
        </p>

      </div>
    </div>
  );
};

export default LoginPage;