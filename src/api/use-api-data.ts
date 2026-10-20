import type { ApiClient } from '@carekind/shared';
import { useCallback, useEffect, useState } from 'react';
import { useSession } from '../session/SessionContext';
import { describeError } from './describe-error';

export type LoadState<T> =
	{ status: 'loading' } | { status: 'error'; message: string } | { status: 'ready'; data: T };

export interface ApiData<T> {
	state: LoadState<T>;
	reload: () => void;
	// Shows a fresh copy returned by a save without fetching again.
	replaceData: (data: T) => void;
}

interface Settled<T> {
	load: (api: ApiClient) => Promise<T>;
	api: ApiClient;
	attempt: number;
	state: LoadState<T>;
}

// Loads page data through the signed-in client. `load` must be stable (useCallback): a new
// function, client or reload attempt makes the page show "loading" until the new result arrives.
export function useApiData<T>(load: (api: ApiClient) => Promise<T>): ApiData<T> {
	const { api } = useSession();
	const [attempt, setAttempt] = useState(0);
	const [settled, setSettled] = useState<Settled<T> | null>(null);

	useEffect(() => {
		let isCurrent = true;
		const settle = (state: LoadState<T>): void => {
			if (isCurrent) {
				setSettled({ load, api, attempt, state });
			}
		};
		load(api).then(
			(data) => settle({ status: 'ready', data }),
			(error: unknown) => settle({ status: 'error', message: describeError(error) }),
		);
		return () => {
			isCurrent = false;
		};
	}, [api, attempt, load]);

	const reload = useCallback(() => setAttempt((current) => current + 1), []);
	const replaceData = useCallback(
		(data: T) => setSettled({ load, api, attempt, state: { status: 'ready', data } }),
		[api, attempt, load],
	);

	const isSettled =
		settled !== null &&
		settled.load === load &&
		settled.api === api &&
		settled.attempt === attempt;
	return { state: isSettled ? settled.state : { status: 'loading' }, reload, replaceData };
}
