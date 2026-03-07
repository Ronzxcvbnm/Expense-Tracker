const admin = require("firebase-admin");

function buildCredentialFromEnv() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
    : "";

  if (!projectId || !clientEmail || !privateKey) {
    return null;
  }

  return admin.credential.cert({
    projectId,
    clientEmail,
    privateKey
  });
}

function initializeFirebase() {
  if (admin.apps.length > 0) {
    return admin;
  }

  const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;
  if (!storageBucket) {
    return null;
  }

  const credential = buildCredentialFromEnv();
  const options = { storageBucket };
  if (credential) {
    options.credential = credential;
  }

  admin.initializeApp(options);
  return admin;
}

function getStorageBucket() {
  const firebase = initializeFirebase();
  if (!firebase) {
    return null;
  }
  return firebase.storage().bucket();
}

module.exports = {
  getStorageBucket
};
