import type { ReactElement, ReactNode } from 'react';
import type { LoadState } from '../api/use-api-data';
import { LoadingState } from './LoadingState';
import { SystemBanner } from './SystemBanner';

export interface AsyncContentProps<T> {
	state: LoadState<T>;
	// What is being loaded, e.g. "organisations" → "Loading organisations…".
	subject: string;
	onRetry: () => void;
	children: (data: T) => ReactNode;
}

// One place for the loading → error → ready states of every page section.
export function AsyncContent<T>({
	state,
	subject,
	onRetry,
	children,
}: AsyncContentProps<T>): ReactElement {
	if (state.status === 'loading') {
		return <LoadingState label={`Loading ${subject}…`} />;
	}
	if (state.status === 'error') {
		return (
			<SystemBanner tone="error" onRetry={onRetry}>
				Could not load {subject}. {state.message} Nothing was changed.
			</SystemBanner>
		);
	}
	return <>{children(state.data)}</>;
}
