import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import crypto from "crypto";
import { cert, initializeApp as initAdminApp, getApps as getAdminApps } from "firebase-admin/app";
import { getFirestore as getAdminFirestore } from "firebase-admin/firestore";
import { initializeApp as initFirebaseClient } from "firebase/app";
import { 
  getFirestore as getClientFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  setDoc, 
  addDoc, 
  updateDoc 
} from "firebase/firestore";

// Client-side Firebase Firestore compatibility wrappers for Node.js server environment
class ClientFirestoreWrapper {
  private firestoreDb: any;

  constructor(firestoreDb: any) {
    this.firestoreDb = firestoreDb;
  }

  collection(collectionPath: string) {
    return new ClientCollectionWrapper(this.firestoreDb, collectionPath);
  }
}

class ClientCollectionWrapper {
  private firestoreDb: any;
  private path: string;
  private constraints: any[];

  constructor(firestoreDb: any, path: string, constraints: any[] = []) {
    this.firestoreDb = firestoreDb;
    this.path = path;
    this.constraints = constraints;
  }

  doc(docId: string) {
    return new ClientDocWrapper(this.firestoreDb, this.path, docId);
  }

  where(field: string, op: string, value: any) {
    return new ClientCollectionWrapper(
      this.firestoreDb,
      this.path,
      [...this.constraints, where(field, op as any, value)]
    );
  }

  async get() {
    const colRef = collection(this.firestoreDb, this.path);
    const q = this.constraints.length > 0 ? query(colRef, ...this.constraints) : colRef;
    const querySnapshot = await getDocs(q);
    
    return {
      empty: querySnapshot.empty,
      size: querySnapshot.size,
      docs: querySnapshot.docs.map(d => ({
        id: d.id,
        ref: new ClientDocWrapper(this.firestoreDb, this.path, d.id),
        data: () => d.data()
      })),
      forEach: (callback: (doc: any) => void) => {
        querySnapshot.forEach(d => {
          callback({
            id: d.id,
            ref: new ClientDocWrapper(this.firestoreDb, this.path, d.id),
            data: () => d.data()
          });
        });
      }
    };
  }

  async add(data: any) {
    const colRef = collection(this.firestoreDb, this.path);
    const docRef = await addDoc(colRef, data);
    return {
      id: docRef.id,
      ref: new ClientDocWrapper(this.firestoreDb, this.path, docRef.id)
    };
  }
}

class ClientDocWrapper {
  private firestoreDb: any;
  private collectionPath: string;
  private docId: string;

  constructor(firestoreDb: any, collectionPath: string, docId: string) {
    this.firestoreDb = firestoreDb;
    this.collectionPath = collectionPath;
    this.docId = docId;
  }

  get id() {
    return this.docId;
  }

  get ref() {
    return this;
  }

  async get() {
    const docRef = doc(this.firestoreDb, this.collectionPath, this.docId);
    const docSnap = await getDoc(docRef);
    return {
      exists: docSnap.exists(),
      id: docSnap.id,
      data: () => docSnap.data()
    };
  }

  async set(data: any, options?: { merge?: boolean }) {
    const docRef = doc(this.firestoreDb, this.collectionPath, this.docId);
    await setDoc(docRef, data, { merge: !!options?.merge });
  }

  async update(data: any) {
    const docRef = doc(this.firestoreDb, this.collectionPath, this.docId);
    await updateDoc(docRef, data);
  }
}
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { COPY_CONFIG } from "./src/copyConfig";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Set up JSON body parser with increased limit for profile photo upload
app.use(express.json({ limit: "10mb" }));

// Serve public directory files as static assets (ebook.pdf, book_cover.jpg, etc.)
app.use(express.static(path.join(process.cwd(), "public")));

// On Vercel (and most serverless platforms) the filesystem is read-only except /tmp,
// and any writes are ephemeral. Firestore is the source of truth there, so guard all
// disk writes behind this flag to avoid crashes.
const CAN_WRITE_DISK = !process.env.VERCEL;

function safeWriteFileSync(filePath: string, data: string | Buffer) {
  if (!CAN_WRITE_DISK) return;
  try {
    fs.writeFileSync(filePath, data);
  } catch (err: any) {
    console.warn(`[Disk Warning] Skipped writing ${filePath}:`, err?.message || err);
  }
}

// Stateless admin auth via signed HMAC tokens (survives serverless cold starts /
// multiple lambda instances, unlike an in-memory session Set).
const SESSION_SECRET = process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || "insecure-default-change-me";

function signAdminToken(ttlMs = 24 * 60 * 60 * 1000) {
  const exp = Date.now() + ttlMs;
  const payload = `admin.${exp}`;
  const sig = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");
  return Buffer.from(`${payload}.${sig}`).toString("base64url");
}

