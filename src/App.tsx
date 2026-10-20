import type { ReactElement } from 'react';
import { AppRoutes } from './AppRoutes';
import { ToastProvider } from './components/Toast';
import { SessionProvider } from './session/SessionContext';

export interface AppProps {
	apiBaseUrl: string;
	// Injectable for tests; defaults to the browser fetch.
	fetchImpl?: typeof fetch;
}

// Providers only; the router is supplied by main.tsx (browser) or by tests (memory).
export function App({ apiBaseUrl, fetchImpl }: AppProps): ReactElement {
	return (
		<SessionProvider baseUrl={apiBaseUrl} fetchImpl={fetchImpl}>
			<ToastProvider>
				<AppRoutes />
			</ToastProvider>
		</SessionProvider>
	);
}
