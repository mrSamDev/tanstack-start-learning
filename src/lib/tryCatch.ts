export async function tryCatch<T>(
	promise: Promise<T>,
): Promise<[T, null] | [null, Error]> {
	try {
		return [await promise, null];
	} catch (e) {
		return [null, e instanceof Error ? e : new Error(String(e))];
	}
}
