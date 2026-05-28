import axiosInstance from "./axiosInstance";

const API_ORIGIN = axiosInstance.defaults.baseURL.replace(/\/api\/?$/, "");

function absoluteApiUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_ORIGIN}${path.startsWith("/api") ? path : `/api${path.startsWith("/") ? path : `/${path}`}`}`;
}

function normalizeApiPath(path) {
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = path.startsWith("/api") ? path.slice(4) : path;
  return normalized.startsWith("/") ? normalized : `/${normalized}`;
}

function requireResourceId(resource) {
  const id = Number(resource?.id);
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Cannot download resource: missing or invalid resource id.");
  }
  return id;
}

function getResourcePath(resource, mode) {
  const raw = mode === "view" ? resource?.viewUrl : resource?.downloadUrl || resource?.url;
  if (raw) return normalizeApiPath(raw);
  return `/resources/${requireResourceId(resource)}/${mode}`;
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
  return absoluteApiUrl(getResourcePath(resource, mode));
}
