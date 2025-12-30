import {
  createApi,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";
import { SetAccessToken } from "./auth/authSlice";

export const baseApiUrl = "http://13.55.115.124:5000/api/v1";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: baseApiUrl,

  prepareHeaders: (headers, { getState }) => {
    const state = getState();
    const token = state.auth?.accessToken;

    if (token) {
      headers.set("Authorization", `${token}`);
    }
    return headers;
  },
});

// Wrap baseQuery to handle 401 globally
const baseQuery = async (
  args,
  api,
  extraOptions
) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  const status = result?.error?.status;

  if (status === 401 || status === 403) {
    api.dispatch(SetAccessToken(null));
    localStorage.removeItem("accessToken");
    window.location.href = "/sign-in";
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery,

  tagTypes: [
    "PROFILE",
    "DASHBOARD",
    "DONATION",
    "SUBSCRIPTION",
    "CAUSE",
    "REWARD",
    "BADGE",
    "NOTIFICATION",
    "CONTENT"
  ],
  endpoints: () => ({}),
});
