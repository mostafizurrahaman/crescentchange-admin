 
import { Table, DatePicker, Modal, Button, Input } from "antd";
// import { MoreOutlined } from "@ant-design/icons";
import { VscEye } from "react-icons/vsc";
import user from "../../../assets/image/user.png";
import { FiDownload } from "react-icons/fi";

import { SlArrowLeft } from "react-icons/sl";
import DonorsSubscription from "../../ManageSubscription/SubscriptionAndPaymentExport";
import {
  useGetSubscriptionOverviewQuery,
  useGetSubscriptionPaymentsQuery,
} from "../../../redux/feature/subscription/subscriptionApis.js";
import { SearchOutlined } from "@ant-design/icons";
import { useState } from "react";
import { exportToXlsx } from "../../../lib/export-xlsx";
const SubscriptionQuickLinks = () => {
  const { RangePicker } = DatePicker;

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [dateRange, setDateRange] = useState(null);
  const [sortBy, setSortBy] = useState(null);
  const [sortOrder, setSortOrder] = useState(null);

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);

  const { data: overviewRes } = useGetSubscriptionOverviewQuery();
  const overview = overviewRes?.data;

  const { data: listRes, isLoading } = useGetSubscriptionPaymentsQuery({
    page: currentPage,
    limit: 10,
    searchTerm: searchTerm || undefined,
    fromDate: dateRange?.[0] || undefined,
    toDate: dateRange?.[1] || undefined,
    sortBy: sortBy || undefined,
    sortOrder: sortOrder || undefined,
  });

  const tableData = Array.isArray(listRes?.data) ? listRes.data : [];
  const meta = listRes?.meta ?? {};

  const handleExport = () => {
    const rows = (Array.isArray(tableData) ? tableData : []).map((r) => ({
      Email: r?.user?.email || "-",
      Type: r?.planType || "-",
      Status: r?.status || "-",
      "Start Date": r?.startDate ? new Date(r.startDate).toLocaleString() : "-",
      "Renewal Date": r?.renewalDate ? new Date(r.renewalDate).toLocaleString() : "-",
    }));

    exportToXlsx({
      rows,
      sheetName: "Subscriptions",
      fileName: `subscriptions-${new Date().toISOString().slice(0, 10)}.xlsx`,
    });
  };

  const getAvatarUrl = (recordOrUserObj) => {
    const logo = recordOrUserObj?.business?.logoImage || recordOrUserObj?.organization?.logoImage;
    return logo || user;
  };

  const handleOpenView = (record) => {
    setSelectedSubscription(record);
    setIsViewOpen(true);
  };

  const handleCloseView = () => {
    setIsViewOpen(false);
    setSelectedSubscription(null);
  };

  const formatDateTime = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "-";
    const date = d.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const time = d.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
    return (
      <div>
        <div className="text-sm font-medium text-gray-900">{date}</div>
        <div className="text-xs text-gray-400">{time}</div>
      </div>
    );
  };


  const columns = [
    {
      title: "Name/Email",
      dataIndex: "user",
      key: "email",
      sorter: true,
      render: (userObj, record) => {
        const email = userObj?.email ?? "-";
        const displayName = email && email !== "-" ? String(email).split("@")[0] : "-";
        return (
          <div className="flex items-center gap-3">
            <img
              src={getAvatarUrl(record)}
              alt={displayName}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <p className="text-sm font-semibold text-gray-900">{displayName}</p>
              <p className="text-xs text-gray-500">{email}</p>
            </div>
          </div>
        );
      },
    },
    {
      title: "Type",
      dataIndex: "planType",
      key: "planType",
      render: (value) => (
        <span
          className={
            "inline-flex items-center rounded-full bg-blue-100 px-4 py-2 text-xs font-medium text-blue-700 capitalize"
          }
        >
          {value || "-"}
        </span>
      ),
    },
    {
      title: "Start Date",
      dataIndex: "startDate",
      key: "startDate",
      sorter: true,
      render: (value) => formatDateTime(value),
    },
    {
      title: "Renewal Date",
      dataIndex: "renewalDate",
      key: "renewalDate",
      sorter: true,
      render: (value) => formatDateTime(value),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <span
          className={
            status === "active"
              ? "inline-flex items-center rounded-full bg-emerald-100 px-4 py-2 text-xs font-medium text-emerald-700 capitalize"
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
      render: (_text, record) => (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => handleOpenView(record)}
            className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full"
            title="View Details"
          >
            <VscEye className="w-5 h-5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <button
        onClick={() => window.history.back()}
        className="flex items-center justify-center gap-2 px-4 py-2 mb-6 bg-white border rounded-full"
      >
        <SlArrowLeft className="w-4 h-4" /> Back
      </button>
      <div className="flex items-center justify-between gap-5">
        <div>
          <h1 className="mb-4 text-3xl font-bold">Subscriptions Overview</h1>
          <p className="mb-4 text-lg text-gray-600">
            Track activity, view invoices, and keep renewals healthy.
          </p>
        </div>
      </div>

      <div>
        <div className="grid items-center justify-center grid-cols-1 gap-3 md:grid-cols-3">
          <div className="p-6 bg-white border rounded-3xl">
            <p className="text-lg font-medium">Active Subscriptions</p>
            <h1 className="mt-10 text-2xl font-medium">
              {overview?.activeCnt ?? 0}
              {/* API does not provide change text vs last month */}
            </h1>
          </div>

          <div className="p-6 bg-white border rounded-3xl">
            <p className="text-lg font-medium">Canceled Subscriptions</p>
            <h1 className="mt-10 text-2xl font-medium">
              {overview?.cancelCnt ?? 0}
              {/* <span className="text-sm text-gray-400">vs last month</span> */}
            </h1>
          </div>
          <div className="p-6 bg-white border rounded-3xl">
            <p className="text-lg font-medium">Renewal Rate</p>
            <h1 className="mt-10 text-2xl font-medium">
              {overview?.renewRate ?? 0}%
              {/* <span className="text-sm text-gray-400">vs last month</span> */}
            </h1>
          </div>
        </div>
      </div>

      <div className="p-6 my-6 bg-white border rounded-3xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-5">
          <h1 className="text-xl font-medium">Subscription Listing</h1>

          <div className="flex flex-col items-stretch gap-3 md:flex-row md:items-center">
            <div className="w-full md:w-[220px]">
              <div className="px-4 py-2 bg-white border border-gray-200 rounded-full [&_.ant-input-affix-wrapper]:!border-0 [&_.ant-input-affix-wrapper]:!shadow-none [&_.ant-input-affix-wrapper]:!bg-transparent [&_.ant-input]:!bg-transparent [&_.ant-input]:!text-sm">
                <Input
                  prefix={<SearchOutlined />}
                  placeholder="Search"
                  allowClear
                  bordered={false}
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>

            <div className="w-full md:w-auto">
              <div className="px-4 py-2 bg-white border border-gray-200 rounded-full [&_.ant-picker]:!border-0 [&_.ant-picker]:!shadow-none [&_.ant-picker]:!bg-transparent [&_.ant-picker-input_>input]:!text-sm">
                <RangePicker
                  placeholder={["Select Interval", ""]}
                  bordered={false}
                  onChange={(dates, dateStrings) => {
                    if (dates && dates.length === 2) {
                      setDateRange([dateStrings[0], dateStrings[1]]);
                      setCurrentPage(1);
                      return;
                    }
                    setDateRange(null);
                    setCurrentPage(1);
                  }}
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

        <Table
          columns={columns}
          dataSource={Array.isArray(tableData) ? tableData : []}
          loading={isLoading}
          onChange={(pagination, _filters, sorter) => {
            setCurrentPage(pagination.current);
            if (sorter?.field) {
              setSortBy(sorter.field);
              setSortOrder(sorter.order === "ascend" ? "asc" : "desc");
            } else {
              setSortBy(null);
              setSortOrder(null);
            }
          }}
          pagination={{
            current: meta?.page || currentPage,
            pageSize: meta?.limit || 10,
            total: meta?.total || 0,
            showTotal: (total, range) => `Showing ${range[0]}-${range[1]} from ${total}`,
          }}
          style={{ marginTop: 16 }}
          rowKey={(row) => row?._id || row?.id || row?.key}
        />

        <Modal
          title="Subscription Details"
          open={isViewOpen}
          onCancel={handleCloseView}
          footer={[
            <Button key="close" onClick={handleCloseView}>
              Close
            </Button>,
          ]}
          width={600}
          centered
        >
          {selectedSubscription ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src={getAvatarUrl(selectedSubscription)}
                  alt={selectedSubscription?.user?.email}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <div className="text-sm font-semibold text-gray-900">
                    {selectedSubscription?.user?.email
                      ? String(selectedSubscription.user.email).split("@")[0]
                      : "-"}
                  </div>
                  <div className="text-xs text-gray-500">{selectedSubscription?.user?.email || "-"}</div>
                </div>
              </div>

              <div className="p-4 border rounded-xl bg-gray-50">
                <p className="text-xs text-gray-500">User</p>
                <p className="text-base font-semibold text-gray-900">
                  {selectedSubscription?.user?.email ? String(selectedSubscription.user.email).split("@")[0] : "-"}
                </p>
                <p className="text-sm text-gray-600">Email: {selectedSubscription?.user?.email || "-"}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 border rounded-xl">
                  <p className="text-xs text-gray-500">Type</p>
                  <p className="text-sm font-semibold text-gray-900 capitalize">{selectedSubscription.planType || "-"}</p>
                </div>
                <div className="p-4 border rounded-xl">
                  <p className="text-xs text-gray-500">Status</p>
                  <p className="text-sm font-semibold text-gray-900 capitalize">{selectedSubscription.status || "-"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 border rounded-xl">
                  <p className="text-xs text-gray-500">Start Date</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {selectedSubscription.startDate ? new Date(selectedSubscription.startDate).toLocaleString() : "-"}
                  </p>
                </div>
                <div className="p-4 border rounded-xl">
                  <p className="text-xs text-gray-500">Renewal Date</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {selectedSubscription.renewalDate ? new Date(selectedSubscription.renewalDate).toLocaleString() : "-"}
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </Modal>
      </div>
      <DonorsSubscription />
    </div>
  );
};

export default SubscriptionQuickLinks;
