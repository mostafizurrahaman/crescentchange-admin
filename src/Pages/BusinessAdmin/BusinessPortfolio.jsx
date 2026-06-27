
import { useState } from "react";
import {
  Button,
  Input,
  Table,
  Drawer,
  Divider,
  Descriptions,
  Space,
  DatePicker,
  Spin,
  message,
} from "antd";
import {
  FaCheckCircle,
} from "react-icons/fa";
import { VscEye } from "react-icons/vsc";
import { RxCross2, RxCrossCircled } from "react-icons/rx";
import { BsExclamationCircle, BsShieldCheck } from "react-icons/bs";
import { Check, Trash2 } from "lucide-react";
import {
  SearchOutlined,
  LinkOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  LoadingOutlined,
} from "@ant-design/icons";

import icon from "../../assets/image/leaf.png";
import { FiDownload } from "react-icons/fi";

import useSmartFetchHook from "../../Components/hooks/useSmartFetchHook.ts";
import { useGetBusinessesReportQuery } from "../../redux/feature/business/businessApis";
import {
  useChangeUserStatusMutation,
  useDeleteUserMutation,
} from "../../redux/feature/user/userApis";
import { exportToXlsx } from "../../lib/export-xlsx";

const COVER =
  "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1200&auto=format&fit=crop";

