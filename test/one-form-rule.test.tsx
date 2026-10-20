import { fireEvent, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
	ORGANISATION_ID,
	createFetchMock,
	expectAtMostOneForm,
	platformRoutes,
	renderApp,
	signIn,
} from './helpers';

// DESIGN §7.3: every rendered page has at most one form and one submit button.
const PAGES: ReadonlyArray<{ path: string; readyText: string; isSignedIn: boolean }> = [
	{ path: '/login', readyText: 'Sign in', isSignedIn: false },
	{ path: '/organisations', readyText: 'Synthetic Care Group', isSignedIn: true },
	{ path: '/organisations/new', readyText: 'Contact email', isSignedIn: true },
	{ path: `/organisations/${ORGANISATION_ID}`, readyText: 'Synthetic Gardens', isSignedIn: true },
	{
		path: `/organisations/${ORGANISATION_ID}/limits`,
		readyText: 'Limits for Synthetic Care Group',
		isSignedIn: true,
	},
	{ path: '/defaults', readyText: 'Facility limit', isSignedIn: true },
	{ path: '/usage', readyText: 'By facility', isSignedIn: true },
	{ path: '/audit', readyText: 'Created organisation', isSignedIn: true },
];

describe('one page = one form = one submit', () => {
	it.each(PAGES)(
		'should_have_at_most_one_form_on_$path',
		async ({ path, readyText, isSignedIn }) => {
			if (isSignedIn) {
				signIn();
			}
			const { fetchImpl } = createFetchMock(platformRoutes());
			renderApp(path, fetchImpl);
			await screen.findAllByText(readyText);
			expectAtMostOneForm(document.body);
		},
	);

	it('should_keep_one_form_inside_the_invite_dialog', async () => {
		signIn();
		const { fetchImpl } = createFetchMock(platformRoutes());
		renderApp(`/organisations/${ORGANISATION_ID}`, fetchImpl);
		fireEvent.click(await screen.findByRole('button', { name: 'Invite org admin' }));
		const dialog = screen.getByRole('dialog');
		expect(within(dialog).getAllByRole('button', { name: 'Create invite link' })).toHaveLength(
			1,
		);
		expectAtMostOneForm(dialog);
	});
});
