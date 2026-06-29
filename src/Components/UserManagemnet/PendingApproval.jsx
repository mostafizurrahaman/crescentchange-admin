import { useState } from "react";
import { useDispatch } from "react-redux";
import { DatePicker, Input, Table, Spin, Button } from "antd";
import { SearchOutlined, LoadingOutlined } from "@ant-design/icons";
import user from "../../assets/image/user.png";
import { RxCross2 } from "react-icons/rx";
import { FiDownload } from "react-icons/fi";
import useSmartFetchHook from "../hooks/useSmartFetchHook.ts";
import { useGetUserPendingReportQuery } from "../../redux/feature/user/userApis.js";
import { baseApi } from "../../redux/feature/baseApi";
import { Check } from "lucide-react";
import { exportToXlsx } from "../../lib/export-xlsx";

const PendingApproval = () => {
  const { RangePicker } = DatePicker;
  const [dateRange, setDateRange] = useState(null);
  const [rowLoadingId, setRowLoadingId] = useState(null);
  const dispatch = useDispatch();
  const {
    searchTerm,
    setSearchTerm,
    setCurrentPage,
    data: apiResponse,
    pagination,
    isLoading,
    setFilterParams,
  } = useSmartFetchHook(useGetUserPendingReportQuery);

  const data = apiResponse || [];

  const handleAccept = async (record) => {
    if (record?.status !== "pending") return;
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
    if (record?.status !== "pending") return;
    try {
      setRowLoadingId(record._id);
      await dispatch(
        baseApi.endpoints.changeUserStatus.initiate({ id: record._id, status: "suspended" })
      ).unwrap();
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
        r?.name
          ? r.name
          : r?.firstName || r?.lastName
          ? `${r?.firstName || ""} ${r?.lastName || ""}`.trim()
          : r?.email?.split("@")[0] || "-",
      Email: r?.email || "-",
      Role: r?.role || "-",
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
      sheetName: "Pending Approvals",
      fileName: `pending-approvals-${new Date().toISOString().slice(0, 10)}.xlsx`,
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
            src={user}
            alt={record?.email}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-gray-900">
                {record?.name
                  ? record?.name
                  : record?.firstName || record?.lastName
                  ? `${record?.firstName || ""} ${record?.lastName || ""}`.trim()
                  : record?.email?.split("@")[0] || "-"}
              </p>
            </div>
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
      align: "center",
      width: 120,
      filters: [
        { text: "Pending", value: "pending" },
        { text: "Verified", value: "verified" },
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
      render: (_,_record) => {
        const isPending = _record?.status === "pending";
        const isRowLoading = rowLoadingId === _record?._id;
        return (
          <div className="flex items-center justify-center gap-3 text-lg">
            <div
              onClick={() => { if (!isRowLoading) handleSuspend(_record); }}
              className={`flex items-center justify-center w-10 h-10 rounded-full ${isPending && !isRowLoading ? "cursor-pointer bg-gray-100" : "cursor-not-allowed bg-gray-50 opacity-50"}`}
              title={isPending ? (isRowLoading ? "Processing..." : "Suspend user") : "Only pending users can be suspended"}
            >
              {isRowLoading ? <LoadingOutlined /> : <RxCross2 />}
            </div>
            <div
              onClick={() => { if (!isRowLoading) handleAccept(_record); }}
              className={`flex items-center justify-center w-10 h-10 rounded-full ${isPending && !isRowLoading ? "cursor-pointer bg-gray-100" : "cursor-not-allowed bg-gray-50 opacity-50"}`}
              title={isPending ? (isRowLoading ? "Processing..." : "Accept user") : "Only pending users can be accepted"}
            >
              {isRowLoading ? <LoadingOutlined /> : <Check size={18} />}
            </div>
          </div>
        );
      },
    },
  ];

  return (
    <div className="p-6 mb-10 bg-white border rounded-3xl">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-base font-semibold text-gray-900">Pending Approvals</h2>
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
                disabled={isLoading}
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
                disabled={isLoading}
                allowEmpty={[true, true]}
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

      <Spin spinning={isLoading} indicator={<LoadingOutlined spin />}>
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
              pageSize: pagination.limit || 10,
              total: pagination.total || 0,
              showTotal: (total, range) => `Showing ${range[0]}-${range[1]} from ${total}`,
              showSizeChanger: false,
              position: ["bottomRight"],
            }}
            rowKey="_id"
          />
        </div>
      </Spin>
    </div>
  );
};

export default PendingApproval;
