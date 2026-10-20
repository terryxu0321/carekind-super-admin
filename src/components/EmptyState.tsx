import type { ReactElement, ReactNode } from 'react';

export interface EmptyStateProps {
	title: string;
	body: string;
	action?: ReactNode;
}

// DESIGN empty-state: one title, one sentence on what to do next, at most one secondary action.
export function EmptyState({ title, body, action }: EmptyStateProps): ReactElement {
	return (
		<div className="empty-state">
			<p className="empty-state__title">{title}</p>
			<p className="empty-state__body">{body}</p>
			{action}
		</div>
	);
}
