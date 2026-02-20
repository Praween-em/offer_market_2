/**
 * Wraps an affiliate link with the user's ID for tracking.
 * EarnKaro specifically uses 's1' as the sub-id parameter.
 */
export const wrapAffiliateLink = (url: string, userId: string): string => {
    if (!url || !userId) return url;

    // Use string manipulation to avoid URL polyfill issues in some RN environments
    const separator = url.includes('?') ? '&' : '?';

    // Check if s1 already exists to avoid duplication
    if (url.includes('s1=')) {
        return url;
    }

    return `${url}${separator}s1=${userId}`;
};
