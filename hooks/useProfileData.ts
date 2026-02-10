/**
 * Re-export the profile data hook and types from the store.
 *
 * Consumers should import from this file:
 *   import { useProfileData } from '@/hooks/useProfileData';
 *
 * The actual implementation (Context + Provider + localStorage logic)
 * lives in lib/profileStore.tsx.
 */
export {
    useProfileData,
    ProfileDataProvider,
    type StudentData,
    type Activity,
    type Honor,
} from '@/lib/profileStore';
