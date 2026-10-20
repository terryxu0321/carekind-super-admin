import type { ReactElement } from 'react';

// System or account states only — never a resident's clinical state (DESIGN status-tag, TGA).
export type StatusTone = 'confirmed' | 'offline' | 'attention';

const SYMBOLS: Readonly<Record<StatusTone, string>> = {
	confirmed: '✓',
	offline: '○',
	attention: '!',
};

export interface StatusTagProps {
	tone: StatusTone;
	label: string;
}

export function StatusTag({ tone, label }: StatusTagProps): ReactElement {
	return (
		<span className={`status-tag status-tag--${tone}`}>
			<span className="status-tag__symbol" aria-hidden="true">
				{SYMBOLS[tone]}
			</span>
			{label}
		</span>
	);
}
