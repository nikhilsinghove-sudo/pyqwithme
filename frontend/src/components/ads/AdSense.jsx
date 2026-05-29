import { useEffect } from "react";

// Reusable AdSense slot component.
// Usage: <AdSense client="ca-pub-XXXXX" slot="1234567890" className="mx-auto" style={{display: 'block'}} />
export function AdSense({ client = "ca-pub-REPLACE_WITH_YOUR_ID", slot = "", className = "", style = {}, responsive = true }) {
  const isPlaceholder = client.includes("REPLACE_WITH_YOUR_ID");

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Don't load AdSense script when using placeholder client
    if (isPlaceholder) return;
    // Inject the AdSense script once
    if (!window._pyq_adsense_loaded) {
      const s = document.createElement("script");
      s.async = true;
      s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`;
      s.crossOrigin = "anonymous";
      document.head.appendChild(s);
      window._pyq_adsense_loaded = true;
    }

    // Try to (re)render the ad slot
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      // ignore in dev or when script blocked
    }
  }, [client, isPlaceholder]);

  return (
    <div className={className} style={style} aria-hidden={isPlaceholder}>
      {isPlaceholder ? (
        <div className="rounded-md border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">
          AdSense placeholder — set your publisher ID in the AdSense component props.
        </div>
      ) : (
        <ins className="adsbygoogle"
          style={{ display: responsive ? "block" : "inline-block", width: "100%", height: "auto" }}
          data-ad-client={client}
          data-ad-slot={slot}
          data-full-width-responsive={responsive ? "true" : "false"} />
      )}
    </div>
  );
}

export default AdSense;
