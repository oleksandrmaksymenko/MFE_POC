import type { ProfileProps, ProfileState } from './types';

export async function loadData({ userId }: ProfileProps): Promise<ProfileState> {
  await new Promise((r) => setTimeout(r, 30));
  return {
    userId,
    name: 'Jane Doe',
    email: 'jane@example.com',
    bio: 'Profile through entrypoint',
    renderedAt: new Date().toISOString(),
  };
}
