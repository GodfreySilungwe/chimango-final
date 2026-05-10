import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import TourDetailPage from './pages/TourDetailPage';
import BookingsPage from './pages/BookingsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/AdminDashboard';
import ActivityGallery from "./pages/ActivityGallery";
import AdminImages from './pages/AdminImages';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import BookingConfirmation from './pages/BookingConfirmation';
import UserProfilePage from './pages/UserProfilePage';
import WishlistPage from './pages/WishlistPage';
import AboutUsPage from './pages/AboutUsPage';
import ContactPage from './pages/ContactPage';
import PushNotification from './components/PushNotification';
// import ChatWidget from './components/ChatWidget'; // Socket.IO not implemented in Lambda backend
import PaymentPage from './pages/PaymentPage';
import TestPayment from './pages/TestPayment';
function App() {
  return (
    <AuthProvider>
      <Router>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
          <Navbar />
          {/* <ChatWidget /> */}
          <div style={{ flex: 1, width: '100%' }}>
            <Routes>
              <Route path="/test-payment" element={<TestPayment />} />
              <Route path="/payment" element={<PaymentPage />} />
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutUsPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/activities" element={<ActivityGallery />} />
              <Route path="/profile" element={<UserProfilePage />} />
              <Route path="/tours/:id" element={<TourDetailPage />} />
              <Route path="/bookings" element={<BookingsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/images" element={<AdminImages />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/booking-confirmation" element={<BookingConfirmation />} />
              <Route path="/wishlist" element={<WishlistPage />} />
            </Routes>
          </div>
          <Footer />
          <PushNotification />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;