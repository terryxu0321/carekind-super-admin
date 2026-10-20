import type { ApiClient, FacilityUsage, OrganisationUsage, UsageResponse } from '@carekind/shared';
import type { ReactElement } from 'react';
import { useApiData } from '../api/use-api-data';
import { AsyncContent } from '../components/AsyncContent';
import { type Column, DataTable } from '../components/DataTable';
import { EmptyState } from '../components/EmptyState';
import { PageHeader } from '../components/PageHeader';
import { formatUnavailable } from '../format';

const loadUsage = (api: ApiClient): Promise<UsageResponse> => api.platform.getUsage();

interface FacilityUsageRow extends FacilityUsage {
	organisationName: string;
}

const ORGANISATION_COLUMNS: ReadonlyArray<Column<OrganisationUsage>> = [
	{ key: 'name', header: 'Organisation', render: (row) => row.organisationName },
	{
		key: 'facilities',
		header: 'Facilities',
		isNumeric: true,
		render: (row) => row.facilityCount,
	},
	{
		key: 'appEnabled',
		header: 'Staff with app access',
		isNumeric: true,
		render: (row) => row.appEnabledStaffCount,
	},
	{
		key: 'signedIn',
		header: 'Staff signed in (last 7 days)',
		isNumeric: true,
		render: (row) => row.staffLoggedInLast7Days,
	},
	{ key: 'segments', header: 'Segments', render: (row) => formatUnavailable(row.segmentCount) },
	{
		key: 'signedRecords',
		header: 'Signed records',
		render: (row) => formatUnavailable(row.signedRecordCount),
	},
];

const FACILITY_COLUMNS: ReadonlyArray<Column<FacilityUsageRow>> = [
	{ key: 'name', header: 'Facility', render: (row) => row.facilityName },
	{ key: 'organisation', header: 'Organisation', render: (row) => row.organisationName },
	{
		key: 'appEnabled',
		header: 'Staff with app access',
		isNumeric: true,
		render: (row) => row.appEnabledStaffCount,
	},
	{
		key: 'signedIn',
		header: 'Staff signed in (last 7 days)',
		isNumeric: true,
		render: (row) => row.staffLoggedInLast7Days,
	},
	{ key: 'segments', header: 'Segments', render: (row) => formatUnavailable(row.segmentCount) },
	{
		key: 'signedRecords',
		header: 'Signed records',
		render: (row) => formatUnavailable(row.signedRecordCount),
	},
];

function facilityRows(usage: UsageResponse): FacilityUsageRow[] {
	return usage.flatMap((organisation) =>
		organisation.facilities.map((facility) => ({
			...facility,
			organisationName: organisation.organisationName,
		})),
	);
}

// SA-04: de-identified totals by organisation and facility only — no per-person figures or
// rankings (PRD S-07). Nurse-app metrics are labelled as not yet available, never invented.
export function UsagePage(): ReactElement {
	const { state, reload } = useApiData(loadUsage);
	return (
		<>
			<PageHeader
				title="Usage"
				description="Totals by organisation and facility. No figures about individual people."
			/>
			<AsyncContent state={state} subject="usage" onRetry={reload}>
				{(usage) =>
					usage.length === 0 ? (
						<EmptyState
							title="No usage yet"
							body="Usage appears here once organisations are created."
						/>
					) : (
						<>
							<section className="section" aria-labelledby="usage-organisations">
								<h2 className="section__title" id="usage-organisations">
									By organisation
								</h2>
								<DataTable
									caption="Usage by organisation"
									columns={ORGANISATION_COLUMNS}
									rows={usage}
									getRowKey={(row) => row.organisationId}
								/>
							</section>
							<section className="section" aria-labelledby="usage-facilities">
								<h2 className="section__title" id="usage-facilities">
									By facility
								</h2>
								<DataTable
									caption="Usage by facility"
									columns={FACILITY_COLUMNS}
									rows={facilityRows(usage)}
									getRowKey={(row) => row.facilityId}
								/>
							</section>
						</>
					)
				}
			</AsyncContent>
		</>
	);
}
