// The session lives in memory and in sessionStorage, so it survives a reload but ends with the tab.
// Stored data is parsed again on read: storage is a boundary like any API response (TY-3).
import { type PlatformMe, loginResponseSchema } from '@carekind/shared';

const STORAGE_KEY = 'carekind.superAdmin.session';

export interface PlatformSession {
	accessToken: string;
	expiresAt: string;
	me: PlatformMe;
}

// Only a platform-audience, unexpired login is a Super Admin session (SPEC-010 SA-03).
export function toPlatformSession(value: unknown, now: Date): PlatformSession | null {
	const parsed = loginResponseSchema.safeParse(value);
	if (!parsed.success || parsed.data.me.audience !== 'platform') {
		return null;
	}
	if (Date.parse(parsed.data.expiresAt) <= now.getTime()) {
		return null;
	}
	return {
		accessToken: parsed.data.accessToken,
		expiresAt: parsed.data.expiresAt,
		me: parsed.data.me,
	};
}

export function readStoredSession(now: Date = new Date()): PlatformSession | null {
	const raw = window.sessionStorage.getItem(STORAGE_KEY);
	if (raw === null) {
		return null;
	}
	try {
		return toPlatformSession(JSON.parse(raw), now);
	} catch (error) {
		// A corrupt entry cannot be trusted; drop it and start signed out.
		console.warn('Discarded an unreadable stored session', error);
		clearStoredSession();
		return null;
	}
}

export function storeSession(session: PlatformSession): void {
	window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearStoredSession(): void {
	window.sessionStorage.removeItem(STORAGE_KEY);
}
