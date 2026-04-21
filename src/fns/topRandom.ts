import { createServerFn } from "@tanstack/react-start";

import { fetchRandomDragonBallZ } from "#/lib/dragonballz";

export const fetchTopRandomFn = createServerFn({ method: "GET" }).handler(
	async () => fetchRandomDragonBallZ(10),
);
