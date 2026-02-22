import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// This route is called when the layout detects a session has been revoked from Firestore.
// It clears the cookie and redirects to the login page with an error message.
export async function GET(request: Request) {
    const url = new URL(request.url);
    const loginUrl = new URL('/login', url.origin);

    // Clear the cookie
    const cookieStore = await cookies();
    cookieStore.delete('admin_session');

    // Add error param so the login page can show a message
    loginUrl.searchParams.set('error', 'session_revoked');

    return NextResponse.redirect(loginUrl);
}
