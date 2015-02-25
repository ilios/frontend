module.exports = function(app) {
  var createRouter = require('../helpers/createrouter.js');
  var fixtureStorage = require('../helpers/fixtureStorage.js');
  var models = [
    'aamcMethods',
    'aamcPcrs',
    'alertChangeTypes',
    'alerts',
    'cohorts',
    'competencies',
    'courseLearningMaterials',
    'courses',
    'curriculumInventoryAcademicLevels',
    'curriculumInventoryExports',
    'curriculumInventoryInstitutions',
    'curriculumInventoryReports',
    'curriculumInventorySequenceBlocks',
    'curriculumInventorySequences',
    'departments',
    'disciplines',
    'educationalYears',
    'ilmSessions',
    'instructionHours',
    'instructorGroups',
    'learnerGroups',
    'learningMaterialStatuses',
    'learningMaterialUserRoles',
    'learningMaterials',
    'meshConcepts',
    'meshQualifiers',
    'objectives',
    'offerings',
    'programYears',
    'programs',
    'publishEvents',
    'recurringEvents',
    'reports',
    'schools',
    'sessionDescriptions',
    'sessionLearningMaterials',
    'sessionTypes',
    'sessions',
    'userRoles',
  ];

  for(var i = 0; i < models.length; i++){
    var str = models[i];
    var fixtures = fixtureStorage.get(str);
    var router = createRouter(str);
    app.use('/api/' + str, router);
  }


};
