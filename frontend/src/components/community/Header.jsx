import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import SafeIcon from "../../common/SafeIcon";
import * as FiIcons from "react-icons/fi";
import { useAuthStore } from "../../store/authStore";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { searchData } from "../../data/searchList";

const { FiMenu, FiBell, FiSearch, FiAward, FiLogOut, FiUser } = FiIcons;

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuthStore();
  const { logout: auth0logout } = useAuth0();
  const navigate = useNavigate();

  const apiBaseUrl = import.meta.env.VITE_API_PORT || "http://localhost:5000";

  const [points, setPoints] = useState(user?.points || 0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);

  const [notifications, setNotifications] = useState([
    { id: 1, message: "Add your resume", read: false, action: () => navigate("/profile") },
    { id: 2, message: "Update your profile", read: false, action: () => navigate("/community/settings") },
  ]);


  const filteredResults = searchData.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (!user?._id) return;

    fetch(`${apiBaseUrl}/api/users/${user._id}/gamification`)
      .then((res) => res.json())
      .then((data) => {
        setPoints(data.totalPoints);
      })
      .catch((err) => {
        console.error("Failed to fetch gamification points:", err);
      });
  }, [user?._id]);

  const handleNotificationClick = (id, action) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    action();
    setShowNotifications(false);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-black border-b border-zinc-800 px-6 py-4 shadow-md transition-all duration-200"
    >
      <div className="flex items-center justify-between gap-4">
        {/* Left side */}
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-900 transition-colors"
          >
            <SafeIcon icon={FiMenu} className="w-5 h-5 text-gray-300" />
          </button>

          {/* Search bar with dropdown */}
          <div className="relative hidden md:block flex-1">
            <SafeIcon
              icon={FiSearch}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowSearchResults(true);
              }}
              placeholder="Search community, tools..."
              className="pl-10 pr-4 py-2 w-full rounded-s rounded-e border border-zinc-800 bg-zinc-900 text-gray-300 placeholder-gray-500 focus:ring-2 focus:ring-[#79e708] focus:border-transparent transition-all"
            />

            {/* Dropdown results */}
            {showSearchResults && searchTerm && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 bg-black/50 z-10"
                  onClick={() => setShowSearchResults(false)}
                />

                {/* Dropdown results */}
                <div className="absolute mt-1 w-full bg-zinc-900 border border-zinc-800 rounded-lg shadow-lg z-20 max-h-96 overflow-y-auto">
                  {filteredResults.length > 0 ? (
                    filteredResults.slice(0, 10).map((item, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          navigate(item.url);
                          setSearchTerm("");
                          setShowSearchResults(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
                      >
                        {item.name}{" "}
                        <span className="text-green-500">in {item.type}</span>
                      </button>
                    ))
                  ) : (
                    <p className="px-4 py-2 text-sm text-gray-500">No results found</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Points */}
          <div className="hidden sm:flex items-center space-x-2 bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">
            <SafeIcon icon={FiAward} className="w-4 h-4 text-[#79e708]" />
            <span className="text-sm font-medium text-gray-300">{points} pts</span>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg hover:bg-gray-900 transition-colors"
            >
              <SafeIcon icon={FiBell} className="w-5 h-5 text-gray-300" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-64 bg-zinc-900 border border-zinc-800 rounded-lg shadow-lg z-20">
                <div className="p-2">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => handleNotificationClick(n.id, n.action)}
                        className={`w-full text-left px-4 py-2 text-sm rounded-md ${n.read
                          ? "text-gray-500 hover:bg-gray-800"
                          : "text-gray-300 hover:bg-gray-700 font-medium"
                          }`}
                      >
                        {n.message}
                      </button>
                    ))
                  ) : (
                    <p className="px-4 py-2 text-sm text-gray-500">
                      No new notifications
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative group">
            <div className="flex items-center space-x-3 cursor-pointer">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-[#79e708]/40"
              />
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-300">{user.name}</p>
              </div>
            </div>

            <div className="absolute right-0 top-6 w-40 bg-zinc-900 border border-zinc-800 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 group-hover:translate-y-1 transform transition-all z-20 pointer-events-none group-hover:pointer-events-auto">
              <button
                onClick={() => {
                  navigate("/profile");
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2"
              >
                <SafeIcon icon={FiUser} className="w-4 h-4 text-gray-400" />
                My Profile
              </button>
              <button
                onClick={() => {
                  logout();
                  auth0logout({ returnTo: "/" });
                  navigate("/");
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2"
              >
                <SafeIcon icon={FiLogOut} className="w-4 h-4 text-gray-400" />
                Log out
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
