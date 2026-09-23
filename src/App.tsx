import type React from 'react';
import { MotionConfig } from 'framer-motion';
import { Route, Routes } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import AuthLayout from './components/layout/AuthLayout';
import PublicLayout from './components/layout/PublicLayout';
import ActivityPage from './pages/app/ActivityPage';
import CommunityPage from './pages/app/CommunityPage';
import CoursePage from './pages/app/CoursePage';
import DashboardPage from './pages/app/DashboardPage';
import LessonPage from './pages/app/LessonPage';
import ModerationPage from './pages/app/ModerationPage';
import PostPage from './pages/app/PostPage';
import PracticePage from './pages/app/PracticePage';
import ProfilePage from './pages/app/ProfilePage';
import ProgressPage from './pages/app/ProgressPage';
import SettingsPage from './pages/app/SettingsPage';
import TrackDetailPage from './pages/app/TrackDetailPage';
import TracksPage from './pages/app/TracksPage';
import UserSearchPage from './pages/app/UserSearchPage';
import PasswordRecoveryPage from './pages/auth/PasswordRecoveryPage';
import SignInPage from './pages/auth/SignInPage';
import SignUpPage from './pages/auth/SignUpPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
import HomePage from './pages/HomePage';
import TermsPage from './pages/legal/TermsPage';
import PrivacyPage from './pages/legal/PrivacyPage';
import NotFoundPage from './pages/NotFoundPage';
import OnboardingPage from './pages/app/OnboardingPage';
import NotificationsPage from './pages/app/NotificationsPage';
import OnboardingRoute from './routes/OnboardingRoute';
import ModeratorRoute from './routes/ModeratorRoute';
import ProtectedRoute from './routes/ProtectedRoute';
import VerifiedEmailRoute from './routes/VerifiedEmailRoute';
import { RouteSEO } from './components/SEO';

export default function App(): React.JSX.Element {
  return (
    <MotionConfig reducedMotion="user">
      <RouteSEO />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="termos" element={<TermsPage />} />
          <Route path="privacidade" element={<PrivacyPage />} />
          <Route path="trilhas" element={<TracksPage />} />
          <Route path="trilhas/:slug" element={<TrackDetailPage />} />
          <Route path="cursos/:slug" element={<CoursePage />} />
        </Route>

        <Route element={<AuthLayout />}>
          <Route path="entrar" element={<SignInPage />} />
          <Route path="cadastro" element={<SignUpPage />} />
          <Route path="recuperar-senha" element={<PasswordRecoveryPage />} />
          <Route path="verificar-email" element={<VerifyEmailPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<VerifiedEmailRoute />}>
            <Route path="onboarding" element={<OnboardingPage />} />
            <Route element={<OnboardingRoute />}>
              <Route element={<AppLayout />}>
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="progresso" element={<ProgressPage />} />
                <Route path="notificacoes" element={<NotificationsPage />} />
                <Route path="aulas/:lessonId" element={<LessonPage />} />
                <Route path="atividades/:activityId" element={<ActivityPage />} />
                <Route path="praticas/:exerciseId" element={<PracticePage />} />
                <Route path="comunidade" element={<CommunityPage />} />
                <Route path="comunidade/posts/:postId" element={<PostPage />} />
                <Route path="usuarios" element={<UserSearchPage />} />
                <Route element={<ModeratorRoute />}>
                  <Route path="moderacao" element={<ModerationPage />} />
                </Route>
                <Route path="perfil/:username" element={<ProfilePage />} />
                <Route path="configuracoes" element={<SettingsPage />} />
              </Route>
            </Route>
          </Route>
        </Route>

        <Route element={<PublicLayout />}>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </MotionConfig>
  );
}
