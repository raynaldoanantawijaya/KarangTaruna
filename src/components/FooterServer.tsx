// Server Component: fetches appearance contact data and passes it to Footer
import { adminDb } from '@/lib/firebase-admin';
import { Footer } from '@/components/Footer';

async function getContactData() {
    try {
        const docRef = adminDb.collection('settings').doc('appearance');
        const doc = await docRef.get();
        if (doc.exists) return doc.data()?.contact || null;
        return null;
    } catch (error) {
        console.error('Error fetching contact data for footer:', error);
        return null;
    }
}

export default async function FooterServer() {
    const contact = await getContactData();
    return <Footer contact={contact} />;
}
