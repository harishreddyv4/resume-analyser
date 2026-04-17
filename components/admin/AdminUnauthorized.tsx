import { Container } from "@/components/layout/Container";

/**
 * Shown when admin routes reject the request. Common pitfall: `$` in
 * `ADMIN_DASHBOARD_KEY` without quoting — Next expands `$…` in .env and the
 * server key no longer matches the URL.
 */
export function AdminUnauthorized() {
  return (
    <main className="py-20">
      <Container className="max-w-3xl">
        <div className="rounded-2xl border border-zinc-200 bg-white p-8">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Unauthorized
          </h1>
          <p className="mt-3 text-sm text-zinc-600">
            Admin access is restricted. Set{" "}
            <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs">
              ADMIN_DASHBOARD_KEY
            </code>{" "}
            in{" "}
            <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs">
              .env.local
            </code>
            , restart{" "}
            <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs">
              npm run dev
            </code>
            , then pass the same value using either:
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-zinc-600">
            <li>
              Query string:{" "}
              <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs">
                /admin?adminKey=YOUR_KEY
              </code>{" "}
              (and the same{" "}
              <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs">
                ?adminKey=
              </code>{" "}
              on submission detail URLs).
            </li>
            <li>
              Header{" "}
              <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs">
                x-admin-key: YOUR_KEY
              </code>{" "}
              (API clients / curl).
            </li>
          </ul>
          <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-950">
            <strong className="font-semibold">If your key contains </strong>
            <code className="font-mono">$</code>
            <strong className="font-semibold">
              , wrap the whole value in single quotes in{" "}
            </strong>
            <code className="font-mono">.env.local</code>
            <strong className="font-semibold">
              {" "}
              (e.g.{" "}
            </strong>
            <code className="whitespace-pre-wrap font-mono">
              {`ADMIN_DASHBOARD_KEY='Vhkr$012118'`}
            </code>
            <strong className="font-semibold">
              ). Otherwise Next.js treats{" "}
            </strong>
            <code className="font-mono">$012118</code>
            <strong className="font-semibold">
              {" "}
              like a variable reference and the loaded key becomes wrong. In the
              URL you can also encode{" "}
            </strong>
            <code className="font-mono">$</code>
            <strong className="font-semibold"> as </strong>
            <code className="font-mono">%24</code>
            <strong className="font-semibold">.</strong>
          </p>
        </div>
      </Container>
    </main>
  );
}
