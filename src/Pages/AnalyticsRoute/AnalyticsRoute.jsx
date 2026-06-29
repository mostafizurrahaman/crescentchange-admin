/* eslint-disable no-unused-vars */
import React, { useMemo, useState } from "react";
import { BsArrowUpRight } from "react-icons/bs";
import { Link } from "react-router-dom";
import { BarChart, ResponsiveContainer } from "recharts";
import { FilterOutlined } from "@ant-design/icons";
import {
  Bar,
  CartesianGrid,
  Legend,
  Pie,
  PieChart,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import { Select } from "antd";
import { FaArrowDown } from "react-icons/fa";
import {
  useGetUserEngagementQuery,
  useGetDonationChartQuery,
  useGetCauseWisePercentagesQuery,
} from "../../redux/feature/user/userApis";
import { exportToXlsx } from "../../lib/export-xlsx";
const { Option } = Select;
const AnalyticsRoute = () => {
  const [active, setActive] = useState("Today");

  const userEngagementTimeFilter = useMemo(() => {
    if (active === "Today") return "today";
    if (active === "This Week") return "week";
    if (active === "This Month") return "month";
    return "month";
  }, [active]);

  const { data: userEngagementData, isLoading: userEngagementLoading } = useGetUserEngagementQuery({
    timeFilter: userEngagementTimeFilter,
    role: "CLIENT",
  });

  const [donationType, setDonationType] = useState("all");
  const [year, setYear] = useState(new Date().getFullYear());

  const { data: donationChart, isLoading: donationLoading } = useGetDonationChartQuery({ 
    donationType: donationType === "all" ? undefined : donationType, 
    year 
  });

  const {
    data: causeWisePercentages,
    isLoading: causeWiseLoading,
    error: causeWiseError,
  } = useGetCauseWisePercentagesQuery();

  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const dataChart = useMemo(() => {
    const list = donationChart?.data?.monthlyDonations || [];
    const byMonth = new Map(list.map((m) => [m.month, m]));
    return Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const item = byMonth.get(month);
      return {
        name: monthNames[i],
        totalAmount: item?.totalAmount || 0,
        count: item?.count || 0,
      };
    });
  }, [donationChart]);

  const getFilteredData = () => {
    switch (active) {
      case "Today":
        return { message: "Showing today's data" };
      case "This Week":
        return { message: "Showing this week's data" };
      case "This Month":
        return { message: "Showing this month's data" };
      default:
        return { message: "No data" };
    }
  };
  const data = getFilteredData();
  const btnClass = (label) =>
    `px-5 py-2 rounded-full border text-sm font-medium transition ${
      active === label
        ? "bg-black text-white border-black"
        : "bg-white text-gray-900 border-gray-200 hover:bg-gray-50"
    }`;
  const PALETTE = {
    org: "#6ee7b7", 
    biz: "#93c5fd", 
    donor: "#fbcfe8",
    pie: ["#c7d2fe", "#bae6fd", "#fde68a", "#fecaca", "#e9d5ff", "#d1fae5"],
  };
  const causes = useMemo(() => {
    const list = Array.isArray(causeWisePercentages?.data)
      ? causeWisePercentages.data
      : Array.isArray(causeWisePercentages?.data?.data)
      ? causeWisePercentages.data.data
      : [];

    return list
      .map((item, index) => {
        const percentRaw = Number(item?.percentage ?? 0);
        const createdAt = item?.createdAt ? new Date(item.createdAt) : null;
        const label = item?.clause || item?.cause || "-";
        return {
          id: `${label}-${index}`,
          name: label,
          since: createdAt ? createdAt.toLocaleDateString() : "—",
          percent: Number.isFinite(percentRaw) ? Number(percentRaw.toFixed(2)) : 0,
          totalAmount: Number(item?.totalAmount ?? 0),
          color: PALETTE.pie[index % PALETTE.pie.length],
        };
      })
      .sort((a, b) => (b.percent || 0) - (a.percent || 0));
  }, [causeWisePercentages]);
  const dataChartStaticRemoved = null;

  const handleExport = () => {
    const rows = [];

    rows.push({
      Section: "Filters",
      Metric: "User Engagement Time Filter",
      Value: userEngagementTimeFilter,
    });
    rows.push({
      Section: "Filters",
      Metric: "Donation Type",
      Value: donationType,
    });
    rows.push({
      Section: "Filters",
      Metric: "Year",
      Value: year,
    });
    rows.push({});

    rows.push({ Section: "User Engagement", Metric: "Active Users", Value: userEngagementData?.data?.totalActiveUsers ?? 0 });
    rows.push({ Section: "User Engagement", Metric: "Active Users Change", Value: userEngagementData?.data?.activeUsersChangeText || "-" });
    rows.push({ Section: "User Engagement", Metric: "New Users", Value: userEngagementData?.data?.totalNewUsers ?? 0 });
    rows.push({ Section: "User Engagement", Metric: "New Users Change", Value: userEngagementData?.data?.newUsersChangeText || "-" });
    rows.push({ Section: "User Engagement", Metric: "Returning Users", Value: userEngagementData?.data?.totalReturningUsers ?? 0 });
    rows.push({ Section: "User Engagement", Metric: "Returning Users Change", Value: userEngagementData?.data?.returningUsersChangeText || "-" });
    rows.push({});

    (Array.isArray(dataChart) ? dataChart : []).forEach((m) => {
      rows.push({
        Section: "Donations Trend",
        Month: m?.name || "-",
        "Total Amount": Number(m?.totalAmount ?? 0),
        Count: Number(m?.count ?? 0),
      });
    });
    rows.push({});

    (Array.isArray(causes) ? causes : []).forEach((c) => {
      rows.push({
        Section: "Top Causes",
        Cause: c?.name || "-",
        Percent: Number(c?.percent ?? 0),
        "Total Amount": Number(c?.totalAmount ?? 0),
        Since: c?.since || "—",
      });
    });

    exportToXlsx({
      rows,
      sheetName: "Analytics",
      fileName: `analytics-${new Date().toISOString().slice(0, 10)}.xlsx`,
    });
  };

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between md:gap-6">
        <div className="w-full">
          <h1 className="text-4xl font-bold text-gray-900">Analytics</h1>
          <p className="mt-2 text-sm text-gray-500">
            Track donor trends, popular causes, and user activity across the
            platform.
          </p>
        </div>
        <div className="flex items-center justify-start gap-3 overflow-x-auto flex-nowrap md:justify-end">
          <button
            type="button"
            className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-full hover:bg-gray-50 whitespace-nowrap"
          >
            <FilterOutlined />
            Filter
          </button>
          <button
            className={`${btnClass("Today")} whitespace-nowrap`} 
            onClick={() => setActive("Today")}
          >
            Today
          </button>
          <button
            className={`${btnClass("This Week")} whitespace-nowrap`}
            onClick={() => setActive("This Week")}
          >
            This Week
          </button>
          <button
            className={`${btnClass("This Month")} whitespace-nowrap`}
            onClick={() => setActive("This Month")}
          >
            This Month
          </button>
        </div>
      </div>
      <div className="p-6 mt-8 bg-white border border-gray-100 rounded-3xl">
        <div className="max-w-5xl">
          <h2 className="text-lg font-semibold text-gray-900">User Engagement</h2>
          <p className="mt-1 text-sm text-gray-500">
            Track how users (donors, organizations, and businesses) are engaging with Crescent Change.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 mt-8 md:grid-cols-3">
          <div className="p-6 bg-gray-50 rounded-3xl">
            <p className="text-sm font-semibold text-gray-900">Active Users</p>
            <p className="mt-1 text-xs text-gray-500">
              {userEngagementData?.data?.activeUsersChangeText ? (
                <span
                  className={
                    userEngagementData.data.activeUsersChangeText.includes("+")
                      ? "text-green-600"
                      : "text-red-500"
                  }
                >
                  {userEngagementData.data.activeUsersChangeText}
                </span>
              ) : (
                <span className="text-gray-500">No change data</span>
              )}
            </p>

            <div className="flex items-baseline gap-2 mt-8">
              <p className="text-3xl font-bold text-gray-900">
                {userEngagementLoading
                  ? "—"
                  : Number(userEngagementData?.data?.totalActiveUsers || 0).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">active users</p>
            </div>
          </div>

          <div className="p-6 bg-gray-50 rounded-3xl">
            <p className="text-sm font-semibold text-gray-900">New Sign-ups</p>
            <p className="mt-1 text-xs text-gray-500">
              {userEngagementData?.data?.newUsersChangeText ? (
                <span
                  className={
                    userEngagementData.data.newUsersChangeText.includes("+")
                      ? "text-green-600"
                      : "text-red-500"
                  }
                >
                  {userEngagementData.data.newUsersChangeText}
                </span>
              ) : (
                <span className="text-gray-500">No change data</span>
              )}
            </p>

            <div className="flex items-baseline gap-2 mt-8">
              <p className="text-3xl font-bold text-gray-900">
                {userEngagementLoading
                  ? "—"
                  : Number(userEngagementData?.data?.totalNewUsers || 0).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">new sign-ups</p>
            </div>
          </div>

          <div className="p-6 bg-gray-50 rounded-3xl">
            <p className="text-sm font-semibold text-gray-900">Returning Users</p>
            <p className="mt-1 text-xs text-gray-500">
              {userEngagementData?.data?.returningUsersChangeText ? (
                <span
                  className={
                    userEngagementData.data.returningUsersChangeText.includes("+")
                      ? "text-green-600"
                      : "text-red-500"
                  }
                >
                  {userEngagementData.data.returningUsersChangeText}
                </span>
              ) : (
                <span className="text-gray-500">No change data</span>
              )}
            </p>

            <div className="flex items-baseline gap-2 mt-8">
              <p className="text-3xl font-bold text-gray-900">
                {userEngagementLoading
                  ? "—"
                  : Number(userEngagementData?.data?.totalReturningUsers || 0).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">returning users</p>
            </div>
          </div>
        </div>
      </div>

      {/* Donations Trend */}
      <div className="p-6 mt-6 bg-white border border-gray-100 rounded-3xl">
        <div className="w-full">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Donations Trend</h2>
            <div className="flex items-center gap-3">
              <Select
                size="middle"
                value={donationType}
                onChange={(v) => setDonationType(v)}
                style={{ width: 150 }}
              >
                <Option value="all">All Types</Option>
                <Option value="one-time">One-time</Option>
                <Option value="recurring">Recurring</Option>
                <Option value="round-up">Round-up</Option>
              </Select>
              <Select
                size="middle"
                value={year}
                onChange={(v) => setYear(v)}
                style={{ width: 120 }}
              >
                {Array.from({ length: 5 }, (_, idx) => new Date().getFullYear() - idx).map((y) => (
                  <Option key={y} value={y}>{y}</Option>
                ))}
              </Select>
            </div>
          </div>

          <div className="h-[420px] mt-6">
            <ResponsiveContainer width="100%" height="100%" Title="Donation Trend">
              <BarChart data={dataChart} barSize={44} barGap={12}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <RechartsTooltip />
                <Legend verticalAlign="bottom" height={36} />
                <Bar dataKey="totalAmount" name="Total Amount" fill={PALETTE.org} radius={[10, 10, 10, 10]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {donationLoading && <div className="mt-2 text-sm text-gray-500">Loading donation data...</div>}
        </div>
      </div>

      {/* Top Causes + Pie */}
      <div className="p-6 my-6 bg-white border rounded-3xl">
        <div className="grid items-center justify-center grid-cols-1 gap-5 md:grid-cols-2">
          <div className="">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-medium">Top Causes</h1>
                <p className="text-gray-400">
                  {" "}
                  Which causes are receiving the most support.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {causeWiseLoading ? (
                <div className="text-sm text-gray-500">Loading causes...</div>
              ) : causeWiseError ? (
                <div className="text-sm text-gray-500">Failed to load causes data</div>
              ) : causes.length ? (
                causes.map((c) => (
                  <div key={c.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className="inline-block w-3 h-3 rounded-full"
                        style={{ backgroundColor: c.color }}
                      />
                      <div>
                        <div className="font-medium">{c.name}</div>
                        <div className="text-xs text-gray-500">{c.since}</div>
                      </div>
                    </div>
                    <div className="font-semibold text-right">{c.percent}%</div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500">No causes data</div>
              )}
            </div>
          </div>

          {/* Right Section: Pie Chart */}
          <div className="w-full h-[260px] md:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <RechartsTooltip />
                <Pie
                  data={causes}
                  dataKey="percent"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius="90%"
                  innerRadius={0}
                  paddingAngle={1}
                  cornerRadius={6}
                >
                  {causes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-5 p-6 my-6 bg-white border rounded-3xl">
        <div>
          <h1 className="text-2xl font-medium">Export Analytics Data</h1>
          <p className="text-gray-400">
            Download a full report of filtered analytics.
          </p>
        </div>
        <button
          type="button"
          onClick={handleExport}
          disabled={userEngagementLoading || donationLoading || causeWiseLoading}
          className="flex items-center justify-center gap-2 px-6 py-3 text-white bg-black rounded-3xl disabled:opacity-60"
        >
          Export <FaArrowDown />
        </button>
      </div>
    </div>
  );
};

export default AnalyticsRoute;
