// import { FaArrowDown, } from "react-icons/fa";
import DonorDataTable from "./DonorDataTable";
import BadgeTable from "./BadgeTable";
import BusinessReview from "./BusinessReview";
// import { FaArrowDown } from "react-icons/fa";

const DonorApp = () => {
  return (
    <div>
      <div className="flex flex-col gap-6 mb-8 md:flex-row md:items-start md:justify-between">
        <div className="w-full">
          <h1 className="text-3xl font-bold text-gray-900">Donor App Management</h1>
          <p className="mt-2 text-base text-gray-500">
            Manage donor details, badges, goals, and rewards for the donor app.
          </p>
        </div>

        <div className="flex items-center justify-end w-full gap-3 md:w-auto">
          {/* <button className="flex items-center justify-center gap-2 px-6 py-3 bg-white border rounded-3xl">
            <FaPen></FaPen> Edit Rewards
          </button> */}
          {/* <button className="flex items-center justify-center gap-2 px-6 py-3 bg-white border rounded-3xl">
            <FaPlus></FaPlus> Add
          </button> */}
          {/* <button className="flex items-center justify-center gap-2 px-6 py-3 bg-white border rounded-3xl">
            <FaArrowDown /> Export
          </button> */}
        </div>
      </div>
      <DonorDataTable />
      <BadgeTable />
      <BusinessReview />
    </div>
  );
};

export default DonorApp;
