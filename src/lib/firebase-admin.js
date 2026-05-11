import admin from "firebase-admin";

const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
  universe_domain: "googleapis.com"
};

const getAdminApp = () => {
  if (!admin.apps.length) {
    if (process.env.FIREBASE_PROJECT_ID) {
      try {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
        });
      } catch (error) {
        console.error("Firebase Admin initialization error:", error);
      }
    } else {
      // Return a dummy or null during build if env vars are missing
      return null;
    }
  }
  return admin.apps[0];
};

export const adminAuth = {
  collection: (...args) => getAdminApp() ? admin.auth(...args) : null,
  // We can also just use a proxy or a simpler approach
};

// Safer approach for Next.js build:
export const getAdminDb = () => {
  getAdminApp();
  return admin.firestore();
};

export const getAdminAuth = () => {
  getAdminApp();
  return admin.auth();
};
