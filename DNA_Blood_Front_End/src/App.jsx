import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { CartProvider } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';
import { ServiceProvider } from './context/ServiceContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Services from './components/Services';
import FAQ from './components/FAQ';
import Blog from './components/Blog';
import Footer from './components/Footer';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Customer/Profile';
import AccountSetting from './pages/Customer/AccountSetting';
import ServicePage from './pages/Customer/ServicePage';
import Cart from './pages/Customer/Cart';
import Testimonials from './components/Testimonials';
import FillBookingForm from './pages/Customer/FillBookingForm';
import Payment from './pages/Customer/Payment';
import PaymentSuccess from './pages/Customer/PaymentSuccess';
import Staff from './pages/Staff/Staff';
import StaffDashboard from './pages/Staff/StaffDashboard';
import StaffProfile from './pages/Staff/StaffProfile';
import OAuthSuccess from './pages/OAuthSuccess';
import AdminPage from './pages/Admin/AdminPage';

const App = () => {
  const [userRole, setUserRole] = useState(null);

  // Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: false,
      offset: 150,
      easing: 'ease-in-out-cubic',
      mirror: true
    });
  }, []);

  // Enable smooth scrolling for anchor links
  useEffect(() => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        const role = tokenData['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
        setUserRole(role);
      } catch (error) {
        console.error('Error parsing token:', error);
        localStorage.removeItem('token');
      }
    }
  }, []);

  const HomeContent = () => (
    <div className="min-h-screen bg-white">
      {/* Nếu là Admin, hiển thị nút vào Admin */}
      {userRole === 'Admin' && (
        <div className="fixed top-24 right-8 z-50">
          <a
            href="/admin"
            className="bg-blue-700 text-white px-5 py-2 rounded-lg shadow-lg font-semibold hover:bg-blue-900 transition-all duration-200 animate-bounce"
          >
            Vào trang Admin
          </a>
        </div>
      )}
      <section id="home">
        <Hero />
      </section>
      <section id="features" className="py-20" data-aos="fade-up" data-aos-duration="1000">
        <Features />
      </section>
      <section id="services" className="py-20 bg-white" data-aos="fade-up" data-aos-duration="1000">
        <Services />
      </section>
      <section id="testimonials" className="py-20 bg-gray-50" data-aos="fade-up" data-aos-duration="1000">
        <Testimonials />
      </section>
      <div className="flex flex-col md:flex-row">
        <section id="blog" className="py-20 bg-white md:w-3/4" data-aos="fade-up" data-aos-duration="1000">
          <Blog />
        </section>
        <section id="faq" className="py-20 md:w-1/4" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="200">
          <FAQ />
        </section>
      </div>
    </div>
  );

  return (
    <NotificationProvider>
      <ServiceProvider>
        <CartProvider>
          <Router>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow">
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/oauth-success" element={<OAuthSuccess />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/settings" element={<AccountSetting />} />
                  <Route path="/services" element={<ServicePage />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/payment" element={<Payment />} />
                  <Route path="/payment-success" element={<PaymentSuccess />} />
                  <Route path="/fill-booking-form" element={<FillBookingForm />} />
                  <Route path="/staff" element={<StaffDashboard />} />
                  <Route path="/staff/orders" element={<Staff />} />
                  <Route path="/staff/profile" element={<StaffProfile />} />
                  <Route path="/admin" element={<AdminPage />} />
                  <Route 
                    path="/" 
                    element={
                      userRole === 'Staff' ? 
                        <Navigate to="/staff" replace /> : 
                      <HomeContent />
                    } 
                  />
                </Routes>
                  </main>
                  <Footer />
                </div>
          </Router>
        </CartProvider>
      </ServiceProvider>
    </NotificationProvider>
  );
};

export default App;
