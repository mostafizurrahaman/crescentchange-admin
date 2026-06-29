 
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { BsArrowUpRight } from "react-icons/bs";

const DonationChart = ({ monthlyData }) => {
  const navigate = useNavigate();
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const data = Array.isArray(monthlyData)
    ? monthlyData.map((m) => ({
        name: monthNames[m.month] ?? String(m.month),
        value: m.count ?? 0,
      }))
    : [];
  const maxValue = data.reduce((acc, cur) => Math.max(acc, Number(cur.value ?? 0)), 0);
  const hasAnyValue = maxValue > 0;

  return (
    <div style={{ width: "100%", height: 400 }} className="p-6 my-6 bg-white border border-gray-100 rounded-3xl shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <div className="mb-6">
          <h3 className="font-bold text-xl">Donation</h3>
        </div>
        <BsArrowUpRight className="h-5 w-5 cursor-pointer hover:text-purple-600 transition" onClick={() => navigate("/donationQuickLink")} />
      </div>
      {hasAnyValue ? (
        <ResponsiveContainer width="100%" height="80%">
          <LineChart data={data}>
            <XAxis dataKey="name" stroke="#000000" />
            <YAxis stroke="#000000" />
            <CartesianGrid strokeDasharray="3 3" stroke="#d3d3d3" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ebe9ec",
                border: "1px solid gray",
                borderRadius: "20px",
              }}
              itemStyle={{
                color: "#000000",
              }}
              labelStyle={{
                color: "#000000",
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#c08fff"
              strokeWidth={3}
              dot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-[320px] text-sm text-gray-500">
          No donation activity found for the selected period.
        </div>
      )}
    </div>
  );
};

export default DonationChart;
