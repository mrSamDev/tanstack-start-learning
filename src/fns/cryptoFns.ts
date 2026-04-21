import { createServerFn } from "@tanstack/react-start";
import { z } from "zod/v4";
import { env } from "#/env";
import {
	createCipheriv,
	createDecipheriv,
	createHash,
	randomBytes,
} from "node:crypto";
import { execSync } from "node:child_process";


// Derive a stable 32-byte AES-256 key from SERVER_KEY
function getKey(): Buffer {
	return createHash("sha256").update(env.SERVER_KEY).digest();
}

// Encrypted payload layout: [16-byte IV | 16-byte GCM auth tag | ciphertext]
export const encryptFn = createServerFn({ method: "POST" })
	.inputValidator((data: unknown) =>
		z.object({ plaintext: z.string().min(1) }).parse(data),
	)
	.handler(async ({ data }) => {
		const iv = randomBytes(16);
		const cipher = createCipheriv("aes-256-gcm", getKey(), iv);
		const encrypted = Buffer.concat([
			cipher.update(data.plaintext, "utf8"),
			cipher.final(),
		]);
		const authTag = cipher.getAuthTag();
		return {
			ciphertext: Buffer.concat([iv, authTag, encrypted]).toString("hex"),
		};
	});

export const decryptFn = createServerFn({ method: "POST" })
	.inputValidator((data: unknown) =>
		z.object({ ciphertext: z.string().min(1) }).parse(data),
	)
	.handler(async ({ data }) => {
		const buf = Buffer.from(data.ciphertext, "hex");
		const iv = buf.subarray(0, 16);
		const authTag = buf.subarray(16, 32);
		const encrypted = buf.subarray(32);
		const decipher = createDecipheriv("aes-256-gcm", getKey(), iv);
		decipher.setAuthTag(authTag);
		const plaintext = Buffer.concat([
			decipher.update(encrypted),
			decipher.final(),
		]).toString("utf8");
		return { plaintext };
	});

// Generates a fresh 16-byte (32-char hex) random key via openssl
export const generateKeyFn = createServerFn({ method: "GET" }).handler(
	async () => {
		const key = execSync("openssl rand -hex 16").toString().trim();
		return { key };
	},
);
