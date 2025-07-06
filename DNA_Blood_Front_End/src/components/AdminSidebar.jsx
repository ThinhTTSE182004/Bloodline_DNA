import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaTachometerAlt, FaUserPlus, FaUserMd, FaCalendarAlt, FaListAlt, FaUsersCog, FaClipboardList, FaBoxOpen, FaEye, FaShoppingCart, FaChevronDown, FaChevronUp, FaBars, FaTimes } from 'react-icons/fa';
import { Card, CardHeader, CardContent } from './ui';
import { Avatar, AvatarImage } from './ui';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui';

// Sidebar Component
const Sidebar = ({ width = "270px", children, isOpen, onClose }) => {
  return (
    <>
      {/* Blurred Backdrop */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto backdrop-blur-sm' : 'opacity-0 pointer-events-none'}`}
        style={{ background: isOpen ? 'rgba(30, 41, 59, 0.15)' : 'transparent', backdropFilter: isOpen ? 'blur(6px)' : 'none' }}
        onClick={onClose}
        aria-hidden={!isOpen}
      />
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full z-50 transition-transform duration-300 ease-in-out transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ width, willChange: 'transform' }}
      >
        <Card className="h-full w-full flex flex-col shadow-2xl rounded-r-2xl border-0 bg-white relative">
          {/* Close button (mobile) */}
          <button className="absolute top-4 right-4 text-gray-500 text-2xl md:hidden z-10 hover:text-blue-600 transition" onClick={onClose}>
            <span className="sr-only">Close sidebar</span>
            <FaTimes />
          </button>
          {children}
        </Card>
      </aside>
    </>
  );
};

// Menu Component
const Menu = ({ subHeading, children }) => {
  return (
    <div className="mb-2">
      <div className="px-6 pt-4 pb-1 text-xs font-semibold text-slate-400 tracking-widest uppercase">
        {subHeading}
      </div>
      <nav className="flex flex-col gap-1">
        {children}
      </nav>
    </div>
  );
};

// MenuItem Component
const MenuItem = ({ link, children, target, badge, icon, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === link;
  
  const content = (
    <div className={`flex items-center gap-3 px-6 py-2 rounded-lg text-base font-medium transition-all duration-200 hover:bg-slate-100 hover:text-blue-700 focus:bg-slate-200 focus:text-blue-700 outline-none ${isActive ? 'bg-slate-100 text-blue-700 font-semibold shadow' : 'text-slate-700'}`}>
      {icon && <span className="text-lg">{icon}</span>}
      <span className="flex-1">{children}</span>
      {badge && (
        <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
          New
        </span>
      )}
    </div>
  );

  if (link) {
    return (
      <Link to={link} target={target} onClick={onClick}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className="w-full text-left">
      {content}
    </button>
  );
};

// Submenu Component
const Submenu = ({ title, children, icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-6 py-2 rounded-lg text-base font-medium transition-all duration-200 hover:bg-slate-100 hover:text-blue-700 focus:bg-slate-200 focus:text-blue-700 outline-none text-slate-700 w-full text-left"
      >
        {icon && <span className="text-lg">{icon}</span>}
        <span className="flex-1">{title}</span>
        {isOpen ? <FaChevronUp className="text-sm" /> : <FaChevronDown className="text-sm" />}
      </button>
      {isOpen && (
        <div className="ml-6 border-l border-slate-200">
          {children}
        </div>
      )}
    </div>
  );
};

const AdminSidebar = ({ isOpen, onClose }) => {
  return (
    <Sidebar width="270px" isOpen={isOpen} onClose={onClose}>
      <CardContent className="flex-1 flex flex-col overflow-y-auto px-0 pt-2 pb-6">
        <Menu subHeading="HOME">
          <MenuItem link="/admin" icon={<FaTachometerAlt />}>
            Dashboard
          </MenuItem>
        </Menu>
        <Menu subHeading="MANAGEMENT">
          <MenuItem link="/admin/register-staff" icon={<FaUserPlus />}>
            Register Staff
          </MenuItem>
          <MenuItem link="/admin/register-medical-staff" icon={<FaUserMd />}>
            Register Medical Staff
          </MenuItem>
          <MenuItem link="/admin/staff-management" icon={<FaUsersCog />}>
            Staff Management
          </MenuItem>
          <MenuItem link="/admin/all-orders" icon={<FaShoppingCart />}>
            All Orders
          </MenuItem>
          <Submenu title="Work Shifts" icon={<FaCalendarAlt />}>
            <MenuItem link="/admin/create-workshift" icon={<FaCalendarAlt />}>
              Create Work Shift
            </MenuItem>
            <MenuItem link="/admin/workshift-list" icon={<FaListAlt />}>
              Work Shift List
            </MenuItem>
            <MenuItem link="/admin/work-assignment" icon={<FaClipboardList />}>
              Work Assignment
            </MenuItem>
          </Submenu>
          <MenuItem link="/admin/services" icon={<FaBoxOpen />}>
            Service Management
          </MenuItem>
        </Menu>
        <Menu subHeading="OTHERS">
          <MenuItem link="/" icon={<FaEye />} target="_blank">
            View Customer Site
          </MenuItem>
        </Menu>
      </CardContent>
    </Sidebar>
  );
};

export default AdminSidebar; 