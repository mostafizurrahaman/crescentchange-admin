import { useState } from "react";
import {
  Button,
  DatePicker,
  Form,
  Input,
  Modal,
  Table,
  Upload,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { VscEye } from "react-icons/vsc";
import user from "../../assets/image/user.png";
import { FaImage, FaUsers } from "react-icons/fa";
import { GoOrganization } from "react-icons/go";
import { FiDownload } from "react-icons/fi";
import useSmartFetchHook from "../../Components/hooks/useSmartFetchHook.ts";
import { useGetOrganizationReportQuery } from "../../redux/feature/organization/organizationApis.js";
import { exportToXlsx } from "../../lib/export-xlsx";

const OrganizationTable = () => {
  const { RangePicker } = DatePicker;
  const [dateRange, setDateRange] = useState(null);

  const {
    searchTerm,
    setSearchTerm,
    setCurrentPage,
    data: apiResponse,
    pagination,
    isLoading,
    setFilterParams,
  } = useSmartFetchHook(useGetOrganizationReportQuery);

  const data = (apiResponse || []).map((org) => ({
    ...org,
    email: org?.auth?.email,
  }));
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [form] = Form.useForm();
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewRecord, setViewRecord] = useState(null);

  //  Handle image upload
  const handleBeforeUpload = (file) => {
    setPreviewImage(URL.createObjectURL(file));
    form.setFieldsValue({ profileImage: file });
    return false;
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setPreviewImage(null);
  };

  const handleSave = () => {
    setIsModalVisible(false);
  };

  const handleExport = () => {
    const rows = (Array.isArray(data) ? data : []).map((r) => {
      const firstCause = Array.isArray(r?.causes) && r.causes.length > 0 ? r.causes[0]?.name : "-";
      return {
        Name: r?.name || "-",
        Email: r?.email || "-",
        "Cause Name": firstCause || "-",
        "Service Type": r?.serviceType || "-",
        "Created At": r?.createdAt ? new Date(r.createdAt).toLocaleString() : "-",
        Status: r?.auth?.status || "-",
      };
    });

    exportToXlsx({
      rows,
      sheetName: "Organizations",
      fileName: `organizations-${new Date().toISOString().slice(0, 10)}.xlsx`,
    });
  };

  const handleView = (record) => {
    setViewRecord(record);
    setIsViewOpen(true);
  };

  const handleDateRangeChange = (dates, dateStrings) => {
    setDateRange(dates);
    const newFilterParams = {};
    if (dates && dates[0] && dates[1]) {
      newFilterParams.startDate = dateStrings[0];
      newFilterParams.endDate = dateStrings[1];
    }
    setFilterParams(newFilterParams);
  };

  const columns = [
    {
      title: "Name/Email",
      dataIndex: "email",
      key: "email",
      render: (text, record) => (
        <div className="flex items-center gap-3">
          <img
            src={user}
            alt={record.name}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <p className="text-sm font-semibold text-gray-900">{record.name}</p>
            <p className="text-xs text-gray-500">{record.email}</p>
          </div>
        </div>
      ),
    },
    {
      title: "Cause Name",
      dataIndex: "causes",
      key: "causeName",
      render: (causes) => {
        const first = Array.isArray(causes) && causes.length > 0 ? causes[0] : null;
        return first?.name || <span className="text-sm text-gray-400">No cause</span>;
      },
    },
    {
      title: "Service Type",
      dataIndex: "serviceType",
      key: "serviceType",
      render: (value) => (
        <div className="flex items-center gap-2 px-4 py-2 rounded-3xl">
          {value === "non-profit" && (
            <div className="flex items-center gap-1 px-4 py-1 text-green-600 bg-green-100 rounded-2xl">
              <GoOrganization className="w-5 h-5" /> Non-profit
            </div>
          )}
          {value === "Charity" && (
            <div className="flex items-center gap-1 px-4 py-1 text-purple-600 bg-purple-100 rounded-2xl">
              <FaUsers className="w-5 h-5" /> Charity
            </div>
          )}
          {value === "Mosque" && (
            <div className="flex items-center gap-1 px-4 py-1 text-indigo-600 bg-indigo-100 rounded-2xl">
              <GoOrganization className="w-5 h-5" /> Mosque
            </div>
          )}
          {!["non-profit", "Charity", "Mosque"].includes(value) && (
            <div className="flex items-center gap-1 px-4 py-1 text-gray-600 bg-gray-100 rounded-2xl">
              {value}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (createdAt) => (
        <span className="text-sm font-medium text-gray-900">
          {createdAt ? new Date(createdAt).toLocaleDateString() : "-"}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: ["auth", "status"],
      key: "status",
      render: (status) => {
        const s = String(status || "").toLowerCase();
        const cls =
          s === "verified"
            ? "inline-flex items-center rounded-full bg-emerald-100 px-4 py-2 text-xs font-medium text-emerald-700"
            : s === "pending"
            ? "inline-flex items-center rounded-full bg-amber-100 px-4 py-2 text-xs font-medium text-amber-700"
            : s === "suspended"
            ? "inline-flex items-center rounded-full bg-red-100 px-4 py-2 text-xs font-medium text-red-600"
            : "inline-flex items-center rounded-full bg-gray-100 px-4 py-2 text-xs font-medium text-gray-700";
        const label = s ? s.charAt(0).toUpperCase() + s.slice(1) : "-";
        return <span className={cls}>{label}</span>;
      },
    },
    {
      title: () => <div className="text-center">Action</div>,
      key: "action",
      render: (_, record) => (
        <div className="flex items-center justify-center gap-3 text-lg">
          <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full cursor-pointer" onClick={() => handleView(record)}>
            <VscEye />
          </div>
          {/* <div
            onClick={() => handleEdit(record)}
            className="flex items-center justify-center w-8 h-8 p-1 rounded-full cursor-pointer bg-neutral-100"
          >
            <FaPencilAlt />
          </div> */}
          {/* <div className="flex items-center justify-center w-8 h-8 p-1 rounded-full cursor-pointer bg-neutral-100">
            <RxCrossCircled />
          </div> */}
        </div>
      ),
    },
  ];

  return (
    <div className="mb-10 bg-white border border-gray-100 rounded-3xl">
      <div className="flex flex-col gap-4 p-6 border-b border-gray-100 md:flex-row md:items-center md:justify-between">
        <h2 className="text-base font-semibold text-gray-900">Organization Table</h2>
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
                bordered={false}
                allowClear
              />
            </div>
          </div>

          <div className="w-full md:w-auto">
            <div className="px-4 py-2 bg-white border border-gray-200 rounded-full [&_.ant-picker]:!border-0 [&_.ant-picker]:!shadow-none [&_.ant-picker]:!bg-transparent [&_.ant-picker-input_>input]:!text-sm">
              <RangePicker
                placeholder={["Select Interval", ""]}
                bordered={false}
                onChange={handleDateRangeChange}
                value={dateRange}
              />
            </div>
          </div>

          <Button
            onClick={handleExport}
            className="!h-11 !rounded-full !border-gray-200 !px-5 !text-sm !font-medium"
          >
            Export <FiDownload className="ml-2" />
          </Button>
        </div>
      </div>

      <div className="">
        <Table
          columns={columns}
          dataSource={data}
          loading={isLoading}
          onChange={(paginationConfig, filters, sorter) => {
            setCurrentPage(paginationConfig.current);
            const newFilterParams = {};
            if (sorter?.field) {
              newFilterParams.sortBy = sorter.field;
              newFilterParams.sortOrder = sorter.order === "ascend" ? "asc" : "desc";
            }
            Object.keys(filters || {}).forEach((key) => {
              if (filters[key]) {
                newFilterParams[key] = filters[key][0];
              }
            });
            setFilterParams(newFilterParams);
          }}
          pagination={{
            current: pagination.page || 1,
            pageSize: pagination.limit || 5,
            total: pagination.total || 0,
            showTotal: (total, range) =>
              `Showing ${range[0]}-${range[1]} from ${String(total).padStart(2, "0")}`,
            showSizeChanger: false,
            position: ["bottomRight"],
          }}
          rowKey={(row) => row._id}
        />
      </div>

      {/* Edit Profile Modal */}
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
        title="Organization Details"
        open={isViewOpen}
        onCancel={() => setIsViewOpen(false)}
        footer={null}
        centered
        width={600}
        styles={{
          content: {
            borderRadius: "30px",
            overflow: "hidden",
          },
        }}
      >
        {viewRecord && (
          <div className="space-y-6">
            {/* Header Section */}
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                <span className="text-xl font-bold text-white">
                  {viewRecord.name?.charAt(0)?.toUpperCase() || "O"}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="mb-1 text-xl font-semibold text-gray-900">
                  {viewRecord.name}
                </h3>
                <p className="text-sm text-gray-600">{viewRecord.email}</p>
              </div>
            </div>

            {/* Key Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border border-blue-100 rounded-lg bg-blue-50">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                    <span className="text-xs font-semibold text-blue-600">ST</span>
                  </div>
                  <p className="text-xs font-medium tracking-wide text-blue-700 uppercase">Service Type</p>
                </div>
                <p className="text-sm font-semibold text-gray-900">{viewRecord.serviceType || "Not specified"}</p>
              </div>

              <div className="p-4 border border-green-100 rounded-lg bg-green-50">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                    <span className="text-xs font-semibold text-green-600">S</span>
                  </div>
                  <p className="text-xs font-medium tracking-wide text-green-700 uppercase">Status</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    viewRecord?.auth?.status === "verified" ? "bg-green-500" :
                    viewRecord?.auth?.status === "pending" ? "bg-yellow-500" :
                    viewRecord?.auth?.status === "suspended" ? "bg-red-500" : "bg-gray-400"
                  }`}></div>
                  <p className="text-sm font-semibold text-gray-900 capitalize">
                    {viewRecord?.auth?.status || "Unknown"}
                  </p>
                </div>
              </div>

              <div className="p-4 border border-purple-100 rounded-lg bg-purple-50">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-full">
                    <span className="text-xs font-semibold text-purple-600">C</span>
                  </div>
                  <p className="text-xs font-medium tracking-wide text-purple-700 uppercase">Cause</p>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {Array.isArray(viewRecord.causes) && viewRecord.causes[0]?.name 
                    ? viewRecord.causes[0].name 
                    : "No cause assigned"}
                </p>
              </div>

              <div className="p-4 border border-orange-100 rounded-lg bg-orange-50">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-full">
                    <span className="text-xs font-semibold text-orange-600">D</span>
                  </div>
                  <p className="text-xs font-medium tracking-wide text-orange-700 uppercase">Created</p>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {viewRecord.createdAt ? new Date(viewRecord.createdAt).toLocaleDateString() : "-"}
                </p>
              </div>
            </div>

            {/* Additional Info */}
            <div className="p-4 rounded-lg bg-gray-50">
              <h4 className="mb-3 text-sm font-medium text-gray-700">Additional Information</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between px-3 py-2 bg-white rounded-lg">
                  <span className="text-sm text-gray-600">Full Created Date</span>
                  <span className="text-sm font-medium text-gray-900">
                    {viewRecord.createdAt ? new Date(viewRecord.createdAt).toLocaleString() : "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between px-3 py-2 bg-white rounded-lg">
                  <span className="text-sm text-gray-600">Organization ID</span>
                  <span className="text-sm font-medium text-gray-900">
                    {viewRecord._id?.slice(-8) || "-"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OrganizationTable;
