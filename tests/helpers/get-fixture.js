import aamcMethodsFixtures from '../fixtures/aamcMethods';
import aamcPcrsFixtures from '../fixtures/aamcPcrs';
import alertChangeTypesFixtures from '../fixtures/alertChangeTypes';
import alertsFixtures from '../fixtures/alerts';
import cohortsFixtures from '../fixtures/cohorts';
import competenciesFixtures from '../fixtures/competencies';
import courseLearningMaterialsFixtures from '../fixtures/courseLearningMaterials';
import coursesFixtures from '../fixtures/courses';
import curriculumInventoryAcademicLevelsFixtures from '../fixtures/curriculumInventoryAcademicLevels';
import curriculumInventoryExportsFixtures from '../fixtures/curriculumInventoryExports';
import curriculumInventoryInstitutionsFixtures from '../fixtures/curriculumInventoryInstitutions';
import curriculumInventoryReportsFixtures from '../fixtures/curriculumInventoryReports';
import curriculumInventorySequenceBlocksFixtures from '../fixtures/curriculumInventorySequenceBlocks';
import curriculumInventorySequencesFixtures from '../fixtures/curriculumInventorySequences';
import departmentsFixtures from '../fixtures/departments';
import disciplinesFixtures from '../fixtures/disciplines';
import educationalYearsFixtures from '../fixtures/educationalYears';
import ilmSessionsFixtures from '../fixtures/ilmSessions';
import instructionHoursFixtures from '../fixtures/instructionHours';
import instructorGroupsFixtures from '../fixtures/instructorGroups';
import learnerGroupsFixtures from '../fixtures/learnerGroups';
import learningMaterialStatusesFixtures from '../fixtures/learningMaterialStatuses';
import learningMaterialUserRolesFixtures from '../fixtures/learningMaterialUserRoles';
import learningMaterialsFixtures from '../fixtures/learningMaterials';
import meshConceptsFixtures from '../fixtures/meshConcepts';
import meshQualifiersFixtures from '../fixtures/meshQualifiers';
import objectivesFixtures from '../fixtures/objectives';
import offeringsFixtures from '../fixtures/offerings';
import programYearsFixtures from '../fixtures/programYears';
import programsFixtures from '../fixtures/programs';
import publishEventsFixtures from '../fixtures/publishEvents';
import recurringEventsFixtures from '../fixtures/recurringEvents';
import reportsFixtures from '../fixtures/reports';
import schoolsFixtures from '../fixtures/schools';
import sessionDescriptionsFixtures from '../fixtures/sessionDescriptions';
import sessionLearningMaterialsFixtures from '../fixtures/sessionLearningMaterials';
import sessionTypesFixtures from '../fixtures/sessionTypes';
import sessionsFixtures from '../fixtures/sessions';
import userRolesFixtures from '../fixtures/userRoles';
import usersFixtures from '../fixtures/users';

export default function getFixture(modelName){
  var fixtures = {
    aamcMethods: aamcMethodsFixtures,
    aamcPcrs: aamcPcrsFixtures,
    alertChangeTypes: alertChangeTypesFixtures,
    alerts: alertsFixtures,
    cohorts: cohortsFixtures,
    competencies: competenciesFixtures,
    courseLearningMaterials: courseLearningMaterialsFixtures,
    courses: coursesFixtures,
    curriculumInventoryAcademicLevels: curriculumInventoryAcademicLevelsFixtures,
    curriculumInventoryExports: curriculumInventoryExportsFixtures,
    curriculumInventoryInstitutions: curriculumInventoryInstitutionsFixtures,
    curriculumInventoryReports: curriculumInventoryReportsFixtures,
    curriculumInventorySequenceBlocks: curriculumInventorySequenceBlocksFixtures,
    curriculumInventorySequences: curriculumInventorySequencesFixtures,
    departments: departmentsFixtures,
    disciplines: disciplinesFixtures,
    educationalYears: educationalYearsFixtures,
    ilmSessions: ilmSessionsFixtures,
    instructionHours: instructionHoursFixtures,
    instructorGroups: instructorGroupsFixtures,
    learnerGroups: learnerGroupsFixtures,
    learningMaterialStatuses: learningMaterialStatusesFixtures,
    learningMaterialUserRoles: learningMaterialUserRolesFixtures,
    learningMaterials: learningMaterialsFixtures,
    meshConcepts: meshConceptsFixtures,
    meshQualifiers: meshQualifiersFixtures,
    objectives: objectivesFixtures,
    offerings: offeringsFixtures,
    programYears: programYearsFixtures,
    programs: programsFixtures,
    publishEvents: publishEventsFixtures,
    recurringEvents: recurringEventsFixtures,
    reports: reportsFixtures,
    schools: schoolsFixtures,
    sessionDescriptions: sessionDescriptionsFixtures,
    sessionLearningMaterials: sessionLearningMaterialsFixtures,
    sessionTypes: sessionTypesFixtures,
    sessions: sessionsFixtures,
    userRoles: userRolesFixtures,
    users: usersFixtures
  };
  var fixture = fixtures[modelName];
  if(!fixture){
    console.log('No fixture for ' + modelName);
  }

  return fixture;
}
