import { createClient } from '@supabase/supabase-js';

const viteEnv = typeof import.meta !== 'undefined' ? import.meta.env : undefined;

function normaliseEnvValue(value) {
	if (typeof value !== 'string') return undefined;
	const trimmed = value.trim();
	if (!trimmed) return undefined;
	// Ignore unresolved variable references like "$VITE_SUPABASE_ANON_KEY".
	if (trimmed.startsWith('$')) return undefined;
	return trimmed;
}

function pickFirstValidEnvValue(...values) {
	for (const value of values) {
		const normalised = normaliseEnvValue(value);
		if (normalised) return normalised;
	}
	return undefined;
}

function getProjectRefFromSupabaseUrl(url) {
	if (!url) return null;
	try {
		const hostname = new URL(url).hostname;
		const match = hostname.match(/^([a-z0-9-]+)\.supabase\.co$/i);
		return match?.[1] ?? null;
	} catch {
		return null;
	}
}

function decodeJwtPayload(token) {
	if (!token || typeof token !== 'string') return null;
	const parts = token.split('.');
	if (parts.length < 2) return null;

	let payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
	while (payload.length % 4 !== 0) payload += '=';

	try {
		const decoded = typeof atob === 'function'
			? atob(payload)
			: Buffer.from(payload, 'base64').toString('utf8');
		return JSON.parse(decoded);
	} catch {
		return null;
	}
}

function getProjectRefFromAnonKey(key) {
	const payload = decodeJwtPayload(key);
	if (!payload || typeof payload !== 'object') return null;
	return typeof payload.ref === 'string' ? payload.ref : null;
}

const supabaseUrl = pickFirstValidEnvValue(
	viteEnv?.VITE_SUPABASE_URL,
	process.env.NEXT_PUBLIC_SUPABASE_URL,
	process.env.VITE_SUPABASE_URL,
);

const supabaseKey = pickFirstValidEnvValue(
	viteEnv?.VITE_SUPABASE_ANON_KEY,
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
	process.env.VITE_SUPABASE_ANON_KEY,
);

const urlProjectRef = getProjectRefFromSupabaseUrl(supabaseUrl);
const keyProjectRef = getProjectRefFromAnonKey(supabaseKey);
const hasMatchingProjectRef = !urlProjectRef || !keyProjectRef || urlProjectRef === keyProjectRef;

export const supabaseConfigIssue =
	!supabaseUrl || !supabaseKey
		? 'missing-env'
		: hasMatchingProjectRef
			? null
			: 'mismatched-project-ref';

if (supabaseConfigIssue === 'mismatched-project-ref') {
	console.error(
		`Supabase config mismatch: URL project ref "${urlProjectRef}" does not match anon key ref "${keyProjectRef}". ` +
		'Use URL and anon key from the same Supabase project.'
	);
}

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey && hasMatchingProjectRef);

export const supabase =
	isSupabaseConfigured ? createClient(supabaseUrl, supabaseKey) : null;
