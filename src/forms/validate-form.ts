// Runs a shared zod schema (defined once in @carekind/shared, code-rules D-3) over form values and
// turns its issues into one message per field. Typed structurally so this app needs no zod import.
interface SchemaIssue {
	readonly path: ReadonlyArray<PropertyKey>;
	readonly message: string;
}

export interface FormSchema<T> {
	safeParse(
		value: unknown,
	):
		| { success: true; data: T }
		| { success: false; error: { issues: ReadonlyArray<SchemaIssue> } };
}

export type FieldErrors<Field extends string> = Partial<Record<Field, string>>;

export type FormValidation<T, Field extends string> =
	| { ok: true; data: T }
	| { ok: false; fieldErrors: FieldErrors<Field>; formError: string | null };

// `messages` gives the plain-English text for each field (DESIGN §3: simple English);
// the schema decides whether the value is valid.
export function validateForm<T, Field extends string>(
	schema: FormSchema<T>,
	values: unknown,
	messages: Readonly<Record<Field, string>>,
): FormValidation<T, Field> {
	const result = schema.safeParse(values);
	if (result.success) {
		return { ok: true, data: result.data };
	}
	const fieldErrors: FieldErrors<Field> = {};
	let formError: string | null = null;
	for (const issue of result.error.issues) {
		const field = issue.path[0];
		if (typeof field === 'string' && field in messages) {
			const key = field as Field;
			fieldErrors[key] ??= messages[key];
		} else {
			formError ??= issue.message;
		}
	}
	return { ok: false, fieldErrors, formError };
}
