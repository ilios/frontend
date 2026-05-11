import { z } from 'zod';

export const schema = z
  .object({
    id: z.number(),
    title: z.string().optional(),
    templatePrefix: z.string().optional(),
    iliosAdministratorEmail: z.string().optional(),
    changeAlertRecipients: z.string().optional(),
  })
  .passthrough();

export const relationships = [
  {
    field: 'competencies',
    type: 'manyOf',
    target: 'competency',
  },
  {
    field: 'courses',
    type: 'manyOf',
    target: 'course',
  },
  {
    field: 'programs',
    type: 'manyOf',
    target: 'program',
  },
  {
    field: 'vocabularies',
    type: 'manyOf',
    target: 'vocabulary',
  },
  {
    field: 'instructorGroups',
    type: 'manyOf',
    target: 'instructorGroup',
  },
  {
    field: 'curriculumInventoryInstitution',
    type: 'oneOf',
    target: 'curriculumInventoryInstitution',
  },
  {
    field: 'sessionTypes',
    type: 'manyOf',
    target: 'sessionType',
  },
  {
    field: 'directors',
    type: 'manyOf',
    target: 'user',
    role: 'schoolDirector',
  },
  {
    field: 'administrators',
    type: 'manyOf',
    target: 'user',
    role: 'schoolAdministrator',
  },
  {
    field: 'configurations',
    type: 'manyOf',
    target: 'schoolConfig',
  },
];
