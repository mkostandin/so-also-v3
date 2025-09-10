import { AuthProvider } from '@/lib/auth-context';
import { ThemeProvider } from "@/components/theme-provider";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ToastProviderComponent } from '@/components/ui/toast';
import ErrorBoundary from '@/components/ErrorBoundary';
import Landing from '@/routes/Landing';
import EmbedView from '@/routes/EmbedView';
import MapIndex from '@/routes/MapIndex';
import MapView from '@/routes/MapView';
import ListView from '@/routes/ListView';
import CalendarView from '@/routes/CalendarView';
import BottomTabs from '@/components/BottomTabs';
import SubmitEvent from '@/routes/SubmitEvent';
import SubmitConference from '@/routes/SubmitConference';
import Conferences from '@/routes/Conferences';
import ConferenceDetail from '@/routes/ConferenceDetail';
import EventDetail from '@/routes/EventDetail';
import Settings from '@/routes/Settings';
import ErrorOverlay from '@/components/ErrorOverlay';

function AppContent() {

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/embed" element={<EmbedView />} />

      {/* Fallbacks for legacy/accidental uppercase or short URLs */}
      <Route path="/app/LIST" element={<Navigate to="/app/map/list" replace />} />
      <Route path="/app/list" element={<Navigate to="/app/map/list" replace />} />

      <Route path="/app" element={<BottomTabsWrapper />}>
        <Route index element={<Navigate to="map" replace />} />

        <Route path="map/*" element={<MapIndex />}>
          <Route index element={<MapView />} />
          <Route path="list" element={<ListView />} />
          <Route path="calendar" element={<CalendarView />} />
        </Route>

        {/* EventDetail Scroll Container */}
        {/* Dedicated scroll container for EventDetail route to ensure smooth mobile scrolling */}
        {/* This provides its own scroll context separate from MapIndex's scroll container */}
        <Route path="e/:id" element={
          <div className="h-screen overflow-y-auto scroll-touch scroll-pan-y scrollbar-stable overscroll-none">
            <EventDetail />
          </div>
        } />
        <Route path="submit" element={<SubmitEvent />} />
        <Route path="submit-conference" element={<SubmitConference />} />
        <Route path="conferences" element={<Conferences />} />
        <Route path="conferences/:id" element={<ConferenceDetail />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

function BottomTabsWrapper() {
  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 min-h-0 overflow-hidden">
        <Outlet />
      </div>
      <div className="flex-shrink-0">
        <BottomTabs />
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
        storageKey="volo-app-theme"
      >
        <ErrorBoundary>
          <ToastProviderComponent>
            <Router>
              <AppContent />
              {/* Global error overlay for critical failures */}
              <ErrorOverlay />
            </Router>
          </ToastProviderComponent>
        </ErrorBoundary>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
