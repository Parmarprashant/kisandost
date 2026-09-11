import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Handlers for environment variables injecting string literal '\n'
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
    console.log('[FirebaseAdmin] Initialized successfully.');
  } catch (error) {
    console.error('[FirebaseAdmin] Initialization Error:', error);
  }
}

export { admin };
