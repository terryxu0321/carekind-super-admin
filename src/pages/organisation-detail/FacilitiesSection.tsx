import type { ApiClient, FacilitySummary } from '@carekind/shared';
import { type ReactElement, useCallback } from 'react';
import { useApiData } from '../../api/use-api-data';
import { AsyncContent } from '../../components/AsyncContent';
import { type Column, DataTable } from '../../components/DataTable';
import { EmptyState } from '../../components/EmptyState';
import { StatusTag } from '../../components/StatusTag';
import { FACILITY_STATUS } from '../../format';

const COLUMNS: ReadonlyArray<Column<FacilitySummary>> = [
	{ key: 'name', header: 'Facility', render: (facility) => facility.name },
	{ key: 'state', header: 'State', render: (facility) => facility.state },
	{
		key: 'status',
		header: 'Status',
		render: (facility) => <StatusTag {...FACILITY_STATUS[facility.status]} />,
	},
];

export interface FacilitiesSectionProps {
	organisationId: string;
}

// SA-01: read-only — the platform sees name, state and go-live status, nothing inside a facility.
export function FacilitiesSection({ organisationId }: FacilitiesSectionProps): ReactElement {
	const loadFacilities = useCallback(
		(api: ApiClient): Promise<FacilitySummary[]> =>
			api.platform.listOrganisationFacilities(organisationId),
		[organisationId],
	);
	const { state, reload } = useApiData(loadFacilities);
	return (
		<section className="section" aria-labelledby="facilities-title">
			<h2 className="section__title" id="facilities-title">
				Facilities
			</h2>
			<AsyncContent state={state} subject="facilities" onRetry={reload}>
				{(facilities) =>
					facilities.length === 0 ? (
						<EmptyState
							title="No facilities yet"
							body="The organisation admin adds facilities in the facility admin console."
						/>
					) : (
						<DataTable
							caption="Facilities"
							columns={COLUMNS}
							rows={facilities}
							getRowKey={(facility) => facility.id}
						/>
					)
				}
			</AsyncContent>
		</section>
	);
}
