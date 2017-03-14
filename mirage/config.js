import moment from 'moment';
import getAll from './helpers/get-all';
import Mirage from 'ember-cli-mirage';
import ENV from 'ilios/config/environment';

const { apiVersion } = ENV.APP;

export default function() {
  this.timing = 100;
  this.passthrough('/write-coverage');
  this.namespace = '/';


  this.get('api/aamcmethods', getAll);
  this.get('api/aamcmethods/:id', 'aamcMethod');
  this.put('api/aamcmethods/:id', 'aamcMethod');
  this.delete('api/aamcmethods/:id', 'aamcMethod');
  this.post('api/aamcmethods', 'aamcMethod');

  this.get('api/aamcpcrs', getAll);
  this.get('api/aamcpcrs/:id', 'aamcPcr');
  this.put('api/aamcpcrs/:id', 'aamcPcr');
  this.delete('api/aamcpcrs/:id', 'aamcPcr');
  this.post('api/aamcpcrs', 'aamcPcr');

  this.get('api/academicyears', getAll);
  this.get('api/academicyears/:id', 'academicYear');
  this.put('api/academicyears/:id', 'academicYear');
  this.delete('api/academicyears/:id', 'academicYear');
  this.post('api/academicyears', 'academicYear');

  this.get('api/alertchangetypes', getAll);
  this.get('api/alertchangetypes/:id', 'alertChangeType');
  this.put('api/alertchangetypes/:id', 'alertChangeType');
  this.delete('api/alertchangetypes/:id', 'alertChangeType');
  this.post('api/alertchangetypes', 'alertChangeType');

  this.get('api/alerts', getAll);
  this.get('api/alerts/:id', 'alert');
  this.put('api/alerts/:id', 'alert');
  this.delete('api/alerts/:id', 'alert');
  this.post('api/alerts', 'alert');

  this.get('api/authentications', getAll);
  this.get('api/authentications/:id', 'authentication');
  this.put('api/authentications/:id', 'authentication');
  this.delete('api/authentications/:id', 'authentication');
  this.post('api/authentications', 'authentication');

  this.get('api/cohorts', (db, request) => {
    const params = request.queryParams;
    const keys = Object.keys(params);
    const schoolKey = 'filters[schools]';
    if (keys.includes(schoolKey)) {
      const schoolsFilter = params[schoolKey];
      const cohorts = db.cohorts.filter(cohort => {
        const programYearId = parseInt(cohort.programYear);
        const programYear = db.programYears.find(programYearId);
        const programId = parseInt(programYear.program);
        const program = db.programs.find(programId);
        const schoolId = program.school;

        return schoolsFilter.includes(schoolId.toString());
      });

      return {cohorts};

    } else {
      return getAll(db, request);
    }
  });
  this.get('api/cohorts/:id', 'cohort');
  this.put('api/cohorts/:id', 'cohort');
  this.delete('api/cohorts/:id', 'cohort');
  this.post('api/cohorts', 'cohort');

  this.get('api/competencies', getAll);
  this.get('api/competencies/:id', 'competency');
  this.put('api/competencies/:id', 'competency');
  this.delete('api/competencies/:id', 'competency');
  this.post('api/competencies', 'competency');

  this.get('api/courseclerkshiptypes', getAll);
  this.get('api/courseclerkshiptypes/:id', 'courseClerkshipType');
  this.put('api/courseclerkshiptypes/:id', 'courseClerkshipType');
  this.delete('api/courseclerkshiptypes/:id', 'courseClerkshipType');
  this.post('api/courseclerkshiptypes', 'courseClerkshipType');

  this.get('api/courselearningmaterials', getAll);
  this.get('api/courselearningmaterials/:id', 'courseLearningMaterial');
  this.put('api/courselearningmaterials/:id', 'courseLearningMaterial');
  this.delete('api/courselearningmaterials/:id', 'courseLearningMaterial');
  this.post('api/courselearningmaterials', 'courseLearningMaterial');

  this.get('api/courses', getAll);
  this.get('api/courses/:id', 'course');
  this.put('api/courses/:id', 'course');
  this.delete('api/courses/:id', 'course');
  this.post('api/courses', 'course');

  this.get('api/curriculuminventoryacademiclevels', getAll);
  this.get('api/curriculuminventoryacademiclevels/:id', 'curriculumInventoryAcademicLevel');
  this.put('api/curriculuminventoryacademiclevels/:id', 'curriculumInventoryAcademicLevel');
  this.delete('api/curriculuminventoryacademiclevels/:id', 'curriculumInventoryAcademicLevel');
  this.post('api/curriculuminventoryacademiclevels', 'curriculumInventoryAcademicLevel');

  this.get('api/curriculuminventoryexports', getAll);
  this.get('api/curriculuminventoryexports/:id', 'curriculumInventoryExport');
  this.put('api/curriculuminventoryexports/:id', 'curriculumInventoryExport');
  this.delete('api/curriculuminventoryexports/:id', 'curriculumInventoryExport');
  this.post('api/curriculuminventoryexports', 'curriculumInventoryExport');

  this.get('api/curriculuminventoryinstitutions', getAll);
  this.get('api/curriculuminventoryinstitutions/:id', 'curriculumInventoryInstitution');
  this.put('api/curriculuminventoryinstitutions/:id', 'curriculumInventoryInstitution');
  this.delete('api/curriculuminventoryinstitutions/:id', 'curriculumInventoryInstitution');
  this.post('api/curriculuminventoryinstitutions', 'curriculumInventoryInstitution');

  this.get('api/curriculuminventoryreports', getAll);
  this.get('api/curriculuminventoryreports/:id', 'curriculumInventoryReport');
  this.put('api/curriculuminventoryreports/:id', 'curriculumInventoryReport');
  this.delete('api/curriculuminventoryreports/:id', 'curriculumInventoryReport');
  this.post('api/curriculuminventoryreports', 'curriculumInventoryReport');

  this.get('api/curriculuminventorysequenceblocks', getAll);
  this.get('api/curriculuminventorysequenceblocks/:id', 'curriculumInventorySequenceBlock');
  this.put('api/curriculuminventorysequenceblocks/:id', 'curriculumInventorySequenceBlock');
  this.delete('api/curriculuminventorysequenceblocks/:id', 'curriculumInventorySequenceBlock');
  this.post('api/curriculuminventorysequenceblocks', 'curriculumInventorySequenceBlock');

  this.get('api/curriculuminventorysequences', getAll);
  this.get('api/curriculuminventorysequences/:id', 'curriculumInventorySequence');
  this.put('api/curriculuminventorysequences/:id', 'curriculumInventorySequence');
  this.delete('api/curriculuminventorysequences/:id', 'curriculumInventorySequence');
  this.post('api/curriculuminventorysequences', 'curriculumInventorySequence');

  this.get('api/departments', getAll);
  this.get('api/departments/:id', 'department');
  this.put('api/departments/:id', 'department');
  this.delete('api/departments/:id', 'department');
  this.post('api/departments', 'department');

  this.get('api/vocabularies', getAll);
  this.get('api/vocabularies/:id', 'vocabulary');
  this.put('api/vocabularies/:id', 'vocabulary');
  this.delete('api/vocabularies/:id', 'vocabulary');
  this.post('api/vocabularies', 'vocabulary');

  this.get('api/terms', getAll);
  this.get('api/terms/:id', 'term');
  this.put('api/terms/:id', 'term');
  this.delete('api/terms/:id', 'term');
  this.post('api/terms', 'term');

  this.get('api/ilmsessions', getAll);
  this.get('api/ilmsessions/:id', 'ilmSession');
  this.put('api/ilmsessions/:id', 'ilmSession');
  this.delete('api/ilmsessions/:id', 'ilmSession');
  this.post('api/ilmsessions', 'ilmSession');

  this.get('api/instructorgroups', getAll);
  this.get('api/instructorgroups/:id', 'instructorGroup');
  this.put('api/instructorgroups/:id', 'instructorGroup');
  this.delete('api/instructorgroups/:id', 'instructorGroup');
  this.post('api/instructorgroups', 'instructorGroup');

  this.get('api/learnergroups', getAll);
  this.get('api/learnergroups/:id', 'learnerGroup');
  this.put('api/learnergroups/:id', 'learnerGroup');
  this.delete('api/learnergroups/:id', 'learnerGroup');
  this.post('api/learnergroups', 'learnerGroup');

  this.get('api/learningmaterialstatuses', getAll);
  this.get('api/learningmaterialstatuses/:id', 'learningMaterialStatus');
  this.put('api/learningmaterialstatuses/:id', 'learningMaterialStatus');
  this.delete('api/learningmaterialstatuses/:id', 'learningMaterialStatus');
  this.post('api/learningmaterialstatuses', 'learningMaterialStatus');

  this.get('api/learningmaterialuserroles', getAll);
  this.get('api/learningmaterialuserroles/:id', 'learningMaterialUserRole');
  this.put('api/learningmaterialuserroles/:id', 'learningMaterialUserRole');
  this.delete('api/learningmaterialuserroles/:id', 'learningMaterialUserRole');
  this.post('api/learningmaterialuserroles', 'learningMaterialUserRole');

  this.get('api/learningmaterials', getAll);
  this.get('api/learningmaterials/:id', 'learningMaterial');
  this.put('api/learningmaterials/:id', 'learningMaterial');
  this.delete('api/learningmaterials/:id', 'learningMaterial');
  this.post('api/learningmaterials', 'learningMaterial');

  this.get('api/meshconcepts', getAll);
  this.get('api/meshconcepts/:id', 'meshConcept');
  this.put('api/meshconcepts/:id', 'meshConcept');
  this.delete('api/meshconcepts/:id', 'meshConcept');
  this.post('api/meshconcepts', 'meshConcept');

  this.get('api/meshdescriptors', getAll);
  this.get('api/meshdescriptors/:id', 'meshDescriptor');
  this.put('api/meshdescriptors/:id', 'meshDescriptor');
  this.delete('api/meshdescriptors/:id', 'meshDescriptor');
  this.post('api/meshdescriptors', 'meshDescriptor');

  this.get('api/meshqualifiers', getAll);
  this.get('api/meshqualifiers/:id', 'meshQualifier');
  this.put('api/meshqualifiers/:id', 'meshQualifier');
  this.delete('api/meshqualifiers/:id', 'meshQualifier');
  this.post('api/meshqualifiers', 'meshQualifier');

  this.get('api/meshtrees', getAll);
  this.get('api/meshtrees/:id', 'meshTree');
  this.put('api/meshtrees/:id', 'meshTree');
  this.delete('api/meshtrees/:id', 'meshTree');
  this.post('api/meshtrees', 'meshTree');


  this.get('api/meshpreviousindexings', getAll);
  this.get('api/meshpreviousindexings/:id', 'meshPreviousIndexing');
  this.put('api/meshpreviousindexings/:id', 'meshPreviousIndexing');
  this.delete('api/meshpreviousindexings/:id', 'meshPreviousIndexing');
  this.post('api/meshpreviousindexings', 'meshPreviousIndexing');

  this.get('api/objectives', getAll);
  this.get('api/objectives/:id', 'objective');
  this.put('api/objectives/:id', 'objective');
  this.delete('api/objectives/:id', 'objective');
  this.post('api/objectives', 'objective');

  this.get('api/offerings', getAll);
  this.get('api/offerings/:id', 'offering');
  this.put('api/offerings/:id', 'offering');
  this.delete('api/offerings/:id', 'offering');
  this.post('api/offerings', 'offering');

  this.get('api/pendinguserupdates', getAll);
  this.get('api/pendinguserupdates/:id');
  this.put('api/pendinguserupdates/:id');
  this.del('api/pendinguserupdates/:id');
  this.post('api/pendinguserupdates');

  this.get('api/permissions', getAll);
  this.get('api/permissions/:id', 'permission');
  this.put('api/permissions/:id', 'permission');
  this.delete('api/permissions/:id', 'permission');
  this.post('api/permissions', 'permission');

  this.get('api/programyears', getAll);
  this.get('api/programyears/:id', 'programYear');
  this.put('api/programyears/:id', 'programYear');
  this.delete('api/programyears/:id', 'programYear');
  this.post('api/programyears', function({db}, request) {
    let attrs = JSON.parse(request.requestBody);
    let record = db.programYears.insert(attrs);
    let programRecord = db.programs.find(record.programYear.program);
    let cohortAttr = {
      programYear: record.id,
      title: 'Class of ' + (parseInt(programRecord.duration, 10) + parseInt(record.programYear.startYear, 10))
    };
    const cohortRecord = db.cohorts.insert(cohortAttr);
    record.programYear.cohort = cohortRecord.id;
    record = db.programYears.update(record.id, record.programYear);
    return {
      programYears: record
    };
  });

  this.get('api/programyearstewards', getAll);
  this.get('api/programyearstewards/:id', 'programYearSteward');
  this.put('api/programyearstewards/:id', 'programYearSteward');
  this.delete('api/programyearstewards/:id', 'programYearSteward');
  this.post('api/programyearstewards', 'programYearSteward');

  this.get('api/programs', getAll);
  this.get('api/programs/:id', 'program');
  this.put('api/programs/:id', 'program');
  this.delete('api/programs/:id', 'program');
  this.post('api/programs', 'program');

  this.get('api/reports', getAll);
  this.get('api/reports/:id', 'report');
  this.put('api/reports/:id', 'report');
  this.delete('api/reports/:id', 'report');
  this.post('api/reports', 'report');

  this.get('api/schools', getAll);
  this.get('api/schools/:id', 'school');
  this.put('api/schools/:id', 'school');
  this.delete('api/schools/:id', 'school');
  this.post('api/schools', 'school');

  this.get('api/schoolconfigs', getAll);
  this.get('api/schoolconfigs/:id', 'schoolConfig');
  this.put('api/schoolconfigs/:id', 'schoolConfig');
  this.delete('api/schoolconfigs/:id', 'schoolConfig');
  this.post('api/schoolconfigs', 'schoolConfig');

  this.get('api/sessiondescriptions', getAll);
  this.get('api/sessiondescriptions/:id', 'sessionDescription');
  this.put('api/sessiondescriptions/:id', 'sessionDescription');
  this.delete('api/sessiondescriptions/:id', 'sessionDescription');
  this.post('api/sessiondescriptions', 'sessionDescription');

  this.get('api/sessionlearningmaterials', getAll);
  this.get('api/sessionlearningmaterials/:id', 'sessionLearningMaterial');
  this.put('api/sessionlearningmaterials/:id', 'sessionLearningMaterial');
  this.delete('api/sessionlearningmaterials/:id', 'sessionLearningMaterial');

  this.post('api/sessionlearningmaterials', function({db}, request) {
    let attrs = JSON.parse(request.requestBody);
    let record = db.sessionLearningMaterials.insert(attrs);
    let lm = db.learningMaterials.find(record.learningMaterial);

    if(lm){
      lm.sessionLearningMaterials.pushObject(record);
    }
    return {
      sessionLearningMaterial: record
    };
  });

  this.get('api/sessiontypes', getAll);
  this.get('api/sessiontypes/:id', 'sessionType');
  this.put('api/sessiontypes/:id', 'sessionType');
  this.delete('api/sessiontypes/:id', 'sessionType');
  this.post('api/sessiontypes', 'sessionType');

  this.get('api/sessions', getAll);
  this.get('api/sessions/:id', 'session');
  this.put('api/sessions/:id', 'session');
  this.delete('api/sessions/:id', 'session');
  this.post('api/sessions', 'session');

  this.get('api/userroles', getAll);
  this.get('api/userroles/:id', 'userRole');
  this.put('api/userroles/:id', 'userRole');
  this.delete('api/userroles/:id', 'userRole');
  this.post('api/userroles', 'userRole');

  this.get('api/users', getAll);
  this.get('api/users/:id');
  this.put('api/users/:id');
  this.del('api/users/:id');
  this.post('api/users');

  this.get('api/userevents/:userid', function({db}, request) {
    let from = moment.unix(request.queryParams.from);
    let to = moment.unix(request.queryParams.to);
    let userid = parseInt(request.params.userid);
    let userEvents = db.userevents.filter(event => {
      return (
        event.user === userid &&
        (from.isSame(event.startDate) || from.isBefore(event.startDate)) &&
        (to.isSame(event.endDate) || to.isAfter(event.endDate))
      );
    });
    return {
      userEvents: userEvents
    };
  });

  this.get('api/schoolevents/:schoolid', function({db}, request) {
    let from = moment.unix(request.queryParams.from);
    let to = moment.unix(request.queryParams.to);
    let schoolId = parseInt(request.params.schoolid);
    let schoolEvents = db.schoolevents.filter(event => {
      return (
        event.school === schoolId &&
        (from.isSame(event.startDate) || from.isBefore(event.startDate)) &&
        (to.isSame(event.endDate) || to.isAfter(event.endDate))
      );
    });
    return {
      events: schoolEvents
    };
  });

  this.post('auth/login', function({db}, request) {
    let errors = [];
    var attrs = JSON.parse(request.requestBody);
    if(!('username' in attrs) || !attrs.username){
      errors.push('missingUsername');
    }
    if(!('password' in attrs) || !attrs.password){
      errors.push('missingPassword');
    }
    let username = attrs.username.toLowerCase();
    if(errors.length === 0){
      if(username === 'demo' && attrs.password === 'demo'){
        let now = moment();
        let nextWeek = now.clone().add(1, 'week');
        let header = '{"alg":"none"}';
        let body = `{"iss": "ilios","aud": "ilios","iat": "${now.format('X')}","exp": "${nextWeek.format('X')}","user_id": 4136}`;

        let encodedData =  window.btoa(header) + '.' +  window.btoa(body) + '.';
        return {
          jwt: encodedData
        };
      } else {
        errors.push('badCredentials');
      }
    }
    return new Mirage.Response(400, {}, {errors: errors});
  });

  this.get('auth/logout', function() {
    return new Mirage.Response(200);
  });

  this.post('upload', function() {
    let hash = "";
    let allowedChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 32; i++ ) {
      hash += allowedChars.charAt(Math.floor(Math.random() * allowedChars.length));
    }

    return {
      filename: 'bogus.txt',
      fileHash: hash
    };
  });

  this.get('auth/whoami', function() {
    return {
      userId: 4136
    };
  });

  this.get('application/config', function() {
    return { config: {
      type: 'form',
      apiVersion
    }};
    // return { config: {
    //   type: 'shibboleth',
    //   shibbolethLoginUrl: '/fakeshiblogin'
    // }};
  });

  this.get('auth/token', function() {
    //un comment to send unauthenticated user data
    // return {
    //   jwt: null
    // };
    let now = moment();
    let nextWeek = now.clone().add(1, 'week');
    let header = '{"alg":"none"}';
    let body = `{"iss": "ilios","aud": "ilios","iat": "${now.format('X')}","exp": "${nextWeek.format('X')}","user_id": 4136}`;

    let encodedData =  window.btoa(header) + '.' +  window.btoa(body) + '.';
    return {
      jwt: encodedData
    };
  });

  this.post('errors', function(){
    //doesn't do anything, just swallows errors
  });
}