function verifyAdminToken(token: string): boolean {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf-8");
    const parts = decoded.split(".");
    if (parts.length !== 3) return false;
    const [role, exp, sig] = parts;
    const expected = crypto.createHmac("sha256", SESSION_SECRET).update(`${role}.${exp}`).digest("hex");
    const sigBuf = Buffer.from(sig);
    const expBuf = Buffer.from(expected);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) return false;
    if (Date.now() > Number(exp)) return false;
    return true;
  } catch {
    return false;
  }
}

// Dynamic Firebase loading
let db: any = null;
function logDbError(message: string, err: any) {
  const errMsg = err?.message || String(err);
  console.warn(`[Database Warning] ${message} - Details: ${errMsg}`);
}

interface ProfileSettings {
  authorName: string;
}

const SETTINGS_FILE_PATH = path.join(process.cwd(), "public", "profile_settings.json");

async function getProfileSettings(): Promise<ProfileSettings> {
  const defaultSettings: ProfileSettings = { authorName: "Gbolahan Oyegoke" };
  
  if (db) {
    try {
      const docRef = db.collection("settings").doc("profile");
      const docSnap = await docRef.get();
      if (docSnap.exists) {
        const data = docSnap.data();
        if (data && data.authorName) {
          if (!fs.existsSync(SETTINGS_FILE_PATH)) {
            safeWriteFileSync(SETTINGS_FILE_PATH, JSON.stringify({ authorName: data.authorName }, null, 2));
          }
          return { authorName: data.authorName };
        }
      } else {
        let localName = "Gbolahan Oyegoke";
        if (fs.existsSync(SETTINGS_FILE_PATH)) {
          try {
            const localData = JSON.parse(fs.readFileSync(SETTINGS_FILE_PATH, "utf-8"));
            if (localData && localData.authorName) {
              localName = localData.authorName;
            }
          } catch (e) {}
        }
        await docRef.set({ authorName: localName, updatedAt: Date.now() });
        return { authorName: localName };
      }
    } catch (err) {
      console.warn("Error loading profile settings from Firestore:", err);
    }
  }

  if (fs.existsSync(SETTINGS_FILE_PATH)) {
    try {
      const raw = fs.readFileSync(SETTINGS_FILE_PATH, "utf-8");
      return JSON.parse(raw);
    } catch (e) {
      console.error("Error parsing profile_settings.json:", e);
    }
  } else {
    try {
      safeWriteFileSync(SETTINGS_FILE_PATH, JSON.stringify(defaultSettings, null, 2));
    } catch (e) {
      console.error("Error writing default profile_settings.json:", e);
    }
  }
  
  return defaultSettings;
}

async function syncProfilePictureFromFirestore() {
  if (!db) return;
  try {
    const docRef = db.collection("settings").doc("profile");
    const docSnap = await docRef.get();
    if (docSnap.exists) {
      const data = docSnap.data();
      if (data && data.profilePictureBase64) {
        const picPath = path.join(process.cwd(), "public", "profile_picture.jpg");
        const base64Data = data.profilePictureBase64.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, "base64");
        safeWriteFileSync(picPath, buffer);
        console.log("Successfully restored custom profile picture from Firestore to local public/profile_picture.jpg");
      }
    }
  } catch (err) {
    console.warn("Failed to sync profile picture from Firestore:", err);
  }
}

async function syncEbookFromFirestore() {
  if (!db) return;
  try {
    const docRef = db.collection("settings").doc("ebook");
    const docSnap = await docRef.get();
    if (docSnap.exists) {
      const data = docSnap.data();
      if (data && data.ebookBase64) {
        const ebookPath = path.join(process.cwd(), "public", "ebook.pdf");
        const base64Data = data.ebookBase64.replace(/^data:application\/pdf;base64,/, "");
        const buffer = Buffer.from(base64Data, "base64");
        safeWriteFileSync(ebookPath, buffer);
        console.log("Successfully restored custom ebook PDF from Firestore to local public/ebook.pdf");
      }
    }
  } catch (err) {
    console.warn("Failed to sync ebook PDF from Firestore:", err);
  }
}

