import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const AccountSetting = () => {
  const [formData, setFormData] = useState({
    fullName: "Trần Thái Thịnh",
    email: "Thaithinh03456@gmail.com",
    phoneNumber: "0348064033",
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
    receiveEmail: true,
    receiveSms: true,
    orderUpdates: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Saving changes:', formData);

    // TODO: Tích hợp API để lưu các thay đổi
    /*
    fetch('/api/user/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alert('Changes saved successfully!');
        // Optionally update local storage or user context if needed
      } else {
        alert('Failed to save changes:' + data.message);
      }
    })
    .catch(error => {
      console.error('Error saving changes:', error);
      alert('An error occurred while saving changes.');
    });
    */

    alert('Changes saved successfully (simulated)!');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-3xl font-extrabold text-blue-600 text-center uppercase tracking-wide mb-8 border-b-2 border-blue-600 pb-2">
            Account Settings
          </h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <div className="bg-white shadow rounded-lg p-6 md:p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 mr-2 text-blue-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
                Personal Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    id="fullName"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={formData.fullName}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={formData.email}
                    onChange={handleChange}
                    readOnly // Email thường không được thay đổi trực tiếp qua form này
                  />
                </div>
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    id="phoneNumber"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Security */}
            <div className="bg-white shadow rounded-lg p-6 md:p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 mr-2 text-blue-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 1.5h9v2.25a2.25 2.25 0 0 1-2.25 2.25H6.75a2.25 2.25 0 0 1-2.25-2.25v-2.25h9Z" />
                </svg>
                Security
              </h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    id="currentPassword"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={formData.currentPassword}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    id="newPassword"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={formData.newPassword}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmNewPassword"
                    id="confirmNewPassword"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={formData.confirmNewPassword}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white shadow rounded-lg p-6 md:p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 mr-2 text-blue-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.04 5.455 1.31m5.714 0a24.248 24.248 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                </svg>
                Notifications
              </h2>
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    id="receiveEmail"
                    name="receiveEmail"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={formData.receiveEmail}
                    onChange={handleChange}
                  />
                  <label htmlFor="receiveEmail" className="ml-2 block text-sm text-gray-900">
                    Receive email notifications
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="receiveSms"
                    name="receiveSms"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={formData.receiveSms}
                    onChange={handleChange}
                  />
                  <label htmlFor="receiveSms" className="ml-2 block text-sm text-gray-900">
                    Receive SMS notifications
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="orderUpdates"
                    name="orderUpdates"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={formData.orderUpdates}
                    onChange={handleChange}
                  />
                  <label htmlFor="orderUpdates" className="ml-2 block text-sm text-gray-900">
                    Order status updates
                  </label>
                </div>
              </div>
            </div>

            {/* Save Changes Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                SAVE CHANGES
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AccountSetting;
