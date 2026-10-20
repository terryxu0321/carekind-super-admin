import {
	adminInviteRequestSchema,
	organisationCreateRequestSchema,
	organisationLimitsSchema,
} from '@carekind/shared';
import { describe, expect, it } from 'vitest';
import { validateForm } from '../src/forms/validate-form';

const PROFILE_MESSAGES = {
	name: 'Enter the organisation name.',
	abn: 'Enter the ABN.',
	contactName: 'Enter the contact name.',
	contactEmail: 'Enter an email address.',
};

describe('validateForm with shared schemas', () => {
	it('should_return_parsed_data_when_profile_is_valid', () => {
		const result = validateForm(
			organisationCreateRequestSchema,
			{
				name: 'Synthetic Care Group',
				abn: '12 345 678 901',
				contactName: 'Casey Example',
				contactEmail: 'casey@example.com',
			},
			PROFILE_MESSAGES,
		);
		expect(result).toEqual({
			ok: true,
			data: {
				name: 'Synthetic Care Group',
				abn: '12345678901',
				contactName: 'Casey Example',
				contactEmail: 'casey@example.com',
			},
		});
	});

	it('should_give_one_plain_message_per_invalid_field', () => {
		const result = validateForm(
			organisationCreateRequestSchema,
			{ name: '   ', abn: '123', contactName: 'Casey Example', contactEmail: 'not-an-email' },
			PROFILE_MESSAGES,
		);
		expect(result).toEqual({
			ok: false,
			fieldErrors: {
				name: 'Enter the organisation name.',
				abn: 'Enter the ABN.',
				contactEmail: 'Enter an email address.',
			},
			formError: null,
		});
	});

	it('should_reject_audio_retention_above_seven_days', () => {
		const result = validateForm(
			organisationLimitsSchema,
			{
				enabledRecordTypes: ['progress_note'],
				pcwRequiresRnReview: true,
				audioRetentionDaysMax: 8,
				aiProcessingEnabled: true,
				facilityLimit: 3,
			},
			{
				enabledRecordTypes: 'types',
				pcwRequiresRnReview: 'review',
				audioRetentionDaysMax: 'retention',
				aiProcessingEnabled: 'ai',
				facilityLimit: 'limit',
			},
		);
		expect(result.ok).toBe(false);
		expect(result.ok ? null : result.fieldErrors).toEqual({
			audioRetentionDaysMax: 'retention',
		});
	});

	it('should_report_unmapped_issues_as_a_form_error', () => {
		const result = validateForm(adminInviteRequestSchema, null, {
			givenName: 'given',
			familyName: 'family',
			email: 'email',
		});
		expect(result.ok).toBe(false);
		expect(result.ok ? null : result.formError).toEqual(expect.any(String));
	});
});
