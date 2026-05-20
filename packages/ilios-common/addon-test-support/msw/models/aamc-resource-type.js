import { z } from 'zod';

export const schema = z.looseObject({
  id: z.string(),
  title: z.string().nullish(),
  description: z.string().nullish(),
});

export const relationships = [];
