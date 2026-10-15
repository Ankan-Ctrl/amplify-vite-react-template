import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'bizPulseStorage',
  access: (allow) => ({
    'users/{entity_id}/*': [
      allow.entity('identity').to(['read', 'write', 'delete']),
    ],
  }),
});
