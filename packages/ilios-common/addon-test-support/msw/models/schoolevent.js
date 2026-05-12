import { z } from 'zod';

export const schema = z.looseObject({
  id: z.number(),
  name: z.string().nullish(),
  startDate: z.string().nullish(),
  endDate: z.string().nullish(),
  offering: z.number().nullish(),
  offeringId: z.number().nullish(),
  ilmSession: z.number().nullish(),
  school: z.number().nullish(),
  course: z.number().nullish(),
  courseTitle: z.string().nullish(),
  instructors: z.string().nullish(),
  sessionTypeId: z.number().nullish(),
  sessionTypeTitle: z.string().nullish(),
  courseExternalId: z.string().nullish(),
  sessionDescription: z.string().nullish(),
  location: z.string().nullish(),
  lastModified: z.string().nullish(),
  isPublished: z.boolean().nullish(),
  isScheduled: z.boolean().nullish(),
  attireRequired: z.boolean().nullish(),
  equipmentRequired: z.boolean().nullish(),
  attendanceRequired: z.boolean().nullish(),
  supplemental: z.boolean().nullish(),
  cohorts: z.string().nullish(),
  prerequisites: z.string().nullish(),
  postrequisites: z.string().nullish(),
  sessionId: z.number().nullish(),
});

export const relationships = [];
