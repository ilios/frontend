import { relationships as aamcMethod } from './models/aamc-method.js';
import { relationships as aamcPcrs } from './models/aamc-pcrs.js';
import { relationships as aamcResourceType } from './models/aamc-resource-type.js';
import { relationships as academicYear } from './models/academic-year.js';
import { relationships as assessmentOption } from './models/assessment-option.js';
import { relationships as authentication } from './models/authentication.js';
import { relationships as cohort } from './models/cohort.js';
import { relationships as competency } from './models/competency.js';
import { relationships as courseClerkshipType } from './models/course-clerkship-type.js';
import { relationships as courseLearningMaterial } from './models/course-learning-material.js';
import { relationships as courseObjective } from './models/course-objective.js';
import { relationships as course } from './models/course.js';
import { relationships as curriculumInventoryAcademicLevel } from './models/curriculum-inventory-academic-level.js';
import { relationships as curriculumInventoryExport } from './models/curriculum-inventory-export.js';
import { relationships as curriculumInventoryInstitution } from './models/curriculum-inventory-institution.js';
import { relationships as curriculumInventoryReport } from './models/curriculum-inventory-report.js';
import { relationships as curriculumInventorySequenceBlock } from './models/curriculum-inventory-sequence-block.js';
import { relationships as curriculumInventorySequence } from './models/curriculum-inventory-sequence.js';
import { relationships as ilmSession } from './models/ilm-session.js';
import { relationships as ingestionException } from './models/ingestion-exception.js';
import { relationships as instructorGroup } from './models/instructor-group.js';
import { relationships as learnerGroup } from './models/learner-group.js';
import { relationships as learningMaterialStatus } from './models/learning-material-status.js';
import { relationships as learningMaterialUserRole } from './models/learning-material-user-role.js';
import { relationships as learningMaterial } from './models/learning-material.js';
import { relationships as meshConcept } from './models/mesh-concept.js';
import { relationships as meshDescriptor } from './models/mesh-descriptor.js';
import { relationships as meshPreviousIndexing } from './models/mesh-previous-indexing.js';
import { relationships as meshQualifier } from './models/mesh-qualifier.js';
import { relationships as meshTerm } from './models/mesh-term.js';
import { relationships as meshTree } from './models/mesh-tree.js';
import { relationships as offering } from './models/offering.js';
import { relationships as pendingUserUpdate } from './models/pending-user-update.js';
import { relationships as programYearObjective } from './models/program-year-objective.js';
import { relationships as programYear } from './models/program-year.js';
import { relationships as program } from './models/program.js';
import { relationships as report } from './models/report.js';
import { relationships as schoolConfig } from './models/school-config.js';
import { relationships as school } from './models/school.js';
import { relationships as schoolevent } from './models/schoolevent.js';
import { relationships as sessionLearningMaterial } from './models/session-learning-material.js';
import { relationships as sessionObjective } from './models/session-objective.js';
import { relationships as sessionType } from './models/session-type.js';
import { relationships as session } from './models/session.js';
import { relationships as term } from './models/term.js';
import { relationships as userRole } from './models/user-role.js';
import { relationships as userSessionMaterialStatus } from './models/user-session-material-status.js';
import { relationships as user } from './models/user.js';
import { relationships as userevent } from './models/userevent.js';
import { relationships as vocabulary } from './models/vocabulary.js';

const relationships = {
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

function getRelationship(target, field) {
  if (!(target in relationships)) {
    throw new Error(`No relationships for ${target}`);
  }
  const t = relationships[target];
  const r = t.find((x) => x.field === field);
  if (!r) {
    throw new Error(
      `${field} is not a field in ${target}, fields are: ` + t.map((x) => x.field).join(', '),
    );
  }

  return r;
}

export function getTypeFor(target, field) {
  const rel = getRelationship(target, field);
  return rel.target;
}
