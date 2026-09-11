import api from "./api";

export const getDashboardStats = () => api.get("/analytics/restaurant/dashboard/");

export const getSalesReport = (start, end) =>
  api.get("/analytics/restaurant/sales/", { params: { start, end } });

export const downloadSalesReportCsv = async (start, end) => {
  const response = await api.get("/analytics/restaurant/sales/", {
    params: { start, end, export: "csv" },
    responseType: "blob",
  });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `sales_${start}_to_${end}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
