import React from 'react';
import { Link } from 'react-router-dom';
import { HomeIcon } from '@heroicons/react/24/outline';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="text-6xl font-extrabold text-orange-500 mb-4">404</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Page not found</h1>
        <p className="text-lg text-gray-600 mb-8">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <Link
          to="/"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
        >
          <HomeIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound; 
