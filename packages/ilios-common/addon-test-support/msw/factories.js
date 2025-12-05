import aamcMethod from './factories/aamc-method.js';
import aamcPcrs from './factories/aamc-pcrs.js';
import aamcResourceType from './factories/aamc-resource-type.js';
import academicYear from './factories/academic-year.js';
import assessmentOption from './factories/assessment-option.js';
import authentication from './factories/authentication.js';
import cohort from './factories/cohort.js';
import competency from './factories/competency.js';
import courseClerkshipType from './factories/course-clerkship-type.js';
import courseLearningMaterial from './factories/course-learning-material.js';
import courseObjective from './factories/course-objective.js';
import course from './factories/course.js';
import curriculumInventoryAcademicLevel from './factories/curriculum-inventory-academic-level.js';
import curriculumInventoryExport from './factories/curriculum-inventory-export.js';
import curriculumInventoryInstitution from './factories/curriculum-inventory-institution.js';
import curriculumInventoryReport from './factories/curriculum-inventory-report.js';
import curriculumInventorySequenceBlock from './factories/curriculum-inventory-sequence-block.js';
import curriculumInventorySequence from './factories/curriculum-inventory-sequence.js';
import ilmSession from './factories/ilm-session.js';
import ingestionException from './factories/ingestion-exception.js';
import instructorGroup from './factories/instructor-group.js';
import learnerGroup from './factories/learner-group.js';
import learningMaterialStatus from './factories/learning-material-status.js';
import learningMaterialUserRole from './factories/learning-material-user-role.js';
import learningMaterial from './factories/learning-material.js';
import meshConcept from './factories/mesh-concept.js';
import meshDescriptor from './factories/mesh-descriptor.js';
import meshPreviousIndexing from './factories/mesh-previous-indexing.js';
import meshQualifier from './factories/mesh-qualifier.js';
import meshTerm from './factories/mesh-term.js';
import meshTree from './factories/mesh-tree.js';
import offering from './factories/offering.js';
import pendingUserUpdate from './factories/pending-user-update.js';
import programYearObjective from './factories/program-year-objective.js';
import programYear from './factories/program-year.js';
import program from './factories/program.js';
import report from './factories/report.js';
import schoolConfig from './factories/school-config.js';
import school from './factories/school.js';
import schoolevent from './factories/schoolevent.js';
import sessionLearningMaterial from './factories/session-learning-material.js';
import sessionObjective from './factories/session-objective.js';
import sessionType from './factories/session-type.js';
import session from './factories/session.js';
import term from './factories/term.js';
import userRole from './factories/user-role.js';
import userSessionMaterialStatus from './factories/user-session-material-status.js';
import user from './factories/user.js';
import userevent from './factories/userevent.js';
import vocabulary from './factories/vocabulary.js';

// Factory defaults applied when creating models
// Functions receive the iteration index (i) for dynamic values
export const factoryDefaults = {
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
};

export default factoryDefaults;
