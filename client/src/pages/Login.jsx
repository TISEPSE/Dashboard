import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Login() {
  const [data, setData] = useState({
    email: "",
    password: "",
  });

  const loginUser = (e) => {
    e.preventDefault();
  };

  return (
    <div>
      <form className="modern-form" onSubmit={loginUser}>
        <div className="form-title">Connexion</div>

        <div className="form-body">
          <div className="input-group">
            <div className="input-wrapper">
              <svg fill="none" viewBox="0 0 24 24" className="input-icon">
                <circle strokeWidth="1.5" stroke="currentColor" r="4" cy="8" cx="12" />
                <path
                  strokeLinecap="round"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  d="M5 20C5 17.2386 8.13401 15 12 15C15.866 15 19 17.2386 19 20"
                />
              </svg>
              <input
                required
                placeholder="Username"
                className="form-input"
                type="text"
                value={data.email}
                onChange={(e) => setData({ ...data, email: e.target.value })}
              />
            </div>
          </div>

          <div className="input-group">
            <div className="input-wrapper">
              <svg fill="none" viewBox="0 0 24 24" className="input-icon">
                <path
                  strokeWidth="1.5"
                  stroke="currentColor"
                  d="M12 10V14M8 6H16C17.1046 6 18 6.89543 18 8V16C18 17.1046 17.1046 18 16 18H8C6.89543 18 6 17.1046 6 16V8C6 6.89543 6.89543 6 8 6Z"
                />
              </svg>
              <input
                required
                placeholder="Password"
                className="form-input"
                type="password"
                value={data.password}
                onChange={(e) => setData({ ...data, password: e.target.value })}
              />
              <button className="password-toggle" type="button">
                <svg fill="none" viewBox="0 0 24 24" className="eye-icon">
                  <path
                    strokeWidth="1.5"
                    stroke="currentColor"
                    d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z"
                  />
                  <circle strokeWidth="1.5" stroke="currentColor" r="3" cy="12" cx="12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <button className="submit-button" type="submit">
          <span className="button-text">Continuer</span>
          <div className="button-glow"></div>
        </button>

        <div className="form-footer">
          <Link className="login-link" to="/register">
            You don't have an account ? <span>Register</span>
          </Link>
        </div>
        
      </form>
    </div>
  );
}