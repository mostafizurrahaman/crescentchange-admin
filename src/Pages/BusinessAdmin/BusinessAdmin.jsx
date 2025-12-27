// import { FaArrowDown } from "react-icons/fa";
import BusinessPortfolio from "./BusinessPortfolio";
import RewardsManagementTable from "./RewardsManagementTable";

const BusinessAdmin = () => {
  return (
    <div>
      <div className="flex flex-col gap-6 mb-8 md:flex-row md:items-start md:justify-between">
        <div className="w-full">
          <h1 className="text-3xl font-bold text-gray-900">Business App Management</h1>
          <p className="mt-2 text-base text-gray-500">
            Manage donor details, badges, goals, and rewards for the donor app.
          </p>
        </div>
        {/* <div className="flex items-center justify-end w-full gap-3 md:w-auto">
          <button className="flex items-center justify-center h-12 gap-2 px-6 text-sm font-medium bg-white border border-gray-200 rounded-full">
            <FaArrowDown /> Export
          </button>
        </div> */}
      </div>
      <BusinessPortfolio />
      <RewardsManagementTable/>
    </div>
  );
};

export default BusinessAdmin;
