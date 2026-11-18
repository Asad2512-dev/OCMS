// Shows a different page for the same URL depending on the user's role (e.g. /dashboard).
import { useAuth } from '../context/AuthContext.jsx';

const RoleSwitch = ({ pages }) => {
  const { user } = useAuth();
  const Page = pages[user.role] || pages.default;
  return Page ? <Page /> : null;
};
export default RoleSwitch;
