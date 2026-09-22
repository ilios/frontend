import { z } from 'zod';

export const schema = z.looseObject({
  id: z.number(),
  name: z.string().nullish(),
  startDate: z.iso.datetime({ offset: true }).nullish(),
  endDate: z.iso.datetime({ offset: true }).nullish(),
  offering: z.number().nullish(),
  offeringId: z.number().nullish(),
  ilmSession: z.number().nullish(),
  session: z.number().nullish(),
  school: z.number().nullish(),
  course: z.number().nullish(),
  courseLevel: z.number().nullish(),
  courseTitle: z.string().nullish(),
  instructors: z.array(z.string()).nullish(),
  learningMaterials: z.array(z.looseObject({})).nullish(),
  sessionTypeId: z.number().nullish(),
  sessionTypeTitle: z.string().nullish(),
  sessionTerms: z
    .array(
      z.looseObject({
        id: z.number(),
        title: z.string().nullish(),
        vocabularyId: z.number().nullish(),
        vocabularyTitle: z.string().nullish(),
      }),
    )
    .nullish(),
  courseExternalId: z.string().nullish(),
  sessionDescription: z.string().nullish(),
  location: z.string().nullish(),
  url: z.url().nullish(),
  lastModified: z.iso.datetime({ offset: true }).nullish(),
  isPublished: z.boolean().nullish(),
  isScheduled: z.boolean().nullish(),
  isUserEvent: z.boolean().nullish(),
  user: z.number().nullish(),
  attireRequired: z.boolean().nullish(),
  equipmentRequired: z.boolean().nullish(),
  attendanceRequired: z.boolean().nullish(),
  supplemental: z.boolean().nullish(),

  cohorts: z
    .array(
      z.looseObject({
        id: z.number(),
        title: z.string().nullish(),
      }),
    )
    .nullish(),
  prerequisites: z.array(z.looseObject({})),
  postrequisites: z.array(z.looseObject({})),
  sessionObjectives: z
    .array(
      z.looseObject({
        id: z.number(),
        title: z.string(),
        position: z.number(),
        competencies: z.array(z.number()),
      }),
    )
    .nullish(),
  courseObjectives: z
    .array(
      z.looseObject({
        id: z.number(),
        title: z.string(),
        position: z.number(),
        competencies: z.array(z.number()),
      }),
    )
    .nullish(),
  competencies: z
    .array(
      z.looseObject({
        id: z.number(),
        title: z.string(),
        parent: z.number().nullish(),
      }),
    )
    .nullish(),
  sessionId: z.number().nullish(),
  userContexts: z.array(z.string()),
});

export const relationships = [];
