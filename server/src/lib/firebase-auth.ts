import { createRemoteJWKSet, jwtVerify } from 'jose';
import { isDevelopment, getEnv } from './env';
import type { Auth } from 'firebase-admin/auth';

let adminAuth: Auth | null = null;

async function getAdminAuth(): Promise<Auth | null> {
	// In Cloudflare Workers, firebase-admin is not supported
	const isWorkers = typeof process === 'undefined' || !process?.versions?.node;
	if (isWorkers) return null;
	try {
		// Lazy import to avoid bundling in Workers
		const admin = await import('firebase-admin');
		if (admin.apps.length === 0) {
			admin.initializeApp();
		}
		return admin.auth();
	} catch {
		return null;
	}
}

export type FirebaseUser = {
	id: string;
	email: string | undefined;
};

const getJWKS = () => {
	if (isDevelopment()) {
		const firebaseAuthHost = getEnv('FIREBASE_AUTH_EMULATOR_HOST') ?? 'localhost:5503';
		const emulatorUrl = firebaseAuthHost.startsWith('http') 
			? firebaseAuthHost 
			: `http://${firebaseAuthHost}`;
		return createRemoteJWKSet(
			new URL(`${emulatorUrl}/www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com`)
		);
	} else {
		return createRemoteJWKSet(
			new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com')
		);
	}
};

export async function verifyFirebaseToken(token: string, projectId: string): Promise<FirebaseUser> {
	if (!projectId) throw new Error('FIREBASE_PROJECT_ID environment variable is not set');

	// Emulator shortcut: decode without verification (matches emulator behavior)
	if (isDevelopment() && getEnv('FIREBASE_AUTH_EMULATOR_HOST')) {
		const parts = token.split('.');
		if (parts.length !== 3) throw new Error('Invalid emulator token');
		const payload = JSON.parse(Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString());
		if (!payload.sub || payload.aud !== projectId) throw new Error('Invalid token payload');
		return { id: payload.sub as string, email: payload.email as string | undefined };
	}

	// Try firebase-admin in Node.js
	const auth = await getAdminAuth();
	if (auth) {
		const decoded = await auth.verifyIdToken(token);
		if (!decoded || decoded.aud !== projectId) throw new Error('Invalid token');
		return { id: decoded.uid, email: decoded.email };
	}

	// Fallback to JWKS verification (for Workers)
	const JWKS = getJWKS();
	const issuer = `https://securetoken.google.com/${projectId}`;
	const { payload } = await jwtVerify(token, JWKS, { issuer, audience: projectId });
	return { id: payload.sub as string, email: payload.email as string | undefined };
} 