import React from 'react';
import StaffNavbar from '../components/StaffNavbar';

const StaffProfile = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <StaffNavbar />
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Staff Profile</h1>
          <div className="bg-white shadow rounded-lg p-6">
            <p className="text-gray-600">Staff profile page coming soon...</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StaffProfile; 