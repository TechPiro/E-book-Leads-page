// Vercel serverless entry point. A rewrite in vercel.json sends every /api/* request
// here; Vercel preserves the original URL, so the Express app (which defines routes with
// the /api prefix) matches them directly.
import app from "../server.js";

export default app;
