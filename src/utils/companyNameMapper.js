/**
 * Company Name Mapper
 * 
 * Maps between different company name formats used in:
 * - problems.json (friendly names with spaces)
 * - wizard-company-counts.json (slug names with hyphens)
 * - companies-list.json (slug names with hyphens)
 */

// Map from slug format (wizard) to friendly format (problems.json)
const SLUG_TO_FRIENDLY = {
    'facebook': 'Facebook',
    'meta': 'Meta',
    'google': 'Google',
    'amazon': 'Amazon',
    'microsoft': 'Microsoft',
    'apple': 'Apple',
    'netflix': 'Netflix',
    'uber': 'Uber',
    'airbnb': 'Airbnb',
    'goldman-sachs': 'Goldman Sachs',
    'linkedin': 'LinkedIn',
    'jpmorgan': 'JPMorgan',
    'morgan-stanley': 'Morgan Stanley',
    'capital-one': 'Capital One',
    'doordash': 'DoorDash',
    'bytedance': 'ByteDance',
    'booking.com': 'Booking.com',
    'bookingcom': 'Booking.com',
    'adobe': 'Adobe',
    'bloomberg': 'Bloomberg',
    'oracle': 'Oracle',
    'salesforce': 'Salesforce',
    'cisco': 'Cisco',
    'intuit': 'Intuit',
    'atlassian': 'Atlassian',
    'nvidia': 'Nvidia',
    'citadel': 'Citadel',
    'databricks': 'Databricks',
    'dropbox': 'Dropbox',
    'expedia': 'Expedia',
    'instacart': 'Instacart',
    'lyft': 'Lyft',
    'coinbase': 'Coinbase'
};

// Reverse mapping: friendly to slug
const FRIENDLY_TO_SLUG = Object.fromEntries(
    Object.entries(SLUG_TO_FRIENDLY).map(([slug, friendly]) => [friendly.toLowerCase(), slug])
);

/**
 * Normalize a company name to the format used in problems.json
 * @param {string} name - Company name in any format
 * @returns {string} - Normalized company name
 */
export function normalizeCompanyName(name) {
    if (!name) return name;

    const lower = name.toLowerCase().trim();

    // If it's a slug format, convert to friendly
    if (SLUG_TO_FRIENDLY[lower]) {
        return SLUG_TO_FRIENDLY[lower];
    }

    // If it's already in friendly format, return as-is
    // (capitalize first letter of each word)
    return name.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('-');
}

/**
 * Convert a friendly name to slug format
 * @param {string} name - Friendly company name
 * @returns {string} - Slug format
 */
export function toSlugFormat(name) {
    if (!name) return name;

    const lower = name.toLowerCase().trim();

    if (FRIENDLY_TO_SLUG[lower]) {
        return FRIENDLY_TO_SLUG[lower];
    }

    // Default: lowercase and replace spaces with hyphens
    return name.toLowerCase().replace(/\s+/g, '-');
}

/**
 * Get all possible name variations for a company
 * @param {string} name - Company name in any format
 * @returns {string[]} - Array of possible name variations
 */
export function getCompanyNameVariations(name) {
    if (!name) return [];

    const variations = new Set();
    const normalized = normalizeCompanyName(name);
    const slug = toSlugFormat(name);

    variations.add(name);
    variations.add(normalized);
    variations.add(slug);
    variations.add(name.toLowerCase());
    variations.add(normalized.toLowerCase());

    return Array.from(variations);
}

/**
 * Check if a problem has a specific company tag (case-insensitive, format-agnostic)
 * @param {object} problem - Problem object with companies array
 * @param {string} companyName - Company name to check
 * @returns {boolean}
 */
export function problemHasCompany(problem, companyName) {
    if (!problem || !problem.companies || !Array.isArray(problem.companies)) {
        return false;
    }

    const variations = getCompanyNameVariations(companyName);
    const problemCompanies = problem.companies.map(c => c.toLowerCase());

    return variations.some(variation =>
        problemCompanies.includes(variation.toLowerCase())
    );
}
