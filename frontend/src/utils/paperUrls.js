const apiBase = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");

export function paperDownloadUrl(paperId) {
  return `${apiBase}/papers/${paperId}/download`;
}

export function paperPreviewUrl(paperId) {
  return `${apiBase}/papers/${paperId}/view`;
}
