import { lazy, Suspense } from 'react';
import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../Layout/Main/Main";
import PrivateRoute from "../tools/private-route";
import PublicRoute from "../tools/public-route";

// Loading component
const Loading = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="w-12 h-12 border-t-2 border-b-2 rounded-full animate-spin border-primary"></div>
  </div>
);

// Lazy load components with Suspense wrapper
const lazyLoad = (importFunc) => {
  const LazyComponent = lazy(importFunc);
  return (props) => (
    <Suspense fallback={<Loading />}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

// Lazy loaded components
const SignIn = lazyLoad(() => import('../Pages/Auth/SignIn/SignIn'));
const ForgatePassword = lazyLoad(() => import('../Pages/Auth/ForgatePassword/ForgatePassword'));
const Newpass = lazyLoad(() => import('../Pages/Auth/NewPass/Newpass'));
const VerifyPass = lazyLoad(() => import('../Pages/Auth/VerifyPass/VerifyPass'));
const ContinuePage = lazyLoad(() => import('../Pages/Auth/ContinuePage/ContinuePage'));
const Subscription = lazyLoad(() => import('../Pages/Subscription/Subscription'));
const AdminProfile = lazyLoad(() => import('../Pages/AdminProfile/AdminProfile'));
const Notifications = lazyLoad(() => import('../Pages/Notification/Notification'));
const AllUsers = lazyLoad(() => import('../Components/UserManagemnet/AllUsers/AllUsers'));
const AllOrganization = lazyLoad(() => import('../Pages/OrganizationManagement/AllOrganization/AllOrganization'));
const Analytics = lazyLoad(() => import('../Pages/Analytics/Analytics'));
const DonationQuickLink = lazyLoad(() => import('../Components/Dashboard/AnalyticsInfo/DonationQuickLink'));
const SubscriptionQuickLinks = lazyLoad(() => import('../Components/Dashboard/AnalyticsInfo/SubscriptionQuickLinks'));
const RewardsQuickLinks = lazyLoad(() => import('../Components/Dashboard/AnalyticsInfo/RewardsQuickLinks'));
const AnalyticsRoute = lazyLoad(() => import('../Pages/AnalyticsRoute/AnalyticsRoute'));
const BusinessAdmin = lazyLoad(() => import('../Pages/BusinessAdmin/BusinessAdmin'));
const DonorApp = lazyLoad(() => import('../Pages/DonorApp/DonorApp'));
const ContactUs = lazyLoad(() => import('../Pages/Settings/ContactUS/ContactUS'));
const PrivacyPolicy = lazyLoad(() => import('../Pages/Settings/PrivacyPolicy/PrivacyPolicy'));
const TermsCondition = lazyLoad(() => import('../Pages/Settings/TermsCondition/TermsCondition'));

export const router = createBrowserRouter([
  {
    path: "/sign-in",
    element: (
      <PublicRoute>
        <SignIn />
      </PublicRoute>
    ),
  },
  {
    path: "/forgot-password",
    element: (
      <PublicRoute>
        <ForgatePassword />
      </PublicRoute>
    ),
  },
  {
    path: "/varification",
    element: (
      <PublicRoute>
        <VerifyPass />
      </PublicRoute>
    ),
  },
  {
    path: "/new-password",
    element: (
      <PublicRoute>
        <Newpass />
      </PublicRoute>
    ),
  },
  {
    path: "/continue-page",
    element: (
      <PublicRoute>
        <ContinuePage />
      </PublicRoute>
    ),
  },
  {
    path: "/",
    element: (
      <PrivateRoute>
        <MainLayout />
      </PrivateRoute>
    ),
    children: [
      {
        path: "/",
        element: <Analytics />,
      },
      {
        path: "user-management",
        element: <AllUsers />,
      },
      {
        path: "/organization-management",
        element: <AllOrganization />,
      },
      {
        path: "/subscription-management",
        element: <Subscription />,
      },
      {
        path: "/analytics",
        element: <AnalyticsRoute />,
      },
      {
        path: "/donor-app",
        element: <DonorApp />,
      },
      {
        path: "/business-admin",
        element: <BusinessAdmin />
      },
      {
        path: "/settings/contact-us",
        element: <ContactUs />,
      },
      {
        path: "/settings/privacy-policy",
        element: <PrivacyPolicy />,
      },
      {
        path: "/settings/terms-condition",
        element: <TermsCondition />,
      },
      {
        path: "/admin-profile",
        element: <AdminProfile />,
      },
      {
        path: "/notification",
        element: <Notifications />,
      },
      {
        path: "donationQuickLink",
        element: <DonationQuickLink />,
      },
      {
        path: "subscriptions",
        element: <SubscriptionQuickLinks />,
      },
      {
        path: "rewards",
        element: <RewardsQuickLinks />,
      },
    ],
  },
]);
