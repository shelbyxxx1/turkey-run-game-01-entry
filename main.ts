// Gobble Run delivers Tom's autumn escape as a self-contained game and four chase portraits.
// This entrypoint stages those assets, seals their canonical dossier, and checks the written receipt.
import * as disk from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath as moduleFilename } from "node:url";
import { buildDossier as describeGobbleRun } from "./vendor/makefun-game.ts";

const entryDirectory = dirname(moduleFilename(import.meta.url));
const deliveryDirectory = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const receiptPath = resolve(deliveryDirectory, "dossier.json");

// These limits are the submission contract, expressed independently of the staging process.
const submissionLimits = {
  "screenshots": { max_bytes: 256 * 1024, max: 4 },
  "game_path_max_bytes": 1_000,
  "game_max_files": 993,
  "game_max_bytes": 48 * 1024 * 1024,
  "text_max_bytes": 160 * 1024,
};

disk.mkdirSync(deliveryDirectory, { recursive: true });
for (const payloadName of ["game", "screenshots"]) {
  const originalFolder = resolve(entryDirectory, payloadName);
  const deliveredFolder = resolve(deliveryDirectory, payloadName);
  const optionalGallery = payloadName === "screenshots";

  // Keep the gallery directory even when no optional source gallery is present.
  if (optionalGallery) disk.mkdirSync(deliveredFolder, { recursive: true });
  if (!optionalGallery || disk.existsSync(originalFolder)) {
    disk.cpSync(originalFolder, deliveredFolder, { recursive: true });
  }
}

const receiptBytes = describeGobbleRun(deliveryDirectory, submissionLimits);
disk.writeFileSync(receiptPath, receiptBytes);

// statSync also fails immediately if the receipt was not created at its promised location.
const writtenReceipt = disk.statSync(receiptPath);
if (!writtenReceipt.isFile() || writtenReceipt.size !== receiptBytes.byteLength) {
  throw new Error("Gobble Run's dossier was not written completely.");
}
console.log(`Gobble Run ready: ${writtenReceipt.size} dossier bytes written to ${receiptPath}`);
