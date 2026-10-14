"use strict";

const release = window.LEV_RELEASE || {};
let availableCount = 0;
let privateCount = 0;
Object.entries(release).forEach(([key, item]) => {
  let targetUrl = null;
  if ((item.linked || item.available) && item.url) {
    if (
      /^#[A-Za-z][\w-]*$/.test(item.url) &&
      document.getElementById(item.url.slice(1))
    ) {
      targetUrl = item.url;
    } else {
      try {
        const url = new URL(item.url);
        if (url.protocol === "https:") targetUrl = url.href;
      } catch (_) {
        /* Keep incomplete destinations in the local resource list. */
      }
    }
  }
  const isPublic = Boolean(
    targetUrl && item.available && item.visibility !== "private",
  );
  const isPrivate = Boolean(targetUrl && item.visibility === "private");
  if (isPublic) availableCount++;
  if (isPrivate) privateCount++;
  document.querySelectorAll(`[data-resource="${key}"]`).forEach((link) => {
    const label = key.charAt(0).toUpperCase() + key.slice(1);
    link.href = targetUrl || "#release";
    link.dataset.available = String(isPublic);
    link.dataset.linked = String(Boolean(targetUrl));
    link.dataset.visibility =
      item.visibility || (isPublic ? "public" : "pending");
    link.querySelector("small").textContent = isPublic
      ? "Open ↗"
      : `${item.status}${isPrivate ? " ↗" : ""}`;
    link.setAttribute(
      "aria-label",
      `${label}: ${isPublic ? "public" : item.status}. ${item.hint || (targetUrl ? "Open resource" : "View release status")}`,
    );
    if (item.hint) link.title = item.hint;
  });
});
if (privateCount > 0) {
  document.querySelector("#release-label").textContent =
    "Private artifacts · public release pending";
  document.querySelector("#release-intro").textContent =
    "Read the paper PDF below. Code, model, and dataset repositories are currently private and require an authorized account.";
} else if (availableCount > 0) {
  document.querySelector("#release-label").textContent =
    availableCount === Object.keys(release).length
      ? "Research resources"
      : "Release in progress";
  document.querySelector("#release-intro").textContent =
    "Explore the available paper, code, models, and data. Each resource shows its current availability below.";
}

const copyButton = document.querySelector("#copy-citation");
copyButton.hidden = false;
copyButton.addEventListener("click", async () => {
  const citation = document.querySelector("#bibtex");
  const status = document.querySelector("#copy-status");
  try {
    if (!navigator.clipboard || !window.isSecureContext)
      throw new Error("Clipboard unavailable");
    await navigator.clipboard.writeText(citation.textContent);
    status.textContent = "BibTeX copied.";
  } catch (_) {
    const range = document.createRange();
    range.selectNodeContents(citation);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    citation.parentElement.focus();
    status.textContent = "Citation selected. Press Ctrl+C or ⌘C to copy.";
  }
});
