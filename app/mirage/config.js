import getAll from './helpers/get-all';

export default function() {
    this.namespace = 'api';
    this.timing = 100;

    //hardcode the current session user id
    this.get('/currentsession', function(){
      return {currentsession: {userId: 4136}};
    });

    this.get('aamcmethods', getAll);
    this.get('aamcmethods/:id', 'aamcMethod');
    this.put('aamcmethods/:id', 'aamcMethod');
    this.delete('aamcmethods/:id', 'aamcMethod');
    this.post('aamcmethods', 'aamcMethod');

    this.get('aamcpcrs', getAll);
    this.get('aamcpcrs/:id', 'aamcPcr');
    this.put('aamcpcrs/:id', 'aamcPcr');
    this.delete('aamcpcrs/:id', 'aamcPcr');
    this.post('aamcpcrs', 'aamcPcr');

    this.get('alertchangetypes', getAll);
    this.get('alertchangetypes/:id', 'alertChangeType');
    this.put('alertchangetypes/:id', 'alertChangeType');
    this.delete('alertchangetypes/:id', 'alertChangeType');
    this.post('alertchangetypes', 'alertChangeType');

    this.get('alerts', getAll);
    this.get('alerts/:id', 'alert');
    this.put('alerts/:id', 'alert');
    this.delete('alerts/:id', 'alert');
    this.post('alerts', 'alert');

    this.get('cohorts', getAll);
    this.get('cohorts/:id', 'cohort');
    this.put('cohorts/:id', 'cohort');
    this.delete('cohorts/:id', 'cohort');
    this.post('cohorts', 'cohort');

    this.get('competencies', getAll);
    this.get('competencies/:id', 'competency');
    this.put('competencies/:id', 'competency');
    this.delete('competencies/:id', 'competency');
    this.post('competencies', 'competency');

    this.get('courseclerkshiptypes', getAll);
    this.get('courseclerkshiptypes/:id', 'courseClerkshipType');
    this.put('courseclerkshiptypes/:id', 'courseClerkshipType');
    this.delete('courseclerkshiptypes/:id', 'courseClerkshipType');
    this.post('courseclerkshiptypes', 'courseClerkshipType');

    this.get('courselearningmaterials', getAll);
    this.get('courselearningmaterials/:id', 'courseLearningMaterial');
    this.put('courselearningmaterials/:id', 'courseLearningMaterial');
    this.delete('courselearningmaterials/:id', 'courseLearningMaterial');
    this.post('courselearningmaterials', 'courseLearningMaterial');

    this.get('courses', getAll);
    this.get('courses/:id', 'course');
    this.put('courses/:id', 'course');
    this.delete('courses/:id', 'course');
    this.post('courses', 'course');

    this.get('curriculuminventoryacademiclevels', getAll);
    this.get('curriculuminventoryacademiclevels/:id', 'curriculumInventoryAcademicLevel');
    this.put('curriculuminventoryacademiclevels/:id', 'curriculumInventoryAcademicLevel');
    this.delete('curriculuminventoryacademiclevels/:id', 'curriculumInventoryAcademicLevel');
    this.post('curriculuminventoryacademiclevels', 'curriculumInventoryAcademicLevel');

    this.get('curriculuminventoryexports', getAll);
    this.get('curriculuminventoryexports/:id', 'curriculumInventoryExport');
    this.put('curriculuminventoryexports/:id', 'curriculumInventoryExport');
    this.delete('curriculuminventoryexports/:id', 'curriculumInventoryExport');
    this.post('curriculuminventoryexports', 'curriculumInventoryExport');

    this.get('curriculuminventoryinstitutions', getAll);
    this.get('curriculuminventoryinstitutions/:id', 'curriculumInventoryInstitution');
    this.put('curriculuminventoryinstitutions/:id', 'curriculumInventoryInstitution');
    this.delete('curriculuminventoryinstitutions/:id', 'curriculumInventoryInstitution');
    this.post('curriculuminventoryinstitutions', 'curriculumInventoryInstitution');

    this.get('curriculuminventoryreports', getAll);
    this.get('curriculuminventoryreports/:id', 'curriculumInventoryReport');
    this.put('curriculuminventoryreports/:id', 'curriculumInventoryReport');
    this.delete('curriculuminventoryreports/:id', 'curriculumInventoryReport');
    this.post('curriculuminventoryreports', 'curriculumInventoryReport');

    this.get('curriculuminventorysequenceblocks', getAll);
    this.get('curriculuminventorysequenceblocks/:id', 'curriculumInventorySequenceBlock');
    this.put('curriculuminventorysequenceblocks/:id', 'curriculumInventorySequenceBlock');
    this.delete('curriculuminventorysequenceblocks/:id', 'curriculumInventorySequenceBlock');
    this.post('curriculuminventorysequenceblocks', 'curriculumInventorySequenceBlock');

    this.get('curriculuminventorysequences', getAll);
    this.get('curriculuminventorysequences/:id', 'curriculumInventorySequence');
    this.put('curriculuminventorysequences/:id', 'curriculumInventorySequence');
    this.delete('curriculuminventorysequences/:id', 'curriculumInventorySequence');
    this.post('curriculuminventorysequences', 'curriculumInventorySequence');

    this.get('departments', getAll);
    this.get('departments/:id', 'department');
    this.put('departments/:id', 'department');
    this.delete('departments/:id', 'department');
    this.post('departments', 'department');

    this.get('disciplines', getAll);
    this.get('disciplines/:id', 'discipline');
    this.put('disciplines/:id', 'discipline');
    this.delete('disciplines/:id', 'discipline');
    this.post('disciplines', 'discipline');

    this.get('educationalyears', getAll);
    this.get('educationalyears/:id', 'educationalYear');
    this.put('educationalyears/:id', 'educationalYear');
    this.delete('educationalyears/:id', 'educationalYear');
    this.post('educationalyears', 'educationalYear');

    this.get('ilmsessions', getAll);
    this.get('ilmsessions/:id', 'ilmSession');
    this.put('ilmsessions/:id', 'ilmSession');
    this.delete('ilmsessions/:id', 'ilmSession');
    this.post('ilmsessions', 'ilmSession');

    this.get('instructionhours', getAll);
    this.get('instructionhours/:id', 'instructionHour');
    this.put('instructionhours/:id', 'instructionHour');
    this.delete('instructionhours/:id', 'instructionHour');
    this.post('instructionhours', 'instructionHour');

    this.get('instructorgroups', getAll);
    this.get('instructorgroups/:id', 'instructorGroup');
    this.put('instructorgroups/:id', 'instructorGroup');
    this.delete('instructorgroups/:id', 'instructorGroup');
    this.post('instructorgroups', 'instructorGroup');

    this.get('learnergroups', getAll);
    this.get('learnergroups/:id', 'learnerGroup');
    this.put('learnergroups/:id', 'learnerGroup');
    this.delete('learnergroups/:id', 'learnerGroup');
    this.post('learnergroups', 'learnerGroup');

    this.get('learningmaterialstatuses', getAll);
    this.get('learningmaterialstatuses/:id', 'learningMaterialStatus');
    this.put('learningmaterialstatuses/:id', 'learningMaterialStatus');
    this.delete('learningmaterialstatuses/:id', 'learningMaterialStatus');
    this.post('learningmaterialstatuses', 'learningMaterialStatus');

    this.get('learningmaterialuserroles', getAll);
    this.get('learningmaterialuserroles/:id', 'learningMaterialUserRole');
    this.put('learningmaterialuserroles/:id', 'learningMaterialUserRole');
    this.delete('learningmaterialuserroles/:id', 'learningMaterialUserRole');
    this.post('learningmaterialuserroles', 'learningMaterialUserRole');

    this.get('learningmaterials', getAll);
    this.get('learningmaterials/:id', 'learningMaterial');
    this.put('learningmaterials/:id', 'learningMaterial');
    this.delete('learningmaterials/:id', 'learningMaterial');
    this.post('learningmaterials', 'learningMaterial');

    this.get('meshconcepts', getAll);
    this.get('meshconcepts/:id', 'meshConcept');
    this.put('meshconcepts/:id', 'meshConcept');
    this.delete('meshconcepts/:id', 'meshConcept');
    this.post('meshconcepts', 'meshConcept');

    this.get('meshdescriptors', getAll);
    this.get('meshdescriptors/:id', 'meshDescriptor');
    this.put('meshdescriptors/:id', 'meshDescriptor');
    this.delete('meshdescriptors/:id', 'meshDescriptor');
    this.post('meshdescriptors', 'meshDescriptor');

    this.get('meshqualifiers', getAll);
    this.get('meshqualifiers/:id', 'meshQualifier');
    this.put('meshqualifiers/:id', 'meshQualifier');
    this.delete('meshqualifiers/:id', 'meshQualifier');
    this.post('meshqualifiers', 'meshQualifier');

    this.get('objectives', getAll);
    this.get('objectives/:id', 'objective');
    this.put('objectives/:id', 'objective');
    this.delete('objectives/:id', 'objective');
    this.post('objectives', 'objective');

    this.get('offerings', getAll);
    this.get('offerings/:id', 'offering');
    this.put('offerings/:id', 'offering');
    this.delete('offerings/:id', 'offering');
    this.post('offerings', 'offering');

    this.get('programyears', getAll);
    this.get('programyears/:id', 'programYear');
    this.put('programyears/:id', 'programYear');
    this.delete('programyears/:id', 'programYear');
    this.post('programyears', 'programYear');

    this.get('programyearstewards', getAll);
    this.get('programyearstewards/:id', 'programYearSteward');
    this.put('programyearstewards/:id', 'programYearSteward');
    this.delete('programyearstewards/:id', 'programYearSteward');
    this.post('programyearstewards', 'programYearSteward');

    this.get('programs', getAll);
    this.get('programs/:id', 'program');
    this.put('programs/:id', 'program');
    this.delete('programs/:id', 'program');
    this.post('programs', 'program');

    this.get('publishevents', getAll);
    this.get('publishevents/:id', 'publishEvent');
    this.put('publishevents/:id', 'publishEvent');
    this.delete('publishevents/:id', 'publishEvent');
    this.post('publishevents', 'publishEvent');

    this.get('recurringevents', getAll);
    this.get('recurringevents/:id', 'recurringEvent');
    this.put('recurringevents/:id', 'recurringEvent');
    this.delete('recurringevents/:id', 'recurringEvent');
    this.post('recurringevents', 'recurringEvent');

    this.get('reports', getAll);
    this.get('reports/:id', 'report');
    this.put('reports/:id', 'report');
    this.delete('reports/:id', 'report');
    this.post('reports', 'report');

    this.get('schools', getAll);
    this.get('schools/:id', 'school');
    this.put('schools/:id', 'school');
    this.delete('schools/:id', 'school');
    this.post('schools', 'school');

    this.get('sessiondescriptions', getAll);
    this.get('sessiondescriptions/:id', 'sessionDescription');
    this.put('sessiondescriptions/:id', 'sessionDescription');
    this.delete('sessiondescriptions/:id', 'sessionDescription');
    this.post('sessiondescriptions', 'sessionDescription');

    this.get('sessionlearningmaterials', getAll);
    this.get('sessionlearningmaterials/:id', 'sessionLearningMaterial');
    this.put('sessionlearningmaterials/:id', 'sessionLearningMaterial');
    this.delete('sessionlearningmaterials/:id', 'sessionLearningMaterial');
    this.post('sessionlearningmaterials', 'sessionLearningMaterial');

    this.get('sessiontypes', getAll);
    this.get('sessiontypes/:id', 'sessionType');
    this.put('sessiontypes/:id', 'sessionType');
    this.delete('sessiontypes/:id', 'sessionType');
    this.post('sessiontypes', 'sessionType');

    this.get('sessions', getAll);
    this.get('sessions/:id', 'session');
    this.put('sessions/:id', 'session');
    this.delete('sessions/:id', 'session');
    this.post('sessions', 'session');

    this.get('userroles', getAll);
    this.get('userroles/:id', 'userRole');
    this.put('userroles/:id', 'userRole');
    this.delete('userroles/:id', 'userRole');
    this.post('userroles', 'userRole');

    this.get('users', getAll);
    this.get('users/:id', 'user');
    this.put('users/:id', 'user');
    this.delete('users/:id', 'user');
    this.post('users', 'user');

    this.get('/userevents/4136', function(db) {
      return {
        userEvents: db.userevents
      };
    });
}
