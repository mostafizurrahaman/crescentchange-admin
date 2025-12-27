import { baseApi } from "../baseApi";

const dashboardApis = baseApi.injectEndpoints({
    endpoints: (builder) => ({

        // GET SUBSCRIPTION OVERVIEW
        getSubscriptionOverview: builder.query({
            query: () => ({
                url: "/subscription/overview",
                method: "GET",
            }),
            providesTags: ["SUBSCRIPTION"],
        }),

        // GET SUBSCRIPTION HISTORY
        getSubscriptionData: builder.query({
            query: (args) => {
                const params = {};
                if (args) {
                    Object.entries(args).forEach(([key, value]) => {
                        if (value !== undefined && value !== null && value !== "") {
                            params[key] = value;
                        }
                    });
                }
                return {
                    url: "/admin/subscriptions",
                    method: "GET",
                    params,
                };
            },
            async onQueryStarted(args, { queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    // eslint-disable-next-line no-console
                    console.log("[getSubscriptionData] args:", args);
                    // eslint-disable-next-line no-console
                    console.log("[getSubscriptionData] response:", data);
                } catch (e) {
                    // eslint-disable-next-line no-console
                    console.log("[getSubscriptionData] error:", e);
                }
            },
            providesTags: ["SUBSCRIPTION"],
        }),


        // GET SUBSCRIPTION PAYMENT STATS
        getSubscriptionPaymentStats: builder.query({
            query: () => ({
                url: "/subscription/payment-stats",
                method: "GET",
            }),
            providesTags: ["SUBSCRIPTION"],
        }),

        // GET SUBSCRIPTION PAYMENTS
        getSubscriptionPayments: builder.query({
            query: (args) => {
                const params = {};
                if (args) {
                    Object.entries(args).forEach(([key, value]) => {
                        if (value !== undefined && value !== null && value !== "") {
                            params[key] = value;
                        }
                    });
                }
                return {
                    url: "/subscription/payments",
                    method: "GET",
                    params,
                };
            },
            async onQueryStarted(args, { queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    // eslint-disable-next-line no-console
                    console.log("[getSubscriptionPayments] args:", args);
                    // eslint-disable-next-line no-console
                    console.log("[getSubscriptionPayments] response:", data);
                } catch (e) {
                    // eslint-disable-next-line no-console
                    console.log("[getSubscriptionPayments] error:", e);
                }
            },
            providesTags: ["SUBSCRIPTION"],
        }),


    }),
});

export const {
    useGetSubscriptionOverviewQuery,
    useGetSubscriptionDataQuery,
    useGetSubscriptionPaymentStatsQuery,
    useGetSubscriptionPaymentsQuery,
} = dashboardApis