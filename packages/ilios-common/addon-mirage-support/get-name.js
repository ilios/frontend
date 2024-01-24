var models = [
  'aamcMethods',
  'aamcPcrs',
  'academicYears',
  'assessmentOptions',
  'courseLearningMaterials',
  'courseClerkshipTypes',
  'courseObjectives',
  'curriculumInventoryAcademicLevels',
  'curriculumInventoryExports',
  'curriculumInventoryInstitutions',
  'curriculumInventoryReports',
  'curriculumInventorySequenceBlocks',
  'curriculumInventorySequences',
  'ilmSessions',
  'instructionHours',
  'instructorGroups',
  'learnerGroups',
  'learningMaterialStatuses',
  'learningMaterialUserRoles',
  'learningMaterials',
  'meshConcepts',
  'meshDescriptors',
  'meshQualifiers',
  'meshPreviousIndexings',
  'meshTrees',
  'pendingUserUpdates',
  'programYears',
  'programYearObjectives',
  'recurringEvents',
  'schoolConfigs',
  'sessionDescriptions',
  'sessionLearningMaterials',
  'sessionObjectives',
  'sessionTypes',
  'userRoles',
  'userSessionMaterialStatuses',
];
export default function getName(string) {
  var camelString = models.find(function (item) {
    return string.toUpperCase() === item.toUpperCase();
  });

  return camelString ? camelString : string;
}