try {
  const configPath = path.resolve(process.cwd(), "firebase-applet-config.json");
  const parsed: any = fs.existsSync(configPath)
    ? JSON.parse(fs.readFileSync(configPath, "utf-8"))
    : null;
  const databaseId = process.env.FIRESTORE_DATABASE_ID || parsed?.firestoreDatabaseId || "(default)";
  // Accept the service account as raw JSON, or as base64 (avoids multi-line paste
  // issues in some dashboards). Base64 takes precedence when both are set.
  const serviceAccountRaw = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64
    ? Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, "base64").toString("utf-8")
    : process.env.FIREBASE_SERVICE_ACCOUNT;

  if (serviceAccountRaw) {
    // Preferred: Firebase Admin SDK. It bypasses Firestore security rules, so the
    // rules can (and should) deny all direct client access — the only way in is
    // through this trusted server. Required for a secure production deployment.
    const serviceAccount = JSON.parse(serviceAccountRaw);
    const adminApp = getAdminApps().length
      ? getAdminApps()[0]
      : initAdminApp({
          credential: cert(serviceAccount),
          projectId: serviceAccount.project_id || parsed?.projectId,
        });
    db = getAdminFirestore(adminApp, databaseId);
    console.log("Firebase Admin SDK initialized. Project:", serviceAccount.project_id, "DB:", databaseId);
  } else if (parsed) {
    // Fallback: client SDK wrapper. Works with only the public config file, but is
    // subject to Firestore security rules — those rules must stay permissive, which
    // exposes lead data. Set FIREBASE_SERVICE_ACCOUNT to switch to the secure path.
    const firebaseClientApp = initFirebaseClient({
      apiKey: parsed.apiKey,
      authDomain: parsed.authDomain,
      projectId: parsed.projectId,
      storageBucket: parsed.storageBucket,
      messagingSenderId: parsed.messagingSenderId,
      appId: parsed.appId
    });
    const clientFirestoreDb = getClientFirestore(firebaseClientApp, databaseId);
    db = new ClientFirestoreWrapper(clientFirestoreDb);
    console.warn("Firebase running via CLIENT SDK fallback (no FIREBASE_SERVICE_ACCOUNT). Firestore rules must remain permissive. Set FIREBASE_SERVICE_ACCOUNT for secure production use.");
  } else {
    console.warn("No Firebase configuration found. Running in memory-only fallback mode (leads will NOT persist).");
  }

  // Restoring assets to disk only makes sense on a writable, persistent filesystem.
  if (db && CAN_WRITE_DISK) {
    syncProfilePictureFromFirestore().catch(err => console.warn("Failed to sync profile picture on startup:", err));
    syncEbookFromFirestore().catch(err => console.warn("Failed to sync ebook PDF on startup:", err));
  }
} catch (err) {
  console.error("Critical error initializing Firebase on server:", err);
}

// Memory fallback database backed by local leads_backup.json for robust testing and persistency
const LEADS_FILE_PATH = path.join(process.cwd(), "leads_backup.json");
let memoryLeads: any[] = [];

try {
  if (fs.existsSync(LEADS_FILE_PATH)) {
    const rawData = fs.readFileSync(LEADS_FILE_PATH, "utf-8");
    memoryLeads = JSON.parse(rawData);
    console.log(`Loaded ${memoryLeads.length} leads from local disk backup.`);
  } else {
    memoryLeads = [
      {
        id: "sample-1",
        name: "Jane Doe",
        email: "jane.doe@example.com",
        phone: "+1 (555) 019-2834",
        createdAt: Date.now() - 3600000 * 2,
        emailSent: true
      },
      {
        id: "sample-2",
        name: "John Smith",
        email: "john.smith@example.com",
        phone: "+1 (555) 014-9988",
        createdAt: Date.now() - 3600000 * 24,
        emailSent: false,
        emailSentError: "RESEND_API_KEY environment variable is not configured."
      }
    ];
    fs.writeFileSync(LEADS_FILE_PATH, JSON.stringify(memoryLeads, null, 2));
    console.log("Initialized default mock leads and saved to local disk backup.");
  }
} catch (err) {
  console.error("Failed to load/initialize memory leads from disk backup:", err);
}

// Helper to handle admin authentication
function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, error: "Unauthorized access. No token provided." });
  }
  const token = authHeader.split(" ")[1];
  if (!verifyAdminToken(token)) {
    return res.status(401).json({ success: false, error: "Session expired or invalid. Please log in again." });
  }
  next();
}

/* ==========================================
   API ROUTES
   ========================================== */

