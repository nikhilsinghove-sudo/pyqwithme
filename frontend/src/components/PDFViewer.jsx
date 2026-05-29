import { useEffect, useState } from "react";
import { Loader } from "lucide-react";
import { paperPreviewUrl } from "../utils/paperUrls.js";

export function PDFViewer({ paperId, pdfUrl, mediaType, mimeType, title = "Preview" }) {
  const [loading, setLoading] = useState(true);
  const [showFallback, setShowFallback] = useState(false);
  const [imageBlobUrl, setImageBlobUrl] = useState("");
  const isImage = mediaType === "image" || mimeType?.startsWith("image/");
  const src = paperId ? paperPreviewUrl(paperId) : pdfUrl;

  useEffect(() => {
    if (!isImage || !paperId) return undefined;

    let active = true;
    let objectUrl = "";

    async function loadImage() {
      setLoading(true);
      try {
        const response = await fetch(paperPreviewUrl(paperId));
        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);
        if (active) setImageBlobUrl(objectUrl);
      } catch {
        if (active) setShowFallback(true);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadImage();

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [isImage, paperId]);

  const handleIframeLoad = () => setLoading(false);
  const handleIframeError = () => {
    setLoading(false);
    setShowFallback(true);
  };

  if (!src) {
    return (
      <div className="flex h-96 items-center justify-center bg-white p-4 text-sm text-slate-600">
        Preview is not available for this paper.
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-[70vh] flex-col bg-slate-100">
      <div className="flex items-center justify-between bg-slate-900 p-3 text-white">
        <h3 className="font-semibold">{title}</h3>
        <span className="text-sm">{isImage ? "Image preview" : "PDF preview"}</span>
      </div>

      <div className="relative flex flex-1 items-center justify-center overflow-auto bg-slate-100 p-2">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50">
            <div className="text-center">
              <Loader className="mx-auto mb-2 h-8 w-8 animate-spin" />
              <p className="text-sm text-slate-600">Loading...</p>
            </div>
          </div>
        )}

        {showFallback ? (
          <div className="flex h-96 items-center justify-center rounded-lg bg-white p-4">
            <div className="text-center">
              <p className="mb-4 text-sm text-slate-600">Preview could not be loaded.</p>
              <a href={src} target="_blank" rel="noopener noreferrer" className="inline-block rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                Open in new tab
              </a>
            </div>
          </div>
        ) : isImage ? (
          imageBlobUrl && (
            <img src={imageBlobUrl} alt={title} className="max-h-[70vh] max-w-full object-contain" onLoad={() => setLoading(false)} />
          )
        ) : (
          <iframe
            src={`${src}#toolbar=1&navpanes=0&scrollbar=1`}
            className="h-[70vh] w-full border-0"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            title="PDF Preview"
          />
        )}
      </div>
    </div>
  );
}
