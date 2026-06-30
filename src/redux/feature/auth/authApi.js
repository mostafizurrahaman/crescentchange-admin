
import { SetAccessToken } from "./authSlice";
import { baseApi } from "../baseApi";
import { ErrorToast, SuccessToast } from "../../../lib/utils";
import { jwtDecode } from "jwt-decode";

const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    // Login Endpoint (Mutation)
    login: builder.mutation({
      query: (credentials) => ({
        url: "/auth/signin",
        method: "POST",
        body: credentials,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const twoFactorRequired = data?.data?.twoFactorRequired;
          const accessToken = data?.data?.accessToken;
          if (twoFactorRequired) {
            // UI will prompt for OTP and call /auth/2fa/verify-login.
            return;
          }
          if (!accessToken) return;
          
          try {
            const decoded = jwtDecode(accessToken);
            const role = decoded?.role || data?.data?.user?.role || data?.data?.role;
            if (role !== "ADMIN") {
              ErrorToast("You are not an admin.");
              return;
            }
          } catch (e) {
            ErrorToast("Invalid authorization token.");
            return;
          }

          // Set access token first
          localStorage.setItem("accessToken", accessToken);
          dispatch(SetAccessToken(accessToken));
          SuccessToast("Login successful.");
          window.location.href = "/";
        } catch (error) {
          ErrorToast(error?.error?.data?.message || "Login failed.");
        }
      },
    }),

    // FORGET PASSWORD
    forgetPassword: builder.mutation({
      query: (email) => {
        return {
          url: "/auth/forgot-password",
          method: "POST",
          body: email,
        };
      },
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const resetToken = data?.data?.token;
          if (resetToken) {
            localStorage.setItem("resetToken", resetToken);
          }
          SuccessToast("OTP sent successfully!");
        } catch (error) {
          ErrorToast(error?.error?.data?.message || "Failed to send new OTP.");
        }
      },
    }),

    // OTP VERIFY FOR RESET PASSWORD
    verifyOTPForResetPassword: builder.mutation({
      query: (data) => ({
        url: "/auth/verify-forgot-password-otp",
        method: "POST",
        body: data,
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const resetPasswordToken = data?.data?.resetPasswordToken;
          if (resetPasswordToken) {
            localStorage.setItem("resetPasswordToken", resetPasswordToken);
            localStorage.removeItem("resetToken");
          }
          SuccessToast(data?.message);
        } catch (error) {
          ErrorToast(error?.error?.data?.message || "OTP verification failed.");
        }
      },
    }),

    // RESEND RESET OTP
    resendResetOTP: builder.mutation({
      query: (email) => ({
        url: "/auth/send-forgot-password-otp-again",
        method: "POST",
        body: email,
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          SuccessToast(data?.message);
        } catch (error) {
          ErrorToast(error?.error?.data?.message || "Failed to send new OTP.");
        }
      },
    }),

    // RESET PASSWORD
    resetPassword: builder.mutation({
      query: (data) => {
        return {
          url: `/auth/reset-password`,
          method: "POST",
          body: data,
        };
      },
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          localStorage.removeItem("resetPasswordToken");
          SuccessToast(data?.message);
          // window.location.href = "/";
        } catch (error) {
          ErrorToast(error?.error?.data?.message || "Failed to reset password.");
        }
      },
    }),

    twoFaSetup: builder.mutation({
      query: () => ({
        url: "/auth/2fa/setup",
        method: "POST",
      }),
    }),

    twoFaEnable: builder.mutation({
      query: (data) => ({
        url: "/auth/2fa/enable",
        method: "POST",
        body: data,
      }),
    }),

    twoFaDisable: builder.mutation({
      query: (data) => ({
        url: "/auth/2fa/disable",
        method: "POST",
        body: data,
      }),
    }),

    twoFaVerifyLogin: builder.mutation({
      query: (data) => ({
        url: "/auth/2fa/verify-login",
        method: "POST",
        body: data,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const accessToken = data?.data?.accessToken;
          if (!accessToken) {
            ErrorToast("Invalid login response.");
            return;
          }

          try {
            const decoded = jwtDecode(accessToken);
            const role = decoded?.role || data?.data?.user?.role || data?.data?.role;
            if (role !== "SUPER_ADMIN") {
              ErrorToast("You are not authorized to login.");
              return;
            }
          } catch (e) {
            ErrorToast("Invalid authorization token.");
            return;
          }

          localStorage.setItem("accessToken", accessToken);
          dispatch(SetAccessToken(accessToken));
          SuccessToast(data?.message || "Login successful.");
          window.location.href = "/";
        } catch (error) {
          ErrorToast(error?.error?.data?.message || "Login failed.");
        }
      },
    }),
    
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useForgetPasswordMutation,
  useVerifyOTPForSignupMutation,
  useVerifyOTPForResetPasswordMutation,
  useResendResetOTPMutation,
  useResendSignupOTPMutation,
  useResetPasswordMutation,
  useTwoFaSetupMutation,
  useTwoFaEnableMutation,
  useTwoFaDisableMutation,
  useTwoFaVerifyLoginMutation,
} = authApi;
