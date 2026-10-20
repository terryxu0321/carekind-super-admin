import type { ApiClient, Organisation, OrganisationLimits } from '@carekind/shared';
import { type ReactElement, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApiData } from '../api/use-api-data';
import { AsyncContent } from '../components/AsyncContent';
import { LinkButton } from '../components/Button';
import { PageHeader } from '../components/PageHeader';
import { useToast } from '../components/Toast';
import { LimitsForm } from '../forms/LimitsForm';
import { useSession } from '../session/SessionContext';

// SA-02: an organisation's limits on their own page, so the detail page keeps a single form.
// Changes apply immediately (SPEC-010 §6).
export function OrganisationLimitsPage(): ReactElement {
	const { organisationId = '' } = useParams();
	const { api } = useSession();
	const { showToast } = useToast();
	const navigate = useNavigate();
	const loadOrganisation = useCallback(
		(client: ApiClient): Promise<Organisation> =>
			client.platform.getOrganisation(organisationId),
		[organisationId],
	);
	const { state, reload } = useApiData(loadOrganisation);
	const detailPath = `/organisations/${organisationId}`;

	const saveLimits = async (limits: OrganisationLimits): Promise<void> => {
		await api.platform.updateOrganisationLimits(organisationId, limits);
		showToast('Limits saved');
		navigate(detailPath);
	};

	return (
		<div className="page-narrow">
			<AsyncContent state={state} subject="organisation limits" onRetry={reload}>
				{(organisation) => (
					<>
						<PageHeader
							title={`Limits for ${organisation.name}`}
							description="Facilities can configure within these limits. Changes apply immediately."
						/>
						<LimitsForm
							initialLimits={organisation.limits}
							submitLabel="Save limits"
							onSubmit={saveLimits}
						/>
						<p className="page-footer-link">
							<LinkButton to={detailPath}>Back to organisation</LinkButton>
						</p>
					</>
				)}
			</AsyncContent>
		</div>
	);
}
