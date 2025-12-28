import { useMemo, useState } from "react";
import { Button, Dropdown, Input, Menu, Modal, Table, message } from "antd";
import { DownOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { FaPencilAlt } from "react-icons/fa";
import { RxCrossCircled } from "react-icons/rx";
import { FiDownload } from "react-icons/fi";
import "@google/model-viewer";

import useSmartFetchHook from "../../Components/hooks/useSmartFetchHook.ts";
import { useDeleteBadgeMutation, useGetBadgeReportQuery } from "../../redux/feature/badge/badgeApis";
import CreateBadgeModal from "./CreateBadgeModal";
import UpdateBadgeModal from "./UpdateBadgeModal";
import { exportToXlsx } from "../../lib/export-xlsx";
const BadgeTable = () => {
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [deleteBadge, { isLoading: isDeleteLoading }] = useDeleteBadgeMutation();

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
      okButtonProps: { loading: isDeleteLoading },
      onOk: async () => {
        try {
          await deleteBadge(record._id).unwrap();
          message.success("Badge deleted successfully");
        } catch (e) {
          const msg = e?.data?.message || "Failed to delete badge";
          message.error(msg);
        }
      },
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
      title: "Icon",
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

      <Modal
        title="Badge Details"
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
        {selectedBadge ? (
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={selectedBadge.iconUrl || ""}
                  alt={selectedBadge.name}
                  className="object-contain w-16 h-16 p-2 rounded-xl bg-gray-50"
                />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {selectedBadge.name}
                  </h3>
                  <p className="text-sm text-gray-600 capitalize">
                    {selectedBadge.unlockType || "-"}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                {statusTag(selectedBadge.isActive)}
                {featuredTag(selectedBadge.featured)}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gray-50">
              <p className="mb-2 text-sm font-medium text-gray-700">Description</p>
              <p className="text-sm leading-relaxed text-gray-600">
                {selectedBadge.description || "No description provided"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border border-blue-100 rounded-lg bg-blue-50">
                <p className="text-xs font-medium tracking-wide text-blue-700 uppercase">Priority</p>
                <p className="text-lg font-bold text-gray-900">{selectedBadge.priority ?? 0}</p>
              </div>
              <div className="p-4 border border-purple-100 rounded-lg bg-purple-50">
                <p className="text-xs font-medium tracking-wide text-purple-700 uppercase">Logic</p>
                <p className="text-sm font-semibold text-gray-900 capitalize">
                  {selectedBadge.conditionLogic || "-"}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="mb-3 text-sm font-medium text-gray-700">Tiers</h4>
              <div className="space-y-2">
                {Array.isArray(selectedBadge.tiers) && selectedBadge.tiers.length ? (
                  selectedBadge.tiers.map((t, idx) => (
                    <div key={`${t.tier}-${idx}`} className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{t.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{t.tier}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">Count: {t.requiredCount}</p>
                        <p className="text-sm font-medium text-gray-900">Amount: {t.requiredAmount}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500">No tiers</div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </Modal>

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
