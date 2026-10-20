import type { ReactElement } from 'react';
import { LinkButton } from '../components/Button';
import { EmptyState } from '../components/EmptyState';

export function NotFoundPage(): ReactElement {
	return (
		<EmptyState
			title="Page not found"
			body="This address does not match a page in the Super Admin console."
			action={<LinkButton to="/organisations">Go to organisations</LinkButton>}
		/>
	);
}
