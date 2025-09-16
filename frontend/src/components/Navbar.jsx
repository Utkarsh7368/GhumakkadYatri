import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X, Sun, Moon, User, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showAdminDropdown, setShowAdminDropdown] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    const handleClickOutside = (event) => {
      if (showAdminDropdown && !event.target.closest('.admin-dropdown')) {
        setShowAdminDropdown(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    document.addEventListener('click', handleClickOutside);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showAdminDropdown]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Packages', path: '/packages' },
    { name: 'My Bookings', path: '/my-bookings', authRequired: true },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-2xl font-bold text-primary-600 dark:text-primary-400"
            >
              🏔️ Ghumakkad Yatri
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems
              .filter(item => !item.authRequired || user)
              .map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`relative px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                  location.pathname === item.path
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'
                }`}
              >
                {item.name}
                {location.pathname === item.path && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 dark:bg-primary-400"
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Right side buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Dark mode toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* User menu */}
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-700 dark:text-gray-300 hidden sm:block">
                  Hi, {user.name}
                </span>
                
                {user.role === 'admin' && (
                  <div className="relative admin-dropdown">
                    <button
                      onClick={() => setShowAdminDropdown(!showAdminDropdown)}
                      className="flex items-center space-x-1 bg-blue-100 text-blue-800 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
                    >
                      <span>Admin</span>
                      <ChevronDown size={14} className={`transition-transform ${showAdminDropdown ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {showAdminDropdown && (
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 py-1 z-50">
                        <Link
                          to="/admin"
                          onClick={() => setShowAdminDropdown(false)}
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          Dashboard
                        </Link>
                        <Link
                          to="/admin/bookings"
                          onClick={() => setShowAdminDropdown(false)}
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          Manage Bookings
                        </Link>
                      </div>
                    )}
                  </div>
                )}
                
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login" className="btn-secondary text-sm">
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{
          opacity: isOpen ? 1 : 0,
          height: isOpen ? 'auto' : 0,
        }}
        className="md:hidden bg-white dark:bg-gray-900 border-t dark:border-gray-800 overflow-hidden"
      >
        <div className="px-4 py-2 space-y-1">
          {navItems
            .filter(item => !item.authRequired || user)
            .map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-2 rounded-lg text-base font-medium transition-colors ${
                location.pathname === item.path
                  ? 'text-primary-600 bg-primary-50 dark:text-primary-400 dark:bg-primary-900/20'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              {item.name}
            </Link>
          ))}
          
          <div className="pt-4 border-t dark:border-gray-800">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="flex items-center space-x-2 w-full px-3 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
            
            {user ? (
              <div className="space-y-1">
                <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                  Signed in as {user.name}
                </div>
                {user.role === 'admin' && (
                  <>
                    <Link
                      to="/admin"
                      onClick={() => setIsOpen(false)}
                      className="block px-3 py-2 text-primary-600 dark:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
                    >
                      Admin Panel
                    </Link>
                    <Link
                      to="/admin/bookings"
                      onClick={() => setIsOpen(false)}
                      className="block px-3 py-2 text-primary-600 dark:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
                    >
                      Manage Bookings
                    </Link>
                  </>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 w-full px-3 py-2 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                >
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 text-primary-600 dark:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.nav>
  );
};

export default Navbar;