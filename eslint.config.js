// CareKind code-rules CORE-14 / CORE-15: explicit export types, no `any`; React hooks rules.
import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

export default tseslint.config(
	{ ignores: ['dist/', 'node_modules/', 'coverage/'] },
	js.configs.recommended,
	...tseslint.configs.recommended,
	reactHooks.configs.flat.recommended,
	{
		files: ['**/*.{ts,tsx}'],
		rules: {
			'@typescript-eslint/no-explicit-any': 'error',
			'@typescript-eslint/explicit-module-boundary-types': 'error',
			'react-hooks/exhaustive-deps': 'error',
			'no-empty': ['error', { allowEmptyCatch: false }],
		},
	},
);
