
import { BsArrowUpRight } from "react-icons/bs";
import { Link } from "react-router-dom";
import PendingApproval from "../PendingApproval";
import { useRef } from "react";
import { useGetUserStateQuery } from "../../../redux/feature/user/userApis.js";
import ProfileTables from "../ProfileTables";
// import { FaArrowDown } from "react-icons/fa";

const AllUsers = () => {
  const { data: userStateData } = useGetUserStateQuery();
  
  const stats = userStateData?.data || {};

  const totalRegisteredProfiles =
    (stats.totalClients ?? 0) + (stats.totalOrganizations ?? 0) + (stats.totalBusinesses ?? 0);

  const pendingApprovalRef = useRef(null);
  const handlePendingApproval = () => {
    if (pendingApprovalRef.current) {
      pendingApprovalRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const cleanChangeText = (text) => {
    if (!text) return "";
    return text.replace(/vs\s+last\s+month/gi, "").trim();
  };

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-sm text-gray-500">
            Manage users, organizations, and businesses in one place.
          </p>
        </div>
        {/* <button className="flex items-center justify-between gap-2 px-4 py-2 bg-white border rounded-3xl">
          <FaArrowDown /> Export
        </button> */}
      </div>

   
      <div className="p-6 my-10 bg-white border rounded-3xl">
        <p className="text-sm font-semibold text-gray-900">Total Registered Profiles</p>
        <div className="mt-8">
          <div className="flex items-end gap-3">
            <p className="text-4xl font-bold text-gray-900">{totalRegisteredProfiles.toLocaleString()}</p>
            <p className="pb-1 text-xs text-gray-500">
              <span className="text-green-600">{cleanChangeText(stats.totalChangeText) || "+0.0%"}</span> vs last month
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 mt-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="p-5 bg-gray-50 rounded-2xl">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Donors</p>
                  <p className="mt-1 text-xs text-gray-500">
                    <span className="text-green-600">{cleanChangeText(stats.clientsChangeText) || "+0.0%"}</span> vs last month
                  </p>
                </div>
                <Link to="/donor-app" className="flex items-center justify-center bg-white rounded-full w-9 h-9">
                  <BsArrowUpRight />
                </Link>
              </div>
              <div className="mt-6">
                <p className="text-2xl font-bold text-gray-900">{(stats.totalClients ?? 0).toLocaleString()}</p>
                <p className="mt-1 text-xs text-gray-500">active profiles</p>
              </div>
            </div>

            <div className="p-5 bg-gray-50 rounded-2xl">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Organizations</p>
                  <p className="mt-1 text-xs text-gray-500">
                    <span className="text-green-600">{cleanChangeText(stats.organizationsChangeText) || "+0.0%"}</span> vs last month
                  </p>
                </div>
                <Link to="/organization-management" className="flex items-center justify-center bg-white rounded-full w-9 h-9">
                  <BsArrowUpRight />
                </Link>
              </div>
              <div className="mt-6">
                <p className="text-2xl font-bold text-gray-900">{(stats.totalOrganizations ?? 0).toLocaleString()}</p>
                <p className="mt-1 text-xs text-gray-500">active profiles</p>
              </div>
            </div>

            <div className="p-5 bg-gray-50 rounded-2xl">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Businesses</p>
                  <p className="mt-1 text-xs text-gray-500">
                    <span className="text-red-500">{cleanChangeText(stats.businessesChangeText) || "-0.0%"}</span> vs last month
                  </p>
                </div>
                <Link to="/business-admin" className="flex items-center justify-center bg-white rounded-full w-9 h-9">
                  <BsArrowUpRight />
                </Link>
              </div>
              <div className="mt-6">
                <p className="text-2xl font-bold text-gray-900">{(stats.totalBusinesses ?? 0).toLocaleString()}</p>
                <p className="mt-1 text-xs text-gray-500">active profiles</p>
              </div>
            </div>

            <div className="p-5 bg-gray-50 rounded-2xl">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Pending Approvals</p>
                  <p className="mt-1 text-xs text-gray-500">
                    <span className="text-yellow-600">{cleanChangeText(stats.pendingChangeText) || "+0.0%"}</span> vs last month
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handlePendingApproval}
                  className="flex items-center justify-center bg-white rounded-full w-9 h-9"
                >
                  <BsArrowUpRight />
                </button>
              </div>
              <div className="mt-6">
                <p className="text-2xl font-bold text-gray-900">{(stats.pendingApprovals ?? 0).toLocaleString()}</p>
                <p className="mt-1 text-xs text-gray-500">pending profiles</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ProfileTables />

      <div ref={pendingApprovalRef}>
        <PendingApproval />
      </div>
    </div>
  );
};

export default AllUsers;
