import admin from "firebase-admin";

const serviceAccount = {
  type: "service_account",
  project_id: "petzone-714af",
  private_key_id: "93835925fd77e7c89c5f01245d7b784c12148e56",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDJfinJkx0VK3Sp\nzdwekdVhnkXni1VZrgFDK5e0EX1BvDCdFuVgT2l6XMfs6LanARyjJrIydNVfJXUN\nnQhrG6tie9OGxfm58fDk584Oq3b6A/fHgXkK9+7+estiKLEX9prO+4VlI+aw5jzB\nZi5IuLOoV301x54RRwgu51q2C6TvQYiwe/GOL6V7Ata3scZUPoR39E3UAtj+Bb7b\noF7Ict1bzHjDCChcj4knySXEts3nrbPqf61UYa65sXGJhWjtY13pnPw0mArim9RY\nkG9aOF+X0xFf2QWPHSTGe2Wno5t3UcMzOPn85K57FqzoXP5vkaDUlh4X7bntToYD\nDRmYgdBjAgMBAAECggEAFOD85YVYAySQnzPUtlo4OThUWAzpGDTerp4qxx700sX0\nZ6LCu/sem+5XTSZEHwQPepx85JuUrJpOCc4W3DpuxPK91X5YRTtb0exvPrfnyTp2\nB3dUGp3cZwREZPSAfVIxcnc/uF5C/lutOgEjlKeG/k+qitMXfwTURT/19103hw8d\nT/J/+mmYq9k3X/v3ZGpyjI5unZG7vQuGqbzZ4eCG1pTJ9LJmSOnFXzwEd2EVqWG7\nDDRHme2d4Of+uR2pGGrA/rlx8qKhuZE23Vkf/h/lWn7aCreJjxWjLVZ3ajBc/tL1\nZIdgm12j9jm+jQh7gvH4auBlZ6OIjxrWzG4O/4yTCQKBgQDkxvRVQ6J97kahEdYT\n3mTDJ1+A1YK+DpYMbNRg5QBGkuDcjtp7YJXZ/8oGTUqNCTFxAJMQbqYCqLq9X3a7\ntrA/FhNeKElqYUWHw1PIQFAOod+7nT7oSdfqld/tJ2KQoEOTXrgfkayuLa3DRLv1\nk5bU/KnZdoEnsGXEzMCzhwOnlQKBgQDheBGo2PyLu0Hph7m3zIWd6szZgm01Gvdh\nHEvpbeSiDVq4dU4r0p6ipAE+xxfsfFhu3vEueaXQsB/+82uEKKT38VbaGKZfNOPV\nva+nPhnLWRX1T1cxHQpVtac90eBXvBqUufktP6thE1RznlAA2fascpm9JXqWSP6y\nsEqJEN46FwKBgH1mfLlb6G6ktDxHvZOIfKzoIRZKcm7hKehHoyY1gDAvBGiBOUsV\nhy5GYiOQLEQgfORXD0WbkQ22FR4GfNup6PO7kwQyiwNvrCAdtgf3EKrkmfGJ4NiM\n2XhxjJu+0e06m6/k5IIRZJjY2v1E6M5UhwHaOPPFXEg4DaCRJzOA10T9AoGBAIlL\n+FT9bSwZp5VxlOIbpPH43S1GgwHnneSAuqk2xhb4UtoodKWy5+7aN/fmfOcBAUji\ncbN/WD2wQouZ50rfBTYGvICqqgUny+WIUMJiyopNgVWULuA1cummaGT4vMgwP295\noAax0saWYsLVEJq0H8X7Mys++1swsAhX2cuFfg2ZAoGAQ35ivDnzoNktipNbb/Kl\nnfAObiTfxszMz/z6svCGTENQP6PqRKV6dgtY5L+XwS20HYt0p+cfY2h2Ul4fPp4Q\nrm6WX8oe8bV+1Xy+U4E5wR6eM/DwiHdLrh6DRaqpnYeJ4v05jdanOFQ29N9labl7\n9IqF7kF86SZJvaxDDepsz5I=\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@petzone-714af.iam.gserviceaccount.com",
  "client_id": "110225266868231657450",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40petzone-714af.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://petzone-714af.firebaseio.com"
  });
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