// 1. PUBLIC Lead Capture Endpoint
app.post("/api/leads", async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    // Simple robust server-side validation
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return res.status(400).json({ success: false, error: "Please enter a valid name (at least 2 characters)." });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ success: false, error: "Please enter a valid email address." });
    }
    // Basic phone validation (at least 7 digits)
    const phoneClean = (phone || "").replace(/\D/g, "");
    if (!phone || phoneClean.length < 7) {
      return res.status(400).json({ success: false, error: "Please enter a valid phone number." });
    }

    // Load dynamic profile settings
    const profileSettings = await getProfileSettings();
    const currentAuthorName = profileSettings.authorName;
    const authorFirstName = currentAuthorName.split(" ")[0];

    let emailSentError: string | undefined = undefined;

    // Determine Ebook delivery link dynamically using request info to ensure correctness
    const protocol = req.headers["x-forwarded-proto"] || req.protocol;
    const host = req.get("host");
    const dynamicBaseUrl = `${protocol}://${host}`;

    // Fallback to dynamic base URL if APP_URL is missing or placeholder
    const finalBaseUrl = (process.env.APP_URL && process.env.APP_URL !== "MY_APP_URL")
      ? process.env.APP_URL
      : dynamicBaseUrl;

    // Point at the dynamic asset route so the emailed link always serves the latest ebook.
    const ebookDownloadUrl = `${finalBaseUrl}/api/asset/ebook`;

    // Set up Nodemailer transporter for Gmail SMTP
    let emailSentStatus = false;
    const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
    const smtpPort = parseInt(process.env.SMTP_PORT || "465", 10);
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (smtpUser && smtpPass) {
      try {
        // Load email assets as buffers (Firestore-first, bundled fallback) so this
        // works on read-only serverless filesystems.
        const [ebookBuffer, profilePictureBuffer] = await Promise.all([
          getEbookBuffer(),
          getProfilePictureBuffer(),
        ]);
        const bookCoverBuffer = getBookCoverBuffer();

        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpPort === 465, // true for 465, false for 587 or other ports
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });

        // HTML Email Template for Gmail SMTP with "Becoming." brand identity
        const emailHtml = `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Free Ebook Is Here 🎉</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <!-- Card Container -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);">
          
          <!-- Brand Header Banner -->
          <tr>
            <td style="background-color: #2c3e3a; padding: 32px; text-align: center;">
              <table border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  <!-- Footsteps representation -->
                  <td style="vertical-align: middle; padding-right: 10px;">
                    <span style="font-size: 28px; line-height: 1;">👣</span>
                  </td>
                  <td style="vertical-align: middle;">
                    <span style="font-family: 'Georgia', serif; font-style: italic; font-weight: 800; font-size: 26px; color: #ffffff; letter-spacing: -0.5px; text-decoration: none;">Becoming.</span>
                  </td>
                </tr>
              </table>
              <div style="margin-top: 8px; font-size: 11px; color: rgba(255,255,255,0.7); text-transform: uppercase; letter-spacing: 2px; font-weight: 600;">The Path to Clarity & Purpose</div>
            </td>
          </tr>

          <!-- Main Content Body -->
          <tr>
            <td style="padding: 40px 32px; color: #1e293b;">
              <!-- Author Profile Card -->
              <table border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 24px; text-align: left;">
                <tr>
                  <td style="vertical-align: middle; width: 52px; padding-right: 12px;">
                    <img src="cid:author_profile" alt="${currentAuthorName}" width="52" height="52" style="border-radius: 50%; display: block; object-fit: cover; border: 2px solid #e2e8f0;" />
                  </td>
                  <td style="vertical-align: middle;">
                    <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #64748b; font-weight: 700; margin-bottom: 2px;">AUTHOR &amp; GUIDE</div>
                    <table border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="vertical-align: middle; padding-right: 5px;">
                          <img src="https://img.icons8.com/color/48/verified-badge.png" alt="Verified" width="17" height="17" style="display: block; vertical-align: middle;" />
                        </td>
                        <td style="vertical-align: middle;">
                          <span style="font-size: 16px; font-weight: 700; color: #2c3e3a; font-family: 'Georgia', serif; line-height: 1;">${currentAuthorName}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <h2 style="font-family: 'Georgia', serif; font-size: 24px; font-weight: 700; color: #2c3e3a; margin-top: 0; margin-bottom: 16px; line-height: 1.3;">Hello, ${name.trim()}!</h2>

              <p style="font-size: 16px; line-height: 1.6; color: #334155; margin-bottom: 24px;">
                Thank you for taking this crucial first step on your journey. Please find your free guidebook below. You can tap on the book cover or click the download button below to access your copy instantly:
              </p>

              <!-- Ebook Showcase Box with cover and download button -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; margin-bottom: 32px; overflow: hidden;">
                <tr>
                  <td style="padding: 32px; text-align: center;">
                    <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #2563eb; margin-bottom: 20px;">EXCLUSIVE PLAYBOOK DELIVERY</div>
                    
                    <!-- Clickable Ebook Cover Image -->
                    <table border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto 24px auto;">
                      <tr>
                        <td align="center">
                          <a href="${ebookDownloadUrl}" target="_blank" style="text-decoration: none; display: inline-block;">
                            <img src="cid:book_cover" alt="The First Step to Becoming Book Cover" width="220" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 12px 28px rgba(0,0,0,0.15); border: 1px solid #e2e8f0; display: block;" />
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="font-size: 15px; color: #475569; margin-top: 0; margin-bottom: 24px; font-style: italic; max-width: 440px; margin-left: auto; margin-right: auto; line-height: 1.5; font-family: 'Georgia', serif;">
                      "The First Step to Becoming: Why You Feel Lost (And Where to Begin)"
                    </p>

                    <!-- CTA Download Button -->
                    <table border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                      <tr>
                        <td align="center" style="background-color: #2c3e3a; border-radius: 8px; box-shadow: 0 4px 12px rgba(44, 62, 58, 0.25);">
                          <a href="${ebookDownloadUrl}" target="_blank" style="display: inline-block; padding: 16px 36px; background-color: #2c3e3a; color: #ffffff; font-weight: 700; font-size: 15px; border-radius: 8px; text-decoration: none; border: 1px solid #2c3e3a; font-family: -apple-system, BlinkMacSystemFont, sans-serif;">
                            📥 Download E-Book For Free
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-bottom: 28px;" />

              <!-- Highlights Section -->
              <h3 style="font-family: 'Georgia', serif; font-size: 18px; font-weight: 700; color: #2c3e3a; margin-top: 0; margin-bottom: 16px;">What you will master in this guide:</h3>
              <ul style="padding-left: 20px; margin: 0; font-size: 15px; line-height: 1.7; color: #334155;">
                <li style="margin-bottom: 10px;"><strong>The Reframing Key:</strong> Realize why feeling lost is not a dead end, but a natural redirection signal.</li>
                <li style="margin-bottom: 10px;"><strong>The First Footstep:</strong> Practical, micro-decisions you can execute in less than 5 minutes to restore immediate momentum.</li>
                <li style="margin-bottom: 10px;"><strong>Clarity Alignment:</strong> A step-by-step diagnostic to help you filter out distractions and focus strictly on your highest-leverage goals.</li>
              </ul>

              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-top: 28px; margin-bottom: 28px;" />

              <!-- Closing -->
              <p style="font-size: 15px; line-height: 1.6; color: #334155; margin-bottom: 8px;">
                We designed this playbook specifically to guide <strong>${COPY_CONFIG.targetAudience}</strong> out of analytical paralysis and into active progression.
              </p>
              <p style="font-size: 15px; line-height: 1.6; color: #334155; margin-bottom: 24px;">
                If you have any questions or breakthroughs as you read through, simply reply directly to this email! ${authorFirstName} and the team monitor this inbox daily and love connecting with readers on their journey.
              </p>

              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <p style="font-size: 14px; font-weight: 700; color: #2c3e3a; margin: 0;">To your continued growth,</p>
                    <p style="font-size: 14px; color: #64748b; margin: 4px 0 0 0;">${currentAuthorName} &amp; The Becoming Team</p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer Legal & Opt Out -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #f1f5f9; padding: 24px 32px; text-align: center; color: #94a3b8; font-size: 12px; line-height: 1.5;">
              <p style="margin: 0 0 8px 0;">You received this email because you downloaded "The First Step to Becoming" guidebook.</p>
              <p style="margin: 0;">© 2026 BECOMING. All rights reserved. 123 Progress Lane, Clarity Suite, CA.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
        `;

        await transporter.sendMail({
          from: `"Becoming" <${smtpUser}>`,
          to: email.trim(),
          subject: `Your Free Ebook Is Here 🎉 - ${COPY_CONFIG.ebookTitle}`,
          html: emailHtml,
          attachments: [
            ...(bookCoverBuffer ? [{ filename: "book_cover.jpg", content: bookCoverBuffer, cid: "book_cover" }] : []),
            ...(profilePictureBuffer ? [{ filename: "profile_picture.jpg", content: profilePictureBuffer, cid: "author_profile" }] : []),
            ...(ebookBuffer ? [{ filename: "The-First-Step-to-Becoming.pdf", content: ebookBuffer, contentType: "application/pdf" }] : []),
          ]
        });

        emailSentStatus = true;
        console.log(`Successfully sent SMTP delivery email to ${email} via Gmail.`);
      } catch (emailErr: any) {
        emailSentError = emailErr.message || String(emailErr);
        console.error(`Gmail SMTP error sending to ${email}:`, emailErr);
      }
    } else {
      emailSentError = "Gmail SMTP environment variables (SMTP_USER and SMTP_PASS) are not configured. Check your Secrets settings.";
      console.warn(`Gmail SMTP email NOT triggered: ${emailSentError}`);
    }

    const leadData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      createdAt: Date.now(),
      emailSent: emailSentStatus,
      ...(emailSentError ? { emailSentError } : {})
    };

    // Save to Firestore Database or Memory fallback
    if (db) {
      try {
        const querySnapshot = await db.collection("leads").where("email", "==", leadData.email).get();

        if (!querySnapshot.empty) {
          // Update existing lead (prevent duplicates)
          const docId = querySnapshot.docs[0].id;
          const docRef = querySnapshot.docs[0].ref;
          await docRef.update(leadData);
          console.log(`Updated existing lead in Firestore. ID: ${docId}, Email: ${leadData.email}`);
        } else {
          // Add brand new lead
          const newDoc = await db.collection("leads").add(leadData);
          console.log(`Saved new lead in Firestore. ID: ${newDoc.id}, Email: ${leadData.email}`);
        }
      } catch (dbErr) {
        logDbError("Failed to save lead in Firestore, falling back to local memory", dbErr);
        upsertMemoryLead(leadData);
      }
    } else {
      // Memory fallback if Firebase not initialized
      upsertMemoryLead(leadData);
    }

    return res.json({ 
      success: true, 
      emailSent: emailSentStatus,
      message: "Lead captured successfully!"
    });

  } catch (err: any) {
    console.error("Server error handling lead:", err);
    return res.status(500).json({ success: false, error: "An unexpected error occurred. Please try again." });
  }
});

