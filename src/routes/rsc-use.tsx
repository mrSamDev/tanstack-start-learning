import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { renderServerComponent } from "@tanstack/react-start/rsc";
import { Suspense, use } from "react";

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
		<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
			{characters.map((c) => (
				<CharacterCard key={c.id} character={c} />
			))}
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

// Promise created once at module level — stable across renders
const dragonBallPromise = getDragonBallZRenderable();

function DragonBallZSection() {
	const { DragonBallZList } = use(dragonBallPromise);
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
			{DragonBallZList}
		</div>
	);
}

export const Route = createFileRoute("/rsc-use")({
	ssr: true,
	component: RscUsePage,
});

function RscUsePage() {
	return (
		<main className="page-wrap px-4 py-12">
			<section className="island-shell rounded-2xl p-6 sm:p-8">
				<p className="island-kicker mb-2">RSC · use() + Suspense</p>
				<h1 className="display-title mb-2 text-3xl font-bold text-(--sea-ink) sm:text-4xl">
					RSC with use() in subtree
				</h1>
				<p className="m-0 max-w-3xl text-base text-(--sea-ink-soft)">
					No route loader — the server fn promise is created at module level and
					passed to{" "}
					<code className="rounded bg-(--chip-bg) px-1 py-0.5 text-xs">
						use()
					</code>{" "}
					inside a child component wrapped in{" "}
					<code className="rounded bg-(--chip-bg) px-1 py-0.5 text-xs">
						{"<Suspense>"}
					</code>
					. The header above renders immediately while the list streams in.
				</p>

				<Suspense
					fallback={
						<div className="mt-6 flex items-center gap-2 text-sm text-(--sea-ink-soft)">
							<span className="animate-spin">⏳</span> Loading characters…
						</div>
					}
				>
					<DragonBallZSection />
				</Suspense>
			</section>
		</main>
	);
}
