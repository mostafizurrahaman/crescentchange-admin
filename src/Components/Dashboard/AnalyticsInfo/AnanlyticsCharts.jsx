
import { useNavigate } from "react-router-dom";
import { BsArrowUpRight } from "react-icons/bs";

const AnanlyticsCharts = ({
  totalDonation,
  donationAmountChangeText,
  totalActiveOrganizations,
  organizationChangeText,
}) => {
  const navigate = useNavigate();

  return (
    <div className="my-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-100 p-6 rounded-3xl relative shadow-sm">
          <div className="flex justify-between items-start mb-8">
            <div className="flex justify-between items-center gap-2">
              <p className="text-base font-semibold text-gray-900">Total Donated</p>
            </div>
            <BsArrowUpRight className="cursor-pointer hover:text-purple-600 transition" onClick={() => navigate("/donationQuickLink")} />
          </div>
          <div className="">
            <h1 className="text-3xl font-semibold text-gray-900">
              <span className="text-gray-300">$</span>
              {Number(totalDonation ?? 0).toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
              })}
            </h1>
            {donationAmountChangeText ? (
              <p className="text-sm text-gray-400 mt-2">{donationAmountChangeText}</p>
            ) : null}
          </div>
        </div>
        <div className="bg-white border border-gray-100 p-6 rounded-3xl relative shadow-sm">
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-base font-semibold text-gray-900">Active Organizations</p>
            </div>
            <BsArrowUpRight className="cursor-pointer hover:text-purple-600 transition" onClick={() => navigate("/organization-management")} />
          </div>
          <div className="">
            <h1 className="text-3xl font-semibold text-gray-900">
              {Number(totalActiveOrganizations ?? 0).toLocaleString()}
            </h1>
            {organizationChangeText ? (
              <p className="text-sm text-gray-400 mt-2">{organizationChangeText}</p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnanlyticsCharts;
