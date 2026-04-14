import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Auth
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';

// Student
import HomePage from './pages/student/HomePage';
import RestaurantPage from './pages/student/RestaurantPage';
import CartPage from './pages/student/CartPage';
import CheckoutPage from './pages/student/CheckoutPage';
import OrderTrackingPage from './pages/student/OrderTrackingPage';
import OrderHistoryPage from './pages/student/OrderHistoryPage';
import ProfilePage from './pages/student/ProfilePage';

// Driver
import DriverDashboard from './pages/driver/DriverDashboard';
import ActiveDeliveryPage from './pages/driver/ActiveDeliveryPage';
import DriverHistoryPage from './pages/driver/DriverHistoryPage';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageRestaurantsPage from './pages/admin/ManageRestaurantsPage';
import ManageUsersPage from './pages/admin/ManageUsersPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <CartProvider>
            <Routes>
              {/* Public */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />

              {/* Student */}
              <Route element={<ProtectedRoute requiredRole="student" />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/restaurants/:id" element={<RestaurantPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/orders" element={<OrderHistoryPage />} />
                <Route path="/orders/:id/tracking" element={<OrderTrackingPage />} />
              </Route>

              {/* Shared (student + driver) */}
              <Route element={<ProtectedRoute />}>
                <Route path="/profile" element={<ProfilePage />} />
              </Route>

              {/* Driver */}
              <Route element={<ProtectedRoute requiredRole="driver" />}>
                <Route path="/driver" element={<DriverDashboard />} />
                <Route path="/driver/delivery/:orderId" element={<ActiveDeliveryPage />} />
                <Route path="/driver/history" element={<DriverHistoryPage />} />
                <Route path="/driver/onboard/success" element={<Navigate to="/driver" />} />
                <Route path="/driver/onboard/refresh" element={<Navigate to="/driver" />} />
              </Route>

              {/* Admin */}
              <Route element={<ProtectedRoute requiredRole="admin" />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/restaurants" element={<ManageRestaurantsPage />} />
                <Route path="/admin/users" element={<ManageUsersPage />} />
              </Route>

              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </CartProvider>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
