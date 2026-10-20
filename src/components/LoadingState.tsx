import type { ReactElement } from 'react';

export interface LoadingStateProps {
	label: string;
}

// DESIGN progress (spinner variant): always paired with text saying what is happening.
export function LoadingState({ label }: LoadingStateProps): ReactElement {
	return (
		<div className="loading" role="status">
			<span className="loading__spinner" aria-hidden="true" />
			<span>{label}</span>
		</div>
	);
}
