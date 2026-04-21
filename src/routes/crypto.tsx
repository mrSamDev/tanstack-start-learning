import { createFileRoute } from "@tanstack/react-router";
import { useReducer } from "react";
import { tryCatch } from "#/lib/tryCatch";
import { decryptFn, encryptFn, generateKeyFn } from "../fns/cryptoFns";

export const Route = createFileRoute("/crypto")({ component: CryptoPage });

type State = {
	key: {
		value: string | null;
		copied: boolean;
		loading: boolean;
		error: string | null;
	};
	encrypt: {
		plaintext: string;
		ciphertext: string | null;
		loading: boolean;
		error: string | null;
	};
	decrypt: {
		input: string;
		plaintext: string | null;
		loading: boolean;
		error: string | null;
	};
};

type Action =
	| { type: "KEY_LOADING" }
	| { type: "KEY_SUCCESS"; key: string }
	| { type: "KEY_ERROR"; error: string }
	| { type: "KEY_COPIED" }
	| { type: "KEY_UNCOPY" }
	| { type: "SET_PLAINTEXT"; value: string }
	| { type: "ENCRYPT_LOADING" }
	| { type: "ENCRYPT_SUCCESS"; ciphertext: string }
	| { type: "ENCRYPT_ERROR"; error: string }
	| { type: "SET_CIPHERTEXT_INPUT"; value: string }
	| { type: "DECRYPT_LOADING" }
	| { type: "DECRYPT_SUCCESS"; plaintext: string }
	| { type: "DECRYPT_ERROR"; error: string };

const initial: State = {
	key: { value: null, copied: false, loading: false, error: null },
	encrypt: { plaintext: "", ciphertext: null, loading: false, error: null },
	decrypt: { input: "", plaintext: null, loading: false, error: null },
};

function reducer(state: State, action: Action): State {
	switch (action.type) {
		case "KEY_LOADING":
			return {
				...state,
				key: { ...state.key, loading: true, error: null, copied: false },
			};
		case "KEY_SUCCESS":
			return {
				...state,
				key: { value: action.key, loading: false, error: null, copied: false },
			};
		case "KEY_ERROR":
			return {
				...state,
				key: { ...state.key, loading: false, error: action.error },
			};
		case "KEY_COPIED":
			return { ...state, key: { ...state.key, copied: true } };
		case "KEY_UNCOPY":
			return { ...state, key: { ...state.key, copied: false } };
		case "SET_PLAINTEXT":
			return {
				...state,
				encrypt: { ...state.encrypt, plaintext: action.value },
			};
		case "ENCRYPT_LOADING":
			return {
				...state,
				encrypt: {
					...state.encrypt,
					loading: true,
					error: null,
					ciphertext: null,
				},
			};
		case "ENCRYPT_SUCCESS":
			return {
				...state,
				encrypt: {
					...state.encrypt,
					loading: false,
					ciphertext: action.ciphertext,
				},
			};
		case "ENCRYPT_ERROR":
			return {
				...state,
				encrypt: { ...state.encrypt, loading: false, error: action.error },
			};
		case "SET_CIPHERTEXT_INPUT":
			return { ...state, decrypt: { ...state.decrypt, input: action.value } };
		case "DECRYPT_LOADING":
			return {
				...state,
				decrypt: {
					...state.decrypt,
					loading: true,
					error: null,
					plaintext: null,
				},
			};
		case "DECRYPT_SUCCESS":
			return {
				...state,
				decrypt: {
					...state.decrypt,
					loading: false,
					plaintext: action.plaintext,
				},
			};
		case "DECRYPT_ERROR":
			return {
				...state,
				decrypt: { ...state.decrypt, loading: false, error: action.error },
			};
	}
}

