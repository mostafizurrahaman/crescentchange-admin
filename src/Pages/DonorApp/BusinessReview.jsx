import { DatePicker, Input, Table, Button } from "antd";
import icon from "../../assets/image/leaf.png";
import { SearchOutlined } from "@ant-design/icons";
import { FiDownload } from "react-icons/fi";
import useSmartFetchHook from "../../Components/hooks/useSmartFetchHook.ts";
import { useGetBusinessesRewardQuery } from "../../redux/feature/business/businessApis";
import { exportToXlsx } from "../../lib/export-xlsx";
const BusinessReview = () => {
  const { RangePicker } = DatePicker;

  const {
    data,
    pagination,
    isLoading,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    setFilterParams,
  } = useSmartFetchHook(useGetBusinessesRewardQuery);

  const columns = [
    {
      title: "Business",
      dataIndex: "name",
      key: "name",
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <img
            src={record?.icon || icon}
            alt={record.name}
            className="object-contain w-12 h-12 rounded-full"
          />
          <span className="text-sm font-semibold text-gray-900">{record.name}</span>
        </div>
      ),
    },
    {
      title: "Active Rewards",
      dataIndex: "rewardTotal",
      key: "rewardTotal",
      render: (v) => <span className="text-sm font-semibold text-gray-900">{v ?? 0}</span>,
    },
    {
      title: "Total Redemptions",
      dataIndex: "totalRedemption",
      key: "totalRedemption",
      render: (v) => <span className="text-sm font-semibold text-gray-900">{v ?? 0}</span>,
    },
    {
      title: "Top Rewards",
      dataIndex: "topReward",
      key: "topReward",
      render: (topReward) => (
        <span className="text-sm text-gray-900">
          {typeof topReward === "string" ? topReward : topReward?.name || topReward?.title || "-"}
        </span>
      ),
    },
  ];

  const handleExport = () => {
    const rows = (Array.isArray(data) ? data : []).map((r) => ({
      Business: r?.name || "-",
      "Active Rewards": r?.rewardTotal ?? 0,
      "Total Redemptions": r?.totalRedemption ?? 0,
      "Top Rewards": typeof r?.topReward === "string" ? r.topReward : r?.topReward?.name || r?.topReward?.title || "-",
    }));

    exportToXlsx({
      rows,
      sheetName: "Business Rewards",
      fileName: `business-rewards-${new Date().toISOString().slice(0, 10)}.xlsx`,
    });
  };
  return (
    <div className="mb-10 bg-white border border-gray-100 rounded-3xl">
      <div className="flex flex-col gap-4 p-6 border-b border-gray-100 md:flex-row md:items-center md:justify-between">
        <h2 className="text-base font-semibold text-gray-900">Business Rewards Overview</h2>
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
                bordered={false}
                allowClear
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="w-full md:w-auto">
            <div className="flex items-center h-12 px-5 bg-white border border-gray-200 rounded-full [&_.ant-picker]:!border-0 [&_.ant-picker]:!shadow-none [&_.ant-picker]:!bg-transparent [&_.ant-picker]:!p-0 [&_.ant-picker]:!h-full [&_.ant-picker-input_>input]:!text-sm [&_.ant-picker-input_>input]:!h-full">
              <RangePicker
                placeholder={["Select Interval", ""]}
                onChange={(_dates, dateStrings) => {
                  const [fromDate, toDate] = dateStrings || [];
                  setFilterParams({
                    fromDate: fromDate || undefined,
                    toDate: toDate || undefined,
                  });
                }}
                disabled={isLoading}
                bordered={false}
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

      <div className="">
        <Table
          columns={columns}
          dataSource={data}
          loading={isLoading}
          pagination={{
            current: pagination?.page || currentPage,
            pageSize: pagination?.limit || 5,
            total: pagination?.total || 0,
            showTotal: (total, range) =>
              `Showing ${String(range?.[1] ?? 0).padStart(2, "0")} from ${String(total).padStart(2, "0")}`,
            onChange: (page) => setCurrentPage(page),
            showSizeChanger: false,
            position: ["bottomRight"],
          }}
          rowKey={(record) => record?._id || record?.id}
        />
      </div>
    </div>
  );
};

export default BusinessReview;
