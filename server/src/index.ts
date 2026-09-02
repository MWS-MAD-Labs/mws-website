import "dotenv/config";
import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono();

const frontendOrigin = process.env["FRONTEND_ORIGIN"] ?? "http://localhost:5173";
const port = Number(process.env["PORT"] ?? 4002);

declare global {
  // `bun run --hot` re-evaluates this module on changes. Keep one server
  // instance alive and reload its fetch handler instead of binding twice.
  var __mwsWebsiteServer: ReturnType<typeof Bun.serve> | undefined;
}

app.use(
  "*",
  cors({
    origin: frontendOrigin,
    credentials: true,
  }),
);

app.get("/", (c) => {
  return c.json({
    message: "MWS Website API is running",
  });
});

app.get("/health", (c) => {
  return c.json({
    data: "ok",
  });
});

app.onError((error, c) => {
  console.error(error);

  return c.json(
    {
      errors: "Internal server error",
    },
    500,
  );
});

if (globalThis.__mwsWebsiteServer) {
  globalThis.__mwsWebsiteServer.reload({
    fetch: app.fetch,
  });
  console.log(`MWS Website API reloaded on :${globalThis.__mwsWebsiteServer.port}`);
} else {
  globalThis.__mwsWebsiteServer = Bun.serve({
    port,
    fetch: app.fetch,
  });
  console.log(`MWS Website API listening on :${globalThis.__mwsWebsiteServer.port}`);
}

export { app };
