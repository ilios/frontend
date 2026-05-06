import { z } from 'zod';

export const schema = z
  .object({
    id: z.union([z.number(), z.string()]),
    title: z.string().optional(),
  })
  .passthrough();

export const relationships = [];
