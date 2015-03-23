var models = [
  'aamcMethods',
  'aamcPcrs',
  'alertChangeTypes',
  'courseLearningMaterials',
  'courseClerkshipTypes',
  'curriculumInventoryAcademicLevels',
  'curriculumInventoryExports',
  'curriculumInventoryInstitutions',
  'curriculumInventoryReports',
  'curriculumInventorySequenceBlocks',
  'curriculumInventorySequences',
  'educationalYears',
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
  'programYears',
  'publishEvents',
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
