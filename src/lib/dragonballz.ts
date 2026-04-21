const DBZ_API = "https://dragonball-api.com/api";

export type DbzCharacter = {
	id: number;
	name: string;
	ki: string;
	race: string;
	affiliation: string;
	image: string;
};

export async function fetchTopDragonBallZ(): Promise<DbzCharacter[]> {
	const res = await fetch(`${DBZ_API}/characters?limit=10`);
	if (!res.ok) throw new Error("Failed to fetch Dragon Ball Z characters");
	const data = (await res.json()) as { items: DbzCharacter[] };
	return data.items.slice(0, 10);
}

export async function fetchRandomDragonBallZ(
	count = 10,
): Promise<DbzCharacter[]> {
	const total = 58;
	const ids = Array.from(
		new Set(
			Array.from({ length: count * 3 }, () =>
				Math.floor(Math.random() * total) + 1,
			),
		),
	).slice(0, count);

	const results = await Promise.all(
		ids.map((id) =>
			fetch(`${DBZ_API}/characters/${id}`)
				.then((r) => r.json() as Promise<DbzCharacter>)
				.then((c) => ({
					id: c.id,
					name: c.name,
					ki: c.ki,
					race: c.race,
					affiliation: c.affiliation,
					image: c.image,
				})),
		),
	);
	return results;
}
