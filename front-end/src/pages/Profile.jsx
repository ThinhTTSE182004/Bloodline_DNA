import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';

const Profile = () => {
  // Dữ liệu giả định cho profile và order history
  const [userProfile] = useState({
    name: "Trần Thái Thịnh",
    memberSince: "June 2025",
    email: "Thaithinh03456@gmail.com",
    phone: "0348064033",
  });

  const [orderHistory] = useState([
    {
      orderId: 1,
      service: "Paternal Ancestry Test",
      patient: "Trần Thế Thanh",
      relative: "Trần Thế Thanh (Child)",
      status: "Pending",
    },
    {
      orderId: 2,
      service: "Family Ancestry Test",
      patient: "Nguyễn Trọng Tấn",
      relative: "Hồ Văn Cao (Member)",
      status: "Pending",
    },
    {
      orderId: 3,
      service: "Sibling Relationship Test",
      patient: "Phạm Thế Quang",
      relative: "Hồ Văn Cao (Sibling)",
      status: "Pending",
    },
    {
      orderId: 4,
      service: "Sibling Relationship Test",
      patient: "Phạm Thế Quang",
      relative: "Hồ Văn Cao (Sibling)",
      status: "Pending",
    },
  ]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* User Profile Card */}
          <div className="bg-white shadow rounded-lg p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
              <div className="flex-shrink-0">
                <div className="h-24 w-24 bg-blue-600 rounded-full flex items-center justify-center text-white text-4xl">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-12 h-12">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                </div>
              </div>
              <div className="flex-grow text-center md:text-left">
                <h1 className="text-3xl font-bold text-gray-900">{userProfile.name}</h1>
                <p className="text-gray-600">Member since {userProfile.memberSince}</p>
                <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-3">
                  <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 mr-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14.25v4.5m-2.25-2.25h4.5" />
                    </svg>
                    Edit Profile
                  </button>
                  <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 mr-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.17.971c.093.535.344 1.04.704 1.46L19 7.75c.42.42.61.99.503 1.55l-.3 1.714a1.875 1.875 0 0 1-1.02 1.258l-.8.47a1.875 1.875 0 0 0-.749 2.19l.292 1.683c.092.536-.123 1.083-.582 1.411L15 21.75c-.473.34-.993.53-1.55.503l-1.715-.3a1.875 1.875 0 0 0-2.19.749l-.47.8c-.34.473-.886.683-1.411.582l-1.683-.292c-.536-.092-1.083.123-1.411.582L2.25 19.5c-.34-.473-.53-.993-.503-1.55l.3-1.715a1.875 1.875 0 0 0-1.258-1.02l-.47-.8a1.875 1.875 0 0 0-2.19-.749l-1.683.292c-.536.092-1.083-.123-1.411-.582L.75 4.5c.473-.34.993-.53 1.55-.503l1.715.3a1.875 1.875 0 0 0 2.19-.749l.47-.8c.34-.473.886-.683 1.411-.582l1.683.292c.536.092 1.083-.123 1.411-.582Zm2.25 6.5a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" clipRule="evenodd" />
                    </svg>
                    Account Settings
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Information Card */}
          <div className="bg-white shadow rounded-lg p-6 md:p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 mr-2 text-blue-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.852l.708-2.836a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.852l.708-2.836a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.852l.708-2.836c.11-.447.5-.75.952-.75h.923l.169.117a3.75 3.75 0 0 0 1.157 1.057c.928.397 1.764.86 2.505 1.418.156.115.31.233.461.353a.925.925 0 0 0 .94-.029c.14-.124.27-.267.387-.425a.916.916 0 0 0 .195-.444c.036-.2.072-.401.072-.602v-1.086c0-.986-.17-1.9-.49-2.73a.75.75 0 0 0-.25-.333l-.226-.153a.75.75 0 0 1-.364-.672V8.5C21.468 7.373 20.266 6 18.25 6h-2.5a.75.75 0 0 0-.75.75v3.25c0 .248-.09.485-.257.653l-.261.261a.75.75 0 0 0-.279.52v.75Z" clipRule="evenodd" />
              </svg>
              Personal Information
            </h2>
            <div className="space-y-3">
              <p className="flex items-center text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 mr-2 text-gray-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25H4.5a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5H4.5A2.25 2.25 0 0 0 2.25 6.75m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L2.52 8.91A2.25 2.25 0 0 1 1.5 6.993V6.75" />
                </svg>
                Email: {userProfile.email}
              </p>
              <p className="flex items-center text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 mr-2 text-gray-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0-1.036.84-1.875 1.875-1.875h16.5c1.035 0 1.875.84 1.875 1.875v10.5a1.875 1.875 0 0 1-1.875 1.875H4.125A1.875 1.875 0 0 1 2.25 17.25V6.75Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 0 3 3m-3-3-3 3M12 18.75h.008v.008H12v-.008Z" />
                </svg>
                Phone: {userProfile.phone}
              </p>
            </div>
          </div>

          {/* Order History Section */}
          <div className="bg-white shadow rounded-lg p-6 md:p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 mr-2 text-blue-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.185 3.185M18.007 9.348l-3.185-3.185m0 0v-4.992m0 0h4.992" />
              </svg>
              Order History
            </h2>
            <div className="space-y-4">
              {orderHistory.map((order) => (
                <div key={order.orderId} className="border border-gray-200 rounded-md p-4">
                  <div className="flex items-center justify-between text-lg font-medium text-gray-900 mb-2">
                    <span className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 mr-2 text-gray-500"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 0a2.25 2.25 0 0 0 2.25 2.25h12.75a2.25 2.25 0 0 0 2.25-2.25M3.75 12m0-2.25a2.25 2.25 0 0 1 2.25-2.25h12.75a2.25 2.25 0 0 1 2.25 2.25M3.75 12m0 2.25a2.25 2.25 0 0 0 2.25 2.25h12.75a2.25 2.25 0 0 0 2.25-2.25" /></svg>
                      Order #{order.orderId}
                    </span>
                    <span className="flex items-center text-sm text-blue-600">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 mr-1"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" /></svg>
                      Service: {order.service}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-gray-700 text-sm">
                    <p className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 mr-1"><path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
                      Patient: {order.patient}
                    </p>
                    <p className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 mr-1"><path strokeLinecap="round" strokeLinejoin="round" d="m15.75 11.25.166.166a.75.75 0 0 1-.53 1.284H9.001a.75.75 0 0 1-.53-1.284l.166-.166M10.867 15.75L7.5 21V3m3.367 12.75L7.5 21m3.367-12.75 3.366 12.75m-3.366-12.75L12 21V3m3.367 12.75L16.5 21V3" /></svg>
                      Relative: {order.relative}
                    </p>
                    <p className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 mr-1"><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.852l.708-2.836a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.852l.708-2.836c.11-.447.5-.75.952-.75h.923l.169.117a3.75 3.75 0 0 0 1.157 1.057c.928.397 1.764.86 2.505 1.418.156.115.31.233.461.353a.925.925 0 0 0 .94-.029c.14-.124.27-.267.387-.425a.916.916 0 0 0 .195-.444c.036-.2.072-.401.072-.602v-1.086c0-.986-.17-1.9-.49-2.73a.75.75 0 0 0-.25-.333l-.226-.153a.75.75 0 0 1-.364-.672V8.5C21.468 7.373 20.266 6 18.25 6h-2.5a.75.75 0 0 0-.75.75v3.25c0 .248-.09.485-.257.653l-.261.261a.75.75 0 0 0-.279.52v.75Z" clipRule="evenodd" /></svg>
                      Status: <span className="font-semibold text-orange-500">{order.status}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
