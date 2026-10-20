import { ApiError } from '@carekind/shared';

// Turns any failure into one sentence for a system banner: what happened + what to do next.
// Server messages never contain health information (tech design §4), so they are safe to show.
export function describeError(error: unknown): string {
	if (!(error instanceof ApiError)) {
		return 'Something went wrong. Try again.';
	}
	if (error.code === 'network_error') {
		return 'Could not reach the CareKind API. Check your connection and try again.';
	}
	if (error.code === 'unexpected_response') {
		return 'The API sent a response this console does not understand. Try again, and tell the tech lead if it keeps happening.';
	}
	return error.message;
}

export function isUnauthorised(error: unknown): boolean {
	return error instanceof ApiError && error.status === 401;
}
