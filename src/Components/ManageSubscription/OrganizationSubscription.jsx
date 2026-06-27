import { useEffect, useState } from "react";
import {
  Button,
  DatePicker,
  Form,
  Input,
  Modal,
  Table,
  Upload,
  message,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { VscEye } from "react-icons/vsc";
import user from "../../assets/image/user.png";
import { FaImage } from "react-icons/fa";
import { FiDownload } from "react-icons/fi";
import { exportToXlsx } from "../../lib/export-xlsx";

import { useGetSubscriptionPaymentsQuery } from "../../redux/feature/subscription/subscriptionApis";

const OrganizationSubscription = ({ setExportHandler }) => {
  const { RangePicker } = DatePicker;

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(5);
  const [dateRange, setDateRange] = useState(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const { data: listRes, isLoading } = useGetSubscriptionPaymentsQuery({
    page: currentPage,
    limit,
    searchTerm,
    fromDate,
    toDate,
  });

  const data = Array.isArray(listRes?.data) ? listRes.data : [];
  const pagination = listRes?.meta ?? {};


  const [isModalVisible, setIsModalVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [form] = Form.useForm();

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);

  // 📸 Handle image upload
  const handleBeforeUpload = (file) => {
    setPreviewImage(URL.createObjectURL(file));
    form.setFieldsValue({ profileImage: file });
    return false;
  };

  const getAvatarUrl = (recordOrUserObj) => {
    const logo = recordOrUserObj?.business?.logoImage || recordOrUserObj?.organization?.logoImage;
    return logo || user;
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setPreviewImage(null);
  };

  const handleSave = (_values) => {
    setIsModalVisible(false);
  };

  const handleView = (record) => {
    setSelectedSubscription(record);
    setIsViewOpen(true);
  };

  const handleDateRangeChange = (dates, dateStrings) => {
    setDateRange(dates);
    setCurrentPage(1);

    if (dates && dates[0] && dates[1]) {
      setFromDate(dateStrings?.[0] || "");
      setToDate(dateStrings?.[1] || "");
    } else {
      setFromDate("");
      setToDate("");
    }
  };

  const handleExportXlsx = () => {
    const rows = (Array.isArray(data) ? data : []).map((r) => {
      const email = r?.user?.email || "";
      return {
        Email: email,
        Type: r?.planType || "",
        Status: r?.status || "",
        "Start Date": r?.startDate ? new Date(r.startDate).toLocaleString() : "",
        "Renewal Date": r?.renewalDate ? new Date(r.renewalDate).toLocaleString() : "",
        Amount: r?.latestPayment?.amount ?? r?.totalPaid ?? "",
        Currency: r?.latestPayment?.currency || "",
        "Transaction Date": r?.latestPayment?.transactionDate
          ? new Date(r.latestPayment.transactionDate).toLocaleString()
          : "",
        "Invoice Url": r?.latestPayment?.invoiceUrl || "",
      };
    });

    exportToXlsx({
      rows,
      sheetName: "Subscriptions",
      fileName: `subscriptions-${new Date().toISOString().slice(0, 10)}.xlsx`,
    });
  };

  useEffect(() => {
    if (typeof setExportHandler === "function") {
      setExportHandler(() => handleExportXlsx);
      return () => setExportHandler(null);
    }
    return undefined;
  }, [setExportHandler, data, fromDate, toDate, searchTerm, currentPage]);

  const handleDownload = (record) => {
    if (!record) {
      message.error("Nothing to download");
      return;
    }

    const fileName = `subscription-${record?._id || record?.id || "data"}.json`;
    const payload = JSON.stringify(record, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const formatDateTime = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "-";
    const date = d.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const time = d.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
    return (
      <div>
        <div className="text-sm font-medium text-gray-900">{date}</div>
        <div className="text-xs text-gray-400">{time}</div>
      </div>
    );
  };

  const planTypeFilterOptions = Array.from(
    new Set((Array.isArray(data) ? data : []).map((r) => r?.planType).filter(Boolean))
  ).map((v) => ({ text: String(v), value: v }));

  const statusFilterOptions = Array.from(
    new Set((Array.isArray(data) ? data : []).map((r) => r?.status).filter(Boolean))
  ).map((v) => ({ text: String(v), value: v }));

  const columns = [
    {
      title: "Name/Email",
      dataIndex: "user",
      key: "email",
      render: (userObj, record) => {
        const email = userObj?.email ?? "-";
        const displayName = email && email !== "-" ? String(email).split("@")[0] : "-";
        return (
        <div className="flex items-center gap-2">
          <img
            src={getAvatarUrl(record)}
            alt={displayName}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <p className="font-medium">{displayName}</p>
            <p className="text-sm text-gray-400">{email}</p>
          </div>
        </div>
        );
      },
    },
    {
      title: "Type",
      dataIndex: "planType",
      key: "planType",
      filters: planTypeFilterOptions,
      onFilter: (value, record) => String(record?.planType || "") === String(value),
      render: (value) => (
        <span className="inline-flex items-center px-4 py-2 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
          {value ? String(value).charAt(0).toUpperCase() + String(value).slice(1) : "-"}
        </span>
      ),
    },
    {
      title: "Start Date",
      dataIndex: "startDate",
      key: "startDate",
      render: (value) => formatDateTime(value),
    },
    {
      title: "Renewal Date",
      dataIndex: "renewalDate",
      key: "renewalDate",
      render: (value) => formatDateTime(value),
    },

    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      filters: statusFilterOptions,
      onFilter: (value, record) => String(record?.status || "") === String(value),
      render: (status) => (
        <span
          className={`px-4 py-1 rounded-2xl text-sm font-medium ${
            String(status).toLowerCase() === "active"
              ? "bg-green-100 text-green-600"
              : String(status).toLowerCase() === "pending" || String(status).toLowerCase() === "trialing"
              ? "bg-yellow-100 text-yellow-600"
              : "bg-gray-200 text-gray-600"
          }`}
        >
          {status}
        </span>
      ),
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      render: (_, record) => (
        <div className="flex items-center justify-center gap-3 text-lg">
          <button
            type="button"
            onClick={() => handleView(record)}
            className="flex items-center justify-center w-8 h-8 p-1 rounded-full cursor-pointer bg-neutral-100"
            title="View"
          >
            <VscEye />
          </button>
          <button
            type="button"
            onClick={() => handleDownload(record)}
            className="flex items-center justify-center w-8 h-8 p-1 rounded-full cursor-pointer bg-neutral-100"
            title="Download"
          >
            <FiDownload />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="mb-10 bg-white border border-gray-100 rounded-3xl">
      <div className="flex flex-col gap-4 p-6 border-b border-gray-100 md:flex-row md:items-center md:justify-between">
        <h2 className="text-base font-semibold text-gray-900">Subscription Listing</h2>
        <div className="flex flex-col items-stretch gap-3 md:flex-row md:items-center">
          <div className="w-full md:w-[220px]">
            <div className="px-4 py-2 bg-white border border-gray-200 rounded-full [&_.ant-input-affix-wrapper]:!border-0 [&_.ant-input-affix-wrapper]:!shadow-none [&_.ant-input-affix-wrapper]:!bg-transparent [&_.ant-input]:!bg-transparent [&_.ant-input]:!text-sm">
              <Input
                prefix={<SearchOutlined />}
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                variant="borderless"
                allowClear
              />
            </div>
          </div>

          <div className="w-full md:w-auto">
            <div className="px-4 py-2 bg-white border border-gray-200 rounded-full [&_.ant-picker]:!border-0 [&_.ant-picker]:!shadow-none [&_.ant-picker]:!bg-transparent [&_.ant-picker-input_>input]:!text-sm">
              <RangePicker
                placeholder={["Select Interval", ""]}
                variant="borderless"
                onChange={handleDateRangeChange}
                value={dateRange}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleExportXlsx}
            className="flex items-center justify-center gap-2 px-6 text-sm font-medium text-white bg-black rounded-full h-11"
          >
            Export <FiDownload className="text-base" />
          </button>
        </div>
      </div>

      <div className="p-6">
        <Table
          columns={columns}
          dataSource={Array.isArray(data) ? data : []}
          loading={isLoading}
          pagination={{
            current: pagination?.page || 1,
            pageSize: pagination?.limit || limit,
            total: pagination?.total || 0,
            showSizeChanger: false,
            showTotal: (total, range) =>
              `Showing ${range[0]}-${range[1]} from ${String(total).padStart(2, "0")}`,
            position: ["bottomRight"],
          }}
          onChange={(tablePagination) => {
            setCurrentPage(tablePagination.current);
          }}
          rowKey={(row) => row?._id || row?.id || row?.key}
        />
      </div>

      {/* ✨ Edit Profile Modal */}
      <Modal
        title="Edit Profile"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        centered
        styles={{
          content: {
            borderRadius: "30px",
            overflow: "hidden",
          },
        }}
      >
        <Form layout="vertical" form={form} onFinish={handleSave}>
          <div className="flex justify-center mb-4">
            <Upload
              showUploadList={false}
              beforeUpload={handleBeforeUpload}
              accept="image/*"
            >
              <div className="flex flex-col items-center p-4 border border-gray-300 border-dashed rounded-full cursor-pointer">
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="object-cover w-24 h-24 rounded-full"
                  />
                ) : (
                  <>
                    <FaImage className="w-8 h-8 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-400">Upload Image</p>
                  </>
                )}
              </div>
            </Upload>
          </div>

          <Form.Item
            name="firstName"
            label="First Name"
            rules={[{ required: true }]}
          >
            <Input placeholder="Enter first name" />
          </Form.Item>
          <Form.Item
            name="lastName"
            label="Last Name"
            rules={[{ required: true }]}
          >
            <Input placeholder="Enter last name" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: "email" }]}
          >
            <Input placeholder="Enter email" />
          </Form.Item>
          <Form.Item name="mobile" label="Mobile" rules={[{ required: true }]}>
            <Input placeholder="Enter phone number" />
          </Form.Item>
          <Form.Item name="password" label="Update Password">
            <Input.Password placeholder="Enter new password" />
          </Form.Item>

          <div className="flex justify-end gap-3 mt-4">
            <Button onClick={handleCancel}>Discard Changes</Button>
            <Button type="primary" htmlType="submit">
              Apply Changes
            </Button>
          </div>
        </Form>
      </Modal>

      <Modal
        title="Subscription Details"
        open={isViewOpen}
        onCancel={() => setIsViewOpen(false)}
        footer={null}
        centered
        styles={{
          content: {
            borderRadius: "30px",
            overflow: "hidden",
          },
        }}
      >
        {selectedSubscription ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={getAvatarUrl(selectedSubscription)}
                alt={selectedSubscription?.user?.email}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <div className="text-sm font-semibold text-gray-900">
                  {selectedSubscription?.user?.email?.split("@")[0] || "-"}
                </div>
                <div className="text-xs text-gray-500">{selectedSubscription?.user?.email || "-"}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 rounded-2xl">
                <div className="text-xs text-gray-500">Type</div>
                <div className="mt-1 text-sm font-semibold text-gray-900">
                  {selectedSubscription?.planType || "-"}
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-2xl">
                <div className="text-xs text-gray-500">Status</div>
                <div className="mt-1 text-sm font-semibold text-gray-900">
                  {selectedSubscription?.status || "-"}
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-2xl">
                <div className="text-xs text-gray-500">Start Date</div>
                <div className="mt-1 text-sm font-semibold text-gray-900">
                  {selectedSubscription?.startDate
                    ? new Date(selectedSubscription.startDate).toLocaleDateString()
                    : "-"}
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-2xl">
                <div className="text-xs text-gray-500">Renewal Date</div>
                <div className="mt-1 text-sm font-semibold text-gray-900">
                  {selectedSubscription?.renewalDate
                    ? new Date(selectedSubscription.renewalDate).toLocaleDateString()
                    : "-"}
                </div>
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-2xl">
              <div className="text-xs text-gray-500">Latest Payment</div>
              <div className="flex items-center justify-between gap-3 mt-1">
                <div className="text-sm font-semibold text-gray-900">
                  {selectedSubscription?.latestPayment?.amount ?? "-"} {selectedSubscription?.latestPayment?.currency || ""}
                </div>
                {selectedSubscription?.latestPayment?.invoiceUrl ? (
                  <a
                    href={selectedSubscription.latestPayment.invoiceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-medium text-blue-600"
                  >
                    View Invoice
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default OrganizationSubscription;
