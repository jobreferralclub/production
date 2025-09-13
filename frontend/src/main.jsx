import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Auth0Provider } from '@auth0/auth0-react';
import App from './App.jsx';
import './index.css';

// Force dark mode on app initialization
document.documentElement.classList.add('dark');

createRoot(document.getElementById('root')).render(
  <Auth0Provider
    domain="jobreferralclub.us.auth0.com"
    clientId="l2I254y6VwAzHHPWL73tZyYNWlK6mRH8"
    authorizationParams={{
      redirect_uri: window.location.origin
    }}
  >
    <StrictMode>
      <App />
    </StrictMode>
  </Auth0Provider>
);