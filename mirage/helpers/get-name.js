var models = [
  'aamcMethods',
  'aamcPcrs',
  'academicYears',
  'alertChangeTypes',
  'courseLearningMaterials',
  'courseClerkshipTypes',
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
  'programYearStewards',
  'recurringEvents',
  'sessionDescriptions',
  'sessionLearningMaterials',
  'sessionTypes',
  'userRoles',
];
export default function getName(string){
  var camelString = models.find(function(item){
    return string.toUpperCase() === item.toUpperCase();
  });

  return camelString?camelString:string;
}
