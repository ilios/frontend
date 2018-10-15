import moment from 'moment';
import { getAll, filterResults } from './get-all';
import parseJsonData from './parse-json-data';

export default function (server) {
  const models = [
    { route: 'aamcmethods', name: 'aamcMethod' },
    { route: 'api/aamcmethods/', name: 'aamcMethod' },
    { route: 'api/aamcpcrs/', name: 'aamcPcr' },
    { route: 'api/academicyears/', name: 'academicYear' },
    { route: 'api/assessmentoptions/', name: 'assessmentOption' },
    { route: 'api/authentications/', name: 'authentication' },
    { route: 'api/cohorts/', name: 'cohort' },
    { route: 'api/competencies/', name: 'competency' },
    { route: 'api/courseclerkshiptypes/', name: 'courseClerkshipType' },
    { route: 'api/courselearningmaterials/', name: 'courseLearningMaterial' },
    { route: 'api/courses/', name: 'course' },
    { route: 'api/curriculuminventoryacademiclevels/', name: 'curriculumInventoryAcademicLevel' },
    { route: 'api/curriculuminventoryexports/', name: 'curriculumInventoryExport' },
    { route: 'api/curriculuminventoryinstitutions/', name: 'curriculumInventoryInstitution' },
    { route: 'api/curriculuminventoryreports/', name: 'curriculumInventoryReport' },
    { route: 'api/curriculuminventorysequenceblocks/', name: 'curriculumInventorySequenceBlock' },
    { route: 'api/curriculuminventorysequences/', name: 'curriculumInventorySequence' },
    { route: 'api/departments/', name: 'department' },
    { route: 'api/vocabularies/', name: 'vocabulary' },
    { route: 'api/terms/', name: 'term' },
    { route: 'api/ilmsessions/', name: 'ilmSession' },
    { route: 'api/instructorgroups/', name: 'instructorGroup' },
    { route: 'api/learnergroups/', name: 'learnerGroup' },
    { route: 'api/learningmaterialstatuses/', name: 'learningMaterialStatus' },
    { route: 'api/learningmaterialuserroles/', name: 'learningMaterialUserRole' },
    { route: 'api/learningmaterials/', name: 'learningMaterial' },
    { route: 'api/meshconcepts/', name: 'meshConcept' },
    { route: 'api/meshdescriptors/', name: 'meshDescriptor' },
    { route: 'api/meshqualifiers/', name: 'meshQualifier' },
    { route: 'api/meshtrees/', name: 'meshTree' },
    { route: 'api/meshpreviousindexings/', name: 'meshPreviousIndexing' },
    { route: 'api/objectives/', name: 'objective' },
    { route: 'api/offerings/', name: 'offering' },
    { route: 'api/programyearstewards/', name: 'programYearSteward' },
    { route: 'api/programs/', name: 'program' },
    { route: 'api/reports/', name: 'report' },
    { route: 'api/schools/', name: 'school' },
    { route: 'api/schoolconfigs/', name: 'schoolConfig' },
    { route: 'api/sessiondescriptions/', name: 'sessionDescription' },
    { route: 'api/sessionlearningmaterials/', name: 'sessionLearningMaterial' },
    { route: 'api/sessiontypes/', name: 'sessionType' },
    { route: 'api/sessions/', name: 'session' },
    { route: 'api/userroles/', name: 'userRole' },
    { route: 'api/pendinguserupdates/', name: 'pendingUserUpdate' },
    { route: 'api/programyears/', name: 'programYear' },
    { route: 'api/users/', name: 'user' },
  ];

  models.forEach(obj => {
    server.get(`api/${obj.route}`, getAll);
    server.get(`api/${obj.route}/:id`, obj.name);
    server.put(`api/${obj.route}/:id`, obj.name);
    server.del(`api/${obj.route}/:id`, obj.name);
    server.post(`api/${obj.route}`, obj.name);
  });

  server.get('api/cohorts', (schema, request) => {
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

  server.get('api/courses', (schema, request) => {
    const params = request.queryParams;
    const keys = Object.keys(params);
    const schoolKey = 'filters[school]';
    if (keys.includes(schoolKey)) {
      const schoolsFilter = params[schoolKey];
      const courses = schema.courses.all().filter(course => {
        const school = course.school;

        return schoolsFilter.includes(school.id);
      });

      return filterResults(courses, 'courses', request);

    } else {
      return getAll(schema, request);
    }
  });

  server.get('api/pendinguserupdates', (schema, request) => {
    const params = request.queryParams;
    const keys = Object.keys(params);
    const schoolKey = 'filters[schools]';
    if (keys.includes(schoolKey)) {
      const schoolsFilter = params[schoolKey];
      const updates = schema.pendingUserUpdates.all().filter(update => {
        const school = update.user.school;

        return schoolsFilter.includes(school.id);
      });

      return updates;

    } else {
      return getAll(schema, request);
    }
  });
  server.post('api/programyears', function (schema, request) {
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

  server.get('api/sessions', (schema, request) => {
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


  server.get('api/userevents/:userid', function ({ db }, request) {
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

  server.get('api/schoolevents/:schoolid', function({ db }, request) {
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

  server.post('upload', function() {
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
}
