import type { ApiClient, AuditEntry } from '@carekind/shared';
import type { ReactElement } from 'react';
import { useApiData } from '../api/use-api-data';
import { AsyncContent } from '../components/AsyncContent';
import { type Column, DataTable } from '../components/DataTable';
import { EmptyState } from '../components/EmptyState';
import { PageHeader } from '../components/PageHeader';
import { ACTOR_TYPE_LABELS, formatDateTime } from '../format';

interface AuditRow extends AuditEntry {
	organisationName: string;
}

// The audit API returns organisation ids; names come from the organisation list.
async function loadAuditRows(api: ApiClient): Promise<AuditRow[]> {
	const [entries, organisations] = await Promise.all([
		api.platform.listAudit(),
		api.platform.listOrganisations(),
	]);
	const namesById = new Map(
		organisations.map((organisation) => [organisation.id, organisation.name]),
	);
	return entries
		.map((entry) => ({
			...entry,
			organisationName:
				entry.organisationId === null
					? 'Platform'
					: (namesById.get(entry.organisationId) ?? 'Unknown organisation'),
		}))
		.sort((first, second) => Date.parse(second.occurredAt) - Date.parse(first.occurredAt));
}

// Actor ids are opaque; a short prefix is enough to tell actors apart in the list.
const ACTOR_ID_PREFIX_LENGTH = 8;

const COLUMNS: ReadonlyArray<Column<AuditRow>> = [
	{ key: 'when', header: 'When', render: (row) => formatDateTime(row.occurredAt) },
	{
		key: 'actor',
		header: 'Actor',
		render: (row) => (
			<>
				{ACTOR_TYPE_LABELS[row.actorType]}
				<span className="cell-secondary">
					ID {row.actorId.slice(0, ACTOR_ID_PREFIX_LENGTH)}
				</span>
			</>
		),
	},
	{ key: 'organisation', header: 'Organisation', render: (row) => row.organisationName },
	{ key: 'action', header: 'Action', render: (row) => row.action },
	{ key: 'entity', header: 'Entity', render: (row) => row.entity },
	{ key: 'summary', header: 'Summary', render: (row) => row.summary },
];

// SA-04a: append-only platform audit log, newest first. Read-only list, no form.
export function AuditLogPage(): ReactElement {
	const { state, reload } = useApiData(loadAuditRows);
	return (
		<>
			<PageHeader
				title="Audit log"
				description="Who did what, when, and for which organisation. Entries cannot be changed or deleted."
			/>
			<AsyncContent state={state} subject="the audit log" onRetry={reload}>
				{(rows) =>
					rows.length === 0 ? (
						<EmptyState
							title="No audit entries yet"
							body="Platform actions, such as creating an organisation, appear here."
						/>
					) : (
						<DataTable
							caption="Audit log"
							columns={COLUMNS}
							rows={rows}
							getRowKey={(row) => row.id}
						/>
					)
				}
			</AsyncContent>
		</>
	);
}
