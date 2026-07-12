/**
 * share.ts — Web Share API + clipboard fallback utilities
 */

/**
 * Share a URL using the Web Share API if supported.
 * Falls back to clipboard copy.
 * Returns true if native share was used, false if clipboard fallback was used.
 */
export async function shareLink(title: string, url: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title,
        text: `Check out this ${title} on FinanceCalc — free, instant financial calculators.`,
        url,
      });
      return true;
    } catch (err: any) {
      // User cancelled the share dialog — treat as graceful cancel
      if (err?.name === 'AbortError') return false;
      // Fallback if share failed for other reason
    }
  }
  await copyToClipboard(url);
  return false;
}

/**
 * Copy text to clipboard.
 * Uses Clipboard API, falls back to execCommand for older browsers.
 */
export async function copyToClipboard(text: string): Promise<void> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  // Legacy fallback
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}
