// 403 page: shown when a user opens a page their role cannot access.
import { ShieldAlert } from 'lucide-react';
import ErrorPage from './ErrorPage.jsx';
import { STRINGS } from '../../config/strings.js';

const E = STRINGS.errorPages;
const Unauthorized = () => <ErrorPage code={E.unauthorizedCode} title={E.unauthorizedTitle} text={E.unauthorizedText} icon={ShieldAlert} />;
export default Unauthorized;
