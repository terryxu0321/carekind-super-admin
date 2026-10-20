// Test helpers. SYNTHETIC DATA ONLY — invented names, ids and addresses for development and tests
// (code-rules CORE-09 / P-3). No real organisations or people.
import type {
	AuditEntry,
	FacilitySummary,
	LoginResponse,
	Organisation,
	OrgAdminSummary,
	PlatformDefaults,
	PlatformMe,
	UsageResponse,
} from '@carekind/shared';
import { type RenderResult, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { expect } from 'vitest';
import { App } from '../src/App';
import { storeSession } from '../src/session/session-storage';

export const API_BASE_URL = 'http://api.test';
export const SYNTHETIC_ACCESS_TOKEN = 'synthetic-access-token';
export const SYNTHETIC_PASSPHRASE = 'synthetic pass phrase';

const FAR_FUTURE = '2099-01-01T00:00:00.000Z';
const CREATED_AT = '2026-10-01T09:30:00.000Z';

export const ORGANISATION_ID = '00000000-0000-4000-8000-000000000001';
const ADMIN_STAFF_ID = '00000000-0000-4000-8000-000000000011';
const FACILITY_ID = '00000000-0000-4000-8000-000000000021';
const PLATFORM_ADMIN_ID = '00000000-0000-4000-8000-000000000031';

const platformMe: PlatformMe = {
	audience: 'platform',
	id: PLATFORM_ADMIN_ID,
	name: 'Test Platform Admin',
	email: 'platform.admin@example.com',
};

export const platformLogin: LoginResponse = {
	accessToken: SYNTHETIC_ACCESS_TOKEN,
	expiresAt: FAR_FUTURE,
	me: platformMe,
};

export const defaults: PlatformDefaults = {
	enabledRecordTypes: ['progress_note', 'adl'],
	pcwRequiresRnReview: true,
	audioRetentionDaysMax: 7,
	aiProcessingEnabled: true,
	facilityLimit: 5,
};

export const organisation: Organisation = {
	id: ORGANISATION_ID,
	name: 'Synthetic Care Group',
	abn: '12345678901',
	contactName: 'Casey Example',
	contactEmail: 'casey@example.com',
	status: 'active',
	limits: defaults,
	createdAt: CREATED_AT,
	updatedAt: CREATED_AT,
};

export const orgAdmin: OrgAdminSummary = {
	staffId: ADMIN_STAFF_ID,
	givenName: 'Robin',
	familyName: 'Sample',
	email: 'robin@example.com',
	lifecycle: 'active',
};

export const facility: FacilitySummary = {
	id: FACILITY_ID,
	name: 'Synthetic Gardens',
	state: 'NSW',
	status: 'configuring',
};

export const usage: UsageResponse = [
	{
		organisationId: ORGANISATION_ID,
		organisationName: organisation.name,
		facilityCount: 1,
		appEnabledStaffCount: 4,
		staffLoggedInLast7Days: 2,
		segmentCount: { value: null, reason: 'nurse_app_not_live' },
		signedRecordCount: { value: null, reason: 'nurse_app_not_live' },
		facilities: [
			{
				facilityId: FACILITY_ID,
				facilityName: facility.name,
				appEnabledStaffCount: 4,
				staffLoggedInLast7Days: 2,
				segmentCount: { value: null, reason: 'nurse_app_not_live' },
				signedRecordCount: { value: null, reason: 'nurse_app_not_live' },
			},
		],
	},
];

export const auditEntry: AuditEntry = {
	id: '00000000-0000-4000-8000-000000000041',
	organisationId: ORGANISATION_ID,
	actorType: 'platform_admin',
	actorId: PLATFORM_ADMIN_ID,
	action: 'organisation.create',
	entity: 'organisation',
	entityId: ORGANISATION_ID,
	occurredAt: CREATED_AT,
	summary: 'Created organisation',
};

export interface MockReply {
	status: number;
	body?: unknown;
}

export interface RecordedCall {
	method: string;
	path: string;
	body: unknown;
	authorization: string | null;
}

// Keyed by "METHOD /api/v1/path"; anything else answers 404 in the API error shape.
export type MockRoutes = Record<string, (body: unknown) => MockReply>;

export interface FetchMock {
	fetchImpl: typeof fetch;
	calls: RecordedCall[];
}

export function createFetchMock(routes: MockRoutes): FetchMock {
	const calls: RecordedCall[] = [];
	const fetchImpl = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
		const url = new URL(String(input));
		const method = init?.method ?? 'GET';
		const body = typeof init?.body === 'string' ? (JSON.parse(init.body) as unknown) : null;
		const headers = new Headers(init?.headers);
		calls.push({
			method,
			path: url.pathname,
			body,
			authorization: headers.get('Authorization'),
		});
		const handler = routes[`${method} ${url.pathname}`];
		const reply = handler
			? handler(body)
			: { status: 404, body: { error: { code: 'not_found', message: 'Not found' } } };
		return new Response(reply.body === undefined ? null : JSON.stringify(reply.body), {
			status: reply.status,
			headers: { 'Content-Type': 'application/json' },
		});
	};
	return { fetchImpl, calls };
}

export function ok(body: unknown): MockReply {
	return { status: 200, body };
}

// A happy-path platform API with one organisation, used by most page tests.
export function platformRoutes(): MockRoutes {
	const organisationPath = `/api/v1/platform/organisations/${ORGANISATION_ID}`;
	return {
		'POST /api/v1/auth/login': () => ok(platformLogin),
		'GET /api/v1/platform/organisations': () => ok([organisation]),
		'POST /api/v1/platform/organisations': () => ok(organisation),
		[`GET ${organisationPath}`]: () => ok(organisation),
		[`PATCH ${organisationPath}`]: () => ok(organisation),
		[`PUT ${organisationPath}/limits`]: () => ok(organisation),
		[`POST ${organisationPath}/suspend`]: () => ok({ ...organisation, status: 'suspended' }),
		[`GET ${organisationPath}/facilities`]: () => ok([facility]),
		[`GET ${organisationPath}/admins`]: () => ok([orgAdmin]),
		[`POST ${organisationPath}/admin-invites`]: () =>
			ok({
				staffId: '00000000-0000-4000-8000-000000000012',
				inviteUrl: 'http://admin.test/accept-invite?token=synthetic',
				expiresAt: '2026-10-27T09:30:00.000Z',
			}),
		'GET /api/v1/platform/defaults': () => ok(defaults),
		'PUT /api/v1/platform/defaults': (body) => ok(body),
		'GET /api/v1/platform/usage': () => ok(usage),
		'GET /api/v1/platform/audit': () => ok([auditEntry]),
	};
}

export function signIn(): void {
	storeSession({ accessToken: SYNTHETIC_ACCESS_TOKEN, expiresAt: FAR_FUTURE, me: platformMe });
}

export function renderApp(path: string, fetchImpl: typeof fetch): RenderResult {
	return render(
		<MemoryRouter initialEntries={[path]}>
			<App apiBaseUrl={API_BASE_URL} fetchImpl={fetchImpl} />
		</MemoryRouter>,
	);
}

// DESIGN §7.3: one page = one form = one submit (dialogs are checked as their own layer).
export function expectAtMostOneForm(root: ParentNode): void {
	expect(root.querySelectorAll('form').length).toBeLessThanOrEqual(1);
	expect(root.querySelectorAll('button[type="submit"]').length).toBeLessThanOrEqual(1);
}
