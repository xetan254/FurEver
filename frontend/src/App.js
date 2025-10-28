import React from 'react';
import { BrowserRouter as Router, Route, Routes, Outlet } from 'react-router-dom';

// Import Layout Components
import Header from './components/Header';
import Footer from './components/Footer';
import AdminLayout from './components/AdminLayout'; // Layout mới cho trang admin
import AdminRoute from './components/AdminRoute';   // Component bảo vệ trang admin


// Import Page Components
import HomePage from './pages/User/HomePage';
import AboutUsPage from './pages/User/AboutUsPage';
import GuidePage from './pages/User/GuidePage';
import NewsPage from './pages/User/NewsPage';
import NewsDetailPage from './pages/User/NewsDetailPage';
import ProfilePage from './pages/Profile/ProfilePage';
import DonatePage from './pages/User/DonatePage'; // Sửa tên import cho Donate


// Import Admin Pages
import AdminPage from './pages/Admin/AdminPage';
import PetManagementPage from './pages/Admin/PetManagementPage';
import UserManagementPage from './pages/Admin/UserManagementPage';
import ArticleManagementPage from './pages/Admin/ArticleManagementPage'; // <-- Thêm import
import OrderManagementPage from './pages/Admin/OrderManagementPage'; // Import trang quản lý đơn hàng 
// Import Auth Flow Components
import LoginPage from './pages/Profile/LoginPage';
import SignupPage from './pages/Profile/SignupPage';
import ForgotPasswordPage from './pages/Profile/ForgotPasswordPage';
import ConfirmPasswordPage from './pages/Profile/ConfirmPasswordPage';
import ResetPasswordPage from './pages/Profile/ResetPasswordPage';
import ConfirmSignupPage from './pages/Profile/ConfirmSignupPage';
import CompleteSignupPage from './pages/Profile/CompleteSignupPage';

// Import Adoption Flow Components
import AdoptionPage from './pages/User/AdoptionPage';
import AdoptionDetailPage from './pages/User/AdoptionDetailPage';
import AdoptionStep1 from './pages/User/AdoptionStep1';
import AdoptionStep2 from './pages/User/AdoptionStep2';
import AdoptionStep3 from './pages/User/AdoptionStep3';
import AdoptionComplete from './pages/User/AdoptionComplete';

// --- QUAN TRỌNG: Import AuthProvider ---
import { AuthProvider } from './context/AuthContext'; // Đảm bảo đường dẫn đúng


// Import Global CSS
import './assets/css/globals.css';
import './assets/css/style.css';

// Component layout cho các trang người dùng thông thường
const UserLayout = () => (
    <>
        <Header />
        <main style={{ paddingTop: '80px', minHeight: 'calc(100vh - 80px)' }}>
            <Outlet />
        </main>
        <Footer />
    </>
);

function App() {
  return (
    <Router>
        <AuthProvider>
            <Routes>

                {/* === ADMIN ROUTES === */}
                <Route element={<AdminRoute />}>
                    <Route path="/admin" element={<AdminLayout />}>
                        <Route index element={<AdminPage />} />
                        <Route path="pets-management" element={<PetManagementPage />} />
                        <Route path="users-management" element={<UserManagementPage />} />
                        <Route path="articles-management" element={<ArticleManagementPage />} />
                        <Route path="orders-management" element={<OrderManagementPage />} />
                    </Route>
                </Route>

                {/* === USER ROUTES === */}
                <Route path="/" element={<UserLayout />}>
                    {/* Main Pages */}
                    <Route index element={<HomePage />} />
                    <Route path="about-us" element={<AboutUsPage />} />
                    <Route path="guide" element={<GuidePage />} />
                    <Route path="news" element={<NewsPage />} />
                    <Route path="news-detail/:id" element={<NewsDetailPage />} />

                    {/* === SỬA DÒNG NÀY === */}
                    <Route path="profile/:id" element={<ProfilePage/>} /> {/* Thêm /:id */}

                    {/* Auth Pages */}
                    <Route path="login" element={<LoginPage />} />
                    <Route path="signup" element={<SignupPage />} />
                    <Route path="forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="confirm-password" element={<ConfirmPasswordPage />} />
                    <Route path="reset-password/:token" element={<ResetPasswordPage />} />
                    <Route path="confirm-signup/:token" element={<ConfirmSignupPage />} />
                    <Route path="complete-signup" element={<CompleteSignupPage />} />
              
                    {/* Adoption Process */}
                    <Route path="adoption" element={<AdoptionPage />} />
                    <Route path="adoption-detail/:id" element={<AdoptionDetailPage />} />
                    <Route path="adoption-step" element={<AdoptionStep1 />} />
                    <Route path="adoption-step-2" element={<AdoptionStep2 />} />
                    <Route path="adoption-step-3" element={<AdoptionStep3 />} />
                    <Route path="adoption-complete" element={<AdoptionComplete />} />
              
                    {/* Donation Process */}
                    <Route path="donate" element={<DonatePage />} /> {/* Sửa tên component */}

                </Route>
            </Routes>
       </AuthProvider>
    </Router>
  );
}

export default App;