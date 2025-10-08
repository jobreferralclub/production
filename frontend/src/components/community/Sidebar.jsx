import React from "react";
import { NavLink, useLocation } from "react-router-dom";
// Removed framer-motion import
import SafeIcon from "../../common/SafeIcon";
import * as FiIcons from "react-icons/fi";
import { useAuthStore } from "../../store/authStore";
import { menuItems, adminOnly } from "../../data/menuList";

const { FiSettings, FiChevronLeft } = FiIcons;

const Sidebar = ({ open, setOpen }) => {
  const location = useLocation();
  const role = useAuthStore((state) => state.role);
  const currentLocation = useAuthStore((state) => state.location);

  // ✅ Always open all submenus
  const allSubMenus = menuItems.filter((item) => item.isSubmenu).map((i) => i.name);
  const [openSubMenus] = React.useState(allSubMenus);

  // ✅ Always open all regions
  const allRegions = menuItems
    .filter((item) => item.children)
    .flatMap((item) => item.children.map((c) => c.name));
  const [openRegions] = React.useState(allRegions);

  // 🔹 Keep your filtering logic intact
  const filteredMenu =
    role === "admin"
      ? menuItems
      : menuItems.filter((item) => !adminOnly.includes(item.name));

  const filteredCommunity = filteredMenu.map((item) => {
    if (item.name === "Community") {
      return {
        ...item,
        children: item.children.filter(
          (child) => !child.region || child.region === currentLocation
        ),
      };
    }
    return item;
  });

  const activeClass = "text-[#79e708]";

  const isSubMenuActive = (item) => {
    if (!item.children) return false;
    const allPaths = item.children.flatMap((region) =>
      region.children ? region.children.map((sub) => sub.path) : []
    );
    return allPaths.some((p) => location.pathname.startsWith(p));
  };

  const isRegionActive = (region) => {
    if (!region.children) return false;
    return region.children.some((sub) =>
      location.pathname.startsWith(sub.path)
    );
  };

  const renderMenuItem = (item) => {
    if (item.isSubmenu) {
      return (
        <button
          // ⚡ handler still here for animation but state never changes
          onClick={() => { }}
          className={`w-full flex items-center justify-between px-3 py-3 transition-all duration-200 relative ${isSubMenuActive(item)
            ? "text-[#79e708]"
            : "text-white hover:text-[#79e708]"
            }`}
        >
          <div className="flex items-center space-x-3">
            <SafeIcon
              icon={item.icon}
              className={`w-5 h-5 flex-shrink-0 ${isSubMenuActive(item) ? "text-[#79e708]" : "text-white"
                }`}
            />
            {open && (
              <>
                <span
                  className={`font-medium ${isSubMenuActive(item) ? "text-[#79e708]" : "text-white"
                    }`}
                >
                  {item.name}
                </span>
                <span
                  className={`absolute bottom-1 left-0 h-[2px] bg-[#79e708] transition-all duration-500 ${isSubMenuActive(item) ? "w-full" : "w-0 hover:w-full"
                    }`}
                />
              </>
            )}
          </div>
          {open && (
            <SafeIcon
              icon={FiChevronLeft}
              className={`w-4 h-4 transition-transform ${openSubMenus.includes(item.name) ? "rotate-90" : ""
                } ${isSubMenuActive(item) ? "text-[#79e708]" : "text-white"
                }`}
            />
          )}
        </button>
      );
    }

    return (
      <NavLink
        to={item.path}
        className={({ isActive }) =>
          `group flex items-center justify-between px-3 py-3 rounded-lg transition-all duration-200 relative ${isActive ? activeClass : "text-white hover:text-[#79e708]"
          }`
        }
      >
        {({ isActive }) => (
          <div className="flex items-center space-x-3">
            <SafeIcon
              icon={item.icon}
              className="w-5 h-5 flex-shrink-0 text-white"
            />
            {open && (
              <>
                <span
                  className={`font-medium ${isActive ? "text-[#79e708]" : "text-white"
                    }`}
                >
                  {item.name}
                </span>
                <span
                  className={`absolute bottom-1 left-0 h-[2px] bg-[#79e708] transition-all duration-500 w-0 group-hover:w-full ${location.pathname.startsWith(item.path) ? "w-full" : ""
                    }`}
                />
              </>
            )}
          </div>
        )}
      </NavLink>
    );
  };

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden ${open ? "block" : "hidden"
          }`}
        onClick={() => setOpen(false)}
      />

      {/* Sidebar itself */}
      <div
        className={`fixed md:static top-0 left-0 h-full z-50 ${open ? "w-72" : "w-20 md:w-20"
          } bg-black border-e border-gray-600 transition-all duration-500 ease-in-out flex flex-col`}
        style={{ transform: open ? "translateX(0)" : "translateX(-300px)" }}
      >
        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {filteredCommunity.map((item) => (
            <div key={item.name}>
              {renderMenuItem(item)}
              {item.children && openSubMenus.includes(item.name) && open && (
                <div className="ml-6 mt-1 space-y-1">
                  {item.children.map((region) => (
                    <div key={region.name}>
                      <button
                        onClick={() => { }}
                        className={`group flex items-center justify-between w-full px-3 py-2 text-sm rounded-lg transition-all duration-200 relative ${isRegionActive(region)
                          ? "text-[#79e708]"
                          : "text-white hover:text-[#79e708]"
                          }`}
                      >
                        {region.name}
                        <SafeIcon
                          icon={FiChevronLeft}
                          className={`w-4 h-4 transition-transform ${openRegions.includes(region.name) ? "rotate-90" : ""
                            } ${isRegionActive(region)
                              ? "text-[#79e708]"
                              : "text-white"
                            }`}
                        />
                        <span
                          className={`absolute bottom-1 left-0 h-[2px] bg-[#79e708] transition-all duration-500 ${isRegionActive(region)
                            ? "w-full"
                            : "w-0 group-hover:w-full"
                            }`}
                        />
                      </button>
                      {region.children && openRegions.includes(region.name) && (
                        <div className="ml-6 mt-1 space-y-1">
                          {region.children.map((sub) => (
                            <NavLink
                              key={sub.name}
                              to={sub.path}
                              className={({ isActive }) =>
                                `block px-3 py-2 rounded-lg text-sm transition-all duration-200 relative ${isActive
                                  ? activeClass
                                  : "text-gray-400 hover:text-[#79e708]"
                                }`
                              }
                            >
                              {sub.name}
                              <span
                                className={`absolute bottom-1 left-0 h-[2px] bg-[#79e708] transition-all duration-500 w-0 group-hover:w-full ${location.pathname.startsWith(sub.path)
                                  ? "w-full"
                                  : ""
                                  }`}
                              />
                            </NavLink>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Settings + Success Stories at Bottom */}
        <div className="px-4 border-t border-gray-200 dark:border-gray-700 flex flex-col gap-2">
          {/* <NavLink
            to="/success-stories" // must match route path
            className={({ isActive }) =>
              `flex items-center px-3 pt-3 rounded-lg transition-all duration-200 relative ${isActive ? activeClass : "text-white hover:text-[#79e708]"}`
            }
          >
            <SafeIcon icon={FiIcons.FiBookOpen} className="w-5 h-5 flex-shrink-0 text-white" />
            {open && <span className="ml-3 font-medium text-white">Success Stories</span>}
          </NavLink> */}

          <NavLink
            to="/community/settings"
            className={({ isActive }) =>
              `flex items-center px-3 py-3 rounded-lg transition-all duration-200 relative ${isActive ? activeClass : "text-white hover:text-[#79e708]"}`
            }
          >
            <SafeIcon icon={FiSettings} className="w-5 h-5 flex-shrink-0 text-white" />
            {open && <span className="ml-3 font-medium text-white">Settings</span>}
          </NavLink>
        </div>

      </div>
    </>
  );
};

export default Sidebar;