function CryptoPage() {
	const [state, dispatch] = useReducer(reducer, initial);
	const { key, encrypt, decrypt } = state;

	async function handleGenerateKey() {
		dispatch({ type: "KEY_LOADING" });
		const [data, err] = await tryCatch(generateKeyFn());
		if (err) {
			dispatch({ type: "KEY_ERROR", error: err.message });
			return;
		}
		dispatch({ type: "KEY_SUCCESS", key: data.key });
	}

	async function handleCopyKey() {
		if (!key.value) return;
		await navigator.clipboard.writeText(key.value);
		dispatch({ type: "KEY_COPIED" });
		setTimeout(() => dispatch({ type: "KEY_UNCOPY" }), 2000);
	}

	async function handleEncrypt(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		dispatch({ type: "ENCRYPT_LOADING" });
		const [data, err] = await tryCatch(
			encryptFn({ data: { plaintext: encrypt.plaintext } }),
		);
		if (err) {
			dispatch({ type: "ENCRYPT_ERROR", error: err.message });
			return;
		}
		dispatch({ type: "ENCRYPT_SUCCESS", ciphertext: data.ciphertext });
	}

	async function handleDecrypt(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		dispatch({ type: "DECRYPT_LOADING" });
		const [data, err] = await tryCatch(
			decryptFn({ data: { ciphertext: decrypt.input } }),
		);
		if (err) {
			dispatch({ type: "DECRYPT_ERROR", error: err.message });
			return;
		}
		dispatch({ type: "DECRYPT_SUCCESS", plaintext: data.plaintext });
	}

	return (
		<div className="p-8 max-w-xl mx-auto flex flex-col gap-10">
			<h1 className="text-3xl font-bold">AES-256-GCM Crypto</h1>

			{/* Generate Key */}
			<section className="flex flex-col gap-3">
				<h2 className="text-xl font-semibold">Generate Key</h2>
				<p className="text-sm text-gray-500">
					Generate a random 16-byte hex key to use as <code>SERVER_KEY</code>.
				</p>
				<button
					type="button"
					onClick={handleGenerateKey}
					disabled={key.loading}
					className="self-start bg-gray-800 text-white rounded px-4 py-2 hover:bg-gray-900 disabled:opacity-50"
				>
					{key.loading ? "Generating…" : "openssl rand -hex 16"}
				</button>
				{key.error && <p className="text-red-600 text-sm">{key.error}</p>}
				{key.value && (
					<div className="flex items-center gap-2">
						<code className="bg-gray-100 rounded px-3 py-2 text-sm font-mono flex-1 break-all">
							{key.value}
						</code>
						<button
							type="button"
							onClick={handleCopyKey}
							className="text-sm text-blue-600 hover:underline shrink-0"
						>
							{key.copied ? "Copied!" : "Copy"}
						</button>
					</div>
				)}
			</section>

			{/* Encrypt */}
			<section className="flex flex-col gap-3">
				<h2 className="text-xl font-semibold">Encrypt</h2>
				<form onSubmit={handleEncrypt} className="flex flex-col gap-3">
					<textarea
						value={encrypt.plaintext}
						onChange={(e) =>
							dispatch({ type: "SET_PLAINTEXT", value: e.target.value })
						}
						placeholder="Enter plaintext…"
						rows={3}
						className="border rounded px-3 py-2 text-sm font-mono resize-none"
					/>
					<button
						type="submit"
						disabled={encrypt.loading || !encrypt.plaintext.trim()}
						className="self-start bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 disabled:opacity-50"
					>
						{encrypt.loading ? "Encrypting…" : "Encrypt"}
					</button>
				</form>
				{encrypt.error && (
					<p className="text-red-600 text-sm">{encrypt.error}</p>
				)}
				{encrypt.ciphertext && (
					<div className="flex flex-col gap-1">
						<span className="text-sm font-medium text-gray-600">
							Ciphertext (hex)
						</span>
						<code className="bg-gray-100 rounded px-3 py-2 text-xs font-mono break-all">
							{encrypt.ciphertext}
						</code>
						<button
							type="button"
							onClick={() =>
								encrypt.ciphertext &&
								dispatch({
									type: "SET_CIPHERTEXT_INPUT",
									value: encrypt.ciphertext,
								})
							}
							className="self-start text-sm text-blue-600 hover:underline"
						>
							→ Use in Decrypt
						</button>
					</div>
				)}
			</section>

			{/* Decrypt */}
			<section className="flex flex-col gap-3">
				<h2 className="text-xl font-semibold">Decrypt</h2>
				<form onSubmit={handleDecrypt} className="flex flex-col gap-3">
					<textarea
						value={decrypt.input}
						onChange={(e) =>
							dispatch({ type: "SET_CIPHERTEXT_INPUT", value: e.target.value })
						}
						placeholder="Paste ciphertext hex…"
						rows={3}
						className="border rounded px-3 py-2 text-sm font-mono resize-none"
					/>
					<button
						type="submit"
						disabled={decrypt.loading || !decrypt.input.trim()}
						className="self-start bg-green-600 text-white rounded px-4 py-2 hover:bg-green-700 disabled:opacity-50"
					>
						{decrypt.loading ? "Decrypting…" : "Decrypt"}
					</button>
				</form>
				{decrypt.error && (
					<p className="text-red-600 text-sm">{decrypt.error}</p>
				)}
				{decrypt.plaintext !== null && (
					<div className="flex flex-col gap-1">
						<span className="text-sm font-medium text-gray-600">Plaintext</span>
						<code className="bg-gray-100 rounded px-3 py-2 text-sm font-mono break-all whitespace-pre-wrap">
							{decrypt.plaintext}
						</code>
					</div>
				)}
			</section>
		</div>
	);
}
