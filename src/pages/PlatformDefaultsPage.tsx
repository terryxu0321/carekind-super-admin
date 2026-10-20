import type { ApiClient, OrganisationLimits, PlatformDefaults } from '@carekind/shared';
import type { ReactElement } from 'react';
import { useApiData } from '../api/use-api-data';
import { AsyncContent } from '../components/AsyncContent';
import { PageHeader } from '../components/PageHeader';
import { useToast } from '../components/Toast';
import { LimitsForm } from '../forms/LimitsForm';
import { useSession } from '../session/SessionContext';

const loadDefaults = (api: ApiClient): Promise<PlatformDefaults> => api.platform.getDefaults();

// SA-02a: defaults are copied into each new organisation; existing organisations keep their own.
export function PlatformDefaultsPage(): ReactElement {
	const { api } = useSession();
	const { showToast } = useToast();
	const { state, reload } = useApiData(loadDefaults);

	const saveDefaults = async (limits: OrganisationLimits): Promise<void> => {
		await api.platform.updateDefaults(limits);
		showToast('Platform defaults saved');
	};

	return (
		<div className="page-narrow">
			<PageHeader
				title="Platform defaults"
				description="New organisations start with these limits. Existing organisations keep their own limits."
			/>
			<AsyncContent state={state} subject="platform defaults" onRetry={reload}>
				{(defaults) => (
					<LimitsForm
						initialLimits={defaults}
						submitLabel="Save defaults"
						onSubmit={saveDefaults}
					/>
				)}
			</AsyncContent>
		</div>
	);
}
