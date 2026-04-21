import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { renderServerComponent } from "@tanstack/react-start/rsc";

import { type DbzCharacter, fetchTopDragonBallZ } from "#/lib/dragonballz";

function CharacterCard({ character }: { character: DbzCharacter }) {
	return (
		<div className="flex flex-col overflow-hidden rounded-xl border border-(--sea-ink-soft)/20 bg-(--chip-bg) shadow-sm">
			<div className="flex h-40 items-center justify-center bg-linear-to-b from-(--lagoon-deep)/10 to-(--lagoon-deep)/5 p-4">
				<img
					src={character.image}
					alt={character.name}
					className="h-full w-auto object-contain drop-shadow-md"
				/>
			</div>
			<div className="flex flex-1 flex-col gap-1 p-3">
				<p className="font-semibold text-(--sea-ink)">{character.name}</p>
				<p className="text-xs text-(--sea-ink-soft)">{character.race}</p>
				<p className="text-xs text-(--sea-ink-soft)/70">
					{character.affiliation}
				</p>
				<p className="mt-auto text-xs font-mono text-(--lagoon-deep)">
					Ki: {character.ki}
				</p>
			</div>
		</div>
	);
}

async function DragonBallZServerList() {
	const characters = await fetchTopDragonBallZ();

	return (
		<div className="mt-6">
			<div className="mb-6 flex items-center gap-3">
				<span className="text-3xl">🐉</span>
				<div>
					<h2 className="text-xl font-bold text-(--sea-ink)">
						Dragon Ball Z Characters
					</h2>
					<p className="text-sm text-(--sea-ink-soft)">
						Top 10 fighters from the DBZ universe
					</p>
				</div>
			</div>
			<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
				{characters.map((c) => (
					<CharacterCard key={c.id} character={c} />
				))}
			</div>
		</div>
	);
}

const getDragonBallZRenderable = createServerFn({ method: "GET" }).handler(
	async () => {
		const DragonBallZList = await renderServerComponent(
			<DragonBallZServerList />,
		);
		return { DragonBallZList };
	},
);

export const Route = createFileRoute("/rsc")({
	loader: async () => getDragonBallZRenderable(),
	component: RscRenderablePage,
});

function RscRenderablePage() {
	const { DragonBallZList } = Route.useLoaderData();

	return (
		<main className="page-wrap px-4 py-12">
			<section className="island-shell rounded-2xl p-6 sm:p-8">
				<p className="island-kicker mb-2">RSC · renderServerComponent</p>
				<h1 className="display-title mb-2 text-3xl font-bold text-(--sea-ink) sm:text-4xl">
					RSC low-level (Renderable)
				</h1>
				<p className="m-0 max-w-3xl text-base text-(--sea-ink-soft)">
					Data is fetched inside an async server component, serialized through
					the Flight payload via{" "}
					<code className="rounded bg-(--chip-bg) px-1 py-0.5 text-xs">
						renderServerComponent
					</code>
					, and returned from a{" "}
					<code className="rounded bg-(--chip-bg) px-1 py-0.5 text-xs">
						createServerFn
					</code>{" "}
					handler for the route loader. The client renders the handle as{" "}
					<code className="rounded bg-(--chip-bg) px-1 py-0.5 text-xs">
						{"{DragonBallZList}"}
					</code>
					.
				</p>
				{DragonBallZList}
			</section>
		</main>
	);
}
