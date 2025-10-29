import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronDown, Menu, X } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useAuth0 } from "@auth0/auth0-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import SafeIcon from "../../common/SafeIcon";
import * as FiIcons from "react-icons/fi";
import { subCommunities } from "../../data/communityList";
import { menuItems, adminOnly } from "../../data/menuList";
import ProductsDropdown from "./ProductsDropdown";

const { FiMenu, FiSearch, FiHelpCircle, FiBookOpen, FiBell } = FiIcons;

const Navigation = () => {
  const [openMenus, setOpenMenus] = useState([]);
  const [openRegions, setOpenRegions] = useState([]);
  
  const toggleMenu = (name) => {
    setOpenMenus((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const toggleRegion = (name) => {
    setOpenRegions((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const { user, logout, role, location: userLocation } = useAuthStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [seenAcknowledged, setSeenAcknowledged] = useState(false);

  const notifications = user?.notifications || [];
  const hasUnseen = notifications.some((n) => !n.seen);

  // Search states
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchSubmitted, setSearchSubmitted] = useState(false);
  const [postResults, setPostResults] = useState([]);

  const { logout: auth0logout, loginWithPopup } = useAuth0();
  const navigate = useNavigate();

  const location = useLocation();
  const isCommunityPage = location.pathname.startsWith("/community");

  const apiBaseUrl = import.meta.env.VITE_API_PORT || "http://localhost:5000";

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch posts when Enter is pressed
  useEffect(() => {
    if (!searchSubmitted || !searchTerm.trim()) return;
    async function fetchPosts() {
      try {
        const res = await fetch(
          `${apiBaseUrl}/api/search?q=${encodeURIComponent(searchTerm)}`
        );
        if (!res.ok) throw new Error("Failed to fetch posts");
        const data = await res.json();
        setPostResults(data.results || []);
      } catch (err) {
        console.error("Failed to search posts:", err);
        setPostResults([]);
      }
    }
    fetchPosts();
  }, [searchSubmitted, searchTerm, apiBaseUrl]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") setSearchSubmitted(true);
  };

  // Base search dataset
  const baseSearchData = [
    { name: "Mock Interviewer", type: "Free Tools", url: "/mock-interviewer" },
    { name: "Resume Builder", type: "Free Tools", url: "/resume-builder" },
    { name: "Resume Ranker", type: "Free Tools", url: "/resume-ranker" },
    { name: "Resume Analyzer", type: "Free Tools", url: "/resume-analyzer" },
    { name: "Profile", type: "User Profile", url: "/profile" },
    { name: "Settings", type: "Community", url: "/community/settings" },
    ...subCommunities.map((c) => {
      const regionMatch = c.title.match(/- (.*)$/);
      const region = regionMatch ? regionMatch[1] : "";
      const nameMatch = c.title.match(/^(.*?)\s*-/);
      const name = nameMatch ? nameMatch[1].trim() : c.title;

      return {
        name,
        type: region ? `Community (${region})` : "Community",
        url: c.path,
      };
    }),
  ];

  const filteredResults = baseSearchData.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter menu based on role and location (like Sidebar)
  const filteredMenu =
    role === "admin"
      ? menuItems
      : menuItems.filter((item) => !adminOnly.includes(item.name));

  const filteredCommunity = filteredMenu.map((item) => {
    if (item.name === "Community") {
      return {
        ...item,
        children: item.children?.filter(
          (child) => !child.region || child.region === userLocation
        ),
      };
    }
    return item;
  });

  const communityNavItems = [
    { label: "Jobs with Referrals", href: "/community/introductions" },
    { label: "Success Stories", href: "/#stories" },
    // { label: "Blogs", href: "/blogs" },
  ];

  const defaultNavItems = [
    { label: "How It Works", href: "/#how-it-works" },
    { label: "Categories", href: "/#categories" },
    { label: "Success Stories", href: "/#stories" },
    // { label: "Blogs", href: "/blogs" },
  ];

  const renderMobileMenu = (menu) =>
    menu.map((item) => {
      // Skip submenu items that don't have children
      if (item.isSubmenu && (!item.children || item.children.length === 0)) {
        return null;
      }

      return (
        <div key={item.name}>
          {/* Top-level menu with icon and collapse arrow */}
          <button
            className="flex items-center justify-between w-full px-4 py-3 font-medium text-gray-100 hover:bg-gray-800"
            onClick={() => {
              if (item.isSubmenu && item.children && item.children.length) {
                toggleMenu(item.name);
              } else if (item.path) {
                setMenuOpen(false);
                navigate(item.path);
              }
            }}
          >
            <span className="flex items-center gap-2">
              <SafeIcon icon={item.icon} className="w-5 h-5" />
              {item.name}
            </span>
            {item.isSubmenu && item.children && item.children.length > 0 && (
              <ChevronDown
                className={`w-5 h-5 transform transition-transform ${
                  openMenus.includes(item.name) ? "rotate-180" : ""
                }`}
              />
            )}
          </button>

          {/* Nested regions/groups */}
          {item.isSubmenu && item.children && item.children.length > 0 && openMenus.includes(item.name) && (
            <div>
              {item.children.map((region) => (
                <div key={region.name}>
                  <button
                    onClick={() => {
                      if (region.children && region.children.length) {
                        toggleRegion(region.name);
                      } else if (region.path) {
                        setMenuOpen(false);
                        navigate(region.path);
                      }
                    }}
                    className="flex items-center justify-between w-full pl-8 pr-4 py-2 text-gray-200 font-semibold hover:bg-gray-800"
                  >
                    {region.name}
                    {region.children && region.children.length > 0 && (
                      <ChevronDown
                        className={`w-4 h-4 transform transition-transform ${
                          openRegions.includes(region.name) ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </button>
                  {/* Final children */}
                  {region.children && region.children.length > 0 && openRegions.includes(region.name) && (
                    <div>
                      {region.children.map((sub) => (
                        <button
                          key={sub.name}
                          onClick={() => {
                            setMenuOpen(false);
                            navigate(sub.path);
                          }}
                          className="block w-full text-left pl-14 pr-4 py-2 text-gray-300 hover:bg-gray-700"
                        >
                          {sub.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    });

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[1000] transition-all duration-300 ${
        isScrolled
          ? "bg-black/95 backdrop-blur-md border-b border-gray-800/50 shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="w-full mx-auto px-4">
        <div className="flex items-center h-16">
          {/* Logo + Nav links */}
          <div className="flex items-center gap-10">
            {/* Logo */}
            <a
              href="/"
              className="flex items-center gap-3 transition-all duration-300"
            >
              <img
                src="/logo.jpg"
                alt="JobReferral.Club Logo"
                className="w-12 h-12 object-contain rounded-full"
              />
              <div className="font-bold text-xl text-white whitespace-nowrap">
                JobReferral<span className="text-primary-green">.Club</span>
              </div>
            </a>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center space-x-8">
              {/* Left Nav Items */}
              {(!isCommunityPage
                ? defaultNavItems.slice(0, 2)
                : communityNavItems.slice(0, 1)
              ).map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  onClick={(e) => {
                    if (
                      item.href.startsWith("/#") &&
                      window.location.pathname === "/"
                    ) {
                      e.preventDefault();
                      document
                        .querySelector(item.href.replace("/", ""))
                        ?.scrollIntoView({ behavior: "smooth" });
                    } else {
                      window.location.href = item.href;
                    }
                  }}
                  className="text-gray-300 hover:text-primary-green transition-all duration-300 font-medium relative group whitespace-nowrap"
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-green transition-all duration-300 group-hover:w-full"></span>
                </a>
              ))}

              {/* Updated Products Dropdown */}
              <ProductsDropdown menuOpenSetter={setMenuOpen} />

              {/* Right Nav Items */}
              {(!isCommunityPage
                ? defaultNavItems.slice(2)
                : communityNavItems.slice(1)
              ).map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  onClick={(e) => {
                    if (
                      item.href.startsWith("/#") &&
                      window.location.pathname === "/"
                    ) {
                      e.preventDefault();
                      document
                        .querySelector(item.href.replace("/", ""))
                        ?.scrollIntoView({ behavior: "smooth" });
                    } else {
                      window.location.href = item.href;
                    }
                  }}
                  className="text-gray-300 hover:text-primary-green transition-all duration-300 font-medium relative group whitespace-nowrap"
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-green transition-all duration-300 group-hover:w-full"></span>
                </a>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-md mx-6 relative">
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
                setSearchSubmitted(false);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search community, tools, users..."
              className="pl-10 pr-4 py-2 w-full rounded-lg border border-zinc-800 bg-zinc-900 text-gray-300 placeholder-gray-500 focus:ring-2 focus:ring-[#79e708] focus:border-transparent transition-all"
            />

            {/* Search Results */}
            {showSearchResults && searchTerm && (
              <>
                <div
                  className="fixed inset-0 bg-black/50 z-10"
                  onClick={() => {
                    setShowSearchResults(false);
                    setSearchSubmitted(false);
                  }}
                />
                <div className="absolute mt-12 w-full bg-zinc-900 border border-zinc-800 rounded-lg shadow-lg z-20 max-h-96 overflow-y-auto">
                  {!searchSubmitted ? (
                    <button
                      type="button"
                      onClick={() => setSearchSubmitted(true)}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
                    >
                      Search for:{" "}
                      <span className="font-medium">{searchTerm}</span>{" "}
                      <span className="text-gray-500">(Press Enter)</span>
                    </button>
                  ) : filteredResults.length > 0 || postResults.length > 0 ? (
                    <>
                      {/* Local results */}
                      {filteredResults.slice(0, 5).map((item, index) => (
                        <button
                          key={`local-${index}`}
                          type="button"
                          onClick={() => {
                            navigate(item.url);
                            setSearchTerm("");
                            setShowSearchResults(false);
                            setSearchSubmitted(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
                        >
                          {item.name}{" "}
                          <span className="text-green-500">in {item.type}</span>
                        </button>
                      ))}

                      {/* Post results */}
                      {postResults.slice(0, 5).map((post) => {
                        const matchedCommunity = subCommunities.find((c) =>
                          c.title
                            .toLowerCase()
                            .includes(post.community.toLowerCase())
                        );
                        const communityPath = matchedCommunity
                          ? matchedCommunity.path
                          : "/general";
                        const customUrl = `${communityPath}?postid=${post.id}`;
                        return (
                          <button
                            key={post.id}
                            type="button"
                            onClick={() => {
                              navigate(customUrl);
                              setSearchTerm("");
                              setShowSearchResults(false);
                              setSearchSubmitted(false);
                            }}
                            className="w-full text-left p-3 flex items-start gap-3 hover:bg-gray-800 transition-colors border-b border-zinc-800"
                          >
                            <img
                              src={post.author?.avatar || "/default-avatar.png"}
                              alt={post.author?.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-gray-200">
                                  {post.author?.name}
                                </span>
                                <span className="text-xs text-gray-500">
                                  · {post.community}
                                </span>
                              </div>
                              <p className="text-sm text-gray-400 line-clamp-1">
                                {post.snippet}
                              </p>
                            </div>
                            <span className="text-xs text-blue-400 font-medium">
                              Post
                            </span>
                          </button>
                        );
                      })}
                    </>
                  ) : (
                    <p className="px-4 py-2 text-sm text-gray-500">
                      No results found
                    </p>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Right Section: Ask + Guidelines + Notifications */}
          <div className="hidden lg:flex items-center gap-4 relative">
            {/* Notifications */}
            <div className="relative group">
              <button
                onClick={async () => {
                  setNotificationsOpen((prev) => !prev);

                  if (!notificationsOpen && hasUnseen) {
                    setSeenAcknowledged(true);
                    try {
                      await fetch(`${apiBaseUrl}/api/notifications/mark-seen`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ userId: user._id }),
                      });
                    } catch (err) {
                      console.error(
                        "Failed to mark notifications as seen:",
                        err
                      );
                    }
                  }
                }}
                className="p-2 rounded-lg hover:bg-zinc-900 transition-colors relative"
              >
                <SafeIcon icon={FiBell} className="w-5 h-5 text-[#79e708]" />
                {hasUnseen && !seenAcknowledged && (
                  <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                )}
              </button>

              {/* Tooltip */}
              <span
                className={`absolute -bottom-6 left-1/2 -translate-x-1/2 bg-gray-800 text-gray-200 text-xs rounded px-2 py-1 transition-opacity pointer-events-none ${
                  !notificationsOpen ? "opacity-0 group-hover:opacity-100" : "opacity-0"
                }`}
              >
                Notifications
              </span>

              {/* Dropdown */}
              <AnimatePresence>
                {notificationsOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setNotificationsOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-80 max-h-96 bg-zinc-900 border border-zinc-800 rounded-lg shadow-lg z-20 overflow-y-auto"
                    >
                      {notifications.length > 0 ? (
                        [...notifications]
                          .sort(
                            (a, b) =>
                              new Date(b.createdAt) - new Date(a.createdAt)
                          )
                          .map((n) => (
                            <button
                              key={n.id}
                              onClick={() => {
                                navigate(n.link);
                                setNotificationsOpen(false);
                              }}
                              className={`flex items-start w-full text-left px-4 py-3 transition-colors border-b border-zinc-800 ${
                                !n.seen
                                  ? "bg-zinc-800 font-semibold"
                                  : "hover:bg-gray-800"
                              }`}
                            >
                              {!n.seen && (
                                <span className="w-2 h-2 mt-1 mr-2 bg-red-500 rounded-full animate-pulse flex-shrink-0" />
                              )}
                              <div className="flex-1">
                                <p
                                  className={`text-gray-200 ${
                                    !n.seen ? "text-green-400" : ""
                                  }`}
                                >
                                  {n.title}
                                </p>
                                {n.description && (
                                  <p
                                    className={`text-sm ${
                                      !n.seen
                                        ? "text-green-300"
                                        : "text-gray-400"
                                    }`}
                                  >
                                    {n.description}
                                  </p>
                                )}
                              </div>
                            </button>
                          ))
                      ) : (
                        <p className="px-4 py-3 text-sm text-gray-500 text-center">
                          No notifications to show
                        </p>
                      )}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Ask the Community */}
            <div className="relative group">
              <button
                onClick={() => navigate("/community/ask-the-community")}
                className="p-2 rounded-lg hover:bg-zinc-900 transition-colors flex items-center space-x-2"
              >
                <SafeIcon
                  icon={FiHelpCircle}
                  className="w-5 h-5 text-[#79e708]"
                />
              </button>

              {/* Tooltip */}
              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-gray-800 text-gray-200 text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                Ask the Community
              </span>
            </div>

            {/* Announcements */}
            <div className="relative group">
              <button
                onClick={() => navigate("/community/announcements")}
                className="p-2 rounded-lg hover:bg-zinc-900 transition-colors flex items-center space-x-2"
              >
                <SafeIcon
                  icon={FiIcons.FiVolume2}
                  className="w-5 h-5 text-[#79e708]"
                />
              </button>

              {/* Tooltip */}
              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-gray-800 text-gray-200 text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                Announcements
              </span>
            </div>
          </div>

          {/* CTA + Mobile Menu */}
          <div className="flex items-center gap-4 ml-auto">
            <div className="hidden lg:block">
              {user ? (
                <div
                  className="relative flex items-center gap-2 cursor-pointer"
                  onMouseEnter={() => setProfileOpen(true)}
                  onMouseLeave={() => setProfileOpen(false)}
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-10 h-10 rounded-full border-2 border-primary-green"
                  />
                  <span className="text-gray-300 font-medium">{user.name}</span>
                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 top-0 mt-12 bg-black border border-gray-800 w-48 shadow-lg z-50 rounded-lg overflow-hidden"
                      >
                        {!isCommunityPage && (
                          <a
                            href="/community"
                            className="block px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-primary-green transition-colors duration-300"
                          >
                            Continue to Community
                          </a>
                        )}
                        <a
                          href="/profile"
                          className="block px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-primary-green transition-colors duration-300"
                        >
                          My Profile
                        </a>
                        <button
                          onClick={() => {
                            logout();
                            auth0logout({ returnTo: "/" });
                          }}
                          className="w-full text-left px-4 py-2 text-red-400 hover:bg-gray-800 hover:text-red-500 transition-colors duration-300"
                        >
                          Log Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Button
                  onClick={loginWithPopup}
                  className="btn-primary group transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary-green/20 whitespace-nowrap"
                >
                  Community Sign In / Up
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <div className="lg:hidden">
              {/* Overlay */}
              {menuOpen && (
                <div
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                  onClick={() => setMenuOpen(false)}
                />
              )}

              {/* Side Menu */}
              <motion.div
                initial={false}
                animate={{ x: menuOpen ? 0 : "100%" }}
                transition={{ type: "tween", duration: 0.3 }}
                className="fixed top-0 right-0 h-full w-80 bg-black border-l border-gray-800 shadow-2xl z-50 overflow-y-auto"
              >
                {/* Menu Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-800">
                  <div className="flex items-center gap-3">
                    <img
                      src="/logo.jpg"
                      alt="JobReferral.Club"
                      className="w-10 h-10 rounded-full object-contain"
                    />
                    <div className="font-bold text-lg text-white">
                      JobReferral<span className="text-primary-green">.Club</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setMenuOpen(false)}
                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>
                </div>

                {/* User Profile Section */}
                {user && (
                  <div className="p-4 border-b border-gray-800">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-12 h-12 rounded-full border-2 border-primary-green"
                      />
                      <div>
                        <p className="text-white font-semibold">{user.name}</p>
                        <p className="text-gray-400 text-sm">{user.email}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* DYNAMIC COLLAPSIBLE MENU */}
                <div className="p-2">
                  {renderMobileMenu(filteredCommunity)}
                </div>

                {/* Divider */}
                <hr className="border-t border-zinc-800 my-2" />

                {/* USER PROFILE & QUICK LINKS */}
                <div className="py-2">
                  {user ? (
                    <>
                      {!isCommunityPage && (
                        <button
                          onClick={() => {
                            setMenuOpen(false);
                            navigate("/community");
                          }}
                          className="w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-primary-green transition-colors flex items-center gap-3"
                        >
                          <SafeIcon icon={FiIcons.FiUsers} className="w-5 h-5" />
                          <span>Continue to Community</span>
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          navigate("/profile");
                        }}
                        className="w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-primary-green transition-colors flex items-center gap-3"
                      >
                        <SafeIcon icon={FiIcons.FiUser} className="w-5 h-5" />
                        <span>My Profile</span>
                      </button>

                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          navigate("/community/ask-the-community");
                        }}
                        className="w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-primary-green transition-colors flex items-center gap-3"
                      >
                        <SafeIcon icon={FiHelpCircle} className="w-5 h-5" />
                        <span>Ask the Community</span>
                      </button>

                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          navigate("/community/announcements");
                        }}
                        className="w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-primary-green transition-colors flex items-center gap-3"
                      >
                        <SafeIcon icon={FiIcons.FiVolume2} className="w-5 h-5" />
                        <span>Announcements</span>
                      </button>

                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          navigate("/community/notifications");
                        }}
                        className="w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-primary-green transition-colors flex items-center gap-3"
                      >
                        <SafeIcon icon={FiBell} className="w-5 h-5" />
                        <span>Notifications</span>
                        {hasUnseen && (
                          <span className="ml-auto inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        )}
                      </button>

                      <hr className="border-t border-zinc-800 my-2" />

                      <button
                        onClick={() => {
                          logout();
                          auth0logout({ returnTo: "/" });
                          setMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 text-red-400 hover:bg-gray-800 hover:text-red-500 transition-colors flex items-center gap-3"
                      >
                        <SafeIcon icon={FiIcons.FiLogOut} className="w-5 h-5" />
                        <span>Log Out</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        loginWithPopup();
                        setMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 text-primary-green hover:bg-gray-800 transition-colors flex items-center gap-3 font-semibold"
                    >
                      <SafeIcon icon={FiIcons.FiLogIn} className="w-5 h-5" />
                      <span>Community Sign In / Up</span>
                    </button>
                  )}
                </div>
              </motion.div>

              {/* Hamburger Icon */}
              <button
                onClick={() => setMenuOpen(true)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <Menu className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;