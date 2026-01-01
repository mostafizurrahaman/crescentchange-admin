import "@google/model-viewer";

import { Button, Modal } from "antd";

const BadgeDetailsModal = ({
  open,
  badge,
  onClose,
  statusTag,
  featuredTag,
  formatDateTime,
  formatUnlockType,
  onPreview,
}) => {
  return (
    <Modal
      title="Badge Details"
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={860}
      styles={{
        content: {
          borderRadius: "30px",
          overflow: "hidden",
        },
        body: {
          maxHeight: "85vh",
          overflowY: "auto",
          background: "#fff",
        },
      }}
    >
      {badge ? (
        <div className="space-y-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-4">
              <div className="w-[120px] h-[120px] rounded-2xl bg-gray-50 overflow-hidden border border-gray-100">
                {badge.iconUrl ? (
                  <model-viewer
                    src={badge.iconUrl}
                    class="w-full h-full"
                    camera-controls
                    auto-rotate
                    shadow-intensity="1"
                    exposure="1"
                  />
                ) : null}
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-semibold text-gray-900">{badge.name}</h3>
                <p className="text-sm text-gray-600 capitalize">
                  {formatUnlockType(badge.unlockType)}
                </p>
                {badge.iconUrl ? (
                  <Button
                    size="small"
                    className="!px-0"
                    type="link"
                    onClick={() => onPreview(badge.iconUrl)}
                  >
                    Open 3D Preview
                  </Button>
                ) : null}
              </div>
            </div>
            <div className="flex flex-row gap-2 md:flex-col md:items-end">
              {statusTag(badge.isActive)}
              {featuredTag(badge.featured)}
            </div>
          </div>

          <div className="p-4 border border-gray-100 rounded-2xl bg-gray-50">
            <p className="mb-2 text-sm font-medium text-gray-700">Description</p>
            <p className="text-sm leading-relaxed text-gray-600">
              {badge.description || "No description provided"}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="p-4 border border-blue-100 rounded-2xl bg-blue-50">
              <p className="text-xs font-medium tracking-wide text-blue-700 uppercase">
                Tier Type
              </p>
              <p className="text-sm font-semibold text-gray-900">
                {badge.isSingleTier ? "Single" : "Multi"}
              </p>
            </div>
            <div className="p-4 border border-purple-100 rounded-2xl bg-purple-50">
              <p className="text-xs font-medium tracking-wide text-purple-700 uppercase">
                Logic
              </p>
              <p className="text-sm font-semibold text-gray-900 capitalize">
                {badge.conditionLogic || "-"}
              </p>
            </div>
            <div className="p-4 border border-emerald-100 rounded-2xl bg-emerald-50">
              <p className="text-xs font-medium tracking-wide uppercase text-emerald-700">
                Priority
              </p>
              <p className="text-lg font-bold text-gray-900">{badge.priority ?? 0}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="p-4 bg-white border rounded-2xl">
              <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">
                Created
              </p>
              <p className="text-sm font-semibold text-gray-900">
                {formatDateTime(badge.createdAt)}
              </p>
            </div>
            <div className="p-4 bg-white border rounded-2xl">
              <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">
                Updated
              </p>
              <p className="text-sm font-semibold text-gray-900">
                {formatDateTime(badge.updatedAt)}
              </p>
            </div>
          </div>

          {badge.seasonalPeriod ? (
            <div className="p-4 bg-white border rounded-2xl">
              <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">
                Seasonal Period
              </p>
              <p className="text-sm font-semibold text-gray-900 capitalize">
                {formatUnlockType(badge.seasonalPeriod)}
              </p>
            </div>
          ) : null}

          {badge.timeRange ? (
            <div className="p-4 bg-white border rounded-2xl">
              <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">
                Time Range
              </p>
              <p className="text-sm font-semibold text-gray-900">
                {String(badge.timeRange?.start ?? "-")} - {String(badge.timeRange?.end ?? "-")}
              </p>
            </div>
          ) : null}

          {Array.isArray(badge.specificCategories) && badge.specificCategories.length ? (
            <div className="p-4 bg-white border rounded-2xl">
              <p className="mb-3 text-xs font-medium tracking-wide text-gray-500 uppercase">
                Specific Categories
              </p>
              <div className="flex flex-wrap gap-2">
                {badge.specificCategories.map((c) => (
                  <span
                    key={c}
                    className="inline-flex items-center px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-full"
                  >
                    {formatUnlockType(c)}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <div className="pt-4 border-t">
            <h4 className="mb-3 text-sm font-medium text-gray-700">Tiers</h4>
            <div className="space-y-2">
              {Array.isArray(badge.tiers) && badge.tiers.length ? (
                badge.tiers.map((t, idx) => (
                  <div
                    key={`${t.tier}-${idx}`}
                    className="flex flex-col gap-3 p-4 border border-gray-100 rounded-2xl bg-gray-50 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="flex items-start gap-3">
                      {t.icon ? (
                        <div className="overflow-hidden bg-white border border-gray-100 w-14 h-14 rounded-xl">
                          <model-viewer
                            src={t.icon}
                            class="w-full h-full"
                            camera-controls
                            auto-rotate
                            shadow-intensity="1"
                            exposure="1"
                          />
                        </div>
                      ) : null}

                      <div>
                        <p className="text-sm font-semibold text-gray-900">{t.name || "-"}</p>
                        <p className="text-xs text-gray-500 capitalize">{t.tier || "-"}</p>
                        {t.icon ? (
                          <Button
                            size="small"
                            type="link"
                            className="!px-0"
                            onClick={() => onPreview(t.icon)}
                          >
                            View Tier 3D
                          </Button>
                        ) : null}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 md:flex md:items-center md:gap-6">
                      <div className="flex items-center gap-3 md:gap-2">
                        {t.smallIconUrl ? (
                          <a
                            href={t.smallIconUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="block"
                          >
                            <img
                              src={t.smallIconUrl}
                              alt={`${t.tier || "tier"}-small`}
                              className="object-contain w-10 h-10 bg-white border border-gray-200 rounded-lg"
                            />
                          </a>
                        ) : null}

                        {t.animationUrl ? (
                          <a
                            href={t.animationUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="block"
                          >
                            <img
                              src={t.animationUrl}
                              alt={`${t.tier || "tier"}-animation`}
                              className="object-contain w-10 h-10 bg-white border border-gray-200 rounded-lg"
                            />
                          </a>
                        ) : null}
                      </div>

                      <div>
                        <p className="text-xs text-gray-500">Required Count</p>
                        <p className="text-sm font-semibold text-gray-900">{t.requiredCount ?? "-"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Required Amount</p>
                        <p className="text-sm font-semibold text-gray-900">{t.requiredAmount ?? "-"}</p>
                      </div>
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
  );
};

export default BadgeDetailsModal;
