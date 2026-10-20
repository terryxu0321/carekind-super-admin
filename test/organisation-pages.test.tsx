import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
	ORGANISATION_ID,
	createFetchMock,
	defaults,
	platformRoutes,
	renderApp,
	signIn,
} from './helpers';

const LIMITS_PATH = `/api/v1/platform/organisations/${ORGANISATION_ID}/limits`;

describe('organisation limits page', () => {
	it('should_reject_audio_retention_above_seven_days_without_saving', async () => {
		signIn();
		const { fetchImpl, calls } = createFetchMock(platformRoutes());
		renderApp(`/organisations/${ORGANISATION_ID}/limits`, fetchImpl);

		const retention = await screen.findByLabelText('Maximum audio retention (days)');
		fireEvent.change(retention, { target: { value: '8' } });
		fireEvent.click(screen.getByRole('button', { name: 'Save limits' }));

		expect(await screen.findByText('Enter a whole number of days from 0 to 7.')).toBeTruthy();
		expect(retention.getAttribute('aria-invalid')).toBe('true');
		expect(calls.some((call) => call.method === 'PUT')).toBe(false);
	});

	it('should_save_valid_limits_and_return_to_the_organisation', async () => {
		signIn();
		const { fetchImpl, calls } = createFetchMock(platformRoutes());
		renderApp(`/organisations/${ORGANISATION_ID}/limits`, fetchImpl);

		fireEvent.change(await screen.findByLabelText('Maximum audio retention (days)'), {
			target: { value: '3' },
		});
		fireEvent.click(screen.getByRole('button', { name: 'Save limits' }));

		expect(await screen.findByRole('heading', { name: 'Profile' })).toBeTruthy();
		const saveCall = calls.find((call) => call.method === 'PUT' && call.path === LIMITS_PATH);
		expect(saveCall?.body).toEqual({ ...defaults, audioRetentionDaysMax: 3 });
		expect(screen.getByText('Limits saved')).toBeTruthy();
	});
});

describe('create organisation page', () => {
	it('should_show_field_errors_from_the_shared_schema', async () => {
		signIn();
		const { fetchImpl, calls } = createFetchMock(platformRoutes());
		renderApp('/organisations/new', fetchImpl);

		fireEvent.change(await screen.findByLabelText('ABN'), { target: { value: '123' } });
		fireEvent.click(screen.getByRole('button', { name: 'Create organisation' }));

		expect(
			await screen.findByText('Enter the 11-digit ABN, for example 12 345 678 901.'),
		).toBeTruthy();
		expect(screen.getByText('Enter the organisation name.')).toBeTruthy();
		expect(calls.some((call) => call.method === 'POST')).toBe(false);
	});
});

describe('organisation detail page', () => {
	it('should_show_a_copyable_invite_link_and_never_send_email', async () => {
		signIn();
		const { fetchImpl, calls } = createFetchMock(platformRoutes());
		renderApp(`/organisations/${ORGANISATION_ID}`, fetchImpl);

		fireEvent.click(await screen.findByRole('button', { name: 'Invite org admin' }));
		const dialog = screen.getByRole('dialog');
		fireEvent.change(within(dialog).getByLabelText('Given name'), {
			target: { value: 'Alex' },
		});
		fireEvent.change(within(dialog).getByLabelText('Family name'), {
			target: { value: 'Example' },
		});
		fireEvent.change(within(dialog).getByLabelText('Email'), {
			target: { value: 'alex@example.com' },
		});
		fireEvent.click(within(dialog).getByRole('button', { name: 'Create invite link' }));

		const linkDialog = await screen.findByRole('dialog', { name: 'Invite link created' });
		expect(within(linkDialog).getByLabelText<HTMLInputElement>('Invite link').value).toBe(
			'http://admin.test/accept-invite?token=synthetic',
		);
		expect(within(linkDialog).getByRole('button', { name: 'Copy link' })).toBeTruthy();
		expect(within(linkDialog).getByText(/CareKind does not send this email/)).toBeTruthy();
		const inviteCall = calls.find((call) => call.path.endsWith('/admin-invites'));
		expect(inviteCall?.body).toEqual({
			givenName: 'Alex',
			familyName: 'Example',
			email: 'alex@example.com',
		});
	});

	it('should_suspend_only_after_confirming_in_a_dialog', async () => {
		signIn();
		const { fetchImpl, calls } = createFetchMock(platformRoutes());
		renderApp(`/organisations/${ORGANISATION_ID}`, fetchImpl);

		fireEvent.click(await screen.findByRole('button', { name: 'Suspend organisation' }));
		const dialog = screen.getByRole('dialog', { name: 'Suspend Synthetic Care Group?' });
		expect(calls.some((call) => call.path.endsWith('/suspend'))).toBe(false);

		fireEvent.click(within(dialog).getByRole('button', { name: 'Suspend organisation' }));

		await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
		expect(calls.some((call) => call.path.endsWith('/suspend'))).toBe(true);
		expect(screen.getByRole('button', { name: 'Reactivate organisation' })).toBeTruthy();
		expect(screen.getAllByText('Suspended').length).toBeGreaterThan(0);
	});
});

describe('usage page', () => {
	it('should_label_nurse_app_metrics_as_not_yet_available', async () => {
		signIn();
		const { fetchImpl } = createFetchMock(platformRoutes());
		renderApp('/usage', fetchImpl);

		const unavailable = await screen.findAllByText('Not yet available — nurse app not live');
		// Segments + signed records, for the organisation row and the facility row.
		expect(unavailable).toHaveLength(4);
	});
});

describe('error states', () => {
	it('should_show_an_error_banner_with_retry_when_loading_fails', async () => {
		signIn();
		const { fetchImpl } = createFetchMock({
			'GET /api/v1/platform/organisations': () => ({
				status: 500,
				body: { error: { code: 'internal_error', message: 'Server error' } },
			}),
		});
		renderApp('/organisations', fetchImpl);

		const banner = await screen.findByRole('alert');
		expect(banner.textContent).toContain('Could not load organisations.');
		expect(within(banner).getByRole('button', { name: 'Try again' })).toBeTruthy();
	});
});
