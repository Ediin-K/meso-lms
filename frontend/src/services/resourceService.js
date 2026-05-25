import axiosInstance from "./axiosInstance";

const API_ORIGIN = axiosInstance.defaults.baseURL.replace(/\/api\/?$/, "");

function absoluteApiUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_ORIGIN}${path.startsWith("/api") ? path : `/api${path.startsWith("/") ? path : `/${path}`}`}`;
}

function getResourcePath(resource, mode) {
  const fallback = `/resources/${resource.id}/${mode}`;
  const raw = mode === "view" ? resource.viewUrl : resource.downloadUrl || resource.url;
  if (!raw) return fallback;
  return raw.startsWith("/api") ? raw.slice(4) : raw;
}

export async function openResourcePreview(resource) {
  const path = getResourcePath(resource, "view");
  const response = await axiosInstance.get(path, { responseType: "blob" });
  const blob = new Blob([response.data], {
    type: response.headers["content-type"] || resource.tipi || "application/octet-stream",
  });
  const objectUrl = URL.createObjectURL(blob);
  window.open(objectUrl, "_blank", "noopener,noreferrer");
  setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
}

export async function downloadResource(resource) {
  const path = getResourcePath(resource, "download");
  const response = await axiosInstance.get(path, { responseType: "blob" });
  const blob = new Blob([response.data], {
    type: response.headers["content-type"] || resource.tipi || "application/octet-stream",
  });
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = resource.emriOrigjinal || "material";
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
}

export function getExternalResourceUrl(resource, mode = "view") {
  return absoluteApiUrl(`/api${getResourcePath(resource, mode)}`);
}
