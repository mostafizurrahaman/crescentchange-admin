import { useState } from "react";
import {
  Button,
  Input,
  Modal,
  Table,
  DatePicker,
  Spin,
} from "antd";
import {
  FaEye,
  FaCheckCircle,
} from "react-icons/fa";
import { RxCrossCircled } from "react-icons/rx";
import { BsExclamationCircle } from "react-icons/bs";
import icon from "../../assets/image/leaf.png";
import { FiDownload } from "react-icons/fi";
import { SearchOutlined, LoadingOutlined } from "@ant-design/icons";

import useSmartFetchHook from "../../Components/hooks/useSmartFetchHook.ts";
import { useGetRewardReportQuery } from "../../redux/feature/reward/rewardApis";
import { exportToXlsx } from "../../lib/export-xlsx";

const RewardsManagementTable = () => {
  const { RangePicker } = DatePicker;
  const [dateRange, setDateRange] = useState(null);
  const [selectedReward, setSelectedReward] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const {
    searchTerm,
    setSearchTerm,
    setCurrentPage,
    data: apiResponse,
    pagination,
    isLoading,
    setFilterParams,
  } = useSmartFetchHook(useGetRewardReportQuery);

  const handleView = (record) => {
    setSelectedReward(record);
    setIsViewModalOpen(true);
  };

  const renderStatus = (status) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700">
            <FaCheckCircle /> Active
          </span>
        );
      case "inactive":
        return (
          <span className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
            <RxCrossCircled /> Inactive
          </span>
        );
      case "expired":
        return (
          <span className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
            Expired
          </span>
        );
      case "upcoming":
        return (
          <span className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
            Upcoming
          </span>
        );
      case "sold-out":
        return (
          <span className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-full bg-amber-100 text-amber-700">
            <BsExclamationCircle /> Pending
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
            {status || "-"}
          </span>
        );
    }
  };

  const columns = [
    {
      title: "Reward Name",
      dataIndex: "title",
      key: "title",
      render: (title, record) => (
        <div className="flex items-center gap-3">
          <img
            src={record?.image || icon}
            alt={title || record?.title || "Reward"}
            className="object-contain w-10 h-10 rounded-full"
            onError={(e) => {
              e.currentTarget.src = icon;
            }}
          />
          <button
            type="button"
            onClick={() => handleView(record)}
            className="text-sm font-semibold text-left text-gray-900"
            title={title || "-"}
          >
            {title || "-"}
          </button>
        </div>
      ),
    },
    {
      title: "Business",
      dataIndex: "business",
      key: "business",
      render: (business) => {
        // const businessImageUrl = business?.logoImage || business?.coverImage || "";
        return (
          <div className="flex items-center gap-3">
            {/* <img
              src={businessImageUrl || icon}
              alt={business?.name}
              title={businessImageUrl || "No business logo provided by API"}
              className="object-contain w-10 h-10 rounded-full"
              onError={(e) => {
                e.currentTarget.src = icon;
              }}
            /> */}
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-900">{business?.name || "-"}</span>
              <span className="text-xs text-gray-500">{business?._id || "-"}</span>
            </div>
          </div>
        );
      },
    },
    {
      title: "Tier",
      dataIndex: "tier",
      key: "tier",
      render: (_v, record) => (
        <span className="text-sm text-gray-900">{record?.tier || record?.category || "-"}</span>
      ),
    },
    {
      title: "Redemptions",
      dataIndex: "redeemedCount",
      key: "redeemedCount",
      render: (_v, record) => record.redeemedCount ?? record.redemptions ?? 0,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => renderStatus(status),
    },
    {
      title: "Actions",
      align: "center",
      key: "action",
      render: (_, record) => (
        <div className="flex items-center justify-center gap-3">
          <div
            onClick={() => handleView(record)}
            className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full cursor-pointer"
          >
            <FaEye />
          </div>
        </div>
      ),
    },
  ];


  const handleDateRangeChange = (dates, dateStrings) => {
    setDateRange(dates);
    const newParams = {};
    if (dates && dates[0] && dates[1]) {
      newParams.fromDate = dateStrings[0];
      newParams.toDate = dateStrings[1];
    }
    setFilterParams(newParams);
  };

  const handleExport = () => {
    const rows = (Array.isArray(apiResponse) ? apiResponse : []).map((r) => ({
      Title: r?.title || "-",
      Business: r?.business?.name || "-",
      Tier: r?.tier || r?.category || "-",
      Redemptions: r?.redeemedCount ?? r?.redemptions ?? 0,
      Status: r?.status || "-",
      "Start Date": r?.startDate ? new Date(r.startDate).toLocaleString() : "-",
      "Expiry Date": r?.expiryDate ? new Date(r.expiryDate).toLocaleString() : "-",
    }));

    exportToXlsx({
      rows,
      sheetName: "Rewards",
      fileName: `rewards-${new Date().toISOString().slice(0, 10)}.xlsx`,
    });
  };

  return (
    <div className="mb-10 bg-white border border-gray-100 rounded-3xl">
      <div className="flex flex-col gap-4 p-6 border-b border-gray-100 md:flex-row md:items-center md:justify-between">
        <h2 className="text-base font-semibold text-gray-900">Rewards Management</h2>

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
            dataSource={apiResponse}
            loading={isLoading}
            rowKey="_id"
            onChange={(tablePagination, filters, sorter) => {
              setCurrentPage(tablePagination.current);
              const newParams = {};
              if (sorter?.field) {
                newParams.sortBy = sorter.field;
                newParams.sortOrder = sorter.order === "ascend" ? "asc" : "desc";
              }
              Object.keys(filters || {}).forEach((key) => {
                if (filters[key]) {
                  newParams[key] = filters[key][0];
                }
              });
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

      <Modal
        title="Reward Details"
        open={isViewModalOpen}
        onCancel={() => setIsViewModalOpen(false)}
        footer={null}
        centered
        width={600}
        styles={{
          content: {
            borderRadius: "30px",
            overflow: "hidden",
          },
        }}
      >
        {selectedReward ? (
          <div className="space-y-6">
            {/* Header Section */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="mb-2 text-xl font-semibold text-gray-900">
                  {selectedReward.title}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">by</span>
                  <span className="text-sm font-medium text-gray-700">
                    {selectedReward.business?.name || "Unknown Business"}
                  </span>
                </div>
              </div>
              <div className="flex-shrink-0">
                {renderStatus(selectedReward.status)}
              </div>
            </div>

            {/* Description */}
            <div className="p-4 rounded-lg bg-gray-50">
              <p className="mb-2 text-sm font-medium text-gray-700">Description</p>
              <p className="text-sm leading-relaxed text-gray-600">
                {selectedReward.description || "No description provided"}
              </p>
            </div>

            {/* Key Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border border-blue-100 rounded-lg bg-blue-50">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                    <span className="text-xs font-semibold text-blue-600">C</span>
                  </div>
                  <p className="text-xs font-medium tracking-wide text-blue-700 uppercase">Category</p>
                </div>
                <p className="text-sm font-semibold text-gray-900">{selectedReward.category}</p>
              </div>

              <div className="p-4 border border-purple-100 rounded-lg bg-purple-50">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-full">
                    <span className="text-xs font-semibold text-purple-600">T</span>
                  </div>
                  <p className="text-xs font-medium tracking-wide text-purple-700 uppercase">Type</p>
                </div>
                <p className="text-sm font-semibold text-gray-900">{selectedReward.type}</p>
              </div>

              <div className="p-4 border border-green-100 rounded-lg bg-green-50">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                    <span className="text-xs font-semibold text-green-600">P</span>
                  </div>
                  <p className="text-xs font-medium tracking-wide text-green-700 uppercase">Points Cost</p>
                </div>
                <p className="text-lg font-bold text-gray-900">{selectedReward.pointsCost}</p>
              </div>

              <div className="p-4 border border-orange-100 rounded-lg bg-orange-50">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-full">
                    <span className="text-xs font-semibold text-orange-600">D</span>
                  </div>
                  <p className="text-xs font-medium tracking-wide text-orange-700 uppercase">Duration</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-900">
                    {selectedReward.startDate ? new Date(selectedReward.startDate).toLocaleDateString() : "-"}
                  </p>
                  <p className="text-xs text-gray-500">to</p>
                  <p className="font-medium text-gray-900">
                    {selectedReward.expiryDate ? new Date(selectedReward.expiryDate).toLocaleDateString() : "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* Timeline Section */}
            <div className="pt-4 border-t">
              <h4 className="mb-3 text-sm font-medium text-gray-700">Timeline</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50">
                  <span className="text-sm text-gray-600">Start Date</span>
                  <span className="text-sm font-medium text-gray-900">
                    {selectedReward.startDate ? new Date(selectedReward.startDate).toLocaleString() : "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50">
                  <span className="text-sm text-gray-600">Expiry Date</span>
                  <span className="text-sm font-medium text-gray-900">
                    {selectedReward.expiryDate ? new Date(selectedReward.expiryDate).toLocaleString() : "-"}
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

export default RewardsManagementTable;
