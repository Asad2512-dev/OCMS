// 404 page: shown for any unknown address.
import { Compass } from 'lucide-react';
import ErrorPage from './ErrorPage.jsx';
import { STRINGS } from '../../config/strings.js';

const E = STRINGS.errorPages;
const NotFound = () => <ErrorPage code={E.notFoundCode} title={E.notFoundTitle} text={E.notFoundText} icon={Compass} />;
export default NotFound;
