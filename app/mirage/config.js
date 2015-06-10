import getAll from './helpers/get-all';
import Ember from 'ember';

export default function() {
    this.namespace = 'api';
    this.timing = 100;

    //hardcode the current session user id
    this.get('/currentsession', function() {
      return {currentsession: {userId: 4136}};
    });

    var models = [
      'aamcMethods',
      'aamcPcrs',
      'alertChangeTypes',
      'alerts',
      'cohorts',
      'competencies',
      'courseClerkshipTypes',
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
      'meshDescriptors',
      'meshQualifiers',
      'objectives',
      'offerings',
      'programYears',
      'programYearStewards',
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
      'users'
    ];

    var inflector = Ember.Inflector.inflector;

    for(let i = 0; i < models.length; i++){
      let model = models[i];
      let route = model.toLowerCase();
      this.get('/' + route, getAll);
      this.get('/' + route + '/:id', inflector.singularize(model));

      this.post('/' + route, inflector.singularize(model));
      this.put('/' + route + '/:id', inflector.singularize(model));
      this.delete('/' + route + '/:id', inflector.singularize(model));
    }

    this.get('/userevents/4136', 'userevent');
}
