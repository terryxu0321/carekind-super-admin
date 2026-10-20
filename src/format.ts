// Display text for shared enum values and dates. Australian formats: DD/MM/YYYY, 24-hour time
// (DESIGN date-time-input).
import type {
	AuditActorType,
	FacilityStatus,
	OrganisationStatus,
	RecordType,
	StaffLifecycle,
	UnavailableMetric,
} from '@carekind/shared';
import type { StatusTone } from './components/StatusTag';

const dateFormat = new Intl.DateTimeFormat('en-AU', {
	day: '2-digit',
	month: '2-digit',
	year: 'numeric',
});

const dateTimeFormat = new Intl.DateTimeFormat('en-AU', {
	day: '2-digit',
	month: '2-digit',
	year: 'numeric',
	hour: '2-digit',
	minute: '2-digit',
	hourCycle: 'h23',
});

export function formatDate(isoDateTime: string): string {
	return dateFormat.format(new Date(isoDateTime));
}

export function formatDateTime(isoDateTime: string): string {
	return dateTimeFormat.format(new Date(isoDateTime));
}

// ABNs are stored as 11 digits and read as "12 345 678 901".
export function formatAbn(abn: string): string {
	return abn.replace(/^(\d{2})(\d{3})(\d{3})(\d{3})$/, '$1 $2 $3 $4');
}

export const RECORD_TYPE_LABELS: Readonly<Record<RecordType, string>> = {
	progress_note: 'Progress note',
	adl: 'ADL',
};

export const ACTOR_TYPE_LABELS: Readonly<Record<AuditActorType, string>> = {
	platform_admin: 'Platform admin',
	staff: 'Organisation staff',
};

// SA-04: metrics that need the nurse app are labelled, never invented (CORE-09).
const UNAVAILABLE_LABELS: Readonly<Record<UnavailableMetric['reason'], string>> = {
	nurse_app_not_live: 'Not yet available — nurse app not live',
};

export function formatUnavailable(metric: UnavailableMetric): string {
	return UNAVAILABLE_LABELS[metric.reason];
}

export function formatYesNo(value: boolean): string {
	return value ? 'Yes' : 'No';
}

export interface StatusDisplay {
	tone: StatusTone;
	label: string;
}

export const ORGANISATION_STATUS: Readonly<Record<OrganisationStatus, StatusDisplay>> = {
	active: { tone: 'confirmed', label: 'Active' },
	suspended: { tone: 'offline', label: 'Suspended' },
};

export const FACILITY_STATUS: Readonly<Record<FacilityStatus, StatusDisplay>> = {
	configuring: { tone: 'attention', label: 'Configuring' },
	live: { tone: 'confirmed', label: 'Live' },
	suspended: { tone: 'offline', label: 'Suspended' },
};

export const STAFF_LIFECYCLE: Readonly<Record<StaffLifecycle, StatusDisplay>> = {
	recorded: { tone: 'offline', label: 'Recorded' },
	invited: { tone: 'attention', label: 'Invited' },
	pending_training: { tone: 'attention', label: 'Pending training' },
	active: { tone: 'confirmed', label: 'Active' },
	deactivated: { tone: 'offline', label: 'Deactivated' },
};
