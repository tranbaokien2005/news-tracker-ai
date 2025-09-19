import crypto from "crypto";

/**
 * Tạo hash SHA-256 cho string input.
 * Dùng để sinh cache key cho summarize.
 * @param {string} input - văn bản cần hash
 * @returns {string} - hash dạng hex
 */
export function sha256(input) {
  return crypto.createHash("sha256").update(input, "utf8").digest("hex");
}
