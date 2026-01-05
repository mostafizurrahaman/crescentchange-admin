import { useMemo, useState } from "react";
import { Button, Dropdown, Input, Menu, Modal, Table, message } from "antd";
import { DownOutlined, EyeOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { FaPencilAlt } from "react-icons/fa";
import { RxCrossCircled } from "react-icons/rx";
import { FiDownload } from "react-icons/fi";
import "@google/model-viewer";

import useSmartFetchHook from "../../Components/hooks/useSmartFetchHook.ts";
import { useDeleteBadgeMutation, useGetBadgeReportQuery } from "../../redux/feature/badge/badgeApis";
import CreateBadgeModal from "./CreateBadgeModal";
import UpdateBadgeModal from "./UpdateBadgeModal";
import { exportToXlsx } from "../../lib/export-xlsx";
import BadgeDetailsModal from "./components/badge-details-modal";

const BadgeTable = () => {
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [deleteBadge] = useDeleteBadgeMutation();

  const {
    data,
    pagination,
    isLoading,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    setFilterParams,
  } = useSmartFetchHook(useGetBadgeReportQuery);

  const handleView = (record) => {
    setSelectedBadge(record);
    setIsViewOpen(true);
  };

  const handleDelete = (record) => {
    if (!record?._id) return;

    Modal.confirm({
      title: "Delete Badge",
      content: `Are you sure you want to delete \"${record?.name || "this badge"}\"?`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      centered: true,
      onOk: () =>
        deleteBadge(record._id)
          .unwrap()
          .then(() => {
            message.success("Badge deleted successfully");
          })
          .catch((e) => {
            const msg = e?.data?.message || "Failed to delete badge";
            message.error(msg);
            return Promise.reject(e);
          }),
    });
  };

  const statusTag = (isActive) => (
    <span
      className={
        isActive
          ? "inline-flex items-center gap-1 rounded-full bg-emerald-100 px-4 py-2 text-xs font-medium text-emerald-700"
          : "inline-flex items-center gap-1 rounded-full bg-gray-100 px-4 py-2 text-xs font-medium text-gray-500"
      }
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  );

  const featuredTag = (featured) => (
    <span
      className={
        featured
          ? "inline-flex items-center rounded-full bg-blue-100 px-4 py-2 text-xs font-medium text-blue-700"
          : "inline-flex items-center rounded-full bg-gray-100 px-4 py-2 text-xs font-medium text-gray-600"
      }
    >
      {featured ? "Featured" : "Normal"}
    </span>
  );

  const normalizedData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data.map((b) => ({
      ...b,
      iconUrl: b?.icon || "",
    }));
  }, [data]);

  const formatDateTime = (value) => {
    if (!value) return "-";
    try {
      return new Date(value).toLocaleString();
    } catch {
      return "-";
    }
  };

  const formatUnlockType = (value) => {
    const v = String(value || "");
    if (!v) return "-";
    return v.replaceAll("_", " ");
  };

  const handleExport = () => {
    const rows = (Array.isArray(normalizedData) ? normalizedData : []).map((r) => ({
      Name: r?.name || "-",
      Icon: r?.iconUrl || "-",
      Description: r?.description || "-",
      "Unlock Type": r?.unlockType || "-",
      Active: r?.isActive ? "Active" : "Inactive",
      Featured: r?.featured ? "Featured" : "Normal",
      Priority: r?.priority ?? "-",
      "Condition Logic": r?.conditionLogic || "-",
      "Created At": r?.createdAt ? new Date(r.createdAt).toLocaleString() : "-",
    }));

    exportToXlsx({
      rows,
      sheetName: "Badges",
      fileName: `badges-${new Date().toISOString().slice(0, 10)}.xlsx`,
    });
  };

  const columns = [
    {
      title: "Badge",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <button
          type="button"
          onClick={() => handleView(record)}
          className="text-sm font-semibold text-left text-gray-900"
        >
          {text}
        </button>
      ),
    },
    {
      title: "GLB",
      dataIndex: "iconUrl",
      key: "icon",
      render: (iconUrl, _record) => {
        const url = iconUrl || "";
        return url ? (
          <Button
            type="link"
            className="!px-0"
            onClick={() => {
              setPreviewUrl(url);
              setIsPreviewOpen(true);
            }}
          >
            View 3D
          </Button>
        ) : (
          <span className="text-sm text-gray-400">-</span>
        );
      },
    },
    {
      title: "Tier Type",
      key: "tierType",
      render: (_value, record) => (
        <span className="text-sm text-gray-900">{record?.isSingleTier ? "Single" : "Multi"}</span>
      ),
    },
    {
      title: "Criteria",
      dataIndex: "description",
      key: "criteria",
      render: (value) => (
        <span className="text-sm text-gray-900">{value || "-"}</span>
      ),
    },
    {
      title: "Actions",
      align: "center",
      key: "action",
      render: (_, record) => (
        <div className="flex items-center justify-center gap-3">
          <div
            className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full cursor-pointer"
            title="View Badge"
            onClick={() => handleView(record)}
          >
            <EyeOutlined />
          </div>
          <div
            className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full cursor-pointer"
            title="Edit Badge"
            onClick={() => {
              setSelectedBadge(record);
              setIsUpdateOpen(true);
            }}
          >
            <FaPencilAlt />
          </div>
          <div
            className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full cursor-pointer"
            title="Delete Badge"
            onClick={() => handleDelete(record)}
          >
            <RxCrossCircled />
          </div>
        </div>
      ),
    },
  ];

  const menu = (
    <Menu>
      <Menu.Item
        onClick={() => {
          setFilterParams({ isActive: true });
        }}
      >
        Active
      </Menu.Item>
      <Menu.Item
        onClick={() => {
          setFilterParams({ isActive: false });
        }}
      >
        Inactive
      </Menu.Item>
      <Menu.Item
        onClick={() => {
          setFilterParams({ featured: true });
        }}
      >
        Featured
      </Menu.Item>
      <Menu.Item
        onClick={() => {
          setFilterParams({ featured: false });
        }}
      >
        Not Featured
      </Menu.Item>
      <Menu.Item
        onClick={() => {
          setFilterParams({ unlockType: "seasonal" });
        }}
      >
        Seasonal
      </Menu.Item>
      <Menu.Item
        onClick={() => {
          setFilterParams({});
        }}
      >
        Clear Filters
      </Menu.Item>
    </Menu>
  );

  return (
    <div className="mb-10 bg-white border border-gray-100 rounded-3xl">
      <div className="flex flex-col gap-4 p-6 border-b border-gray-100 md:flex-row md:items-center md:justify-between">
        <h2 className="text-base font-semibold text-gray-900">Badges Management</h2>

        <div className="flex flex-col items-stretch gap-3 md:flex-row md:items-center">
          <div className="w-full md:w-[240px]">
            <div className="flex items-center h-12 px-5 bg-white border border-gray-200 rounded-full [&_.ant-input-affix-wrapper]:!h-full [&_.ant-input-affix-wrapper]:!border-0 [&_.ant-input-affix-wrapper]:!shadow-none [&_.ant-input-affix-wrapper]:!bg-transparent [&_.ant-input-affix-wrapper]:!p-0 [&_.ant-input]:!h-full [&_.ant-input]:!bg-transparent [&_.ant-input]:!text-sm">
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
                disabled={isLoading}
              />
            </div>
          </div>

          <Dropdown overlay={menu} trigger={["click"]}>
            <Button className="!h-12 !rounded-full !border-gray-200 !px-6 !text-sm !font-medium">
              Filter <DownOutlined />
            </Button>
          </Dropdown>

          <Button
            onClick={handleExport}
            disabled={isLoading}
            className="!h-12 !rounded-full !border-gray-200 !px-6 !text-sm !font-medium"
          >
            Export <FiDownload className="ml-2" />
          </Button>

          <Button
            icon={<PlusOutlined />}
            onClick={() => setIsCreateOpen(true)}
            className="!h-12 !rounded-full !border-gray-200 !px-6 !text-sm !font-medium"
          >
            Add
          </Button>
        </div>
      </div>

      <div className="">
        <Table
          columns={columns}
          dataSource={normalizedData}
          loading={isLoading}
          pagination={{
            current: pagination?.page || currentPage,
            pageSize: pagination?.limit || 10,
            total: pagination?.total || 0,
            showTotal: (total, range) =>
              `Showing ${String(range?.[1] ?? 0).padStart(2, "0")} from ${String(total).padStart(2, "0")}`,
            onChange: (page) => setCurrentPage(page),
            showSizeChanger: false,
            position: ["bottomRight"],
          }}
          rowKey="_id"
        />
      </div>

      <BadgeDetailsModal
        open={isViewOpen}
        badge={selectedBadge}
        onClose={() => setIsViewOpen(false)}
        statusTag={statusTag}
        featuredTag={featuredTag}
        formatDateTime={formatDateTime}
        formatUnlockType={formatUnlockType}
        onPreview={(url) => {
          setPreviewUrl(url);
          setIsPreviewOpen(true);
        }}
      />

      <CreateBadgeModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      <UpdateBadgeModal
        open={isUpdateOpen}
        badge={selectedBadge}
        onClose={() => setIsUpdateOpen(false)}
      />

      <Modal
        title="3D Preview"
        open={isPreviewOpen}
        onCancel={() => {
          setIsPreviewOpen(false);
          setPreviewUrl(null);
        }}
        footer={null}
        centered
        width={720}
      >
        {previewUrl ? (
          <div className="w-full h-[420px]">
            <model-viewer
              src={previewUrl}
              class="w-full h-full"
              camera-controls
              auto-rotate
              shadow-intensity="1"
              exposure="1"
            />
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default BadgeTable;