const BusinessPortfolio = () => {
  const { RangePicker } = DatePicker;
  const [dateRange, setDateRange] = useState(null);
  const {
    searchTerm,
    setSearchTerm,
    setCurrentPage,
    data,
    pagination,
    isLoading,
    setFilterParams,
  } = useSmartFetchHook(useGetBusinessesReportQuery);
  
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [rowLoadingId, setRowLoadingId] = useState(null);

  const [changeUserStatus] = useChangeUserStatusMutation();
  const [deleteUser] = useDeleteUserMutation();


  const handleAccept = async (record) => {
    if (!record?.authId) return;

    try {
      setRowLoadingId(record.authId);
      await changeUserStatus({ id: record.authId, status: "verified" }).unwrap();
    } finally {
      setRowLoadingId(null);
    }
  };

  const handleSuspend = async (record) => {
    if (!record?.authId) return;

    try {
      setRowLoadingId(record.authId);
      await changeUserStatus({ id: record.authId, status: "suspended" }).unwrap();
    } finally {
      setRowLoadingId(null);
    }
  };

  const handleDelete = async (record) => {
    if (!record?.authId) return;

    try {
      setRowLoadingId(record.authId);
      await deleteUser(record.authId).unwrap();
      message.success("User deleted successfully");
    } catch (err) {
      message.error(err?.data?.message || "Failed to delete user");
    } finally {
      setRowLoadingId(null);
    }
  };

  const handleDateRangeChange = (dates, dateStrings) => {
    setDateRange(dates);
    const newParams = {};
    if (dates && dates[0] && dates[1]) {
      newParams.startDate = dateStrings[0];
      newParams.endDate = dateStrings[1];
    }
    setFilterParams(newParams);
  };

  const tableData = Array.isArray(data)
    ? data.map((b) => ({
        key: b?._id,
        authId: b?.auth?._id || b?.auth?.id,
        name: b?.name,
        email: b?.auth?.email,
        status: b?.auth?.status,
        isActive: b?.auth?.isActive,
        logoImage: b?.logoImage,
        coverImage: b?.coverImage,
        createdAt: b?.createdAt,
        updatedAt: b?.updatedAt,
        icon,
      }))
    : [];

  const handleExport = () => {
    const rows = (Array.isArray(tableData) ? tableData : []).map((r) => ({
      Name: r?.name || "-",
      Email: r?.email || "-",
      Status: r?.status || "-",
      Active: r?.isActive ? "Active" : "Inactive",
      "Created At": r?.createdAt ? new Date(r.createdAt).toLocaleString() : "-",
    }));

    exportToXlsx({
      rows,
      sheetName: "Businesses",
      fileName: `businesses-${new Date().toISOString().slice(0, 10)}.xlsx`,
    });
  };

  const openProfile = (record) => {
    setSelectedBusiness(record);
    setIsProfileOpen(true);
  };

  const renderStatus = (status, isActive) => {
    if (!isActive) {
      return (
        <span className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
          <RxCrossCircled /> Inactive
        </span>
      );
    }

    if (status === "pending") {
      return (
        <span className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-full bg-amber-100 text-amber-700">
          <BsExclamationCircle /> Pending
        </span>
      );
    }

    if (status === "suspended") {
      return (
        <span className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
          <RxCrossCircled /> Inactive
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700">
        <FaCheckCircle /> Active
      </span>
    );
  };

  const columns = [
    {
      title: "Business",
      dataIndex: "name",
      key: "name",
      render: (_, record) => {
        const businessImageUrl = record?.logoImage || record?.coverImage || record?.icon || "";
        return (
          <div className="flex items-center gap-3">
            <img
              src={businessImageUrl || icon}
              alt={record.name}
              title={businessImageUrl || "No business image provided by API"}
              className="object-contain w-10 h-10 rounded-full"
              onError={(e) => {
                e.currentTarget.src = icon;
              }}
            />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-900">{record.name}</span>
              <span className="text-xs text-gray-500">{record.email || "—"}</span>
            </div>
          </div>
        );
      },
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: true,
      render: (createdAt) => (
        <span className="text-sm font-medium text-gray-900">
          {createdAt ? new Date(createdAt).toLocaleDateString() : "—"}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (_status, record) => renderStatus(record.status, record.isActive),
    },
    {
      title: "Action",
      align:'center',
      key: "action",
      render: (_, record) => {
        const isRowLoading = rowLoadingId === record?.authId;
        const hasAuthId = Boolean(record?.authId);
        const isPending = record?.status === "pending";
        const isSuspended = record?.status === "suspended";

        return (
          <div className="flex items-center justify-center gap-3">
            <div
              onClick={() => openProfile(record)}
              className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full cursor-pointer"
              title="View"
            >
              <VscEye />
            </div>

            {isPending ? (
              <>
                <div
                  onClick={() => {
                    if (!isRowLoading && hasAuthId) handleSuspend(record);
                  }}
                  className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    !isRowLoading && hasAuthId
                      ? "cursor-pointer bg-gray-100"
                      : "cursor-not-allowed bg-gray-50 opacity-50"
                  }`}
                  title={
                    !hasAuthId
                      ? "Missing user id"
                      : isRowLoading
                      ? "Processing..."
                      : "Suspend"
                  }
                >
                  {isRowLoading ? <LoadingOutlined /> : <RxCross2 />}
                </div>
                <div
                  onClick={() => {
                    if (!isRowLoading && hasAuthId) handleAccept(record);
                  }}
                  className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    !isRowLoading && hasAuthId
                      ? "cursor-pointer bg-gray-100"
                      : "cursor-not-allowed bg-gray-50 opacity-50"
                  }`}
                  title={
                    !hasAuthId
                      ? "Missing user id"
                      : isRowLoading
                      ? "Processing..."
                      : "Accept"
                  }
                >
                  {isRowLoading ? <LoadingOutlined /> : <Check size={18} />}
                </div>
              </>
            ) : (
              <div
                onClick={() => {
                  if (!isRowLoading && hasAuthId) {
                    if (isSuspended) handleAccept(record);
                    else handleSuspend(record);
                  }
                }}
                className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  !isRowLoading && hasAuthId
                    ? "cursor-pointer bg-gray-100"
                    : "cursor-not-allowed bg-gray-50 opacity-50"
                }`}
                title={
                  !hasAuthId
                    ? "Missing user id"
                    : isRowLoading
                    ? "Processing..."
                    : isSuspended
                    ? "Unblock"
                    : "Block"
                }
              >
                {isRowLoading ? (
                  <LoadingOutlined />
                ) : isSuspended ? (
                  <Check size={18} />
                ) : (
                  <RxCross2 />
                )}
              </div>
            )}

            <div
              onClick={() => {
                if (!isRowLoading && hasAuthId) handleDelete(record);
              }}
              className={`flex items-center justify-center w-10 h-10 rounded-full ${
                !isRowLoading && hasAuthId
                  ? "cursor-pointer bg-gray-100"
                  : "cursor-not-allowed bg-gray-50 opacity-50"
              }`}
              title={
                !hasAuthId
                  ? "Missing user id"
                  : isRowLoading
                  ? "Processing..."
                  : "Delete"
              }
            >
              {isRowLoading ? <LoadingOutlined /> : <Trash2 size={16} />}
            </div>
          </div>
        );
      },
    },
  ];

  return (
    <div className="mb-10 bg-white border border-gray-100 rounded-3xl">
      <div className="flex flex-col gap-4 p-6 border-b border-gray-100 md:flex-row md:items-center md:justify-between">
        <h2 className="text-base font-semibold text-gray-900">Business Portfolio</h2>
        <div className="flex flex-col items-stretch gap-3 md:flex-row md:items-center">
          <div className="w-full md:w-[240px]">
            <div className="flex items-center h-12 px-5 bg-white border border-gray-200 rounded-full [&_.ant-input-affix-wrapper]:!h-full [&_.ant-input-affix-wrapper]:!border-0 [&_.ant-input-affix-wrapper]:!shadow-none [&_.ant-input-affix-wrapper]:!bg-transparent [&_.ant-input-affix-wrapper]:!p-0 [&_.ant-input]:!h-full [&_.ant-input]:!bg-transparent [&_.ant-input]:!text-sm">
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
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="w-full md:w-auto">
            <div className="flex items-center h-12 px-5 bg-white border border-gray-200 rounded-full [&_.ant-picker]:!border-0 [&_.ant-picker]:!shadow-none [&_.ant-picker]:!bg-transparent [&_.ant-picker]:!p-0 [&_.ant-picker]:!h-full [&_.ant-picker-input_>input]:!text-sm [&_.ant-picker-input_>input]:!h-full">
              <RangePicker
                placeholder={["Select Interval", ""]}
                onChange={handleDateRangeChange}
                value={dateRange}
                disabled={isLoading}
                variant="borderless"
                allowEmpty={[true, true]}
              />
            </div>
          </div>

          <Button
            onClick={handleExport}
            disabled={isLoading}
            className="!h-12 !rounded-full !border-gray-200 !px-6 !text-sm !font-medium"
          >
            Export <FiDownload className="ml-2" />
          </Button>
        </div>
      </div>

      <Spin spinning={isLoading} indicator={<LoadingOutlined spin />}>
        <div className="">
          <Table
            columns={columns}
            dataSource={tableData}
            rowKey="key"
            onChange={(tablePagination, _filters, sorter) => {
              setCurrentPage(tablePagination.current);

              const newParams = {};
              if (sorter?.field) {
                newParams.sortBy = sorter.field;
                newParams.sortOrder = sorter.order === "ascend" ? "asc" : "desc";
              }
              setFilterParams(newParams);
            }}
            pagination={{
              current: pagination.page || 1,
              pageSize: pagination.limit || 10,
              total: pagination.total || 0,
              showTotal: (total, range) =>
                `Showing ${String(range?.[1] ?? 0).padStart(2, "0")} from ${String(total).padStart(2, "0")}`,
              showSizeChanger: false,
              position: ["bottomRight"],
            }}
          />
        </div>
      </Spin>

      {/* Right-side Profile Drawer */}
      <Drawer
        title="Business Profile"
        placement="right"
        width={520}
        
        onClose={() => setIsProfileOpen(false)}
        open={isProfileOpen}
        destroyOnClose
      >
        {selectedBusiness && (
          <div className="p-4">
            <div className="mb-4 overflow-hidden rounded-xl">
              <img
                src={selectedBusiness?.coverImage || COVER}
                alt="cover"
                className="object-cover w-full h-40"
                onError={(e) => {
                  e.currentTarget.src = COVER;
                }}
              />
            </div>

            <div className="flex items-center gap-3 mb-2">
              <img
                src={selectedBusiness?.logoImage || selectedBusiness?.icon || icon}
                alt={selectedBusiness.name}
                className="object-cover w-12 h-12 rounded-full ring-1 ring-gray-200"
                onError={(e) => {
                  e.currentTarget.src = icon;
                }}
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-base font-semibold">{selectedBusiness.name}</span>
                  {selectedBusiness.verified && (
                    <span
                      title="Verified"
                      className="inline-flex items-center gap-1 text-xs font-medium text-green-600"
                    >
                      <BsShieldCheck /> Verified
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-500">Sydney, Australia</span>
              </div>
            </div>

            <p className="mb-3 text-sm text-gray-600">
              {selectedBusiness.overview || "No overview provided."}
            </p>

            <Divider />

            <Descriptions column={1} labelStyle={{ fontWeight: 600 }} size="small" colon={false}>
              <Descriptions.Item label="Email">
                <Space>
                  <MailOutlined />
                  <a href={`mailto:${selectedBusiness.email}`}>
                    {selectedBusiness.email}
                  </a>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Mobile">
                <Space>
                  <PhoneOutlined />
                  <a href={`tel:${selectedBusiness.phone || ""}`}>
                    {selectedBusiness.phone || "—"}
                  </a>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Website">
                <Space>
                  <LinkOutlined />
                  {selectedBusiness.website ? (
                    <a
                      href={selectedBusiness.website}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {selectedBusiness.website.replace(/^https?:\/\//, "")}
                    </a>
                  ) : (
                    "—"
                  )}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Address">
                <Space>
                  <EnvironmentOutlined />
                  {selectedBusiness.address || "—"}
                </Space>
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <div className="mb-2 font-semibold">Offered Rewards</div>
            <p className="text-sm text-gray-600">
              {selectedBusiness.offeredRewards || "No rewards listed."}
            </p>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default BusinessPortfolio;
