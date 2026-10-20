import type { OrganisationLimits } from '@carekind/shared';
import type { ReactElement } from 'react';
import { LinkButton } from '../../components/Button';
import { RECORD_TYPE_LABELS, formatYesNo } from '../../format';

export interface LimitsSummaryProps {
	organisationId: string;
	limits: OrganisationLimits;
}

// Read-only view of SA-02 limits; editing happens on the limits page.
export function LimitsSummary({ organisationId, limits }: LimitsSummaryProps): ReactElement {
	const items: ReadonlyArray<[string, string]> = [
		[
			'Enabled record types',
			limits.enabledRecordTypes.map((type) => RECORD_TYPE_LABELS[type]).join(', '),
		],
		['PCW records need RN review (default)', formatYesNo(limits.pcwRequiresRnReview)],
		['Maximum audio retention', `${limits.audioRetentionDaysMax} days`],
		['AI processing on', formatYesNo(limits.aiProcessingEnabled)],
		['Facility limit', String(limits.facilityLimit)],
	];
	return (
		<section className="section" aria-labelledby="limits-title">
			<div className="section__header">
				<h2 className="section__title" id="limits-title">
					Limits
				</h2>
				<LinkButton to={`/organisations/${organisationId}/limits`} variant="utility">
					Edit limits
				</LinkButton>
			</div>
			<dl className="summary-list">
				{items.map(([term, value]) => (
					<div className="summary-list__row" key={term}>
						<dt>{term}</dt>
						<dd>{value}</dd>
					</div>
				))}
			</dl>
		</section>
	);
}
