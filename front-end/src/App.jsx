import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import Profile from './pages/Profile';
import AccountSetting from './pages/AccountSetting';
import ServicePage from './pages/ServicePage';
import Cart from './pages/Cart';
import Contact from './components/Contact';
import Testimonials from './components/Testimonials';
import FillBookingForm from './pages/FillBookingForm';
import Payment from './pages/Payment';
import PaymentSuccess from './pages/PaymentSuccess';

function App() {
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

  return (
    <NotificationProvider>
      <ServiceProvider>
        <CartProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<AccountSetting />} />
              <Route path="/services" element={<ServicePage />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/fill-booking-form" element={<FillBookingForm />} />
              <Route path="/payment" element={<Payment />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/" element={
                <div className="min-h-screen bg-white">
                  <Navbar />
                  <main className="pt-16">
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
                    <section id="contact" className="py-20 bg-white" data-aos="fade-up" data-aos-duration="1000">
                      <Contact />
                    </section>
                  </main>
                  <Footer />
                </div>
              } />
            </Routes>
          </Router>
        </CartProvider>
      </ServiceProvider>
    </NotificationProvider>
  );
}

export default App;
