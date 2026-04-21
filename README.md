# TanStack Start — Server Functions Playground

This repo is a scratchpad for TanStack Start's server-side primitives: `createServerFn`, React Server Components via `renderServerComponent`, and AES-256-GCM encryption. Everything talks to a real API, because mocks lie.

## Getting Started

```bash
pnpm install
pnpm dev
```

## Routes

| Route | What it does |
|---|---|
| `/` | POST `createServerFn` with a typed form (`@tanstack/react-form` + Zod) that adds number pairs and returns results |
| `/crypto` | Server-side AES-256-GCM key generation, encryption, and decryption |
| `/rsc` | An async server component fetches DBZ characters, serializes through the Flight protocol, and lands on the client as a `Renderable` |

## Project Structure

```
src/
├── fns/
│   ├── addNumbers.ts      # POST server fn — add number pairs
│   ├── cryptoFns.ts       # Server fns — key gen, encrypt, decrypt
│   └── topRandom.ts       # GET server fn — fetch random DBZ characters
├── lib/
│   ├── dragonballz.ts     # Dragon Ball Z API client (dragonball-api.com)
│   └── tryCatch.ts        # Typed try/catch helper
├── routes/
│   ├── __root.tsx         # Shell layout
│   ├── index.tsx          # Number adder form (/)
│   ├── crypto.tsx         # AES-256-GCM playground (/crypto)
│   └── rsc.tsx            # RSC Renderable demo (/rsc)
└── env.ts                 # T3Env typed environment variables
```

## Key Concepts

### `createServerFn`

Mark a function as server-only. Call it from loaders, components, or event handlers; the framework handles the RPC boundary without you touching fetch.

```ts
const myFn = createServerFn({ method: "GET" }).handler(async () => {
  return await fetchSomethingServerSide();
});
```

### `renderServerComponent`

Renders an async server component to a Flight payload inside a `createServerFn` handler. The client gets back a `Renderable` it drops straight into JSX, no hydration ceremony required.

```tsx
const getList = createServerFn({ method: "GET" }).handler(async () => {
  const List = await renderServerComponent(<MyServerComponent />);
  return { List };
});
```

### Dragon Ball Z RSC Demo (`/rsc`)

Fetches the first 10 DBZ characters from [dragonball-api.com](https://dragonball-api.com) inside a server component, renders them as image cards (name, race, affiliation, Ki power), and serializes the whole tree server-side. The client fetches nothing.

### Crypto Demo (`/crypto`)

`generateKeyFn` produces a random 16-byte hex key. `encryptFn` runs AES-256-GCM against `SERVER_KEY` from your env; `decryptFn` reverses it. Set the key before you start:

```env
SERVER_KEY=your_32_char_hex_key_here
```

## Scripts

```bash
pnpm dev      # Start dev server
pnpm build    # Production build
pnpm test     # Run Vitest tests
pnpm lint     # Biome lint
pnpm format   # Biome format
pnpm check    # Biome lint + format check
```

## Stack

[TanStack Start](https://tanstack.com/start), [TanStack Router](https://tanstack.com/router), [TanStack Form](https://tanstack.com/form), [Tailwind CSS](https://tailwindcss.com), [Zod](https://zod.dev), [Biome](https://biomejs.dev), [Dragon Ball Z API](https://dragonball-api.com).
