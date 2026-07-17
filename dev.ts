// Local development / traditional Node hosting entry point.
//
// The serverless deployment (Vercel) imports ./server directly and never runs this
// file, so app.listen() and the SPA-serving middleware live here — keeping them out
// of the serverless function, where calling listen() would crash the invocation.
import path from "path";
import express from "express";
import app from "./server.js";

const PORT = Number(process.env.PORT) || 3000;

if (process.env.NODE_ENV !== "production") {
  // Dev: attach Vite as middleware so the React app is served with HMR.
  const { createServer: createViteServer } = await import("vite");
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
} else {
  // Production (non-Vercel): serve the built SPA from dist/.
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  // Single-page-app routing fallback (Express 4 format).
  app.get("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
