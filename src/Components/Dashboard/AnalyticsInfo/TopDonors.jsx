import { Link } from "react-router-dom";
import user from "../../../assets/image/user.png";


const TopDonors= ({ topDonors = [], recentDonorDocs = [], donationsByCause = [], totalDonation = 0 }) => {
  const formatCategoryLabel = (value) => {
    const v = String(value || "").replaceAll("_", " ").trim();
    if (!v) return "-";
    return v.charAt(0).toUpperCase() + v.slice(1);
  };

  const totalDonationFallback = Array.isArray(donationsByCause)
    ? donationsByCause.reduce((sum, c) => sum + Number(c?.totalAmount || 0), 0)
    : 0;
  const donationDenominator = Number(totalDonation || 0) > 0 ? Number(totalDonation) : totalDonationFallback;

  return (
    <div>
      <div className="p-6 my-3 bg-white border border-gray-100 shadow-sm rounded-3xl">
        <h1 className="mb-1 text-lg font-semibold">Top 5 donors</h1>
        <p className="mb-5 text-xs text-gray-400">Sorted by total donations</p>
        {topDonors.map((item, idx) => (
          <div
            key={`${item.donor}-${idx}`}
            className="flex items-center justify-between gap-2 mb-4"
          >
            <div className="flex items-center justify-start gap-2">
              <p className="w-4 text-sm text-gray-500">{idx + 1}</p>
              <img
                src={item?.donorImage || user}
                alt="avatar"
                className="h-9 w-9 rounded-full object-cover bg-gray-100"
                onError={(e) => {
                  e.currentTarget.src = user;
                }}
              />
              <div>
                <h1 className="text-sm font-semibold text-gray-900">{item.donor || "Unknown"}</h1>
                <p className="text-xs text-gray-400">{item.since ? `Since: ${new Date(item.since).toLocaleDateString()}` : ""} </p>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">${Number(item.totalAmount ?? 0).toLocaleString()}</p>
              {item.changeText ? (
                <p className="text-xs text-green-500">{item.changeText}</p>
              ) : null}
            </div>
          </div>
        ))}
      </div>
      {/* recent donors */}
      <div className="p-6 my-3 bg-white border border-gray-100 shadow-sm rounded-3xl">
        <div className="flex items-center justify-between ">
          <h1 className="text-lg font-semibold">Recent donors</h1>
          <Link to="/donor-app">
            <button className="text-xs text-purple-500 underline">View all</button>
          </Link>
        </div>

        {recentDonorDocs.map((item, idx) => (
          <div
            key={`${item?.donor?.email || 'unknown'}-${item?.createdAt || 'no-date'}-${idx}`}
            className="flex items-center justify-between gap-2 mb-4"
          >
            <div className="flex items-center justify-start gap-2">
              <img
                src={item?.donor?.donorImage || user}
                alt="avatar"
                className="h-9 w-9 rounded-full object-cover bg-gray-100"
                onError={(e) => {
                  e.currentTarget.src = user;
                }}
              />
              <div>
                <h1 className="text-sm font-semibold text-gray-900">{item?.donor?.name || "Unknown"}</h1>
                <p className="text-xs text-gray-400">{item?.createdAt ? new Date(item.createdAt).toLocaleString() : ""} </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* breakdown by causes */}
      <div className="p-6 my-3 overflow-hidden bg-white border border-gray-100 shadow-sm rounded-3xl">
        <h1 className="text-lg font-semibold">Breakdown by Causes</h1>
        <div className="my-6">
          <p className="text-sm text-gray-400">Total Donations</p>
          <h1 className="text-4xl font-semibold text-gray-900">
            <span className="text-gray-300">$</span>{Number(totalDonation ?? 0).toLocaleString()}
          </h1>
        </div>
        {Array.isArray(donationsByCause) && donationsByCause.length > 0 ? (
          <>
            <div className="flex items-center justify-between gap-1 overflow-hidden rounded-3xl">
              {donationsByCause.map((c, idx) => {
                const base = donationDenominator > 0
                  ? Math.round((Number(c?.totalAmount || 0) / donationDenominator) * 100)
                  : Math.floor(100 / donationsByCause.length);
                const widthPct = Math.max(1, base);
                const colors = ["bg-pink-200", "bg-blue-200", "bg-yellow-200", "bg-green-200", "bg-purple-200"]; 
                const color = colors[idx % colors.length];
                return (
                  <div key={`${c.causeCategory || "category"}-${idx}`} className={`${color} h-16 rounded-3xl`} style={{ width: `${widthPct}%` }}></div>
                );
              })}
            </div>
            <div className="grid grid-cols-1 gap-5 mt-6 md:grid-cols-3">
              {donationsByCause.map((c, idx) => {
                const colors = ["bg-pink-200", "bg-blue-200", "bg-yellow-200", "bg-green-200", "bg-purple-200"]; 
                const dot = colors[idx % colors.length];
                return (
                  <div key={`${c.causeCategory || "category"}-summary-${idx}`}>
                    <div className="flex items-center justify-start gap-2">
                      <div className={`h-3 w-3 rounded ${dot}`}></div>
                      <p className="text-sm text-gray-500">{formatCategoryLabel(c.causeCategory)}</p>
                    </div>
                    <h1 className="text-3xl font-semibold text-gray-900">
                      <span className="text-gray-300">$</span>{Number(c.totalAmount ?? 0).toLocaleString()}
                    </h1>
                  </div>
                );
              })}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default TopDonors;
