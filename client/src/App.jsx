// Root component: router, login state, notifications and toast messages.
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';
import AppRoutes from './routes/AppRoutes.jsx';
import theme from './config/theme.js';

const toastOptions = {
  duration: 4000,
  style: {
    background: theme.colors.ink.DEFAULT,
    color: theme.colors.ink.inverse,
    borderRadius: theme.radius.control,
    fontSize: '14px',
    padding: '10px 14px',
    boxShadow: theme.shadows.pop,
  },
  success: { iconTheme: { primary: theme.colors.success.DEFAULT, secondary: theme.colors.ink.inverse } },
  error: { iconTheme: { primary: theme.colors.danger.DEFAULT, secondary: theme.colors.ink.inverse } },
};

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <NotificationProvider>
        <AppRoutes />
        <Toaster position="top-right" toastOptions={toastOptions} />
      </NotificationProvider>
    </AuthProvider>
  </BrowserRouter>
);
export default App;
