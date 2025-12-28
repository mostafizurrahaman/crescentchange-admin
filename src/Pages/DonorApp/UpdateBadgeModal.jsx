import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Switch,
  Upload,
  message,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";

import { useUpdateBadgeMutation } from "../../redux/feature/badge/badgeApis";

const { TextArea } = Input;

const normalizeGlbFile = (file) => {
  if (!file) return null;
  const name = String(file?.name || "").toLowerCase();
  if (!name.endsWith(".glb")) return file;
  if (file?.type === "model/gltf-binary") return file;
  try {
    return new File([file], file.name || "model.glb", {
      type: "model/gltf-binary",
      lastModified: file.lastModified,
    });
  } catch {
    return file;
  }
};

const UpdateBadgeModal = ({ open, onClose, badge }) => {
  const [form] = Form.useForm();
  const [mainIconList, setMainIconList] = useState([]);
  const [oneTierModelList, setOneTierModelList] = useState([]);
  const [tierModelLists, setTierModelLists] = useState({
    colour: [],
    bronze: [],
    silver: [],
    gold: [],
  });

  const [updateBadge, { isLoading }] = useUpdateBadgeMutation();

  const isMultiTier = useMemo(() => {
    const tiers = badge?.tiers;
    if (Array.isArray(tiers) && tiers.length) {
      if (tiers.length === 1) return false;
      return true;
    }
    if (typeof badge?.isSingleTier === "boolean") return !badge.isSingleTier;
    return false;
  }, [badge]);

  const uploadProps = useMemo(
    () => ({
      fileList: mainIconList,
      maxCount: 1,
      accept: ".glb",
      beforeUpload: (file) => {
        const name = String(file?.name || "").toLowerCase();
        const ok = name.endsWith(".glb") || file?.type === "model/gltf-binary";
        if (!ok) {
          message.error("Please upload a .glb file");
          return Upload.LIST_IGNORE;
        }
        return false;
      },
      onChange: (info) => {
        const nextList = Array.isArray(info?.fileList) ? info.fileList.slice(-1) : [];
        setMainIconList(nextList);
      },
      onRemove: () => {
        setMainIconList([]);
      },
    }),
    [mainIconList]
  );

  const modelUploadProps = useMemo(
    () => ({
      maxCount: 1,
      accept: ".glb",
      beforeUpload: (file) => {
        const name = String(file?.name || "").toLowerCase();
        const ok = name.endsWith(".glb") || file?.type === "model/gltf-binary";
        if (!ok) {
          message.error("Please upload a .glb file");
          return Upload.LIST_IGNORE;
        }
        return false;
      },
    }),
    []
  );

  useEffect(() => {
    if (!open) {
      form.resetFields();
      setMainIconList([]);
      setOneTierModelList([]);
      setTierModelLists({
        colour: [],
        bronze: [],
        silver: [],
        gold: [],
      });
      return;
    }

    if (!badge) {
      form.resetFields();
      return;
    }

    form.setFieldsValue({
      name: badge?.name,
      description: badge?.description,
      isActive: typeof badge?.isActive === "boolean" ? badge.isActive : true,
      featured: typeof badge?.featured === "boolean" ? badge.featured : false,
      priority: typeof badge?.priority === "number" ? badge.priority : 0,
    });

    setMainIconList([]);
    setOneTierModelList([]);
    setTierModelLists({
      colour: [],
      bronze: [],
      silver: [],
      gold: [],
    });
  }, [open, badge, form]);

  const handleSubmit = async (values) => {
    if (!badge?._id) return;

    const payload = {
      name: values?.name,
      description: values?.description,
      isActive: values?.isActive,
      featured: values?.featured,
      priority: values?.priority,
    };

    const fd = new FormData();
    fd.append("data", JSON.stringify(payload));

    const iconFile = normalizeGlbFile(mainIconList?.[0]?.originFileObj);
    const oneTierModelFile = normalizeGlbFile(oneTierModelList?.[0]?.originFileObj);
    const colourModelFile = normalizeGlbFile(tierModelLists?.colour?.[0]?.originFileObj);
    const bronzeModelFile = normalizeGlbFile(tierModelLists?.bronze?.[0]?.originFileObj);
    const silverModelFile = normalizeGlbFile(tierModelLists?.silver?.[0]?.originFileObj);
    const goldModelFile = normalizeGlbFile(tierModelLists?.gold?.[0]?.originFileObj);

    if (iconFile) {
      fd.append("mainIcon", iconFile);
    }

    if (!isMultiTier) {
      if (oneTierModelFile) {
        fd.append("tier_one-tier", oneTierModelFile);
      }
    }

    if (isMultiTier) {
      const anyMultiProvided = !!(colourModelFile || bronzeModelFile || silverModelFile || goldModelFile);
      if (anyMultiProvided && !(colourModelFile && bronzeModelFile && silverModelFile && goldModelFile)) {
        message.error("Multi-tier badges require all 4 tier models (colour/bronze/silver/gold)");
        return;
      }

      if (colourModelFile && bronzeModelFile && silverModelFile && goldModelFile) {
        fd.append("tier_colour", colourModelFile);
        fd.append("tier_bronze", bronzeModelFile);
        fd.append("tier_silver", silverModelFile);
        fd.append("tier_gold", goldModelFile);
      }
    }

    try {
      await updateBadge({ id: badge._id, data: fd }).unwrap();
      message.success("Badge updated successfully");
      onClose?.();
    } catch (e) {
      const msg = e?.data?.message || "Failed to update badge";
      message.error(msg);
    }
  };

  return (
    <Modal
      title="Update Badge"
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={720}
      destroyOnClose
      styles={{
        content: {
          borderRadius: "30px",
          overflow: "hidden",
        },
      }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          isActive: true,
          featured: false,
          priority: 0,
        }}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Form.Item
            name="name"
            label="Badge Name"
            rules={[{ required: true, message: "Badge name is required" }]}
          >
            <Input placeholder="Enter badge name" />
          </Form.Item>

          <Form.Item
            name="priority"
            label="Priority"
            rules={[{ type: "number", min: 0, message: "Priority must be 0 or more" }]}
          >
            <InputNumber
              className="w-full"
              min={0}
              placeholder="0"
            />
          </Form.Item>
        </div>

        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: "Description is required" }]}
        >
          <TextArea rows={4} placeholder="Write a short description" />
        </Form.Item>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Form.Item
            name="isActive"
            label="Status"
            valuePropName="checked"
          >
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>

          <Form.Item
            name="featured"
            label="Featured"
            valuePropName="checked"
          >
            <Switch checkedChildren="Yes" unCheckedChildren="No" />
          </Form.Item>
        </div>

        <div className="mb-4">
          <div className="mb-2 text-sm font-medium text-gray-700">Main Icon (.glb) (optional)</div>
          <Upload {...uploadProps} listType="text" showUploadList>
            <Button icon={<UploadOutlined />}>Upload .glb</Button>
          </Upload>
          <Alert
            className="mt-3"
            type="info"
            showIcon
            message="If you upload a main icon, it will replace the existing one. Otherwise, the current icon stays." 
          />
        </div>

        <div className="p-4 mb-4 border border-gray-200 bg-gray-50 rounded-2xl">
          <div className="mb-3 text-sm font-semibold text-gray-900">Tier 3D Models (.glb) (optional)</div>

          {!isMultiTier ? (
            <Upload
              {...modelUploadProps}
              fileList={oneTierModelList}
              onChange={(info) => {
                const nextList = Array.isArray(info?.fileList) ? info.fileList.slice(-1) : [];
                setOneTierModelList(nextList);
              }}
              onRemove={() => setOneTierModelList([])}
            >
              <Button icon={<UploadOutlined />}>Upload tier model (.glb)</Button>
            </Upload>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Upload
                {...modelUploadProps}
                fileList={tierModelLists.colour}
                onChange={(info) => {
                  const nextList = Array.isArray(info?.fileList) ? info.fileList.slice(-1) : [];
                  setTierModelLists((prev) => ({ ...prev, colour: nextList }));
                }}
                onRemove={() => setTierModelLists((prev) => ({ ...prev, colour: [] }))}
              >
                <Button icon={<UploadOutlined />}>Upload Colour (.glb)</Button>
              </Upload>

              <Upload
                {...modelUploadProps}
                fileList={tierModelLists.bronze}
                onChange={(info) => {
                  const nextList = Array.isArray(info?.fileList) ? info.fileList.slice(-1) : [];
                  setTierModelLists((prev) => ({ ...prev, bronze: nextList }));
                }}
                onRemove={() => setTierModelLists((prev) => ({ ...prev, bronze: [] }))}
              >
                <Button icon={<UploadOutlined />}>Upload Bronze (.glb)</Button>
              </Upload>

              <Upload
                {...modelUploadProps}
                fileList={tierModelLists.silver}
                onChange={(info) => {
                  const nextList = Array.isArray(info?.fileList) ? info.fileList.slice(-1) : [];
                  setTierModelLists((prev) => ({ ...prev, silver: nextList }));
                }}
                onRemove={() => setTierModelLists((prev) => ({ ...prev, silver: [] }))}
              >
                <Button icon={<UploadOutlined />}>Upload Silver (.glb)</Button>
              </Upload>

              <Upload
                {...modelUploadProps}
                fileList={tierModelLists.gold}
                onChange={(info) => {
                  const nextList = Array.isArray(info?.fileList) ? info.fileList.slice(-1) : [];
                  setTierModelLists((prev) => ({ ...prev, gold: nextList }));
                }}
                onRemove={() => setTierModelLists((prev) => ({ ...prev, gold: [] }))}
              >
                <Button icon={<UploadOutlined />}>Upload Gold (.glb)</Button>
              </Upload>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={isLoading}>
            Update Badge
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default UpdateBadgeModal;
