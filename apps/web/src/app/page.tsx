import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-6 text-zinc-100">
      <h1 className="text-4xl font-semibold tracking-tight">Aegis RPC</h1>
      <p className="mt-3 max-w-lg text-center text-zinc-400">
        Programmable pre-broadcast transaction screening for Base Sepolia.
        Deterministic policy decides; AI explains.
      </p>
      <div className="mt-8 flex flex-wrap gap-4">
        <Link
          href="/dashboard"
          className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-500"
        >
          OpsRisk Dashboard
        </Link>
        <a
          href="/api/adapters/chainlink"
          className="rounded-lg border border-zinc-700 px-5 py-2.5 text-sm hover:bg-zinc-900"
        >
          Chainlink health
        </a>
      </div>
    </main>
  );
}
