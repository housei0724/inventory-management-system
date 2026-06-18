import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

// Read service account key
const serviceAccount = JSON.parse(fs.readFileSync('C:/Users/user/.gemini/antigravity/brain/814f1abd-9bc0-461c-b419-ef18ed7a25c4/serviceAccountKey.json', 'utf8'));

initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();

async function addDefaultIssuer() {
    try {
        const issuersRef = db.collection('issuers');
        const existing = await issuersRef.where('name', '==', '林田').get();

        if (existing.empty) {
            await issuersRef.add({
                name: '林田'
            });
            console.log('Successfully added default issuer: 林田');
        } else {
            console.log('Issuer "林田" already exists.');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

addDefaultIssuer();
