import type { ApiClient, Organisation, OrganisationCreateRequest } from '@carekind/shared';
import { type ReactElement, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useApiData } from '../../api/use-api-data';
import { AsyncContent } from '../../components/AsyncContent';
import { PageHeader } from '../../components/PageHeader';
import { StatusTag } from '../../components/StatusTag';
import { useToast } from '../../components/Toast';
import { OrganisationProfileForm } from '../../forms/OrganisationProfileForm';
import { ORGANISATION_STATUS, formatAbn } from '../../format';
import { useSession } from '../../session/SessionContext';
import { AccessSection } from './AccessSection';
import { AdminsSection } from './AdminsSection';
import { FacilitiesSection } from './FacilitiesSection';
import { LimitsSummary } from './LimitsSummary';

interface OrganisationDetailProps {
	organisation: Organisation;
	onOrganisationChange: (organisation: Organisation) => void;
}

// The page's only form is the profile; limits have their own page, invites and status changes
// use dialogs (DESIGN §7.3: one page = one form = one submit).
function OrganisationDetail({
	organisation,
	onOrganisationChange,
}: OrganisationDetailProps): ReactElement {
	const { api } = useSession();
	const { showToast } = useToast();

	const saveProfile = async (profile: OrganisationCreateRequest): Promise<void> => {
		onOrganisationChange(await api.platform.updateOrganisation(organisation.id, profile));
		showToast('Profile saved');
	};

	return (
		<>
			<PageHeader
				title={organisation.name}
				actions={<StatusTag {...ORGANISATION_STATUS[organisation.status]} />}
			/>
			<section className="section" aria-labelledby="profile-title">
				<h2 className="section__title" id="profile-title">
					Profile
				</h2>
				<div className="page-narrow">
					<OrganisationProfileForm
						initialProfile={{
							name: organisation.name,
							abn: formatAbn(organisation.abn),
							contactName: organisation.contactName,
							contactEmail: organisation.contactEmail,
						}}
						submitLabel="Save profile"
						onSubmit={saveProfile}
					/>
				</div>
			</section>
			<LimitsSummary organisationId={organisation.id} limits={organisation.limits} />
			<AdminsSection organisationId={organisation.id} />
			<FacilitiesSection organisationId={organisation.id} />
			<AccessSection
				organisation={organisation}
				onOrganisationChange={onOrganisationChange}
			/>
		</>
	);
}

// SA-01 / SA-03: one organisation — profile, limits, admins, facilities (read-only), access.
export function OrganisationDetailPage(): ReactElement {
	const { organisationId = '' } = useParams();
	const loadOrganisation = useCallback(
		(api: ApiClient): Promise<Organisation> => api.platform.getOrganisation(organisationId),
		[organisationId],
	);
	const { state, reload, replaceData } = useApiData(loadOrganisation);
	return (
		<AsyncContent state={state} subject="the organisation" onRetry={reload}>
			{(organisation) => (
				<OrganisationDetail
					organisation={organisation}
					onOrganisationChange={replaceData}
				/>
			)}
		</AsyncContent>
	);
}
