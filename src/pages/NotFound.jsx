import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft, Search } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Animated 404 */}
        <div className="mb-8 relative">
          <h1 className="text-9xl font-extrabold text-gray-200 select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 bg-blue-500 rounded-full opacity-20 animate-ping"></div>
          </div>
        </div>

        {/* Main Message */}
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
          Page Not Found
        </h2>
        <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
          Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or never existed.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:border-gray-400 hover:shadow-md transition-all duration-200"
          >
            <ArrowLeft size={20} />
            Go Back
          </button>

          <a
            href="/"
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 hover:shadow-lg transition-all duration-200"
          >
            <Home size={20} />
            Back to Home
          </a>
        </div>

        {/* Helpful Links */}
        <div className="pt-8 border-t border-gray-200 max-w-md mx-auto">
          <p className="text-sm text-gray-500 mb-4">Here are some helpful links:</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <a href="/" className="text-blue-600 hover:text-blue-800 hover:underline">
              Home
            </a>
            <a href="/about" className="text-blue-600 hover:text-blue-800 hover:underline">
              About
            </a>
            <a href="/contact" className="text-blue-600 hover:text-blue-800 hover:underline">
              Contact
            </a>
            <a href="/help" className="text-blue-600 hover:text-blue-800 hover:underline">
              Help Center
            </a>
          </div>
        </div>

        {/* Error Path Display */}
        {location.pathname !== "/" && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <p className="text-xs text-gray-500 font-mono break-all">
              Requested path: {location.pathname}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotFound;