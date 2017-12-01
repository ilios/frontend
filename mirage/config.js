import moment from 'moment';
import getAll from './helpers/get-all';
import parseJsonData from './helpers/parse-json-data';
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
  this.del('api/aamcmethods/:id', 'aamcMethod');
  this.post('api/aamcmethods', 'aamcMethod');

  this.get('api/aamcpcrs', getAll);
  this.get('api/aamcpcrs/:id', 'aamcPcr');
  this.put('api/aamcpcrs/:id', 'aamcPcr');
  this.del('api/aamcpcrs/:id', 'aamcPcr');
  this.post('api/aamcpcrs', 'aamcPcr');

  this.get('api/academicyears', getAll);
  this.get('api/academicyears/:id', 'academicYear');
  this.put('api/academicyears/:id', 'academicYear');
  this.del('api/academicyears/:id', 'academicYear');
  this.post('api/academicyears', 'academicYear');

  this.get('api/authentications', getAll);
  this.get('api/authentications/:id', 'authentication');
  this.put('api/authentications/:id', 'authentication');
  this.del('api/authentications/:id', 'authentication');
  this.post('api/authentications', 'authentication');

  this.get('api/cohorts', (schema, request) => {
    const params = request.queryParams;
    const keys = Object.keys(params);
    const schoolKey = 'filters[schools]';
    if (keys.includes(schoolKey)) {
      const schoolsFilter = params[schoolKey];
      const cohorts = schema.cohorts.all().filter(cohort => {
        const school = cohort.programYear.program.school;

        return schoolsFilter.includes(school.id);
      });

      return cohorts;

    } else {
      return getAll(schema, request);
    }
  });
  this.get('api/cohorts/:id', 'cohort');
  this.put('api/cohorts/:id', 'cohort');
  this.del('api/cohorts/:id', 'cohort');
  this.post('api/cohorts', 'cohort');

  this.get('api/competencies', getAll);
  this.get('api/competencies/:id', 'competency');
  this.put('api/competencies/:id', 'competency');
  this.del('api/competencies/:id', 'competency');
  this.post('api/competencies', 'competency');

  this.get('api/courseclerkshiptypes', getAll);
  this.get('api/courseclerkshiptypes/:id', 'courseClerkshipType');
  this.put('api/courseclerkshiptypes/:id', 'courseClerkshipType');
  this.del('api/courseclerkshiptypes/:id', 'courseClerkshipType');
  this.post('api/courseclerkshiptypes', 'courseClerkshipType');

  this.get('api/courselearningmaterials', getAll);
  this.get('api/courselearningmaterials/:id', 'courseLearningMaterial');
  this.put('api/courselearningmaterials/:id', 'courseLearningMaterial');
  this.del('api/courselearningmaterials/:id', 'courseLearningMaterial');
  this.post('api/courselearningmaterials', 'courseLearningMaterial');

  this.get('api/courses', getAll);
  this.get('api/courses/:id', 'course');
  this.put('api/courses/:id', 'course');
  this.del('api/courses/:id', 'course');
  this.post('api/courses', 'course');

  this.get('api/curriculuminventoryacademiclevels', getAll);
  this.get('api/curriculuminventoryacademiclevels/:id', 'curriculumInventoryAcademicLevel');
  this.put('api/curriculuminventoryacademiclevels/:id', 'curriculumInventoryAcademicLevel');
  this.del('api/curriculuminventoryacademiclevels/:id', 'curriculumInventoryAcademicLevel');
  this.post('api/curriculuminventoryacademiclevels', 'curriculumInventoryAcademicLevel');

  this.get('api/curriculuminventoryexports', getAll);
  this.get('api/curriculuminventoryexports/:id', 'curriculumInventoryExport');
  this.put('api/curriculuminventoryexports/:id', 'curriculumInventoryExport');
  this.del('api/curriculuminventoryexports/:id', 'curriculumInventoryExport');
  this.post('api/curriculuminventoryexports', 'curriculumInventoryExport');

  this.get('api/curriculuminventoryinstitutions', getAll);
  this.get('api/curriculuminventoryinstitutions/:id', 'curriculumInventoryInstitution');
  this.put('api/curriculuminventoryinstitutions/:id', 'curriculumInventoryInstitution');
  this.del('api/curriculuminventoryinstitutions/:id', 'curriculumInventoryInstitution');
  this.post('api/curriculuminventoryinstitutions', 'curriculumInventoryInstitution');

  this.get('api/curriculuminventoryreports', getAll);
  this.get('api/curriculuminventoryreports/:id', 'curriculumInventoryReport');
  this.put('api/curriculuminventoryreports/:id', 'curriculumInventoryReport');
  this.del('api/curriculuminventoryreports/:id', 'curriculumInventoryReport');
  this.post('api/curriculuminventoryreports', 'curriculumInventoryReport');

  this.get('api/curriculuminventorysequenceblocks', getAll);
  this.get('api/curriculuminventorysequenceblocks/:id', 'curriculumInventorySequenceBlock');
  this.put('api/curriculuminventorysequenceblocks/:id', 'curriculumInventorySequenceBlock');
  this.del('api/curriculuminventorysequenceblocks/:id', 'curriculumInventorySequenceBlock');
  this.post('api/curriculuminventorysequenceblocks', 'curriculumInventorySequenceBlock');

  this.get('api/curriculuminventorysequences', getAll);
  this.get('api/curriculuminventorysequences/:id', 'curriculumInventorySequence');
  this.put('api/curriculuminventorysequences/:id', 'curriculumInventorySequence');
  this.del('api/curriculuminventorysequences/:id', 'curriculumInventorySequence');
  this.post('api/curriculuminventorysequences', 'curriculumInventorySequence');

  this.get('api/departments', getAll);
  this.get('api/departments/:id', 'department');
  this.put('api/departments/:id', 'department');
  this.del('api/departments/:id', 'department');
  this.post('api/departments', 'department');

  this.get('api/vocabularies', getAll);
  this.get('api/vocabularies/:id', 'vocabulary');
  this.put('api/vocabularies/:id', 'vocabulary');
  this.del('api/vocabularies/:id', 'vocabulary');
  this.post('api/vocabularies', 'vocabulary');

  this.get('api/terms', getAll);
  this.get('api/terms/:id', 'term');
  this.put('api/terms/:id', 'term');
  this.del('api/terms/:id', 'term');
  this.post('api/terms', 'term');

  this.get('api/ilmsessions', getAll);
  this.get('api/ilmsessions/:id', 'ilmSession');
  this.put('api/ilmsessions/:id', 'ilmSession');
  this.del('api/ilmsessions/:id', 'ilmSession');
  this.post('api/ilmsessions', 'ilmSession');

  this.get('api/instructorgroups', getAll);
  this.get('api/instructorgroups/:id', 'instructorGroup');
  this.put('api/instructorgroups/:id', 'instructorGroup');
  this.del('api/instructorgroups/:id', 'instructorGroup');
  this.post('api/instructorgroups', 'instructorGroup');

  this.get('api/learnergroups', getAll);
  this.get('api/learnergroups/:id', 'learnerGroup');
  this.put('api/learnergroups/:id', 'learnerGroup');
  this.del('api/learnergroups/:id', 'learnerGroup');
  this.post('api/learnergroups', 'learnerGroup');

  this.get('api/learningmaterialstatuses', getAll);
  this.get('api/learningmaterialstatuses/:id', 'learningMaterialStatus');
  this.put('api/learningmaterialstatuses/:id', 'learningMaterialStatus');
  this.del('api/learningmaterialstatuses/:id', 'learningMaterialStatus');
  this.post('api/learningmaterialstatuses', 'learningMaterialStatus');

  this.get('api/learningmaterialuserroles', getAll);
  this.get('api/learningmaterialuserroles/:id', 'learningMaterialUserRole');
  this.put('api/learningmaterialuserroles/:id', 'learningMaterialUserRole');
  this.del('api/learningmaterialuserroles/:id', 'learningMaterialUserRole');
  this.post('api/learningmaterialuserroles', 'learningMaterialUserRole');

  this.get('api/learningmaterials', getAll);
  this.get('api/learningmaterials/:id', 'learningMaterial');
  this.put('api/learningmaterials/:id', 'learningMaterial');
  this.del('api/learningmaterials/:id', 'learningMaterial');
  this.post('api/learningmaterials', 'learningMaterial');

  this.get('api/meshconcepts', getAll);
  this.get('api/meshconcepts/:id', 'meshConcept');
  this.put('api/meshconcepts/:id', 'meshConcept');
  this.del('api/meshconcepts/:id', 'meshConcept');
  this.post('api/meshconcepts', 'meshConcept');

  this.get('api/meshdescriptors', getAll);
  this.get('api/meshdescriptors/:id', 'meshDescriptor');
  this.put('api/meshdescriptors/:id', 'meshDescriptor');
  this.del('api/meshdescriptors/:id', 'meshDescriptor');
  this.post('api/meshdescriptors', 'meshDescriptor');

  this.get('api/meshqualifiers', getAll);
  this.get('api/meshqualifiers/:id', 'meshQualifier');
  this.put('api/meshqualifiers/:id', 'meshQualifier');
  this.del('api/meshqualifiers/:id', 'meshQualifier');
  this.post('api/meshqualifiers', 'meshQualifier');

  this.get('api/meshtrees', getAll);
  this.get('api/meshtrees/:id', 'meshTree');
  this.put('api/meshtrees/:id', 'meshTree');
  this.del('api/meshtrees/:id', 'meshTree');
  this.post('api/meshtrees', 'meshTree');


  this.get('api/meshpreviousindexings', getAll);
  this.get('api/meshpreviousindexings/:id', 'meshPreviousIndexing');
  this.put('api/meshpreviousindexings/:id', 'meshPreviousIndexing');
  this.del('api/meshpreviousindexings/:id', 'meshPreviousIndexing');
  this.post('api/meshpreviousindexings', 'meshPreviousIndexing');

  this.get('api/objectives', getAll);
  this.get('api/objectives/:id', 'objective');
  this.put('api/objectives/:id', 'objective');
  this.del('api/objectives/:id', 'objective');
  this.post('api/objectives', 'objective');

  this.get('api/offerings', getAll);
  this.get('api/offerings/:id', 'offering');
  this.put('api/offerings/:id', 'offering');
  this.del('api/offerings/:id', 'offering');
  this.post('api/offerings', 'offering');

  this.get('api/pendinguserupdates', getAll);
  this.get('api/pendinguserupdates/:id');
  this.put('api/pendinguserupdates/:id');
  this.del('api/pendinguserupdates/:id');
  this.post('api/pendinguserupdates');

  this.get('api/permissions', getAll);
  this.get('api/permissions/:id', 'permission');
  this.put('api/permissions/:id', 'permission');
  this.del('api/permissions/:id', 'permission');
  this.post('api/permissions', 'permission');

  this.get('api/programyears', getAll);
  this.get('api/programyears/:id', 'programYear');
  this.put('api/programyears/:id', 'programYear');
  this.del('api/programyears/:id', 'programYear');
  this.post('api/programyears', function (schema, request) {
    const jsonData = this.serializerOrRegistry.normalize(JSON.parse(request.requestBody), 'program-year');
    const attrs = parseJsonData(jsonData);
    const programYear = schema.programYears.create(attrs);
    const cohortAttr = {
      programYearId: programYear.id,
      title: 'Class of ' + (parseInt(programYear.program.duration, 10) + parseInt(programYear.startYear, 10))
    };
    const cohort = schema.cohorts.create(cohortAttr);
    programYear.cohort = cohort;
    return programYear;
  });

  this.get('api/programyearstewards', getAll);
  this.get('api/programyearstewards/:id', 'programYearSteward');
  this.put('api/programyearstewards/:id', 'programYearSteward');
  this.del('api/programyearstewards/:id', 'programYearSteward');
  this.post('api/programyearstewards', 'programYearSteward');

  this.get('api/programs', getAll);
  this.get('api/programs/:id', 'program');
  this.put('api/programs/:id', 'program');
  this.del('api/programs/:id', 'program');
  this.post('api/programs', 'program');

  this.get('api/reports', getAll);
  this.get('api/reports/:id', 'report');
  this.put('api/reports/:id', 'report');
  this.del('api/reports/:id', 'report');
  this.post('api/reports', 'report');

  this.get('api/schools', getAll);
  this.get('api/schools/:id', 'school');
  this.put('api/schools/:id', 'school');
  this.del('api/schools/:id', 'school');
  this.post('api/schools', 'school');

  this.get('api/schoolconfigs', getAll);
  this.get('api/schoolconfigs/:id', 'schoolConfig');
  this.put('api/schoolconfigs/:id', 'schoolConfig');
  this.del('api/schoolconfigs/:id', 'schoolConfig');
  this.post('api/schoolconfigs', 'schoolConfig');

  this.get('api/sessiondescriptions', getAll);
  this.get('api/sessiondescriptions/:id', 'sessionDescription');
  this.put('api/sessiondescriptions/:id', 'sessionDescription');
  this.del('api/sessiondescriptions/:id', 'sessionDescription');
  this.post('api/sessiondescriptions', 'sessionDescription');

  this.get('api/sessionlearningmaterials', getAll);
  this.get('api/sessionlearningmaterials/:id', 'sessionLearningMaterial');
  this.put('api/sessionlearningmaterials/:id', 'sessionLearningMaterial');
  this.del('api/sessionlearningmaterials/:id', 'sessionLearningMaterial');
  this.post('api/sessionlearningmaterials', 'sessionLearningMaterial') ;

  this.get('api/sessiontypes', getAll);
  this.get('api/sessiontypes/:id', 'sessionType');
  this.put('api/sessiontypes/:id', 'sessionType');
  this.del('api/sessiontypes/:id', 'sessionType');
  this.post('api/sessiontypes', 'sessionType');

  this.get('api/sessions', (schema, request) => {
    const params = request.queryParams;
    const keys = Object.keys(params);
    const schoolKey = 'filters[schools]';
    if (keys.includes(schoolKey)) {
      const schoolsFilter = params[schoolKey];
      const sessions = schema.sessions.all().filter(session => {
        const school = session.course.school;

        return schoolsFilter.includes(school.id);
      });

      return sessions;

    } else {
      return getAll(schema, request);
    }
  });
  this.get('api/sessions/:id', 'session');
  this.put('api/sessions/:id', 'session');
  this.del('api/sessions/:id', 'session');
  this.post('api/sessions', 'session');

  this.get('api/userroles', getAll);
  this.get('api/userroles/:id', 'userRole');
  this.put('api/userroles/:id', 'userRole');
  this.del('api/userroles/:id', 'userRole');
  this.post('api/userroles', 'userRole');

  this.get('api/users', getAll);
  this.get('api/users/:id');
  this.put('api/users/:id');
  this.del('api/users/:id');
  this.post('api/users');

  this.get('api/userevents/:userid', function({ db }, request) {
    let from = moment.unix(request.queryParams.from);
    let to = moment.unix(request.queryParams.to);
    let userid = parseInt(request.params.userid, 10);
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

  this.get('api/schoolevents/:schoolid', function({ db }, request) {
    let from = moment.unix(request.queryParams.from);
    let to = moment.unix(request.queryParams.to);
    let schoolId = parseInt(request.params.schoolid, 10);
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

  this.post('auth/login', function(schema, request) {
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
