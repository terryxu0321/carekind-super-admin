import type { ApiClient, Organisation } from '@carekind/shared';
import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { useApiData } from '../api/use-api-data';
import { AsyncContent } from '../components/AsyncContent';
import { LinkButton } from '../components/Button';
import { type Column, DataTable } from '../components/DataTable';
import { EmptyState } from '../components/EmptyState';
import { PageHeader } from '../components/PageHeader';
import { StatusTag } from '../components/StatusTag';
import { ORGANISATION_STATUS, formatAbn, formatDate } from '../format';

const loadOrganisations = (api: ApiClient): Promise<Organisation[]> =>
	api.platform.listOrganisations();

const COLUMNS: ReadonlyArray<Column<Organisation>> = [
	{
		key: 'name',
		header: 'Organisation',
		render: (organisation) => (
			<Link to={`/organisations/${organisation.id}`}>{organisation.name}</Link>
		),
	},
	{ key: 'abn', header: 'ABN', render: (organisation) => formatAbn(organisation.abn) },
	{
		key: 'contact',
		header: 'Contact',
		render: (organisation) => (
			<>
				{organisation.contactName}
				<span className="cell-secondary">{organisation.contactEmail}</span>
			</>
		),
	},
	{
		key: 'status',
		header: 'Status',
		render: (organisation) => <StatusTag {...ORGANISATION_STATUS[organisation.status]} />,
	},
	{
		key: 'facilityLimit',
		header: 'Facility limit',
		isNumeric: true,
		render: (organisation) => organisation.limits.facilityLimit,
	},
	{
		key: 'created',
		header: 'Created',
		render: (organisation) => formatDate(organisation.createdAt),
	},
];

// SA-01: list page — no form; rows navigate to the organisation's detail page.
export function OrganisationListPage(): ReactElement {
	const { state, reload } = useApiData(loadOrganisations);
	const hasOrganisations = state.status === 'ready' && state.data.length > 0;
	return (
		<>
			<PageHeader
				title="Organisations"
				description="Customer organisations (tenants). Each one manages its own facilities, staff and residents."
				actions={
					hasOrganisations ? (
						<LinkButton to="/organisations/new" variant="primary">
							Create organisation
						</LinkButton>
					) : null
				}
			/>
			<AsyncContent state={state} subject="organisations" onRetry={reload}>
				{(organisations) =>
					organisations.length === 0 ? (
						<EmptyState
							title="No organisations yet"
							body="Create the first customer organisation to start onboarding."
							action={
								<LinkButton to="/organisations/new">Create organisation</LinkButton>
							}
						/>
					) : (
						<DataTable
							caption="Organisations"
							columns={COLUMNS}
							rows={organisations}
							getRowKey={(organisation) => organisation.id}
						/>
					)
				}
			</AsyncContent>
		</>
	);
}
