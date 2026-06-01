import axiosInstance from './axiosInstance';

const BASE = (axiosInstance.defaults.baseURL || 'http://localhost:8080/api').replace(/\/$/, '');

export function getViewUrl(resourceId) {
  return `${BASE}/resources/${resourceId}/view`;
}

export function getDownloadUrl(resourceId) {
  return `${BASE}/resources/${resourceId}/download`;
}

export function openResourcePreview(resource) {
  const id = resource?.id;
  if (!id) return;
  window.open(getViewUrl(id), '_blank', 'noopener,noreferrer');
}

export function downloadResource(resource) {
  const id = resource?.id;
  if (!id) return;
  const a = document.createElement('a');
  a.href = getDownloadUrl(id);
  a.download = resource.emriOrigjinal || 'material';
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export function getExternalResourceUrl(resource, mode = 'view') {
  const id = resource?.id;
  if (!id) return '';
  return mode === 'view' ? getViewUrl(id) : getDownloadUrl(id);
}
