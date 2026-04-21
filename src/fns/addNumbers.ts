import { createServerFn } from "@tanstack/react-start";
import { z } from "zod/v4";

export const schema = z.object({
	title: z.string().min(1, "Title is required"),
	category: z.enum(["basic", "advanced", "expert"]),
	items: z
		.array(z.object({ a: z.number(), b: z.number() }))
		.min(1, "Add at least one pair"),
});

export type FormValues = z.infer<typeof schema>;
export type Result = { id: string; a: number; b: number; result: number };

export const addNumbersFn = createServerFn({ method: "POST" })
	.inputValidator((data: unknown) => schema.parse(data))
	.handler(async ({ data }) =>
		data.items.map(({ a, b }) => ({
			id: crypto.randomUUID(),
			a,
			b,
			result: a + b,
		})),
	);
