// Shared layout for the 404 and 403 pages.
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Logo from '../../components/layout/Logo.jsx';
import { Button } from '../../components/ui/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROUTES } from '../../config/constants.js';
import { STRINGS } from '../../config/strings.js';

const ErrorPage = ({ code, title, text, icon: Icon }) => {
  const { user } = useAuth();
  const E = STRINGS.errorPages;
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <div className="p-6"><Link to={ROUTES.HOME}><Logo /></Link></div>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="m-auto max-w-md px-6 pb-24 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-soft text-primary ring-8 ring-primary-soft/50"><Icon className="h-8 w-8" /></div>
        <p className="bg-gradient-to-r from-primary to-accent bg-clip-text text-6xl font-bold tracking-tight text-transparent">{code}</p>
        <h1 className="mt-3 text-2xl font-semibold text-ink">{title}</h1>
        <p className="mt-2 text-ink-muted">{text}</p>
        <Link to={user ? ROUTES.DASHBOARD : ROUTES.HOME}>
          <Button className="mt-8" icon={ArrowLeft}>{user ? E.goDashboard : E.goHome}</Button>
        </Link>
      </motion.div>
    </div>
  );
};
export default ErrorPage;
