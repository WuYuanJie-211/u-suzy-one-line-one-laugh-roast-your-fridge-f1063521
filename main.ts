// One Line, One Laugh: Roast Your Fridge — entry.
//
// One line, at most 200 characters. The line is validated here
// (valid UTF-8 round-trip, exactly one line, non-blank, at most
// 200 characters counted as Unicode code points) and then written
// to /output/entry.txt. Any validation failure aborts before
// anything is written and exits non-zero.
//
// After writing we force the file to 0644 — under a strict umask
// the file would otherwise land 0600 and a grader running as a
// different identity could not read it — and we verify the
// permission bits, the read-back content, and the byte length.

import { chmodSync, readFileSync, statSync, writeFileSync } from "node:fs";

const ENTRY =
  "The fridge light comes on like it's opening a museum at midnight, and the only exhibit is a single pickle jar from 2023 staring back at me.";

const OUTPUT_PATH = "/output/entry.txt";
const MAX_CHARS = 200;

function fail(message: string): never {
  console.error(`entry rejected: ${message}`);
  process.exit(1);
}

// Count characters as Unicode code points, not UTF-16 code units,
// so an astral character counts as one.
const charCount = [...ENTRY].length;

if (ENTRY.trim().length === 0) {
  fail("entry is blank");
}
if (ENTRY !== ENTRY.trim()) {
  fail("entry must not start or end with whitespace");
}
if (ENTRY.includes("\n") || ENTRY.includes("\r")) {
  fail("entry must be exactly one line");
}
if (charCount < 1 || charCount > MAX_CHARS) {
  fail(`entry is ${charCount} characters, must be 1-${MAX_CHARS}`);
}

// Valid UTF-8 round-trip: encode and decode and require identity.
const encoded = new TextEncoder().encode(ENTRY);
const decoded = new TextDecoder("utf-8", { fatal: true }).decode(encoded);
if (decoded !== ENTRY) {
  fail("entry is not valid UTF-8");
}

writeFileSync(OUTPUT_PATH, ENTRY, "utf8");
chmodSync(OUTPUT_PATH, 0o644);

const readBack = readFileSync(OUTPUT_PATH, "utf8");
if (readBack !== ENTRY) {
  fail("read-back content does not match entry");
}
const mode = statSync(OUTPUT_PATH).mode & 0o777;
if (mode !== 0o644) {
  fail(`output mode is ${mode.toString(8)}, expected 644`);
}
const byteLength = Buffer.byteLength(readBack, "utf8");
if (byteLength !== encoded.length) {
  fail(`output is ${byteLength} bytes, expected ${encoded.length}`);
}

console.log(`entry written: ${charCount} characters, ${byteLength} bytes, mode 644`);
