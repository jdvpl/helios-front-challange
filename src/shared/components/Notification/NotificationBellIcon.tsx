'use client';
import React from 'react';

interface NotificationBellIconProps {
  onClick: () => void;
  unreadCount: number; 
}

const NotificationBellIcon: React.FC<NotificationBellIconProps> = ({ onClick, unreadCount }) => {
  return (
    <button
      onClick={onClick}
      className="relative p-2 rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
      aria-label="View notifications"
    >
      <svg className="h-6 w-6 text-gray-300 group-hover:text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
      </svg>
      {unreadCount > 0 && (
        <span className="absolute top-0 right-0 block h-5 w-5 transform -translate-y-1 translate-x-1">
          <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 animate-ping"></span>
          <span className="relative inline-flex rounded-full h-5 w-5 bg-red-600 text-white text-xs font-semibold items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        </span>
      )}
    </button>
  );
};

export default NotificationBellIcon;