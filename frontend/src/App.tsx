import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { AuthProvider } from '@/contexts/AuthContext';
import { AppShell } from '@/components/layout/AppShell';
import { RequireAuth } from '@/components/common/RequireAuth';
import { Home } from '@/pages/Home';
import { Events } from '@/pages/Events';
import { EventDetail } from '@/pages/EventDetail';
import { Organizations } from '@/pages/Organizations';
import { OrganizationDetail } from '@/pages/OrganizationDetail';
import { Volunteers } from '@/pages/Volunteers';
import { VolunteerDetail } from '@/pages/VolunteerDetail';
import { Initiatives } from '@/pages/Initiatives';
import { InitiativeDetail } from '@/pages/InitiativeDetail';
import { Map } from '@/pages/Map';
import { Profile } from '@/pages/Profile';
import { Applications } from '@/pages/Applications';
import { CreateEvent } from '@/pages/CreateEvent';
import { Notifications } from '@/pages/Notifications';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { NotFound } from '@/pages/NotFound';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<Home />} />
            <Route path="events" element={<Events />} />
            <Route path="events/:id" element={<EventDetail />} />
            <Route path="organizations" element={<Organizations />} />
            <Route path="organizations/:id" element={<OrganizationDetail />} />
            <Route path="volunteers" element={<Volunteers />} />
            <Route path="volunteers/:id" element={<VolunteerDetail />} />
            <Route path="initiatives" element={<Initiatives />} />
            <Route path="initiatives/:id" element={<InitiativeDetail />} />
            <Route path="map" element={<Map />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route
              path="profile"
              element={
                <RequireAuth>
                  <Profile />
                </RequireAuth>
              }
            />
            <Route
              path="applications"
              element={
                <RequireAuth>
                  <Applications />
                </RequireAuth>
              }
            />
            <Route
              path="create-event"
              element={
                <RequireAuth>
                  <CreateEvent />
                </RequireAuth>
              }
            />
            <Route
              path="notifications"
              element={
                <RequireAuth>
                  <Notifications />
                </RequireAuth>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
