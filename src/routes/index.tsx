import { useForm } from "@tanstack/react-form";
import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { env } from "#/env";
import { tryCatch } from "#/lib/tryCatch";
import {
	addNumbersFn,
	type FormValues,
	type Result,
	schema,
} from "../fns/addNumbers";

export const Route = createFileRoute("/")({ ssr: false, component: Home });

console.log(env.VITE_APP_TITLE);

function Home() {
	const [results, setResults] = useState<Result[] | null>(null);
	const [submitError, setSubmitError] = useState<string | null>(null);
	const keyCounter = useRef(0);
	const [itemKeys, setItemKeys] = useState<string[]>([
		String(keyCounter.current++),
	]);

	const form = useForm({
		defaultValues: {
			title: "",
			category: "basic" as FormValues["category"],
			items: [{ a: 0, b: 0 }],
		},
		validators: {
			onBlur: schema,
		},

		onSubmit: async ({ value }) => {
			setSubmitError(null);
			const [data, err] = await tryCatch(addNumbersFn({ data: value }));
			if (err !== null) {
				setSubmitError(err.message);
				return;
			}
			setResults(data);
		},
	});

	return (
		<div className="p-8 max-w-xl mx-auto">
			<h1 className="text-3xl font-bold mb-6">Number Adder</h1>

			<form
				onSubmit={(e) => {
					e.preventDefault();
					form.handleSubmit();
				}}
				className="flex flex-col gap-4"
			>
				{/* Title */}
				<form.Field name="title">
					{(field) => (
						<div className="flex flex-col gap-1">
							<label className="font-medium" htmlFor={field.name}>
								Title
							</label>
							<input
								id={field.name}
								value={field.state.value}
								onChange={(e) => field.handleChange(e.target.value)}
								onBlur={field.handleBlur}
								className="border rounded px-3 py-2"
								placeholder="Enter a title"
							/>
							{field.state.meta.errors.length > 0 && (
								<span className="text-red-500 text-sm">
									{field.state.meta.errors[0]?.message}
								</span>
							)}
						</div>
					)}
				</form.Field>

				{/* Category Select */}
				<form.Field name="category">
					{(field) => (
						<div className="flex flex-col gap-1">
							<label className="font-medium" htmlFor={field.name}>
								Category
							</label>
							<select
								id={field.name}
								value={field.state.value}
								onChange={(e) =>
									field.handleChange(e.target.value as FormValues["category"])
								}
								onBlur={field.handleBlur}
								className="border rounded px-3 py-2 bg-white"
							>
								<option value="basic">Basic</option>
								<option value="advanced">Advanced</option>
								<option value="expert">Expert</option>
							</select>
						</div>
					)}
				</form.Field>

				{/* Items Array */}
				<form.Field name="items" mode="array">
					{(field) => (
						<div className="flex flex-col gap-2">
							<span className="font-medium">Number Pairs</span>

							{(field.state.value as FormValues["items"]).map((_, i) => (
								<div key={itemKeys[i]} className="flex items-center gap-2">
									<form.Field name={`items[${i}].a`}>
										{(subField) => (
											<input
												type="number"
												value={subField.state.value as number}
												onChange={(e) =>
													subField.handleChange(Number(e.target.value))
												}
												className="border rounded px-3 py-2 w-24"
												placeholder="A"
											/>
										)}
									</form.Field>
									<span className="text-gray-500">+</span>
									<form.Field name={`items[${i}].b`}>
										{(subField) => (
											<input
												type="number"
												value={subField.state.value as number}
												onChange={(e) =>
													subField.handleChange(Number(e.target.value))
												}
												className="border rounded px-3 py-2 w-24"
												placeholder="B"
											/>
										)}
									</form.Field>
									<button
										type="button"
										onClick={() => {
											field.removeValue(i);
											setItemKeys((k) => k.filter((_, ki) => ki !== i));
										}}
										className="text-red-500 px-2 py-1 rounded hover:bg-red-50"
									>
										Remove
									</button>
								</div>
							))}

							<button
								type="button"
								onClick={() => {
									field.pushValue({ a: 0, b: 0 });
									setItemKeys((k) => [...k, String(keyCounter.current++)]);
								}}
								className="self-start text-blue-600 hover:underline text-sm"
							>
								+ Add pair
							</button>
						</div>
					)}
				</form.Field>

				<form.Subscribe selector={(s) => s.isSubmitting}>
					{(isSubmitting) => (
						<button
							type="submit"
							disabled={isSubmitting}
							className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 disabled:opacity-50"
						>
							{isSubmitting ? "Calculating…" : "Submit"}
						</button>
					)}
				</form.Subscribe>

				{submitError && <p className="text-red-600 text-sm">{submitError}</p>}
			</form>

			{results && (
				<div className="mt-8">
					<h2 className="text-xl font-semibold mb-3">Results</h2>
					<table className="w-full border-collapse text-sm">
						<thead>
							<tr className="bg-gray-100">
								<th className="border px-3 py-2 text-left">A</th>
								<th className="border px-3 py-2 text-left">B</th>
								<th className="border px-3 py-2 text-left">A + B</th>
							</tr>
						</thead>
						<tbody>
							{results.map(({ id, a, b, result }) => (
								<tr key={id}>
									<td className="border px-3 py-2">{a}</td>
									<td className="border px-3 py-2">{b}</td>
									<td className="border px-3 py-2 font-medium">{result}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}