// New Endpoint: Get real-time books downloaded today count
app.get("/api/leads/today-count", async (req, res) => {
  try {
    let liveCount = 0;
    // 24 hours ago
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    
    if (db) {
      try {
        const querySnapshot = await db.collection("leads")
          .where("createdAt", ">=", oneDayAgo)
          .get();
        liveCount = querySnapshot.size;
      } catch (dbErr) {
        logDbError("Failed to query live counts from Firestore", dbErr);
        // Fallback to memory count
        liveCount = memoryLeads.filter((l: any) => l.createdAt >= oneDayAgo).length;
      }
    } else {
      liveCount = memoryLeads.filter((l: any) => l.createdAt >= oneDayAgo).length;
    }

    // Dynamic, realistic calculations:
    // We compute a base count that rises from morning to night based on local server hour
    const currentHour = new Date().getHours();
    const baseCurve = Math.floor(40 + (currentHour * 4.5) + Math.sin(currentHour / 3) * 10);
    const dateSeed = new Date().getDate();
    const fluctuation = (dateSeed * 7) % 15; // deterministic per-day shift
    
    const count = baseCurve + fluctuation + liveCount;

    return res.json({
      success: true,
      count,
      isLive: !!db,
      liveLeadsToday: liveCount
    });
  } catch (err) {
    console.error("Error in lead count endpoint:", err);
    // Safe hardcoded realistic count fallback
    const fallbackCount = 84 + Math.floor(Math.random() * 15);
    return res.json({ success: true, count: fallbackCount, isLive: false, liveLeadsToday: 0 });
  }
});

