/** @type {import('next').NextConfig} */
function normaliseEnvValue(value) {
	if (typeof value !== 'string') return undefined;
	const trimmed = value.trim();
	if (!trimmed) return undefined;
	// Ignore unresolved variable references like "$VITE_SUPABASE_URL".
	if (trimmed.startsWith('$')) return undefined;
	return trimmed;
}

function pickFirstValidEnvValue(...values) {
	for (const value of values) {
		const normalised = normaliseEnvValue(value);
		if (normalised) return normalised;
	}
	return '';
}

const nextConfig = {
	env: {
		NEXT_PUBLIC_SUPABASE_URL:
			pickFirstValidEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.VITE_SUPABASE_URL),
		NEXT_PUBLIC_SUPABASE_ANON_KEY:
			pickFirstValidEnvValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, process.env.VITE_SUPABASE_ANON_KEY),
	},
};

export default nextConfig;
