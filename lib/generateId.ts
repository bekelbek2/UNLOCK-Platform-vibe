import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a UUID that works in all contexts (HTTP and HTTPS).
 * `crypto.randomUUID()` only works in secure contexts (HTTPS / localhost).
 * Falls back to the `uuid` package for HTTP-deployed servers.
 */
export function generateId(): string {
    try {
        return crypto.randomUUID();
    } catch {
        return uuidv4();
    }
}