// Helper for memory leads upsert and persistence
function upsertMemoryLead(leadData: any) {
  const existingIdx = memoryLeads.findIndex(l => l.email === leadData.email);
  if (existingIdx > -1) {
    memoryLeads[existingIdx] = { ...memoryLeads[existingIdx], ...leadData };
  } else {
    memoryLeads.push({ id: `mem-${Date.now()}`, ...leadData });
  }
  try {
    fs.writeFileSync(LEADS_FILE_PATH, JSON.stringify(memoryLeads, null, 2));
    console.log("Successfully saved updated lead backup to disk.");
  } catch (err) {
    console.error("Failed to write memory leads backup to disk:", err);
  }
}

// 2. ADMIN Login Endpoint
app.post("/api/admin/login", (req, res) => {
  try {
    const { password } = req.body;
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

    if (password === adminPassword) {
      const token = signAdminToken();
      return res.json({ success: true, token });
    } else {
      return res.status(401).json({ success: false, error: "Incorrect password. Please try again." });
    }
  } catch (err) {
    console.error("Admin login error:", err);
    return res.status(500).json({ success: false, error: "Authentication failed due to an internal error." });
  }
});

// 3. ADMIN Logout Endpoint
app.post("/api/admin/logout", (_req, res) => {
  // Tokens are stateless and short-lived; the client simply discards it on logout.
  return res.json({ success: true });
});

