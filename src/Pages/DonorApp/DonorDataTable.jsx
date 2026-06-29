
import { useState } from "react";
import { DatePicker, Input, Table, Spin, Modal, Tag, Divider, Button } from "antd";
import { SearchOutlined, LoadingOutlined } from "@ant-design/icons";
import { VscEye } from "react-icons/vsc";
import { FiDownload } from "react-icons/fi";
import user from "../../assets/image/user.png";

import useSmartFetchHook from "../../Components/hooks/useSmartFetchHook.ts";
import { useGetDonationReportQuery } from "../../redux/feature/donation/donationApis";
import { exportToXlsx } from "../../lib/export-xlsx";

const DonorDataTable = () => {
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
  } = useSmartFetchHook(useGetDonationReportQuery);

  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState(null);


  const handleView = (record) => {
    setSelectedDonor(record);
    setIsViewModalVisible(true);
  };

  const handleViewCancel = () => {
    setIsViewModalVisible(false);
    setSelectedDonor(null);
  };

  const handleDateRangeChange = (dates, dateStrings) => {
    setDateRange(dates);
    setCurrentPage(1);

    const params = {};
    if (dates && dates[0] && dates[1]) {
      params.fromDate = dateStrings?.[0];
      params.toDate = dateStrings?.[1];
    }

    setFilterParams(params);
  };

  const handleExport = () => {
    const rows = (Array.isArray(data) ? data : []).map((r) => {
      const badges = Array.isArray(r?.badges) ? r.badges : [];
      return {
        Name: r?.name || "-",
        Email: r?.email || "-",
        "Total Donations": Number(r?.totalDonationAmount ?? 0),
        "Badges Earned": badges.length,
        "Created At": r?.createdAt ? new Date(r.createdAt).toLocaleString() : "-",
      };
    });

    exportToXlsx({
      rows,
      sheetName: "Donors",
      fileName: `donors-${new Date().toISOString().slice(0, 10)}.xlsx`,
    });
  };

  const columns = [
    {
      title: "Name/Email",
      dataIndex: "email",
      key: "email",
      sorter: (a, b) => String(a?.email || "").localeCompare(String(b?.email || "")),
      render: (_text, record) => (
        <div className="flex items-center gap-3">
          <img
            src={record?.image || record?.profileImage || user}
            alt={record.name}
            className="w-10 h-10 rounded-full object-cover"
            onError={(e) => {
              e.currentTarget.src = user;
            }}
          />
          <div>
            <p className="text-sm font-semibold text-gray-900">{record.name}</p>
            <p className="text-xs text-gray-500">{record.email}</p>
          </div>
        </div>
      ),
    },
    {
      title: "Total Donations",
      dataIndex: "totalDonationAmount",
      key: "totalDonationAmount",
      sorter: (a, b) => Number(a?.totalDonationAmount ?? 0) - Number(b?.totalDonationAmount ?? 0),
      render: (v) => (
        <p className="text-sm font-semibold text-gray-900">${(v ?? 0).toFixed(2)}</p>
      ),
    },
    {
      title: <div className="flex items-center gap-2">Badges Earned</div>,
      dataIndex: "badges",
      key: "badges",
      render: (badges = []) => {
        const maxVisible = 3;
        const visibleBadges = badges.slice(0, maxVisible);
        const remainingCount = Math.max(0, badges.length - maxVisible);

        return (
          <div className="relative group">
            <div className="flex flex-wrap gap-2">
              {visibleBadges.map((b, i) => (
                <span
                  key={i}
                  className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-[11px] font-medium text-gray-700 w-fit"
                >
                  {b?.badgeName || b?.badge_actual_name || "-"}
                </span>
              ))}
              {remainingCount > 0 && (
                <span className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 text-[11px] font-medium text-gray-500">
                  +{remainingCount} more
                </span>
              )}
            </div>
            {badges.length > 0 && (
              <div className="absolute z-10 hidden w-48 p-2 mt-1 text-sm bg-white border rounded shadow-lg group-hover:block">
                <div className="flex flex-col gap-1">
                  {badges.map((b, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 text-gray-600 rounded bg-gray-50"
                    >
                      {b?.badgeName || b?.badge_actual_name || "-"}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      },
    },

    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: (a, b) => new Date(a?.createdAt || 0).getTime() - new Date(b?.createdAt || 0).getTime(),
      render: (createdAt) => (
        <div className="leading-tight">
          <p className="text-sm font-semibold text-gray-900">
            {createdAt ? new Date(createdAt).toLocaleDateString() : "-"}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {createdAt ? new Date(createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
          </p>
        </div>
      ),
    },

    {
      title: "Action",
      key: "action",
      align: "center",
      render: (_, _record) => (
        <div className="flex items-center justify-center gap-3">
          <div
            onClick={() => handleView(_record)}
            className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full cursor-pointer"
          >
            <VscEye />
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="mb-10 bg-white border border-gray-100 rounded-3xl">
      <div className="flex flex-col gap-4 p-6 border-b border-gray-100 md:flex-row md:items-center md:justify-between">
        <h2 className="text-base font-semibold text-gray-900">Donors Data</h2>
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
            dataSource={data}
            loading={isLoading}
            rowKey="_id"
            onChange={(tablePagination) => {
              setCurrentPage(tablePagination.current);
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

      {/* View Donor Modal */}
      <Modal
        title="Donor Details"
        open={isViewModalVisible}
        onCancel={handleViewCancel}
        footer={[
          <Button key="close" onClick={handleViewCancel}>
            Close
          </Button>
        ]}
        width={600}
        styles={{
          content: {
            borderRadius: "30px",
            overflow: "hidden",
          },
        }}
        className="donor-view-modal"
      >
        {selectedDonor && (
          <div className="space-y-6">
            {/* Profile Section */}
            <div className="flex items-center gap-4">
              <img
                src={selectedDonor.image || selectedDonor.profileImage || user}
                alt={selectedDonor.name}
                className="object-cover w-20 h-20 border-2 border-gray-200 rounded-full"
                onError={(e) => { e.target.src = user; }}
              />
              <div>
                <h3 className="text-xl font-semibold">{selectedDonor.name}</h3>
                <p className="text-gray-500">{selectedDonor.email}</p>
                <div className="mt-2">
                  <Tag
                    color={selectedDonor.status === 'verified' ? 'green' : selectedDonor.status === 'pending' ? 'orange' : 'red'}
                    className="capitalize"
                  >
                    {selectedDonor.status}
                  </Tag>
                  <Tag color={selectedDonor.isActive ? 'blue' : 'default'}>
                    {selectedDonor.isActive ? 'Active' : 'Inactive'}
                  </Tag>
                </div>
              </div>
            </div>

            <Divider />

            {/* Contact Information */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block mb-1 text-sm text-gray-500">Phone Number</label>
                <p className="font-medium">{selectedDonor.phoneNumber || 'Not provided'}</p>
              </div>
              <div>
                <label className="block mb-1 text-sm text-gray-500">Address</label>
                <p className="font-medium">{selectedDonor.address || 'Not provided'}</p>
              </div>
              <div>
                <label className="block mb-1 text-sm text-gray-500">State</label>
                <p className="font-medium">{selectedDonor.state || 'Not provided'}</p>
              </div>
              <div>
                <label className="block mb-1 text-sm text-gray-500">Postal Code</label>
                <p className="font-medium">{selectedDonor.postalCode || 'Not provided'}</p>
              </div>
            </div>

            <Divider />

            {/* Donation Information */}
            <div>
              <h4 className="mb-3 font-semibold">Donation Information</h4>
              <div className="p-4 rounded-lg bg-blue-50">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Donation Amount</span>
                  <span className="text-2xl font-bold text-blue-600">
                    ${(selectedDonor.totalDonationAmount).toFixed(2) || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Badges */}
            {selectedDonor.badges && selectedDonor.badges.length > 0 && (
              <div>
                <h4 className="mb-3 font-semibold">Badges Earned ({selectedDonor.badges.length})</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedDonor.badges.map((badge, index) => (
                    <div
                      key={index}
                      className="px-3 py-2 border border-purple-200 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50"
                    >
                      <p className="text-sm font-medium">{badge.badgeName || badge.badge_actual_name}</p>
                      <p className="text-xs text-gray-500">{badge.currentTier}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
              <div>
                <label className="block mb-1 text-gray-500">Joined Date</label>
                <p className="font-medium">
                  {selectedDonor.createdAt ? new Date(selectedDonor.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <label className="block mb-1 text-gray-500">Last Updated</label>
                <p className="font-medium">
                  {selectedDonor.updatedAt ? new Date(selectedDonor.updatedAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DonorDataTable;
