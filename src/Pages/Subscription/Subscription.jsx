 
import OrganizationSubscription from "../../Components/ManageSubscription/OrganizationSubscription";
import { BsArrowUpRight } from "react-icons/bs";
import { Link } from "react-router-dom";
import { useGetSubscriptionPaymentStatsQuery } from "../../redux/feature/subscription/subscriptionApis";

const Subscription = () => {
  const { data: statsRes } = useGetSubscriptionPaymentStatsQuery();

  const activeSubscribers = statsRes?.data?.activeSubscribers ?? 0;
  const breakDownByRole = Array.isArray(statsRes?.data?.breakDownByRole)
    ? statsRes.data.breakDownByRole
    : [];

  const donorCount = breakDownByRole.find((r) => r?.role === "DONOR")?.count ?? 0;
  const businessCount = breakDownByRole.find((r) => r?.role === "BUSINESS")?.count ?? 0;
  const organizationCount = breakDownByRole.find((r) => r?.role === "ORGANIZATION")?.count ?? 0;
  const breakdownTotal = donorCount + businessCount + organizationCount || 1;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ---------- Top Title ---------- */}
      <div className="flex flex-col gap-6 mb-8 md:flex-row md:items-start md:justify-between">
        <div className="w-full">
          <h1 className="text-3xl font-bold text-gray-900">Subscription & Payments</h1>
          <p className="mt-2 text-base text-gray-500">
            Track all subscriptions, manage invoices, and export payment data.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-8 lg:grid-cols-2">
        <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-3xl">
          <div className="flex items-center justify-between gap-2 mb-14">
            <div className="text-base font-semibold text-gray-900">Overview</div>
            <Link to="/donationQuickLink">
              <div className="flex items-center justify-center w-10 h-10 p-1 bg-white rounded-full">
                <BsArrowUpRight />
              </div>
            </Link>
          </div>

          <div className="flex items-end gap-3">
            <div className="text-4xl font-bold text-gray-900">{activeSubscribers}</div>
            <div className="pb-1">
              <span className="text-sm font-medium text-emerald-600">Active</span>
              <span className="text-sm text-gray-400">
                {" "}
                subscriptions across donors, businesses, and organizations.
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-3xl">
          <div className="text-base font-semibold text-gray-900">Breakdown</div>
          <div className="flex items-center justify-center gap-2 mt-6">
            <div
              className="h-12 bg-pink-100 rounded-2xl"
              style={{ width: `${Math.round((donorCount / breakdownTotal) * 100)}%` }}
            />
            <div
              className="h-12 bg-sky-200 rounded-2xl"
              style={{ width: `${Math.round((businessCount / breakdownTotal) * 100)}%` }}
            />
            <div
              className="h-12 bg-emerald-200 rounded-2xl"
              style={{ width: `${Math.round((organizationCount / breakdownTotal) * 100)}%` }}
            />
          </div>

          <div className="grid grid-cols-3 gap-6 mt-6">
            <div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="w-2 h-2 bg-pink-100 rounded-sm" />
                Donor
              </div>
              <div className="mt-2 text-xl font-semibold text-gray-900">{donorCount}</div>
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="w-2 h-2 rounded-sm bg-sky-200" />
                Business
              </div>
              <div className="mt-2 text-xl font-semibold text-gray-900">{businessCount}</div>
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="w-2 h-2 rounded-sm bg-emerald-200" />
                Organization
              </div>
              <div className="mt-2 text-xl font-semibold text-gray-900">{organizationCount}</div>
            </div>
          </div>
        </div>
      </div>

      <OrganizationSubscription />
    </div>
  );
};

export default Subscription;
