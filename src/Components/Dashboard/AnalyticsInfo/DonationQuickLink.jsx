import { Table, Input, Drawer, Button } from "antd";
import { VscEye } from "react-icons/vsc";
import user from "../../../assets/image/user.png";
import { FiDownload } from "react-icons/fi";
import Chnage from "../../../assets/image/Change.png";
import Gift from "../../../assets/image/Gift.png";
import Calendar from "../../../assets/image/Calendar.png";
import { SlArrowLeft } from "react-icons/sl";
import { useGetDonationHistoryQuery } from "../../../redux/feature/donation/donationApis";
import useSmartFetchHook from "../../hooks/useSmartFetchHook.ts";
import { useState } from "react";
import { exportToXlsx } from "../../../lib/export-xlsx";
const DonationQuickLink = () => {
  const { Search } = Input;

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);

  const {
    searchTerm,
    setSearchTerm,
    setCurrentPage,
    data: donationRes,
    pagination,
    isLoading,
    isError,
    setFilterParams,
  } = useSmartFetchHook(useGetDonationHistoryQuery);

  const apiData = donationRes?.donationHistory || [];
  const toTitleDonationType = (type) => {
    if (!type) return "-";
    const map = {
      "round-up": "Round Up",
      "one-time": "One Time",
      recurring: "Recurring",
    };
    return map[type] || type;
  };

  const renderDonationTypeBadge = (value) => (
    <div className="flex items-center gap-2">
      {value === "Round Up" && (
        <div className="flex items-center gap-1 px-4 py-1 text-blue-600 bg-blue-100 rounded-2xl">
          <img src={Chnage} alt="" /> Round Up
        </div>
      )}
      {value === "Recurring" && (
        <div className="flex items-center gap-1 px-4 py-1 text-green-600 bg-green-100 rounded-2xl">
          <img src={Calendar} alt="" />
          Recurring
        </div>
      )}
      {value === "One Time" && (
        <div className="flex items-center gap-1 px-4 py-1 text-pink-600 bg-pink-100 rounded-2xl">
          <img src={Gift} alt="" /> One Time
        </div>
      )}
      {value !== "Round Up" && value !== "Recurring" && value !== "One Time" ? (
        <div className="px-3 py-1 text-gray-700 bg-gray-100 rounded-2xl">{value || "-"}</div>
      ) : null}
    </div>
  );

  const tableData = apiData.map((item, idx) => ({
    key: item?.createdAt || String(idx),
    _id: item?._id,
    donorName: item?.donor?.name || "-",
    donorEmail: item?.donor?.email || "-",
    organizationName: item?.organization?.name || "-",
    organizationEmail: item?.organization?.email || "-",
    causeId: item?.cause || "-",
    donationTypeRaw: item?.donationType,
    donationType: toTitleDonationType(item?.donationType),
    dateTime: item?.createdAt,
    donationMessage: item?.specialMessage || "-",
    amount: Number(item?.amount) || 0,
  })) || [];

  const handleExport = () => {
    const rows = (Array.isArray(tableData) ? tableData : []).map((r) => ({
      Name: r?.donorName || "-",
      Email: r?.donorEmail || "-",
      Amount: Number(r?.amount ?? 0),
      "Donation Type": r?.donationType || "-",
      "Date & Time": r?.dateTime ? new Date(r.dateTime).toLocaleString() : "-",
      Message: r?.donationMessage || "-",
      Cause: r?.causeId || "-",
      Organization: r?.organizationName || "-",
    }));

    exportToXlsx({
      rows,
      sheetName: "Donations",
      fileName: `donations-${new Date().toISOString().slice(0, 10)}.xlsx`,
    });
  };

  const handleOpenView = (record) => {
    setSelectedDonation(record);
    setIsViewOpen(true);
  };

  const columns = [
    {
      title: "Name/Email",
      dataIndex: "donorName",
      key: "name",
      sorter: true,
      render: (text, record) => (
        <div className="flex gap-1">
          {/* Assuming 'user' is the image URL */}
          <img
            src={user}
            alt={record.name}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <p className="font-medium">{record.donorName}</p>
            <p className="text-gray-400">{record.donorEmail}</p>
          </div>
        </div>
      ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      sorter: true,
      render: (amount) => <p className="font-medium"> ${Number(amount || 0).toFixed(2)}</p>,
    },
    {
      title: "Date & Time",
      dataIndex: "dateTime",
      key: "dateTime",
      sorter: true,
      render: (dateTime) => {
        if (!dateTime) return <p className="font-medium">-</p>;

        const dt = new Date(dateTime);
        return (
          <div className="leading-tight">
            <p className="text-base font-semibold text-gray-900">{dt.toLocaleDateString()}</p>
            <p className="mt-1 text-sm text-gray-500">{dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
          </div>
        );
      },
    },
    {
      title: "Donation Type",
      dataIndex: "donationType",
      key: "donationType",
      filters: [
        { text: "One Time", value: "one-time" },
        { text: "Recurring", value: "recurring" },
        { text: "Round Up", value: "round-up" },
      ],
      render: (value) => (
        <div className="flex items-center gap-2 px-4 py-2 rounded-3xl">
          {renderDonationTypeBadge(value)}
        </div>
      ),
    },

    {
      title: "Donation Message",
      dataIndex: "donationMessage",
      key: "donationMessage",
      render: (donationMessage) => (
        <p className="font-medium"> {donationMessage}</p>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => handleOpenView(record)}
            className="flex items-center justify-center"
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
      <div className="flex flex-col gap-6">
        <div className="flex items-start justify-between gap-6">
          <div className="max-w-[720px]">
            <h1 className="mb-2 text-3xl font-bold">Donations Overview</h1>
            <p className="text-base text-gray-500">
              Filter, review, and manage receipts with ease.
            </p>
          </div>
          <div />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="p-6 bg-white border rounded-3xl">
            <p className="text-sm font-semibold text-gray-900">Total Donations</p>
            <div className="mt-10">
              <p className="text-3xl font-semibold">
                <span className="text-gray-300">$</span>
                {Number(donationRes?.totalDonation || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                <span className="text-green-600">{donationRes?.totalDonationChangeText || ""}</span>
              </p>
            </div>
          </div>

          <div className="p-6 bg-white border rounded-3xl">
            <p className="text-sm font-semibold text-gray-900">Avg. Donation</p>
            <div className="mt-10">
              <p className="text-3xl font-semibold">
                <span className="text-gray-300">$</span>
                {Number(donationRes?.avgDonationAmount || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                <span className="text-green-600">{donationRes?.avgDonationChangeText || ""}</span>
              </p>
            </div>
          </div>

          <div className="p-6 bg-white border rounded-3xl">
            <p className="text-sm font-semibold text-gray-900">Total Donors</p>
            <div className="mt-10">
              <p className="text-3xl font-semibold">{Number(donationRes?.totalDonors || 0).toLocaleString()}</p>
              <p className="mt-1 text-xs text-gray-500">
                <span className="text-green-600">{donationRes?.totalDonorsChangeText || ""}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white border rounded-3xl">
          <div className="flex items-center justify-between gap-6 mb-4">
            <h1 className="text-lg font-semibold">Donation history</h1>

            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-white border rounded-full">
                <Search
                  placeholder="Search"
                  allowClear
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  variant="borderless"
                />
              </div>

              <Button
                onClick={handleExport}
                disabled={isLoading}
                className="!h-10 !rounded-full !border-gray-200 !px-5 !text-sm !font-medium"
              >
                Export <FiDownload className="ml-2" />
              </Button>
            </div>
          </div>
          <Table
            columns={columns}
            dataSource={tableData}
            loading={isLoading}
            onChange={(pagination, filters, sorter) => {
              setCurrentPage(pagination.current);
              const newFilterParams = {};
              // Handle sorting
              if (sorter.field) {
                newFilterParams.sortBy = sorter.field;
                newFilterParams.sortOrder = sorter.order === "ascend" ? "asc" : "desc";
              }
              // Handle filters
              Object.keys(filters).forEach((key) => {
                if (filters[key]) {
                  newFilterParams[key] = filters[key][0];
                }
              });
              setFilterParams(newFilterParams);
            }}
            pagination={{
              current: pagination.page,
              pageSize: pagination.limit,
              total: pagination.total,
              // showSizeChanger: true,
              // pageSizeOptions: ["5", "10", "20", "50"],
              showTotal: (total) => `Total ${total} items`,
            }}
            scroll={{
              x: true,
            }}
          />
          {isError && (
            <div className="mt-2 text-red-500">Failed to load donation history.</div>
          )}
        </div>
      </div>

      <Drawer
        title="Donation Details"
        open={isViewOpen}
        onClose={() => {
          setIsViewOpen(false);
          setSelectedDonation(null);
        }}
        placement="right"
        width={420}
      >
        {selectedDonation ? (
          <div className="space-y-4">
            <div className="p-4 border rounded-xl bg-gray-50">
              <p className="text-xs text-gray-500">Donor</p>
              <p className="text-base font-semibold text-gray-900">{selectedDonation.donorName}</p>
              <p className="text-sm text-gray-600">{selectedDonation.donorEmail}</p>
            </div>

            <div className="p-4 border rounded-xl bg-gray-50">
              <p className="text-xs text-gray-500">Organization</p>
              <p className="text-base font-semibold text-gray-900">{selectedDonation.organizationName}</p>
              <p className="text-sm text-gray-600">{selectedDonation.organizationEmail}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 border rounded-xl">
                <p className="text-xs text-gray-500">Amount</p>
                <p className="text-lg font-bold text-gray-900">${Number(selectedDonation.amount || 0).toFixed(2)}</p>
              </div>
              <div className="p-4 border rounded-xl">
                <p className="text-xs text-gray-500">Donation Message</p>
                <p className="text-sm text-gray-800 whitespace-pre-wrap">
                  {selectedDonation.donationMessage || "-"}
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </Drawer>
    </div>
  );
};

export default DonationQuickLink;
