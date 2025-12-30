import { baseApi } from "../baseApi";

const dashboardApis = baseApi.injectEndpoints({
    endpoints: (builder) => ({

        // GET USER STATE
        getUserState: builder.query({
            query: () => ({
                url: "/admin/user-states",
                method: "GET",
            }),
            providesTags: ["USER"],
        }),

        // GET USER REPORT
        getUserReport: builder.query({
            query: (args) => {
                const params = new URLSearchParams();
                if (args) {
                    Object.entries(args).forEach(([key, value]) => {
                        if (value !== undefined && value !== null && value !== "") {
                            params.append(key, value);
                        }
                    });
                }
                return {
                    url: "/admin/users",
                    method: "GET",
                    params,
                };
            },
            providesTags: ["USER"],
        }),

        // UPDATE USER STATUS
        changeUserStatus: builder.mutation({
            query: ({ id, status }) => ({
                url: `/admin/change-user-status/${id}`,
                method: "PATCH",
                body: { status },
            }),
            invalidatesTags: ["USER"],
        }),


        // DELETE USER
        deleteUser: builder.mutation({
            query: (id) => ({
                url: `/admin/delete-user/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["USER"],
        }),



        // GET PENDING USER REPORT
        getUserPendingReport: builder.query({
            query: (args) => {
                const params = new URLSearchParams();
                if (args) {
                    Object.entries(args).forEach(([key, value]) => {
                        if (value !== undefined && value !== null && value !== "") {
                            params.append(key, value);
                        }
                    });
                }
                return {
                    url: "/admin/pending-users",
                    method: "GET",
                    params,
                };
            },
            providesTags: ["USER"],
        }),

        // GET USER ENGAGEMENT
        getUserEngagement: builder.query({
            query: (args) => {
                const params = new URLSearchParams();
                if (args) {
                    Object.entries(args).forEach(([key, value]) => {
                        if (value !== undefined && value !== null && value !== "") {
                            params.append(key, value);
                        }
                    });
                }
                return {
                    url: "/admin/user-engagement",
                    method: "GET",
                    params
                };
            },
            providesTags: ["USER"],
        }),

        // GET DONATION CHART
        getDonationChart: builder.query({
            query: (args) => {
                const params = new URLSearchParams();
                if (args) {
                    Object.entries(args).forEach(([key, value]) => {
                        if (value !== undefined && value !== null && value !== "") {
                            params.append(key, value);
                        }
                    });
                }
                return {
                    url: "/admin/donation-engagement",
                    method: "GET",
                    params,
                };
            },
            providesTags: ["USER"],
        }),

        // GET DONATION CHART
        getCausesChart: builder.query({
            query: () => ({
                url: "/admin/causes",
                method: "GET",
            }),
            providesTags: ["USER"],
        }),

        getCauseWisePercentages: builder.query({
            query: () => ({
                url: "/admin/clause-wise-percentages",
                method: "GET",
            }),
            providesTags: ["USER"],
        }),

    }),
});

export const {
    useGetUserStateQuery,
    useGetUserReportQuery,
    useGetUserPendingReportQuery,
    useGetUserEngagementQuery,
    useGetDonationChartQuery,
    useGetCausesChartQuery,
    useGetCauseWisePercentagesQuery,
    useChangeUserStatusMutation,
    useDeleteUserMutation,
} = dashboardApis