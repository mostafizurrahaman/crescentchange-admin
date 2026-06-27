import { useState } from "react";
import { useDispatch } from "react-redux";
import {
  DatePicker,
  Input,
  Modal,
  Table,
  Button,
  message,
} from "antd";
import { SearchOutlined, LoadingOutlined } from "@ant-design/icons";
import { VscEye } from "react-icons/vsc";
import { RxCross2 } from "react-icons/rx";
import user from "../../assets/image/user.png";
import { Check, Trash2 } from "lucide-react";
import { FiDownload } from "react-icons/fi";
import useSmartFetchHook from "../hooks/useSmartFetchHook.ts";
import { useGetUserReportQuery } from "../../redux/feature/user/userApis.js";
import { baseApi } from "../../redux/feature/baseApi";
import { exportToXlsx } from "../../lib/export-xlsx";

const ProfileTables = () => {
  const { RangePicker } = DatePicker;
  const [dateRange, setDateRange] = useState(null);
  const dispatch = useDispatch();
  const [rowLoadingId, setRowLoadingId] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const { 
    searchTerm,
    setSearchTerm,
    setCurrentPage,
    data: apiResponse,
    pagination,
    isLoading,
    setFilterParams,
  } = useSmartFetchHook(useGetUserReportQuery);

  // Extract users array from API response
  const data = apiResponse || [];

  const handleView = (record) => {
    setSelectedUser(record);
    setIsViewOpen(true);
  };

  const handleAccept = async (record) => {
    try {
      setRowLoadingId(record._id);
      await dispatch(
        baseApi.endpoints.changeUserStatus.initiate({ id: record._id, status: "verified" })
      ).unwrap();
    } finally {
      setRowLoadingId(null);
    }
  };

  const handleSuspend = async (record) => {
    try {
      setRowLoadingId(record._id);
      await dispatch(
        baseApi.endpoints.changeUserStatus.initiate({ id: record._id, status: "suspended" })
      ).unwrap();
    } finally {
      setRowLoadingId(null);
    }
  };

  const handleDelete = async (record) => {
    try {
      setRowLoadingId(record._id);
      await dispatch(
        baseApi.endpoints.deleteUser.initiate(record._id)
      ).unwrap();
      message.success("User deleted successfully");
    } catch (err) {
      message.error(err?.data?.message || "Failed to delete user");
    } finally {
      setRowLoadingId(null);
    }
  };

  const handleDateRangeChange = (dates, dateStrings) => {
    setDateRange(dates);

    // Update filter params with date range
    const newFilterParams = {};

    if (dates && dates[0] && dates[1]) {
      newFilterParams.startDate = dateStrings[0];
      newFilterParams.endDate = dateStrings[1];
    }

    setFilterParams(newFilterParams);
  };

  const handleExport = () => {
    const rows = (Array.isArray(data) ? data : []).map((r) => ({
      Name:
        r?.firstName || r?.lastName
          ? `${r?.firstName || ""} ${r?.lastName || ""}`.trim()
          : r?.email?.split("@")[0] || "-",
      Email: r?.email || "-",
      Status: r?.status || "-",
      "Last Active": r?.lastActive
        ? new Date(r.lastActive).toLocaleString()
        : r?.updatedAt
        ? new Date(r.updatedAt).toLocaleString()
        : r?.createdAt
        ? new Date(r.createdAt).toLocaleString()
        : "-",
    }));

    exportToXlsx({
      rows,
      sheetName: "Profiles",
      fileName: `profiles-${new Date().toISOString().slice(0, 10)}.xlsx`,
    });
  };

  const columns = [
    {
      title: "Name/Email",
      dataIndex: "email",
      key: "email",
      sorter: true,
      render: (_email, record) => (
        <div className="flex items-center gap-3">
          <img
            src={record?.image || record?.profileImage || user}
            alt={record?.email}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <p className="text-sm font-semibold text-gray-900">
              {record?.firstName || record?.lastName
                ? `${record?.firstName || ""} ${record?.lastName || ""}`.trim()
                : record?.email?.split("@")[0] || "-"}
            </p>
            <p className="text-xs text-gray-500">{record?.email || "-"}</p>
          </div>
        </div>
      ),
    },
    {
      title: "Last Active",
      dataIndex: "lastActive",
      key: "lastActive",
      sorter: true,
      render: (_v, record) => {
        const dt = record?.lastActive || record?.updatedAt || record?.createdAt;
        if (!dt) return <p className="text-sm text-gray-700">-</p>;
        const d = new Date(dt);
        return (
          <div className="leading-tight">
            <p className="text-sm font-semibold text-gray-900">{d.toLocaleDateString()}</p>
            <p className="mt-1 text-xs text-gray-500">
              {d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      filters: [
        { text: "Verified", value: "verified" },
        { text: "Pending", value: "pending" },
        { text: "Suspended", value: "suspended" },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => (
        <span
          className={
            status === "verified"
              ? "inline-flex items-center rounded-full bg-emerald-100 px-4 py-2 text-xs font-medium text-emerald-700 capitalize"
              : status === "pending"
              ? "inline-flex items-center rounded-full bg-amber-100 px-4 py-2 text-xs font-medium text-amber-700 capitalize"
              : "inline-flex items-center rounded-full bg-gray-100 px-4 py-2 text-xs font-medium text-gray-700 capitalize"
          }
        >
          {status || "-"}
        </span>
      ),
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      render: (_, record) => {
        const isRowLoading = rowLoadingId === record?._id;
        const isPending = record?.status === "pending";
        const isSuspended = record?.status === "suspended";
        return (
          <div className="flex items-center justify-center gap-3 text-lg">
            <div
              onClick={() => handleView(record)}
              className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full cursor-pointer"
              title="View"
            >
              <VscEye />
            </div>
            {isPending ? (
              <>
                <div
                  onClick={() => { if (!isRowLoading) handleSuspend(record); }}
                  className={`flex items-center justify-center w-10 h-10 rounded-full ${!isRowLoading ? "cursor-pointer bg-gray-100" : "cursor-not-allowed bg-gray-50 opacity-50"}`}
                  title={isRowLoading ? "Processing..." : "Suspend"}
                >
                  {isRowLoading ? <LoadingOutlined /> : <RxCross2 />}
                </div>
                <div
                  onClick={() => { if (!isRowLoading) handleAccept(record); }}
                  className={`flex items-center justify-center w-10 h-10 rounded-full ${!isRowLoading ? "cursor-pointer bg-gray-100" : "cursor-not-allowed bg-gray-50 opacity-50"}`}
                  title={isRowLoading ? "Processing..." : "Accept"}
                >
                  {isRowLoading ? <LoadingOutlined /> : <Check size={18} />}
                </div>
              </>
            ) : (
              <div
                onClick={() => { if (!isRowLoading) (isSuspended ? handleAccept(record) : handleSuspend(record)); }}
                className={`flex items-center justify-center w-10 h-10 rounded-full ${!isRowLoading ? "cursor-pointer bg-gray-100" : "cursor-not-allowed bg-gray-50 opacity-50"}`}
                title={isRowLoading ? "Processing..." : (isSuspended ? "Unblock" : "Block")}
              >
                {isRowLoading ? <LoadingOutlined /> : (isSuspended ? <Check size={18} /> : <RxCross2 />)}
              </div>
            )}
            <div
              onClick={() => { if (!isRowLoading) handleDelete(record); }}
              className={`flex items-center justify-center w-10 h-10 rounded-full ${!isRowLoading ? "cursor-pointer bg-gray-100" : "cursor-not-allowed bg-gray-50 opacity-50"}`}
              title={isRowLoading ? "Processing..." : "Delete"}
            >
              {isRowLoading ? <LoadingOutlined /> : <Trash2 size={16} />}
            </div>
          </div>
        );
      },
    },
  ];

  return (
    <div className="p-6 mb-10 bg-white border rounded-3xl">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-base font-semibold text-gray-900">Profiles</h2>

        <div className="flex flex-col items-stretch gap-3 md:flex-row md:items-center">
          <div className="w-full md:w-[220px]">
            <div className="px-4 py-2 bg-white border border-gray-200 rounded-full [&_.ant-input-affix-wrapper]:!border-0 [&_.ant-input-affix-wrapper]:!shadow-none [&_.ant-input-affix-wrapper]:!bg-transparent [&_.ant-input]:!bg-transparent [&_.ant-input]:!text-sm">
              <Input
                prefix={<SearchOutlined />}
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                variant="borderless"
                allowClear
              />
            </div>
          </div>

          <div className="w-full md:w-auto">
            <div className="px-4 py-2 bg-white border border-gray-200 rounded-full [&_.ant-picker]:!border-0 [&_.ant-picker]:!shadow-none [&_.ant-picker]:!bg-transparent [&_.ant-picker-input_>input]:!text-sm">
              <RangePicker
                placeholder={["Select Interval", ""]}
                variant="borderless"
                onChange={handleDateRangeChange}
                value={dateRange}
              />
            </div>
          </div>

          <Button
            onClick={handleExport}
            disabled={isLoading}
            className="!h-11 !rounded-full !border-gray-200 !px-5 !text-sm !font-medium"
          >
            Export <FiDownload className="ml-2" />
          </Button>
        </div>
      </div>

      <div className="mt-4 [&_.ant-table-thead>tr>th]:bg-gray-50 [&_.ant-table-thead>tr>th]:border-b [&_.ant-table-thead>tr>th]:border-gray-100 [&_.ant-table-thead>tr>th]:text-gray-900 [&_.ant-table-thead>tr>th]:font-semibold [&_.ant-table-thead>tr>th]:text-xs [&_.ant-table-tbody>tr>td]:border-b [&_.ant-table-tbody>tr>td]:border-gray-100 [&_.ant-table-tbody>tr>td]:py-4 [&_.ant-table-tbody>tr>td]:text-sm">
        <Table
          columns={columns}
          dataSource={data}
          loading={isLoading}
          onChange={(pagination, filters, sorter) => {
          setCurrentPage(pagination.current);

          const newFilterParams = {};

          if (sorter?.field) {
            newFilterParams.sortBy = sorter.field;
            newFilterParams.sortOrder = sorter.order === "ascend" ? "asc" : "desc";
          }

          Object.keys(filters).forEach((key) => {
            if (filters[key]) {
              newFilterParams[key] = filters[key][0];
            }
          });

          setFilterParams(newFilterParams);
        }}
        pagination={{
          current: pagination.page || 1,
          pageSize: pagination.limit || 5,
          total: pagination.total || 0,
          showTotal: (total, range) => `Showing ${range[0]}-${range[1]} from ${total}`,
          showSizeChanger: false,
          position: ['bottomRight'],
        }}
        rowKey="_id"
        />
      </div>

      {/* View User Modal */}
      <Modal
        title="User Details"
        open={isViewOpen}
        onCancel={() => setIsViewOpen(false)}
        footer={null}
        centered
        width={600}
      >
        {selectedUser ? (
          <div className="space-y-6">
            {/* Header Section */}
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                <span className="text-xl font-bold text-white">
                  {selectedUser.firstName?.charAt(0)?.toUpperCase() || selectedUser.email?.charAt(0)?.toUpperCase() || "U"}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="mb-1 text-xl font-semibold text-gray-900">
                  {selectedUser.firstName && selectedUser.lastName 
                    ? `${selectedUser.firstName} ${selectedUser.lastName}` 
                    : selectedUser.email?.split('@')[0] || 'Unknown User'}
                </h3>
                <p className="text-sm text-gray-600">{selectedUser.email}</p>
              </div>
            </div>

            {/* Key Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border border-blue-100 rounded-lg bg-blue-50">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                    <span className="text-xs font-semibold text-blue-600">S</span>
                  </div>
                  <p className="text-xs font-medium tracking-wide text-blue-700 uppercase">Status</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    selectedUser.status === "verified" ? "bg-green-500" :
                    selectedUser.status === "pending" ? "bg-yellow-500" :
                    selectedUser.status === "suspended" ? "bg-red-500" : "bg-gray-400"
                  }`}></div>
                  <p className="text-sm font-semibold text-gray-900 capitalize">
                    {selectedUser.status || "Unknown"}
                  </p>
                </div>
              </div>

              <div className="p-4 border border-green-100 rounded-lg bg-green-50">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                    <span className="text-xs font-semibold text-green-600">A</span>
                  </div>
                  <p className="text-xs font-medium tracking-wide text-green-700 uppercase">Active</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    selectedUser.isActive ? "bg-green-500" : "bg-red-500"
                  }`}></div>
                  <p className="text-sm font-semibold text-gray-900">
                    {selectedUser.isActive ? "Active" : "Inactive"}
                  </p>
                </div>
              </div>

              <div className="p-4 border border-purple-100 rounded-lg bg-purple-50">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-full">
                    <span className="text-xs font-semibold text-purple-600">V</span>
                  </div>
                  <p className="text-xs font-medium tracking-wide text-purple-700 uppercase">OTP Verified</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    selectedUser.isVerifiedByOTP ? "bg-green-500" : "bg-gray-400"
                  }`}></div>
                  <p className="text-sm font-semibold text-gray-900">
                    {selectedUser.isVerifiedByOTP ? "Verified" : "Not Verified"}
                  </p>
                </div>
              </div>

              <div className="p-4 border border-orange-100 rounded-lg bg-orange-50">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-full">
                    <span className="text-xs font-semibold text-orange-600">D</span>
                  </div>
                  <p className="text-xs font-medium tracking-wide text-orange-700 uppercase">Joined</p>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : "-"}
                </p>
              </div>
            </div>

            {/* Additional Info */}
            <div className="p-4 rounded-lg bg-gray-50">
              <h4 className="mb-3 text-sm font-medium text-gray-700">Additional Information</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between px-3 py-2 bg-white rounded-lg">
                  <span className="text-sm text-gray-600">Full Name</span>
                  <span className="text-sm font-medium text-gray-900">
                    {selectedUser.firstName && selectedUser.lastName 
                      ? `${selectedUser.firstName} ${selectedUser.lastName}` 
                      : "Not specified"}
                  </span>
                </div>
                <div className="flex items-center justify-between px-3 py-2 bg-white rounded-lg">
                  <span className="text-sm text-gray-600">Mobile</span>
                  <span className="text-sm font-medium text-gray-900">
                    {selectedUser.mobile || "Not specified"}
                  </span>
                </div>
                <div className="flex items-center justify-between px-3 py-2 bg-white rounded-lg">
                  <span className="text-sm text-gray-600">User ID</span>
                  <span className="text-sm font-medium text-gray-900">
                    {selectedUser._id?.slice(-8) || "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between px-3 py-2 bg-white rounded-lg">
                  <span className="text-sm text-gray-600">Full Created Date</span>
                  <span className="text-sm font-medium text-gray-900">
                    {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : "-"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default ProfileTables;
