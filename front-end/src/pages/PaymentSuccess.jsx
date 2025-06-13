import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link, useNavigate } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';

const PaymentSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/'); // Redirect to home page after 60 seconds
    }, 60000); // 60 seconds

    return () => clearTimeout(timer); // Clear the timer if component unmounts
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="bg-white shadow rounded-lg p-8 md:p-12 text-center max-w-lg w-full" style={{ borderRadius: '5px' }}>
          <FaCheckCircle className="text-green-500 w-20 h-20 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-blue-600 mb-4">Payment Successful!</h1>
          <p className="text-gray-700 text-lg mb-6">
            Your order has been placed successfully. Thank you for your purchase!
          </p>
          <p className="text-gray-500 text-sm mb-8">
            You will be redirected to the home page shortly, or you can click the button below.
          </p>
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Go to Home
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PaymentSuccess;
