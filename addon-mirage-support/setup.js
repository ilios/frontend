import moment from 'moment';
import { getAll, filterResults } from './get-all';
import parseJsonData from './parse-json-data';

export default function (server) {
  const models = [
    { route: 'aamcmethods', name: 'aamcMethod' },
    { route: 'aamcmethods/', name: 'aamcMethod' },
    { route: 'aamcpcrs/', name: 'aamcPcr' },
    { route: 'academicyears/', name: 'academicYear' },
    { route: 'assessmentoptions/', name: 'assessmentOption' },
    { route: 'authentications/', name: 'authentication' },
    { route: 'cohorts/', name: 'cohort' },
    { route: 'competencies/', name: 'competency' },
    { route: 'courseclerkshiptypes/', name: 'courseClerkshipType' },
    { route: 'courselearningmaterials/', name: 'courseLearningMaterial' },
    { route: 'courses/', name: 'course' },
    { route: 'curriculuminventoryacademiclevels/', name: 'curriculumInventoryAcademicLevel' },
    { route: 'curriculuminventoryexports/', name: 'curriculumInventoryExport' },
    { route: 'curriculuminventoryinstitutions/', name: 'curriculumInventoryInstitution' },
    { route: 'curriculuminventoryreports/', name: 'curriculumInventoryReport' },
    { route: 'curriculuminventorysequenceblocks/', name: 'curriculumInventorySequenceBlock' },
    { route: 'curriculuminventorysequences/', name: 'curriculumInventorySequence' },
    { route: 'departments/', name: 'department' },
    { route: 'vocabularies/', name: 'vocabulary' },
    { route: 'terms/', name: 'term' },
    { route: 'ilmsessions/', name: 'ilmSession' },
    { route: 'instructorgroups/', name: 'instructorGroup' },
    { route: 'learnergroups/', name: 'learnerGroup' },
    { route: 'learningmaterialstatuses/', name: 'learningMaterialStatus' },
    { route: 'learningmaterialuserroles/', name: 'learningMaterialUserRole' },
    { route: 'learningmaterials/', name: 'learningMaterial' },
    { route: 'meshconcepts/', name: 'meshConcept' },
    { route: 'meshdescriptors/', name: 'meshDescriptor' },
    { route: 'meshqualifiers/', name: 'meshQualifier' },
    { route: 'meshtrees/', name: 'meshTree' },
    { route: 'meshpreviousindexings/', name: 'meshPreviousIndexing' },
    { route: 'objectives/', name: 'objective' },
    { route: 'offerings/', name: 'offering' },
    { route: 'programyearstewards/', name: 'programYearSteward' },
    { route: 'programs/', name: 'program' },
    { route: 'reports/', name: 'report' },
    { route: 'schools/', name: 'school' },
    { route: 'schoolconfigs/', name: 'schoolConfig' },
    { route: 'sessiondescriptions/', name: 'sessionDescription' },
    { route: 'sessionlearningmaterials/', name: 'sessionLearningMaterial' },
    { route: 'sessiontypes/', name: 'sessionType' },
    { route: 'sessions/', name: 'session' },
    { route: 'userroles/', name: 'userRole' },
    { route: 'pendinguserupdates/', name: 'pendingUserUpdate' },
    { route: 'programyears/', name: 'programYear' },
    { route: 'users/', name: 'user' },
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
