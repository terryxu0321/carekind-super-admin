import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { readStoredSession } from '../src/session/session-storage';
import {
	SYNTHETIC_ACCESS_TOKEN,
	SYNTHETIC_PASSPHRASE,
	createFetchMock,
	ok,
	platformLogin,
	platformRoutes,
	renderApp,
	signIn,
} from './helpers';

function fillLogin(email: string, passphrase: string): void {
	fireEvent.change(screen.getByLabelText('Email'), { target: { value: email } });
	fireEvent.change(screen.getByLabelText('Password'), { target: { value: passphrase } });
	fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
}

describe('login', () => {
	it('should_redirect_to_login_when_not_signed_in', async () => {
		const { fetchImpl, calls } = createFetchMock(platformRoutes());
		renderApp('/organisations', fetchImpl);
		expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeTruthy();
		expect(calls).toHaveLength(0);
	});

	it('should_show_field_errors_and_not_call_the_api_when_empty', async () => {
		const { fetchImpl, calls } = createFetchMock(platformRoutes());
		renderApp('/login', fetchImpl);
		fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
		expect(
			await screen.findByText('Enter your email address, like name@example.com.'),
		).toBeTruthy();
		expect(screen.getByText('Enter your password.')).toBeTruthy();
		expect(calls).toHaveLength(0);
	});

	it('should_sign_in_with_platform_audience_and_open_organisations', async () => {
		const { fetchImpl, calls } = createFetchMock(platformRoutes());
		renderApp('/login', fetchImpl);
		fillLogin('platform.admin@example.com', SYNTHETIC_PASSPHRASE);

		expect(await screen.findByRole('heading', { name: 'Organisations' })).toBeTruthy();
		expect(calls[0]).toMatchObject({
			method: 'POST',
			path: '/api/v1/auth/login',
			body: {
				audience: 'platform',
				email: 'platform.admin@example.com',
				password: SYNTHETIC_PASSPHRASE,
			},
		});
		expect(readStoredSession()?.accessToken).toBe(SYNTHETIC_ACCESS_TOKEN);
		const listCall = calls.find((call) => call.path === '/api/v1/platform/organisations');
		expect(listCall?.authorization).toBe(`Bearer ${SYNTHETIC_ACCESS_TOKEN}`);
	});

	it('should_explain_wrong_credentials_without_signing_in', async () => {
		const { fetchImpl } = createFetchMock({
			'POST /api/v1/auth/login': () => ({
				status: 401,
				body: { error: { code: 'unauthenticated', message: 'Invalid credentials' } },
			}),
		});
		renderApp('/login', fetchImpl);
		fillLogin('platform.admin@example.com', SYNTHETIC_PASSPHRASE);

		expect(
			await screen.findByText('Email or password is incorrect. Check them and try again.'),
		).toBeTruthy();
		expect(readStoredSession()).toBeNull();
	});

	it('should_reject_an_organisation_account', async () => {
		const { fetchImpl } = createFetchMock({
			'POST /api/v1/auth/login': () =>
				ok({
					...platformLogin,
					me: {
						audience: 'org',
						staffId: '00000000-0000-4000-8000-000000000051',
						organisationId: '00000000-0000-4000-8000-000000000001',
						organisationName: 'Synthetic Care Group',
						givenName: 'Robin',
						familyName: 'Sample',
						email: 'robin@example.com',
						isOrgAdmin: true,
						assignments: [],
					},
				}),
		});
		renderApp('/login', fetchImpl);
		fillLogin('robin@example.com', SYNTHETIC_PASSPHRASE);

		expect(await screen.findByText(/cannot use the Super Admin console/)).toBeTruthy();
		expect(readStoredSession()).toBeNull();
	});
});

describe('session handling', () => {
	it('should_return_to_login_and_clear_the_session_on_401', async () => {
		signIn();
		const { fetchImpl } = createFetchMock({
			'GET /api/v1/platform/organisations': () => ({
				status: 401,
				body: { error: { code: 'unauthenticated', message: 'Token expired' } },
			}),
		});
		renderApp('/organisations', fetchImpl);

		expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeTruthy();
		expect(screen.getByText('Your session has ended. Sign in again to continue.')).toBeTruthy();
		expect(readStoredSession()).toBeNull();
	});

	it('should_clear_the_session_on_sign_out', async () => {
		signIn();
		const { fetchImpl } = createFetchMock(platformRoutes());
		renderApp('/organisations', fetchImpl);
		fireEvent.click(await screen.findByRole('button', { name: 'Sign out' }));

		await waitFor(() => expect(screen.getByRole('heading', { name: 'Sign in' })).toBeTruthy());
		expect(readStoredSession()).toBeNull();
	});
});
