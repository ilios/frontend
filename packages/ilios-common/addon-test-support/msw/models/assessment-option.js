import { z } from 'zod';

export const schema = z
  .object({
    id: z.number(),
    name: z.string().nullish(),
  })
  .passthrough();

export const relationships = [];
