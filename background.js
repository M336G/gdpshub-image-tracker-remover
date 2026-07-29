const PROXY_HOST = "gdpshub-image-proxy.m336.workers.dev";
const ALLOWED_ORIGINS = [ PROXY_HOST, "gdpshub.com", "gdpshub.b-cdn.net", "i.ytimg.com" ];

function shouldProxy(url) {
    if (!url) return false;
    if (url.startsWith("data:") || url.startsWith("blob:")) return false;

    try {
        url = new URL(url);
        if (ALLOWED_ORIGINS.some(hostname => url.hostname.includes(hostname))) return false;

        return true;
    } catch {
        return false;
    }
}

browser.webRequest.onBeforeRequest.addListener(
    (details) => {
        // Only proxy images that are loaded FROM gdpshub.com pages
        const origin = details.originUrl || details.documentUrl || "";
        if (!origin.includes("gdpshub.com")) return;

        if (details.type !== "image" && details.type !== "imageset") return;
        if (!shouldProxy(details.url)) return;

        return { redirectUrl: `https://${PROXY_HOST}/${encodeURIComponent(details.url)}` };
    },
    { urls: ["<all_urls>"] },
    ["blocking"]
);