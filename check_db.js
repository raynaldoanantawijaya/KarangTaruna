const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}
const db = admin.firestore();

async function check() {
    const snap = await db.collection('posts').get();
    let size = 0;
    snap.docs.forEach(doc => {
        const d = doc.data();
        if (d.image && d.image.length > 1000) {
            console.log('Post', doc.id, 'has huge image field:', d.image.length, 'bytes');
        }
        if (d.content && d.content.length > 1000) {
            console.log('Post', doc.id, 'has huge content field:', d.content.length, 'bytes');
        }
    });
    console.log('Done');
}
check();
