 
import { FiSettings } from "react-icons/fi";
import { LuLayoutDashboard } from "react-icons/lu";
import { HiOutlineUsers } from "react-icons/hi2";
import {
  TbChartBar,
  TbBuildingCommunity,
  TbHeartHandshake,
  TbBriefcase2,
  TbCalendarEvent,
} from "react-icons/tb";
import { Link, useNavigate, useLocation } from "react-router-dom";

import logout from "../../assets/image/logout.png";

const Sidebar = ({ closeDrawer }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: LuLayoutDashboard, label: "Dashboard", Link: "/" },
    { icon: HiOutlineUsers, label: "User Management", Link: "/user-management" },
    {
      icon: TbCalendarEvent,
      label: "Subscription & Payments",
      Link: "/subscription-management",
    },
    { icon: TbChartBar, label: "Analytics", Link: "/analytics" },
    {
      icon: TbBuildingCommunity,
      label: "Organizations",
      Link: "/organization-management",
    },
    { icon: TbHeartHandshake, label: "Donor App", Link: "/donor-app" },
    { icon: TbBriefcase2, label: "Business Admin", Link: "/business-admin" },
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
                    <item.icon className="w-5 h-5" />
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
