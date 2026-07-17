// Vercel serverless entry point.
// Catches every /api/* request and hands it to the Express app defined in server.ts.
// The Express routes already include the /api prefix, and Vercel forwards the original
// URL, so routing lines up without any extra rewrites.
import app from "../server";

export default app;
