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
import StaffOrder from './pages/Staff/StaffOrder';
import StaffProfile from './pages/Staff/StaffProfile';
import OAuthSuccess from './pages/OAuthSuccess';
import AdminPage from './pages/Admin/AdminPage';
import MedicalStaff from './pages/MedicalStaff/MedicalStaff';
import MedicalStaffOrder from './pages/MedicalStaff/MedicalStaffOrder';
import ServiceDetail from './components/ServiceDetail';
import Notification from './components/Notification';
import Contact from './components/Contact';
import ResetPassword from "./pages/ResetPassword";
import ForgotPassword from "./pages/ForgotPassword";

const HomePage = () => (
    <>
        <Hero />
        <Features />
        <Services />
        <Testimonials />
        <Blog />
        <FAQ />
        <Contact />
    </>
);

const App = () => {
    return (
        <Router>
            <NotificationProvider>
                <ServiceProvider>
                    <CartProvider>
                        <Navbar />
                        <main className="flex-grow">
                            <Routes>
                                {/* Customer Routes */}
                                <Route path="/" element={<HomePage />} />
                                <Route path="/services" element={<ServicePage />} />
                                <Route path="/service/:id" element={<ServiceDetail />} />
                                <Route path="/cart" element={<Cart />} />
                                <Route path="/fill-booking" element={<FillBookingForm />} />
                                <Route path="/payment" element={<Payment />} />
                                <Route path="/payment-success" element={<PaymentSuccess />} />
                                <Route path="/profile" element={<Profile />} />
                                <Route path="/account-setting" element={<AccountSetting />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<Register />} />

                                {/* Staff Routes */}
                                <Route path="/staff" element={<Staff />} />
                                <Route path="/staff/orders" element={<StaffOrder />} />
                                <Route path="/staff/profile" element={<StaffProfile />} />

                                {/* Medical Staff Routes */}
                                <Route path="/medical-staff" element={<MedicalStaff />} />
                                <Route path="/medical-staff/orders" element={<MedicalStaffOrder />} />

                                {/* Admin Routes */}
                                <Route path="/admin" element={<AdminPage />} />

                                {/* Other Routes */}
                                <Route path="/oauth-success" element={<OAuthSuccess />} />
                                <Route path="/reset-password" element={<ResetPassword />} />
                                <Route path="/forgot-password" element={<ForgotPassword />} />
                                <Route path="*" element={<Navigate to="/" />} />
                            </Routes>
                        </main>
                        <Footer />
                    </CartProvider>
                </ServiceProvider>
            </NotificationProvider>
        </Router>
    );
}

export default App;
