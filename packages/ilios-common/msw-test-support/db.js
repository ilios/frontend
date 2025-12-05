import { factory } from '@msw/data';
import aamcMethod from './models/aamc-method.js';
import aamcPcrs from './models/aamc-pcrs.js';
import aamcResourceType from './models/aamc-resource-type.js';
import academicYear from './models/academic-year.js';
import assessmentOption from './models/assessment-option.js';
import authentication from './models/authentication.js';
import cohort from './models/cohort.js';
import competency from './models/competency.js';
import courseClerkshipType from './models/course-clerkship-type.js';
import courseLearningMaterial from './models/course-learning-material.js';
import courseObjective from './models/course-objective.js';
import course from './models/course.js';
import curriculumInventoryAcademicLevel from './models/curriculum-inventory-academic-level.js';
import curriculumInventoryExport from './models/curriculum-inventory-export.js';
import curriculumInventoryInstitution from './models/curriculum-inventory-institution.js';
import curriculumInventoryReport from './models/curriculum-inventory-report.js';
import curriculumInventorySequenceBlock from './models/curriculum-inventory-sequence-block.js';
import curriculumInventorySequence from './models/curriculum-inventory-sequence.js';
import ilmSession from './models/ilm-session.js';
import ingestionException from './models/ingestion-exception.js';
import instructorGroup from './models/instructor-group.js';
import learnerGroup from './models/learner-group.js';
import learningMaterialStatus from './models/learning-material-status.js';
import learningMaterialUserRole from './models/learning-material-user-role.js';
import learningMaterial from './models/learning-material.js';
import meshConcept from './models/mesh-concept.js';
import meshDescriptor from './models/mesh-descriptor.js';
import meshPreviousIndexing from './models/mesh-previous-indexing.js';
import meshQualifier from './models/mesh-qualifier.js';
import meshTerm from './models/mesh-term.js';
import meshTree from './models/mesh-tree.js';
import offering from './models/offering.js';
import pendingUserUpdate from './models/pending-user-update.js';
import programYearObjective from './models/program-year-objective.js';
import programYear from './models/program-year.js';
import program from './models/program.js';
import report from './models/report.js';
import schoolConfig from './models/school-config.js';
import school from './models/school.js';
import schoolevent from './models/schoolevent.js';
import sessionLearningMaterial from './models/session-learning-material.js';
import sessionObjective from './models/session-objective.js';
import sessionType from './models/session-type.js';
import session from './models/session.js';
import term from './models/term.js';
import userRole from './models/user-role.js';
import userSessionMaterialStatus from './models/user-session-material-status.js';
import user from './models/user.js';
import userevent from './models/userevent.js';
import vocabulary from './models/vocabulary.js';

export const db = factory({
  aamcMethod,
  aamcPcrs,
  aamcResourceType,
  academicYear,
  assessmentOption,
  authentication,
  cohort,
  competency,
  courseClerkshipType,
  courseLearningMaterial,
  courseObjective,
  course,
  curriculumInventoryAcademicLevel,
  curriculumInventoryExport,
  curriculumInventoryInstitution,
  curriculumInventoryReport,
  curriculumInventorySequenceBlock,
  curriculumInventorySequence,
  ilmSession,
  ingestionException,
  instructorGroup,
  learnerGroup,
  learningMaterialStatus,
  learningMaterialUserRole,
  learningMaterial,
  meshConcept,
  meshDescriptor,
  meshPreviousIndexing,
  meshQualifier,
  meshTerm,
  meshTree,
  offering,
  pendingUserUpdate,
  programYearObjective,
  programYear,
  program,
  report,
  schoolConfig,
  school,
  schoolevent,
  sessionLearningMaterial,
  sessionObjective,
  sessionType,
  session,
  term,
  userRole,
  userSessionMaterialStatus,
  user,
  userevent,
  vocabulary,
});

export default db;
