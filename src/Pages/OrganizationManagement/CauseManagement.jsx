
import { useState } from "react";
import {
  Button,
  Form,
  Input,
  Modal,
  Select,
  Table,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { VscEye } from "react-icons/vsc";
import { FaPencilAlt, FaPlus } from "react-icons/fa";
import { FiDownload } from "react-icons/fi";
const { Option } = Select;

import useSmartFetchHook from "../../Components/hooks/useSmartFetchHook.ts";
import { useGetAllCauseQuery, useUpdateCauseMutation, useGetCauseCategoriesQuery, useChangeCauseStatusMutation, useCreateCauseMutation } from "../../redux/feature/cause/causeApis";
import { useGetOrganizationReportQuery } from "../../redux/feature/organization/organizationApis";
import { SuccessToast, ErrorToast } from "../../lib/utils.js";
import { exportToXlsx } from "../../lib/export-xlsx";

const CauseManagement = () => {
  const {
    data,
    pagination,
    isLoading,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
  } = useSmartFetchHook(useGetAllCauseQuery);

  const [updateCause, { isLoading: isUpdating }] = useUpdateCauseMutation();
  const { data: categoriesRes, isLoading: isCatLoading } = useGetCauseCategoriesQuery();
  const [changeStatus, { isLoading: isStatusUpdating }] = useChangeCauseStatusMutation();
  const [createCause, { isLoading: isCreating }] = useCreateCauseMutation();
  const { data: orgRes, isLoading: isOrgLoading } = useGetOrganizationReportQuery({ page: 1, limit: 10 });

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewRecord, setViewRecord] = useState(null);



  /** Open View Modal */
  const handleView = (record) => {
    setViewRecord(record);
    setIsViewModalOpen(true);
  };

  const handleExport = () => {
    const rows = (Array.isArray(data) ? data : []).map((r) => ({
      Name: r?.name || "-",
      Description: r?.description || "-",
      Category: r?.category || "-",
      Status: r?.status || "-",
      Organization: r?.organization?.name || "-",
      "Created At": r?.createdAt ? new Date(r.createdAt).toLocaleString() : "-",
    }));

    exportToXlsx({
      rows,
      sheetName: "Causes",
      fileName: `causes-${new Date().toISOString().slice(0, 10)}.xlsx`,
    });
  };

  /** Open Edit Modal */
  const handleEdit = (record) => {
    setIsEditing(true);
    setEditingRecord(record);
    form.setFieldsValue({
      name: record?.name || "",
      category: record?.category || undefined,
      description: record?.description || "",
    });
    setIsModalVisible(true);
  };

  /** Open Create Modal */
  const handleAdd = () => {
    setIsEditing(false);
    setEditingRecord(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  /** Change status to any of: pending | verified | suspended */
  const handleChangeStatus = async (id, status) => {
    try {
      await changeStatus({ id, status }).unwrap();
      SuccessToast("Status updated");
    } catch (e) {
      ErrorToast(e?.data?.message || "Failed to update status");
    }
  };

  /** Close Modal */
  const handleCancel = () => {
    setIsModalVisible(false);
    setIsEditing(false);
    setEditingRecord(null);
    form.resetFields();
  };

  /** Submit Update */
  const handleSubmit = async (values) => {
    try {
      const payload = {
        name: values.name,
        category: values.category,
        description: values.description,
        organizationId: values.organizationId,
      };

      if (isEditing && editingRecord?._id) {
        await updateCause({ id: editingRecord._id, payload }).unwrap();
        SuccessToast("Cause updated successfully");
      } else {
        await createCause(payload).unwrap();
        SuccessToast("Cause created successfully");
      }
      handleCancel();
    } catch (e) {
      ErrorToast(e?.data?.message || "Failed to update cause");
    }
  };

  /** � Table Columns */
  const columns = [
    {
      title: "Cause Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <img
            src={record?.organization?.logoImage || ""}
            alt={record.name}
            className="object-cover w-10 h-10 rounded-full"
          />
          <div>
            <p className="text-sm font-semibold text-gray-900">{record.name}</p>
            <p className="text-xs text-gray-500">
              {record?.createdAt ? new Date(record.createdAt).toLocaleDateString() : ""}
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      render: (description) => (
        <span className="text-sm text-gray-600">
          {description || "-"}
        </span>
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      filters: (categoriesRes?.data || []).map((c) => ({ text: c.label, value: c.value })),
      onFilter: (value, record) => record.category === value,
      render: (value) => (
        <span className="inline-flex items-center px-4 py-2 text-xs font-medium rounded-full bg-slate-100 text-slate-700">
          {value}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      filters: [
        { text: "Pending", value: "pending" },
        { text: "Verified", value: "verified" },
        { text: "Suspended", value: "suspended" },
      ],
      onFilter: (value, record) => record.status === value,
      render: (_, record) => {
        const s = String(record?.status || "").toLowerCase();
        const pillCls =
          s === "verified"
            ? "bg-emerald-100 text-emerald-700"
            : s === "pending"
            ? "bg-amber-100 text-amber-700"
            : s === "suspended"
            ? "bg-red-100 text-red-600"
            : "bg-gray-100 text-gray-700";
        return (
          <div className="inline-flex items-center px-4 py-2 text-xs font-medium capitalize rounded-full cursor-pointer select-none">
            <Select
              size="small"
              value={record.status}
              bordered={false}
              loading={isStatusUpdating}
              onChange={(v) => handleChangeStatus(record._id, v)}
              className={`!w-[140px] !rounded-full !px-2 !py-4 ${pillCls} [&_.ant-select-selector]:!bg-transparent [&_.ant-select-selector]:!border-0 [&_.ant-select-selector]:!shadow-none [&_.ant-select-selection-item]:!text-xs [&_.ant-select-selection-item]:!font-medium`}
              dropdownMatchSelectWidth={false}
            >
              <Option value="pending">Pending</Option>
              <Option value="verified">Verified</Option>
              <Option value="suspended">Suspended</Option>
            </Select>
          </div>
        );
      },
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      render: (_, record) => (
        <div className="flex items-center justify-center gap-3 text-lg">
          <div 
            onClick={() => handleView(record)}
            className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full cursor-pointer"
            title="View Details"
          >
            <VscEye />
          </div>
          <div
            onClick={() => handleEdit(record)}
            className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full cursor-pointer"
            title="Edit Cause"
          >
            <FaPencilAlt />
          </div>
        </div>
      ),
    },
  ];


  return (
    <div className="mb-10 bg-white border border-gray-100 rounded-3xl">
      <div className="flex flex-col gap-4 p-6 border-b border-gray-100 md:flex-row md:items-center md:justify-between">
        <h2 className="text-base font-semibold text-gray-900">Cause Management</h2>

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

          <button
            onClick={handleAdd}
            className="flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-full whitespace-nowrap"
          >
            <FaPlus /> Add Cause
          </button>

          <button
            type="button"
            onClick={handleExport}
            className="flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-full whitespace-nowrap"
          >
            Export <FiDownload className="text-base" />
          </button>
        </div>
      </div>

      <div className="">
        <Table
          columns={columns}
          dataSource={data}
          loading={isLoading}
          pagination={{
            current: pagination?.page || currentPage,
            pageSize: pagination?.limit || 10,
            showTotal: (total, range) =>
              `Showing ${range[0]}-${range[1]} from ${String(total).padStart(2, "0")}`,
            showSizeChanger: false,
            position: ["bottomRight"],
          }}
          rowKey="_id"
        />
      </div>

      {/* Add/Edit Cause Modal */}
      <Modal
        title={isEditing ? "Edit Cause" : "Add Cause"}
        open={isModalVisible}
        onCancel={handleCancel}
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
        <Form layout="vertical" form={form} onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Cause Name"
            rules={[{ required: true, message: "Please enter cause name" }]}
          >
            <Input placeholder="Enter cause name" />
          </Form.Item>

          {!isEditing && (
            <Form.Item
              name="organizationId"
              label="Organization"
              rules={[{ required: true, message: "Please select an organization" }]}
            >
              <Select placeholder="Select organization" loading={isOrgLoading} showSearch optionFilterProp="children">
                {(orgRes?.data || []).map((o) => (
                  <Option key={o._id} value={o._id}>{o.name}</Option>
                ))}
              </Select>
            </Form.Item>
          )}

          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: "Please select a category" }]}
          >
            <Select placeholder="Select category" loading={isCatLoading} showSearch optionFilterProp="children">
              {(categoriesRes?.data || []).map((c) => (
                <Option key={c.value} value={c.value}>{c.label}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: "Please enter description" }]}
          >
            <Input.TextArea rows={4} placeholder="Enter description" />
          </Form.Item>

          <div className="flex justify-end gap-3 mt-4">
            <Button onClick={handleCancel}>Discard Changes</Button>
            <Button type="primary" htmlType="submit" loading={isEditing ? isUpdating : isCreating}>
              {isEditing ? "Update Cause" : "Create Cause"}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Cause Details Modal */}
      <Modal
        title="Cause Details"
        open={isViewModalOpen}
        onCancel={() => setIsViewModalOpen(false)}
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
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="mb-2 text-xl font-semibold text-gray-900">
                  {viewRecord.name}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">by</span>
                  <span className="text-sm font-medium text-gray-700">
                    {viewRecord.organization?.name || "No Organization"}
                  </span>
                </div>
              </div>
              <div className="flex-shrink-0">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  viewRecord.status === "verified" ? "bg-green-100 text-green-700" :
                  viewRecord.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                  viewRecord.status === "suspended" ? "bg-red-100 text-red-700" :
                  "bg-gray-100 text-gray-700"
                }`}>
                  {viewRecord.status?.charAt(0)?.toUpperCase() + viewRecord.status?.slice(1)}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="p-4 rounded-lg bg-gray-50">
              <p className="mb-2 text-sm font-medium text-gray-700">Description</p>
              <p className="text-sm leading-relaxed text-gray-600">
                {viewRecord.description || "No description provided"}
              </p>
            </div>

            {/* Key Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border border-blue-100 rounded-lg bg-blue-50">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                    <span className="text-xs font-semibold text-blue-600">C</span>
                  </div>
                  <p className="text-xs font-medium tracking-wide text-blue-700 uppercase">Category</p>
                </div>
                <p className="text-sm font-semibold text-gray-900 capitalize">{viewRecord.category}</p>
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
                    viewRecord.status === "verified" ? "bg-green-500" :
                    viewRecord.status === "pending" ? "bg-yellow-500" :
                    viewRecord.status === "suspended" ? "bg-red-500" : "bg-gray-400"
                  }`}></div>
                  <p className="text-sm font-semibold text-gray-900 capitalize">
                    {viewRecord.status || "Unknown"}
                  </p>
                </div>
              </div>

              <div className="p-4 border border-purple-100 rounded-lg bg-purple-50">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-full">
                    <span className="text-xs font-semibold text-purple-600">O</span>
                  </div>
                  <p className="text-xs font-medium tracking-wide text-purple-700 uppercase">Organization</p>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {viewRecord.organization?.name || "No Organization"}
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

            {/* Stats Section */}
            <div className="p-4 rounded-lg bg-gray-50">
              <h4 className="mb-3 text-sm font-medium text-gray-700">Donation Statistics</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{viewRecord.totalDonationAmount || 0}</p>
                  <p className="text-xs text-gray-600">Total Amount</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{viewRecord.totalDonors || 0}</p>
                  <p className="text-xs text-gray-600">Total Donors</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{viewRecord.totalDonations || 0}</p>
                  <p className="text-xs text-gray-600">Total Donations</p>
                </div>
              </div>
            </div>

            {/* Timeline Section */}
            <div className="pt-4 border-t">
              <h4 className="mb-3 text-sm font-medium text-gray-700">Timeline</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50">
                  <span className="text-sm text-gray-600">Created Date</span>
                  <span className="text-sm font-medium text-gray-900">
                    {viewRecord.createdAt ? new Date(viewRecord.createdAt).toLocaleString() : "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50">
                  <span className="text-sm text-gray-600">Last Updated</span>
                  <span className="text-sm font-medium text-gray-900">
                    {viewRecord.updatedAt ? new Date(viewRecord.updatedAt).toLocaleString() : "-"}
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

export default CauseManagement;
