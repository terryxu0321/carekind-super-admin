import { type ApiClient, createApiClient } from '@carekind/shared';
import {
	type ReactElement,
	type ReactNode,
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
} from 'react';
import {
	type PlatformSession,
	clearStoredSession,
	readStoredSession,
	storeSession,
	toPlatformSession,
} from './session-storage';

// Why the last session ended, so the login page can explain it.
export type SessionEndReason = 'signed_out' | 'expired';

export class SignInRejectedError extends Error {
	constructor() {
		super(
			'This account cannot use the Super Admin console. Sign in with a CareKind platform account.',
		);
		this.name = 'SignInRejectedError';
	}
}

export interface SessionContextValue {
	session: PlatformSession | null;
	endReason: SessionEndReason | null;
	api: ApiClient;
	signIn: (email: string, password: string) => Promise<void>;
	signOut: () => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export interface SessionProviderProps {
	baseUrl: string;
	children: ReactNode;
	// Injectable for tests; defaults to the browser fetch.
	fetchImpl?: typeof fetch;
}

export function SessionProvider({
	baseUrl,
	children,
	fetchImpl,
}: SessionProviderProps): ReactElement {
	const [session, setSession] = useState<PlatformSession | null>(() => readStoredSession());
	const [endReason, setEndReason] = useState<SessionEndReason | null>(null);
	const accessToken = session?.accessToken ?? null;

	const endSession = useCallback((reason: SessionEndReason) => {
		clearStoredSession();
		setSession(null);
		setEndReason(reason);
	}, []);

	const api = useMemo(() => {
		const baseFetch = fetchImpl ?? globalThis.fetch.bind(globalThis);
		// Any 401 on a signed-in request means the token is no longer valid: return to login.
		const fetchWithSessionCheck = async (
			input: RequestInfo | URL,
			init?: RequestInit,
		): Promise<Response> => {
			const response = await baseFetch(input, init);
			if (response.status === 401 && accessToken !== null) {
				endSession('expired');
			}
			return response;
		};
		return createApiClient({
			baseUrl,
			getToken: () => accessToken,
			fetchImpl: fetchWithSessionCheck,
		});
	}, [accessToken, baseUrl, endSession, fetchImpl]);

	const signIn = useCallback(
		async (email: string, password: string): Promise<void> => {
			const response = await api.auth.login({ audience: 'platform', email, password });
			const nextSession = toPlatformSession(response, new Date());
			if (nextSession === null) {
				throw new SignInRejectedError();
			}
			storeSession(nextSession);
			setSession(nextSession);
			setEndReason(null);
		},
		[api],
	);

	const signOut = useCallback(() => endSession('signed_out'), [endSession]);

	const value = useMemo(
		() => ({ session, endReason, api, signIn, signOut }),
		[session, endReason, api, signIn, signOut],
	);
	return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
	const value = useContext(SessionContext);
	if (value === null) {
		throw new Error('useSession must be used inside SessionProvider');
	}
	return value;
}