// 4. ADMIN Fetch Leads Endpoint (Authorized)
app.get("/api/admin/leads", requireAdmin, async (req, res) => {
  try {
    const leadsMap = new Map<string, any>();
    
    // First, populate with memory leads (loaded from disk fallback)
    for (const mLead of memoryLeads) {
      if (mLead && mLead.email) {
        leadsMap.set(mLead.email.toLowerCase().trim(), mLead);
      }
    }
    
    if (db) {
      try {
        // Try getting Firestore leads
        const querySnapshot = await db.collection("leads").get();
        
        querySnapshot.forEach((doc: any) => {
          const data = doc.data();
          if (data && data.email) {
            const email = data.email.toLowerCase().trim();
            const firestoreLead = { id: doc.id, ...data };
            
            if (leadsMap.has(email)) {
              const existingLead = leadsMap.get(email);
              // Merge, taking the most recent or the one that is verified sent
              if (firestoreLead.createdAt > existingLead.createdAt || (!existingLead.emailSent && firestoreLead.emailSent)) {
                leadsMap.set(email, firestoreLead);
              }
            } else {
              leadsMap.set(email, firestoreLead);
            }
          }
        });
      } catch (dbErr) {
        logDbError("Firestore leads fetch failed, serving memory leads only", dbErr);
      }
    }
    
    const combinedLeads = Array.from(leadsMap.values()).sort((a, b) => b.createdAt - a.createdAt);
    return res.json({ success: true, data: combinedLeads });
  } catch (err) {
    console.error("Admin leads fetch error:", err);
    return res.status(500).json({ success: false, error: "Could not retrieve leads from the database." });
  }
});

// 5. ADMIN Fetch Profile Settings Endpoint (Authorized)
app.get("/api/admin/profile", requireAdmin, async (req, res) => {
  try {
    const settings = await getProfileSettings();
    const picExists = fs.existsSync(path.join(process.cwd(), "public", "profile_picture.jpg"));
    return res.json({ 
      success: true, 
      authorName: settings.authorName,
      hasCustomPicture: picExists
    });
  } catch (err: any) {
    console.error("Error fetching profile settings:", err);
    return res.status(500).json({ success: false, error: err.message || String(err) });
  }
});

// 6. ADMIN Update Profile Settings Endpoint (Authorized)
app.post("/api/admin/profile", requireAdmin, async (req, res) => {
  try {
    const { authorName, profilePictureBase64 } = req.body;
    if (!authorName || typeof authorName !== "string" || authorName.trim().length < 2) {
      return res.status(400).json({ success: false, error: "Please enter a valid author name (at least 2 characters)." });
    }

    // 1. Save local config file
    fs.writeFileSync(SETTINGS_FILE_PATH, JSON.stringify({ authorName: authorName.trim() }, null, 2));

    // 2. Save profile picture to disk if base64 is provided
    if (profilePictureBase64) {
      const base64Data = profilePictureBase64.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");
      const picPath = path.join(process.cwd(), "public", "profile_picture.jpg");
      safeWriteFileSync(picPath, buffer);
      console.log("Updated local profile_picture.jpg");
    }

    // 3. Save to Firestore if database is initialized
    if (db) {
      try {
        const docRef = db.collection("settings").doc("profile");
        const updateData: any = {
          authorName: authorName.trim(),
          updatedAt: Date.now()
        };
        if (profilePictureBase64) {
          updateData.profilePictureBase64 = profilePictureBase64;
        }
        await docRef.set(updateData, { merge: true });
        console.log("Saved profile settings and image to Firestore settings/profile");
      } catch (dbErr) {
        logDbError("Failed to save profile settings to Firestore", dbErr);
      }
    }

    return res.json({ success: true, message: "Profile updated successfully!" });
  } catch (err: any) {
    console.error("Error updating profile settings:", err);
    return res.status(500).json({ success: false, error: err.message || String(err) });
  }
});

