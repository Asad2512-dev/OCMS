// Every page address in the app and who can open it.
// Pages are loaded on demand (lazy) so the first download stays small.
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { PageLoader } from '../components/ui/Spinner.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import RoleSwitch from './RoleSwitch.jsx';
import AppLayout from '../components/layout/AppLayout.jsx';
import { ROUTES, ROLES, COMPLAINANT_ROLES } from '../config/constants.js';

const Landing = lazy(() => import('../pages/public/Landing.jsx'));
const Login = lazy(() => import('../pages/public/Login.jsx'));
const NotFound = lazy(() => import('../pages/public/NotFound.jsx'));
const Unauthorized = lazy(() => import('../pages/public/Unauthorized.jsx'));
const UiPreview = lazy(() => import('../pages/public/UiPreview.jsx'));

const UserDashboard = lazy(() => import('../pages/user/UserDashboard.jsx'));
const NewComplaint = lazy(() => import('../pages/user/NewComplaint.jsx'));
const ComplaintList = lazy(() => import('../pages/shared/ComplaintList.jsx'));
const ComplaintDetail = lazy(() => import('../pages/shared/ComplaintDetail.jsx'));
const TrackComplaint = lazy(() => import('../pages/shared/TrackComplaint.jsx'));
const Notifications = lazy(() => import('../pages/shared/Notifications.jsx'));
const Profile = lazy(() => import('../pages/shared/Profile.jsx'));

const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard.jsx'));
const UsersPage = lazy(() => import('../pages/admin/UsersPage.jsx'));
const DepartmentsPage = lazy(() => import('../pages/admin/DepartmentsPage.jsx'));
const FeedbackPage = lazy(() => import('../pages/admin/FeedbackPage.jsx'));
const ReportsPage = lazy(() => import('../pages/admin/ReportsPage.jsx'));
const OfficerDashboard = lazy(() => import('../pages/officer/OfficerDashboard.jsx'));

const dashboards = { admin: AdminDashboard, officer: OfficerDashboard, default: UserDashboard };

const AppRoutes = () => (
  <Suspense fallback={<PageLoader />}>
  <Routes>
    <Route path={ROUTES.HOME} element={<Landing />} />
    <Route path={ROUTES.LOGIN} element={<Login />} />
    <Route path={ROUTES.UNAUTHORIZED} element={<Unauthorized />} />
    <Route path={ROUTES.UI_PREVIEW} element={<UiPreview />} />

    <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
      <Route path={ROUTES.DASHBOARD} element={<RoleSwitch pages={dashboards} />} />
      <Route path={ROUTES.COMPLAINTS} element={<ComplaintList />} />
      <Route path={ROUTES.NEW_COMPLAINT} element={<ProtectedRoute roles={COMPLAINANT_ROLES}><NewComplaint /></ProtectedRoute>} />
      <Route path={ROUTES.COMPLAINT()} element={<ComplaintDetail />} />
      <Route path={ROUTES.TRACK} element={<TrackComplaint />} />
      <Route path={ROUTES.NOTIFICATIONS} element={<Notifications />} />
      <Route path={ROUTES.PROFILE} element={<Profile />} />

      <Route element={<ProtectedRoute roles={[ROLES.ADMIN]} />}>
        <Route path={ROUTES.USERS} element={<UsersPage />} />
        <Route path={ROUTES.DEPARTMENTS} element={<DepartmentsPage />} />
        <Route path={ROUTES.FEEDBACK} element={<FeedbackPage />} />
        <Route path={ROUTES.REPORTS} element={<ReportsPage />} />
      </Route>
    </Route>

    <Route path="*" element={<NotFound />} />
  </Routes>
  </Suspense>
);
export default AppRoutes;
