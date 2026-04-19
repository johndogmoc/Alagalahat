import QRCode from "qrcode";

/**
 * Generate a QR code as a data URL (PNG base64).
 * Used for pet collar tags and digital profiles.
 */
export async function generateQRDataURL(
  text: string,
  options?: { width?: number; margin?: number; color?: { dark?: string; light?: string } }
): Promise<string> {
  return QRCode.toDataURL(text, {
    width: options?.width ?? 300,
    margin: options?.margin ?? 2,
    color: {
      dark: options?.color?.dark ?? "#1B4F8A",
      light: options?.color?.light ?? "#FFFFFF",
    },
    errorCorrectionLevel: "H",
  });
}

/**
 * Build the public URL for a pet's QR-scannable profile page.
 */
export function getPetPublicURL(registrationNumber: string): string {
  const base = typeof window !== "undefined"
    ? window.location.origin
    : process.env.NEXT_PUBLIC_SITE_URL || "https://alagalahat.vercel.app";
  return `${base}/pet/${encodeURIComponent(registrationNumber)}`;
}
