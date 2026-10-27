import { OAuth2Client } from "google-auth-library";
import { config } from "../config.js";
import { HttpError } from "./errors.js";

// ------------------------------------------------------------------
// Google hisobini tasdiqlash. Frontend ikki xil token yuborishi mumkin:
//   - credential:  Google Identity Services ID token (JWT)
//   - accessToken: useGoogleLogin() popup'idan olingan access token
//                  (o'z dizaynimizdagi tugma shu usulda ishlaydi)
// Ikkala holatda ham token AYNAN bizning Client ID uchun berilganini
// tekshiramiz — boshqa saytning tokeni bilan kirib bo'lmaydi.
// ------------------------------------------------------------------

const client = new OAuth2Client();

function ensureConfigured() {
  if (!config.googleClientId) {
    throw new HttpError(500, "internal", "Google orqali kirish serverda sozlanmagan.");
  }
}

const invalid = () => new HttpError(401, "auth/invalid-credential", "Google tokeni yaroqsiz.");

export async function verifyGoogle({ credential, accessToken }) {
  ensureConfigured();

  if (credential) {
    try {
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: config.googleClientId,
      });
      const p = ticket.getPayload();
      return { sub: p.sub, email: p.email, emailVerified: p.email_verified, name: p.name || "" };
    } catch {
      throw invalid();
    }
  }

  if (accessToken) {
    const infoRes = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?access_token=${encodeURIComponent(accessToken)}`
    );
    if (!infoRes.ok) throw invalid();
    const info = await infoRes.json();
    if (info.aud !== config.googleClientId && info.azp !== config.googleClientId) throw invalid();

    const userRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!userRes.ok) throw invalid();
    const p = await userRes.json();
    if (p.sub !== info.sub) throw invalid();
    return { sub: p.sub, email: p.email, emailVerified: p.email_verified, name: p.name || "" };
  }

  throw invalid();
}
