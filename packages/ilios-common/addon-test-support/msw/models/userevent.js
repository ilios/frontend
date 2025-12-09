import { z } from 'zod';

export const schema = z
  .object({
    id: z.string(),
    name: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    offering: z.number().optional(),
    offeringId: z.number().optional(),
    ilmSession: z.number().optional(),
    school: z.number().optional(),
    course: z.number().optional(),
    courseTitle: z.string().optional(),
    instructors: z.string().optional(),
    sessionTypeId: z.number().optional(),
    sessionTypeTitle: z.string().optional(),
    courseExternalId: z.string().optional(),
    sessionDescription: z.string().optional(),
    location: z.string().optional(),
    lastModified: z.string().optional(),
    isPublished: z.boolean().optional(),
    isScheduled: z.boolean().optional(),
    user: z.number().optional(),
    attireRequired: z.boolean().optional(),
    equipmentRequired: z.boolean().optional(),
    attendanceRequired: z.boolean().optional(),
    supplemental: z.boolean().optional(),
    cohorts: z.string().optional(),
    prerequisites: z.string().optional(),
    postrequisites: z.string().optional(),
    sessionId: z.number().optional(),
  })
  .passthrough();

export const relationships = [];
