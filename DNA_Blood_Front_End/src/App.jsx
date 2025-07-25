import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { CartProvider } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';
import { ServiceProvider } from './context/ServiceContext';
import Navbar from './components/customer/Navbar';
import PageWrapper from './components/general/PageWrapper';
import Hero from './components/general/Hero';
import Features from './components/general/Features';
import Services from './components/general/Services';
import FAQ from './components/general/FAQ';
import Blog from './components/general/Blog';
import Footer from './components/customer/Footer';
import BlogDetailGuest from './components/customer/BlogDetailGuest';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Customer/Profile';
import AccountSetting from './pages/Customer/AccountSetting';
import ServicePage from './pages/Customer/ServicePage';
import Cart from './pages/Customer/Cart';
import Testimonials from './components/general/Testimonials';
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
import ServiceDetail from './components/customer/ServiceDetail';
import Notification from './components/general/Notification';
import Contact from './components/general/Contact';
import ResetPassword from "./pages/ResetPassword";
import ForgotPassword from "./pages/ForgotPassword";
import RegisterStaff from './pages/Admin/RegisterStaff';
import RegisterMedicalStaff from './pages/Admin/RegisterMedicalStaff';
import CreateWorkShift from './pages/Admin/CreateWorkShift';
import WorkShiftList from './pages/Admin/WorkShiftList';
import StaffFeedback from './pages/Staff/StaffFeedback';
import WorkAssignment from './pages/Admin/WorkAssignment';
import ServiceManager from './pages/Admin/ServiceManager';
import StaffManagement from './pages/Admin/StaffManagement';
import AllOrders from './pages/Admin/AllOrders';
import CustomerLayout from './pages/Customer/CustomerLayout';
import BlogList from './components/general/BlogList';
import BlogDetail from './components/general/BlogDetail';
import AdminBlogList from './pages/Admin/AdminBlogList';
import AdminCreateBlog from './pages/Admin/AdminCreateBlog';
import Chatbot from './components/ui/Chatbot';
import BlogListGuest from './components/customer/BlogListGuest';
// import AdminEditBlog from './pages/Admin/AdminEditBlog'; // [NOTE] Đã comment lại vì file này chưa tồn tại hoặc không cần thiết nếu đã dùng popup edit trong AdminBlogList


const HomePage = () => (
    <>
        <Hero />
        <Features />
        <Services />
        <Testimonials />
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-8 px-4 sm:px-6 lg:px-8">
            <div className="lg:col-span-5">
                <Blog />
            </div>
            <div className="lg:col-span-2">
                <FAQ />
            </div>
        </div>
        <Contact />
    </>
);

const App = () => {
    return (
        
            <NotificationProvider>
                <ServiceProvider>
                    <CartProvider>
                        <Navbar />
                        <main className="flex-grow">
                            <PageWrapper>
                                <Routes>
                                    {/* Customer Routes */}
                                    <Route path="/" element={<CustomerLayout><HomePage /></CustomerLayout>} />
                                    <Route path="/services" element={<CustomerLayout><ServicePage /></CustomerLayout>} />
                                    <Route path="/service/:id" element={<CustomerLayout><ServiceDetail /></CustomerLayout>} />
                                    <Route path="/cart" element={<CustomerLayout><Cart /></CustomerLayout>} />
                                    <Route path="/fill-booking" element={<CustomerLayout><FillBookingForm /></CustomerLayout>} />
                                    <Route path="/payment" element={<CustomerLayout><Payment /></CustomerLayout>} />
                                    <Route path="/payment-success" element={<CustomerLayout><PaymentSuccess /></CustomerLayout>} />
                                    <Route path="/profile" element={<CustomerLayout><Profile /></CustomerLayout>} />
                                    <Route path="/account-setting" element={<CustomerLayout><AccountSetting /></CustomerLayout>} />
                                    <Route path="/login" element={<CustomerLayout><Login /></CustomerLayout>} />
                                    <Route path="/register" element={<CustomerLayout><Register /></CustomerLayout>} />

                                   
                                    {/* Blog Routes - Public */}
                                    <Route path="/blog" element={<CustomerLayout><BlogListGuest /></CustomerLayout>} />
                                    <Route path="/blog/:blogId" element={<CustomerLayout><BlogDetailGuest /></CustomerLayout>} />
                                    {/* Staff Routes */}
                                    <Route path="/staff" element={<Staff />} />
                                    <Route path="/staff/orders" element={<StaffOrder />} />
                                    <Route path="/staff/profile" element={<StaffProfile />} />
                                    <Route path="/staff/feedback" element={<StaffFeedback />} />

                                    {/* Medical Staff Routes */}
                                    <Route path="/medical-staff" element={<MedicalStaff />} />
                                    <Route path="/medical-staff/orders" element={<MedicalStaffOrder />} />

                                    {/* Admin Routes */}
                                    <Route path="/admin" element={<AdminPage />} />
                                    <Route path="/admin/register-staff" element={<RegisterStaff />} />
                                    <Route path="/admin/register-medical-staff" element={<RegisterMedicalStaff />} />
                                    <Route path="/admin/create-workshift" element={<CreateWorkShift />} />
                                    <Route path="/admin/workshift-list" element={<WorkShiftList />} />
                                    <Route path="/admin/work-assignment" element={<WorkAssignment />} />
                                    <Route path="/admin/services" element={<ServiceManager />} />
                                    <Route path="/admin/staff-management" element={<StaffManagement />} />
                                    <Route path="/admin/all-orders" element={<AllOrders />} />
                                    <Route path="/admin/blogs" element={<AdminBlogList />} />
                                    <Route path="/admin/blogs-create" element={<AdminCreateBlog />} />
                                    {/*<Route path="/admin/blogs/edit/:id" element={<AdminEditBlog />} /> */} [NOTE] Đã comment lại vì file này chưa tồn tại hoặc không cần thiết nếu đã dùng popup edit trong AdminBlogList


                                    {/* Other Routes */}
                                    <Route path="/oauth-success" element={<OAuthSuccess />} />
                                    <Route path="/reset-password" element={<ResetPassword />} />
                                    <Route path="/forgot-password" element={<ForgotPassword />} />
                                    <Route path="*" element={<Navigate to="/" />} />
                                </Routes>
                            </PageWrapper>
                        </main>
                        <Chatbot />
                    </CartProvider>
                </ServiceProvider>
            </NotificationProvider>
        
    );
}

export default App;
