/**
 * Re-export the profile data hook and types from the store.
 *
 * Consumers should import from this file:
 *   import { useProfileStore } from '@/hooks/useProfileStore';
 *
 * The actual implementation (Context + Provider + localStorage logic)
 * lives in lib/profileStore.tsx.
 */
export {
    useProfileStore,
    type StudentData,
    type Activity,
    type Honor,
} from '@/lib/profileStore';
