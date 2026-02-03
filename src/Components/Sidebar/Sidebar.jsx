 
import { FiSettings } from "react-icons/fi";
import { Link, useNavigate, useLocation } from "react-router-dom";

import logout from "../../assets/image/logout.png";

const Sidebar = ({ closeDrawer }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: "/dashboard.svg", label: "Dashboard", Link: "/" },
    { icon: "/user.svg", label: "User Management", Link: "/user-management" },
    {
      icon: "/subscription.svg",
      label: "Subscription & Payments",
      Link: "/subscription-management",
    },
    { icon: "/analytics.svg", label: "Analytics", Link: "/analytics" },
    {
      icon: "/organization.svg",
      label: "Organizations",
      Link: "/organization-management",
    },
    { icon: "/donor.svg", label: "Donor App", Link: "/donor-app" },
    { icon: "/business.svg", label: "Business Admin", Link: "/business-admin" },
  ];

  // Find active menu item based on current path
  const getActiveMenuItem = () => {
    const currentPath = location.pathname;
    const activeItem = menuItems.find(item => item.Link === currentPath);
    return activeItem ? activeItem.label : "Dashboard";
  };

  const active = getActiveMenuItem();

  const handleActiveRoute = (_item) => {
    if (closeDrawer) closeDrawer();
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/sign-in");
  };

  const isSettingsActive = location.pathname.startsWith("/settings");

  return (
    <div className="h-full bg-white">
      <div className="flex flex-col h-full">
        <div className="flex flex-col gap-2 px-4 py-6">
          {menuItems.map((item) => (
            <div key={item.label} className={item.className || ""}>
              <Link to={item.Link}>
              <div
                className={`text-sm md:text-base flex justify-between items-center px-4 py-3 cursor-pointer rounded-2xl transition ${
                  active === item.label
                    ? "bg-lime-300 text-black"
                    : "text-black hover:bg-gray-100"
                }`}
                onClick={() => handleActiveRoute(item.label)}
              >
                  <div className="flex items-center gap-3">
                    <img src={item.icon} alt={item.label} className="w-5 h-5" />
                    <p className="font-medium truncate max-w-[170px]">{item.label}</p>
                  </div>
              </div>
                </Link>
            </div>
          ))}
        </div>

        <div className="flex-1" />

        <div className="px-4 pb-3">
          <Link
            to="/settings/contact-us"
            className={`text-sm md:text-base flex justify-between items-center px-4 py-3 cursor-pointer rounded-2xl transition mb-3 ${
              isSettingsActive
                ? "bg-lime-300 text-black"
                : "text-black hover:bg-gray-100"
            }`}
          >
            <div className="flex items-center gap-3">
              <FiSettings className="w-5 h-5" />
              <p className="font-medium">Settings</p>
            </div>
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center w-full gap-3 px-4 py-3 text-black border cursor-pointer rounded-2xl hover:bg-gray-100"
          >
            <img src={logout} alt="Logout" className="w-5 h-5" />
            <p className="font-medium">Log out</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
