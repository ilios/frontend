import { primaryKey } from '@msw/data';

let idCounter = 1;

export default {
  id: primaryKey(() => String(idCounter++)),
  name: String,
  startDate: String,
  endDate: String,
  offering: Number,
  offeringId: Number,
  ilmSession: Number,
  school: Number,
  course: Number,
  courseTitle: String,
  instructors: String,
  sessionTypeId: Number,
  sessionTypeTitle: String,
  courseExternalId: String,
  sessionDescription: String,
  location: String,
  lastModified: String,
  isPublished: Boolean,
  isScheduled: Boolean,
  user: Number,
  attireRequired: Boolean,
  equipmentRequired: Boolean,
  attendanceRequired: Boolean,
  supplemental: Boolean,
  cohorts: String,
  prerequisites: String,
  postrequisites: String,
  sessionId: Number,
};
