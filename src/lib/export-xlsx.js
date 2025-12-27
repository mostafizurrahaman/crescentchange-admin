import * as XLSX from "xlsx";

const getByDataIndex = (row, dataIndex) => {
  if (!dataIndex) return undefined;
  if (Array.isArray(dataIndex)) {
    return dataIndex.reduce((acc, key) => (acc == null ? undefined : acc[key]), row);
  }
  return row?.[dataIndex];
};

const toCellValue = (value) => {
  if (value == null) return "";
  if (value instanceof Date) return value.toLocaleString();
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

export const buildRowsFromTable = ({ data, columns }) => {
  const safeData = Array.isArray(data) ? data : [];
  const safeColumns = Array.isArray(columns) ? columns : [];

  const usableColumns = safeColumns.filter((c) => {
    const titleOk = typeof c?.title === "string";
    const hasDataIndex = Boolean(c?.dataIndex);
    const isAction = String(c?.key || "").toLowerCase() === "action";
    return titleOk && hasDataIndex && !isAction;
  });

  if (usableColumns.length === 0) {
    return safeData.map((r) => ({ Data: toCellValue(r) }));
  }

  return safeData.map((row) => {
    const out = {};
    usableColumns.forEach((col) => {
      const v = getByDataIndex(row, col.dataIndex);
      out[col.title] = toCellValue(v);
    });
    return out;
  });
};

export const exportToXlsx = ({ rows, fileName, sheetName }) => {
  const worksheet = XLSX.utils.json_to_sheet(Array.isArray(rows) ? rows : []);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName || "Sheet1");
  XLSX.writeFile(workbook, fileName || `export-${new Date().toISOString().slice(0, 10)}.xlsx`);
};
