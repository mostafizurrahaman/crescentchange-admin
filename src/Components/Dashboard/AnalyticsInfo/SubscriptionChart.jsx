 
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

const SubscriptionChart = ({ monthlyData }) => {
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
  const byMonth = new Map(
    (Array.isArray(monthlyData) ? monthlyData : []).map((m) => [m?.month, m])
  );

  const data = Array.from({ length: 12 }, (_, i) => {
    const month = i;
    const item = byMonth.get(month);
    return {
      name: monthNames[i],
      value: item?.count ?? 0,
    };
  });

  const maxValue = data.reduce((acc, cur) => Math.max(acc, Number(cur.value ?? 0)), 0);
  const hasAnyValue = maxValue > 0;

  return (
    <div
      style={{ width: "100%", height: 400 }}
      className="p-6 my-6 bg-white border border-gray-100 shadow-sm rounded-3xl"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="mb-6">
          <h3 className="text-xl font-bold">Subscriptions</h3>
        </div>
        <BsArrowUpRight className="w-5 h-5 cursor-pointer hover:text-purple-600 transition" onClick={() => navigate("/subscriptions")} />
      </div>
      {hasAnyValue ? (
        <ResponsiveContainer width="100%" height="80%">
          <LineChart data={data}>
            <XAxis dataKey="name" stroke="#000000" />
            <YAxis stroke="#000000" domain={[0, Math.max(1, maxValue)]} />
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
          No subscription activity found for the selected period.
        </div>
      )}
    </div>
  );
};

export default SubscriptionChart;