import { useEffect, useState } from "react";
import {
  Button,
  Input,
  Dropdown,
  Menu,
  Switch,
  Drawer,
  Table,
  Tag,
  Space,
  Spin,
  DatePicker,
  message,
} from "antd";
import {
  EllipsisOutlined,
  QrcodeOutlined,
  WifiOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import { LoadingOutlined } from "@ant-design/icons";
import muffin from "../../../assets/image/muffin.png";
import free from "../../../assets/image/free.png";
import entire from "../../../assets/image/entire.png";
import qr from "../../../assets/image/qr.png";
import nfc from "../../../assets/image/nfc.png";
import manual from "../../../assets/image/manual.png";
import { FiDownload } from "react-icons/fi";
import { exportToXlsx } from "../../../lib/export-xlsx";
// import { FaPlus } from "react-icons/fa6";
import useSmartFetchHook from "../../hooks/useSmartFetchHook.ts";
import {
  useGetRewardReportQuery,
  useGetSingleRewardQuery,
  useUpdateRewardStatusMutation,
} from "../../../redux/feature/reward/rewardApis";

// Data for the rewards (mock data as per your design)
const initialRewards = [
  {
    id: 1,
    title: "Free Coffee",
    description: " GreenO Bites",
    redemptions: 120,
    expires: "June 30, 2025",
    icon: free,
    offeredBy: "GreenO Bites",
    redeem: [manual, qr, nfc],
  },
  {
    id: 2,
    title: "Free Muffin",
    description: " Coffee Beans & Tea Leaf",
    redemptions: 86,
    expires: "June 30, 2025",
    icon: muffin,
    offeredBy: "GreenO Bites",
    redeem: [qr],
  },
  {
    id: 3,
    title: "Free Cookie",
    description: " Crumble",
    redemptions: 86,
    expires: "June 30, 2025",
    icon: muffin,
    offeredBy: "GreenO Bites",
    redeem: [qr],
  },
  {
    id: 4,
    title: "10% Off Entire Order",
    description: "Offered by: Burning Brownie",
    redemptions: 86,
    expires: "June 30, 2025",
    icon: entire,
    offeredBy: "GreenO Bites",
    redeem: [qr],
  },
];

const DonorRewards = () => {
  const { RangePicker } = DatePicker;
  const [dateRange, setDateRange] = useState(null);

  const { data: rewardList, isLoading, searchTerm, setSearchTerm, setFilterParams } = useSmartFetchHook(
    useGetRewardReportQuery
  );

  const [rewards, setRewards] = useState(initialRewards);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedReward, setSelectedReward] = useState(null);
  const [redemptionsPage, setRedemptionsPage] = useState(1);
  const [selectedRewardId, setSelectedRewardId] = useState(null);
  const [updatingRewardId, setUpdatingRewardId] = useState(null);

  const [updateRewardStatus] = useUpdateRewardStatusMutation();

  const {
    data: singleRewardResponse,
    isLoading: isSingleRewardLoading,
  } = useGetSingleRewardQuery(selectedRewardId, {
    skip: !selectedRewardId,
  });

  const rewardDetails = singleRewardResponse?.data?.reward;
  const redemptionList = singleRewardResponse?.data?.redeemtionList || [];

  const redemptionPageSize = 5;
  const redemptionCurrentPageData = redemptionList
    .slice((redemptionsPage - 1) * redemptionPageSize, redemptionsPage * redemptionPageSize)
    .map((item) => ({
      key: item?._id,
      name: item?.user?.name || "-",
      email: item?.user?.auth?.email || "-",
      status: item?.status,
      redemptionMethod: item?.redemptionMethod,
      assignedCode: item?.assignedCode,
      date: item?.claimedAt
        ? new Date(item.claimedAt).toLocaleDateString()
        : item?.createdAt
        ? new Date(item.createdAt).toLocaleDateString()
        : "-",
      time: item?.claimedAt
        ? new Date(item.claimedAt).toLocaleTimeString()
        : item?.createdAt
        ? new Date(item.createdAt).toLocaleTimeString()
        : "-",
    }));

  const handleExportRedemptions = () => {
    const rows = redemptionCurrentPageData.map((r) => ({
      Name: r?.name || "-",
      Email: r?.email || "-",
      Status: r?.status || "-",
      Method: r?.redemptionMethod || "-",
      Code: r?.assignedCode || "-",
      Date: r?.date || "-",
      Time: r?.time || "-",
    }));

    exportToXlsx({
      rows,
      sheetName: "Redemptions",
      fileName: `redemptions-${new Date().toISOString().slice(0, 10)}.xlsx`,
    });
  };

  useEffect(() => {
    if (!Array.isArray(rewardList)) return;

    const mapped = rewardList.map((r) => {
      const category = r?.category;
      const iconByCategory =
        category === "food"
          ? muffin
          : category === "groceries"
          ? free
          : category === "travel"
          ? entire
          : free;

      const redeem = [];
      if (r?.inStoreRedemptionMethods?.staticCode) redeem.push(manual);
      if (r?.inStoreRedemptionMethods?.qrCode) redeem.push(qr);
      if (r?.inStoreRedemptionMethods?.nfcTap) redeem.push(nfc);

      return {
        id: r?._id,
        title: r?.title,
        description: r?.business?.name || "",
        redemptions: r?.redeemedCount ?? r?.redemptions ?? 0,
        expires: r?.expiryDate ? new Date(r.expiryDate).toLocaleDateString() : "-",
        icon: iconByCategory,
        offeredBy: r?.business?.name || "-",
        redeem,
        isActive: !!r?.isActive,
        _raw: r,
      };
    });

    setRewards(mapped);
  }, [rewardList]);

  const handleDateRangeChange = (dates, dateStrings) => {
    setDateRange(dates);
    const newParams = {};
    if (dates && dates[0] && dates[1]) {
      newParams.fromDate = dateStrings[0];
      newParams.toDate = dateStrings[1];
    }
    setFilterParams(newParams);
  };


  const openDrawer = (reward) => {
    setSelectedReward(reward);
    setSelectedRewardId(reward?.id);
    setDrawerVisible(true);
  };

  const handleToggleActive = async (rewardId, nextActive) => {
    if (!rewardId) return;

    const prevRewards = rewards;
    setUpdatingRewardId(rewardId);

    setRewards((current) =>
      current.map((r) => (r.id === rewardId ? { ...r, isActive: nextActive } : r))
    );

    try {
      await updateRewardStatus({ id: rewardId, isActive: nextActive }).unwrap();
      message.success("Status updated");
    } catch {
      setRewards(prevRewards);
      message.error("Failed to update status");
    } finally {
      setUpdatingRewardId(null);
    }
  };

  const closeDrawer = () => {
    setDrawerVisible(false);
    setSelectedReward(null);
    setSelectedRewardId(null);
  };

  const redemptionColumns = [
    {
      title: "Name/Email",
      dataIndex: "name",
      key: "name",
      render: (_text, record) => (
        <div>
          <p className="font-medium">{record.name}</p>
          <p className="text-sm text-gray-500">{record.email}</p>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag
          color={
            status === "redeemed"
              ? "green"
              : status === "claimed"
              ? "orange"
              : "default"
          }
          className="capitalize"
        >
          {status || "-"}
        </Tag>
      ),
    },
    {
      title: "Claimed At",
      dataIndex: "claimedAt",
      key: "claimedAt",
      render: (_text, record) => (
        <span>
          {record.date} <br />
          <span className="text-sm text-gray-500">{record.time}</span>
        </span>
      ),
    },
    {
      title: "Method",
      dataIndex: "redemptionMethod",
      key: "redemptionMethod",
      render: (v) => <span className="capitalize">{v || "-"}</span>,
    },
    {
      title: "Code",
      dataIndex: "assignedCode",
      key: "assignedCode",
      render: (code) => <span className="font-medium">{code || "-"}</span>,
    },
  ];

  const rewardMenu = (reward) => (
    <Menu>
      <Menu.Item onClick={() => openDrawer(reward)}>
        View Detail
      </Menu.Item>
    </Menu>
  );

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-base font-semibold text-gray-900">Create and manage donor rewards</h2>

        <div className="flex flex-col items-stretch gap-3 md:flex-row md:items-center">
          <div className="w-full md:w-[220px]">
            <div className="px-4 py-2 bg-white border border-gray-200 rounded-full [&_.ant-input-affix-wrapper]:!border-0 [&_.ant-input-affix-wrapper]:!shadow-none [&_.ant-input-affix-wrapper]:!bg-transparent [&_.ant-input]:!bg-transparent [&_.ant-input]:!text-sm">
              <Input
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                bordered={false}
                allowClear
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="w-full md:w-auto">
            <div className="px-4 py-2 bg-white border border-gray-200 rounded-full [&_.ant-picker]:!border-0 [&_.ant-picker]:!shadow-none [&_.ant-picker]:!bg-transparent [&_.ant-picker-input_>input]:!text-sm">
              <RangePicker
                placeholder={["Select Interval", ""]}
                onChange={handleDateRangeChange}
                value={dateRange}
                bordered={false}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>
      </div>

      <Spin spinning={isLoading} indicator={<LoadingOutlined spin />}>
        <div className="grid grid-cols-1 gap-4 mt-6 sm:grid-cols-2 lg:grid-cols-3">
          {rewards.map((reward) => (
            <div
              key={reward.id}
              role="button"
              tabIndex={0}
              onClick={() => openDrawer(reward)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  openDrawer(reward);
                }
              }}
              className="p-5 bg-white border shadow-sm cursor-pointer rounded-2xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img src={reward.icon} alt="" className="w-8 h-8" />
                  <h3 className="text-base font-semibold text-gray-900">{reward.title}</h3>
                </div>

                <Dropdown overlay={rewardMenu(reward)} trigger={["click"]}>
                  <Button
                    type="text"
                    onClick={(e) => e.stopPropagation()}
                    className="!h-9 !w-9 !p-0 flex items-center justify-center rounded-full bg-gray-50"
                    icon={<EllipsisOutlined />}
                  />
                </Dropdown>
              </div>

              <div className="flex items-center justify-between gap-4 mt-4">
                <p className="text-xs text-gray-500">Expires: {reward.expires}</p>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-gray-700">Active</p>
                  <Switch
                    checked={!!reward.isActive}
                    disabled={updatingRewardId === reward.id}
                    loading={updatingRewardId === reward.id}
                    onClick={(checked, e) => {
                      e?.stopPropagation?.();
                    }}
                    onChange={(checked) => handleToggleActive(reward.id, checked)}
                  />
                </div>
              </div>

              <div className="mt-4">
                <p className="text-xs text-gray-500">Offered by:</p>
                <p className="mt-1 text-sm font-medium text-gray-900">{reward.offeredBy}</p>
              </div>

              <div className="flex items-end justify-between gap-4 mt-6">
                <div>
                  <p className="text-2xl font-semibold text-gray-900">{reward.redemptions}</p>
                  <p className="text-xs text-gray-500">redemptions</p>
                </div>

                <div className="text-right">
                  <p className="text-xs text-gray-700">Redeem via</p>
                  <div className="flex items-center justify-end gap-2 mt-2">
                    {reward.redeem.map((method, index) => (
                      <img
                        key={index}
                        src={method}
                        alt="redeem option"
                        className="w-5 h-5"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Spin>
      {/* <RewardExport /> */}

      {/* Reward Detail Drawer */}
      <Drawer
        title={null}
        placement="right"
        onClose={closeDrawer}
        open={drawerVisible}
        width={600}
        className="px-8"
        
      >
        {selectedReward && (
          <>
            {isSingleRewardLoading ? (
              <div className="py-10">
                <Spin
                  spinning
                  indicator={<LoadingOutlined spin />}
                  className="w-full"
                />
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <img src={selectedReward.icon} alt="" className="w-10 h-10" />
                  <div>
                    <h2 className="text-lg font-semibold">{selectedReward.title}</h2>
                    <p className="text-sm text-gray-500">
                      {rewardDetails?.description || "-"}
                    </p>
                    <div className="mt-2">
                      <Tag
                        color={rewardDetails?.status === "active" ? "green" : "default"}
                        className="capitalize"
                      >
                        {rewardDetails?.status || "-"}
                      </Tag>
                      <Tag color={rewardDetails?.isActive ? "blue" : "default"}>
                        {rewardDetails?.isActive ? "Active" : "Inactive"}
                      </Tag>
                    </div>
                  </div>
                </div>

                {/* Offered By */}
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Offered By</p>
                  <p className="font-medium">{selectedReward.offeredBy}</p>
                </div>

                {/* Reward Code & Redeem Options */}
                <div className="flex items-center justify-between p-3 mb-6 border rounded-md">
                  <p className="font-medium">
                    {redemptionList?.[0]?.assignedCode
                      ? `#${redemptionList[0].assignedCode}`
                      : "-"}
                  </p>
                  <Space size="large">
                    {rewardDetails?.inStoreRedemptionMethods?.qrCode && (
                      <QrcodeOutlined className="text-xl" />
                    )}
                    {rewardDetails?.inStoreRedemptionMethods?.nfcTap && (
                      <WifiOutlined className="text-xl" />
                    )}
                    {rewardDetails?.inStoreRedemptionMethods?.staticCode && (
                      <AppstoreOutlined className="text-xl" />
                    )}
                  </Space>
                </div>

                {/* Redemption Stats */}
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Redemption Stats</h3>
                  <Button
                    onClick={handleExportRedemptions}
                    disabled={isSingleRewardLoading}
                    className="!h-10 !rounded-full !border-gray-200 !px-5 !text-sm !font-medium"
                  >
                    Export <FiDownload className="ml-2" />
                  </Button>
                </div>
                <Table
                  columns={redemptionColumns}
                  dataSource={redemptionList.map((item) => ({
                    key: item?._id,
                    name: item?.user?.name || "-",
                    email: item?.user?.auth?.email || "-",
                    status: item?.status,
                    redemptionMethod: item?.redemptionMethod,
                    assignedCode: item?.assignedCode,
                    date: item?.claimedAt
                      ? new Date(item.claimedAt).toLocaleDateString()
                      : item?.createdAt
                      ? new Date(item.createdAt).toLocaleDateString()
                      : "-",
                    time: item?.claimedAt
                      ? new Date(item.claimedAt).toLocaleTimeString()
                      : item?.createdAt
                      ? new Date(item.createdAt).toLocaleTimeString()
                      : "-",
                  }))}
                  pagination={{
                    current: redemptionsPage,
                    pageSize: redemptionPageSize,
                    onChange: (p) => setRedemptionsPage(p),
                    showSizeChanger: false,
                  }}
                  size="middle"
                />
              </>
            )}
          </>
        )}
      </Drawer>
    </div>
  );
};

export default DonorRewards;
