import crypto from "crypto";

/**
 * Generate a SHA-256 hash for a given string input.
 * Used to create cache keys for summarization.
 *
 * @param {string} input - The text to hash.
 * @returns {string} Hex-encoded SHA-256 hash string.
 */
export function sha256(input) {
  return crypto.createHash("sha256").update(input, "utf8").digest("hex");
}