// 7. ADMIN Upload Ebook PDF Endpoint (Authorized)
app.post("/api/admin/ebook", requireAdmin, async (req, res) => {
  try {
    const { ebookBase64 } = req.body;
    if (!ebookBase64) {
      return res.status(400).json({ success: false, error: "No Ebook PDF file provided." });
    }

    // 1. Save local PDF file to disk
    const base64Data = ebookBase64.replace(/^data:application\/pdf;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");
    const ebookPath = path.join(process.cwd(), "public", "ebook.pdf");
    fs.writeFileSync(ebookPath, buffer);
    console.log("Updated local public/ebook.pdf via admin upload");

    // 2. Save to Firestore if database is initialized
    if (db) {
      try {
        const docRef = db.collection("settings").doc("ebook");
        await docRef.set({
          ebookBase64,
          updatedAt: Date.now()
        }, { merge: true });
        console.log("Saved ebook base64 backup to Firestore settings/ebook");
      } catch (dbErr) {
        logDbError("Failed to save ebook backup to Firestore", dbErr);
      }
    }

    return res.json({ success: true, message: "Ebook PDF file uploaded and updated successfully!" });
  } catch (err: any) {
    console.error("Error uploading Ebook settings:", err);
    return res.status(500).json({ success: false, error: err.message || String(err) });
  }
});

// 8. ADMIN Get Ebook Info Endpoint (Authorized)
app.get("/api/admin/ebook-info", requireAdmin, async (_req, res) => {
  try {
    let size: number | undefined;
    let mtime: number | undefined;

    if (db) {
      try {
        const snap = await db.collection("settings").doc("ebook").get();
        const data = snap.exists ? snap.data() : null;
        if (data?.ebookBase64) {
          const base64 = data.ebookBase64.replace(/^data:application\/pdf;base64,/, "");
          size = Buffer.from(base64, "base64").length;
          mtime = data.updatedAt;
        }
      } catch (dbErr) {
        logDbError("Failed to read ebook info from Firestore", dbErr);
      }
    }

    // Fall back to the bundled file shipped with the deployment.
    if (size === undefined) {
      const ebookPath = path.join(process.cwd(), "public", "ebook.pdf");
      if (fs.existsSync(ebookPath)) {
        const stats = fs.statSync(ebookPath);
        size = stats.size;
        mtime = stats.mtime.getTime();
      }
    }

    if (size === undefined) {
      return res.json({ success: true, exists: false });
    }
    return res.json({ success: true, exists: true, size, mtime });
  } catch (err: any) {
    console.error("Error getting ebook info:", err);
    return res.status(500).json({ success: false, error: err.message || String(err) });
  }
});

/* ==========================================
   DYNAMIC ASSET SERVING
   Firestore-first with a bundled fallback, so admin-uploaded assets are served
   without relying on a writable filesystem.
   ========================================== */

async function getEbookBuffer(): Promise<Buffer | null> {
  if (db) {
    try {
      const snap = await db.collection("settings").doc("ebook").get();
      const data = snap.exists ? snap.data() : null;
      if (data?.ebookBase64) {
        return Buffer.from(data.ebookBase64.replace(/^data:application\/pdf;base64,/, ""), "base64");
      }
    } catch (err) {
      logDbError("Failed to load ebook from Firestore", err);
    }
  }
  const bundled = path.join(process.cwd(), "public", "ebook.pdf");
  return fs.existsSync(bundled) ? fs.readFileSync(bundled) : null;
}

async function getProfilePictureBuffer(): Promise<Buffer | null> {
  if (db) {
    try {
      const snap = await db.collection("settings").doc("profile").get();
      const data = snap.exists ? snap.data() : null;
      if (data?.profilePictureBase64) {
        return Buffer.from(data.profilePictureBase64.replace(/^data:image\/\w+;base64,/, ""), "base64");
      }
    } catch (err) {
      logDbError("Failed to load profile picture from Firestore", err);
    }
  }
  const bundled = path.join(process.cwd(), "public", "profile_picture.jpg");
  return fs.existsSync(bundled) ? fs.readFileSync(bundled) : null;
}

function getBookCoverBuffer(): Buffer | null {
  const bundled = path.join(process.cwd(), "public", "book_cover.jpg");
  return fs.existsSync(bundled) ? fs.readFileSync(bundled) : null;
}

app.get("/api/asset/ebook", async (_req, res) => {
  const buffer = await getEbookBuffer();
  if (!buffer) return res.status(404).send("Ebook not found");
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", 'attachment; filename="The-First-Step-to-Becoming.pdf"');
  res.setHeader("Cache-Control", "public, max-age=300");
  return res.send(buffer);
});

app.get("/api/asset/profile", async (_req, res) => {
  const buffer = await getProfilePictureBuffer();
  if (!buffer) return res.status(404).send("Profile picture not found");
  res.setHeader("Content-Type", "image/jpeg");
  res.setHeader("Cache-Control", "public, max-age=300");
  return res.send(buffer);
});

// TEMP diagnostic endpoint — confirms the function loaded and reports DB state.
app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    dbInitialized: !!db,
    node: process.version,
    vercel: !!process.env.VERCEL,
  });
});

// TEMP error surface — return the real error instead of Vercel's generic 500 page,
// so request-time failures are visible while debugging the deployment.
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Express error:", err);
  res.status(500).json({ success: false, error: String(err?.stack || err?.message || err) });
});

// This module only defines the Express app and exports it. Serving the SPA and
// listening on a port is done by the dev entry point (dev.ts) for local/traditional
// hosting; on Vercel this app is mounted as the /api serverless function
// (see api/index.ts). Nothing here should call app.listen().
export default app;
