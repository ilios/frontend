export function buildSchoolsFromData(db) {
  const schools = db.school.all();
  const courses = db.course.all();
  const years = courses.map(({ year }) => year);
  const uniqueYears = [...new Set(years)].sort().reverse();

  const rhett = schools.map((school) => {
    const data = {
      id: `${school.id}`,
      title: school.title,
      years: uniqueYears.map((year) => {
        return {
          year,
          courses: courses
            .filter((course) => course.school.id == school.id)
            .filter((course) => course.year == year)
            .map((course) => buildCourse(course)),
        };
      }),
    };
    return data;
  });

  return rhett;
}

const buildCourse = (course) => {
  const { id, title, year } = course;
  const school = { id: `${course.school.id}`, title: course.school.title };
  const courseObjectives = course.courseObjectives.map((courseObjective) =>
    buildCourseObjective(courseObjective),
  );
  const sessions = course.sessions.map((session) => buildSession(session));

  return { id: `${id}`, title, year, school, courseObjectives, sessions };
};

const buildCourseObjective = (courseObjective) => {
  if (!courseObjective) {
    return null;
  }
  const { id, title } = courseObjective;
  const programYearObjectives = courseObjective.programYearObjectives.map((pyObjective) =>
    buildProgramYearObjective(pyObjective),
  );

  return { id: `${id}`, title, programYearObjectives };
};

const buildProgramYearObjective = (programYearObjective) => {
  if (!programYearObjective) {
    return null;
  }
  const { id, title } = programYearObjective;
  return {
    id: `${id}`,
    title,
    competency: {
      id: `${programYearObjective.competency.id}`,
      title: programYearObjective.competency.title,
    },
  };
};

const buildSession = (session) => {
  const { id, title, sessionType, offerings, ilmSession } = session;
  const { title: sessionTypeTitle } = sessionType;
  return {
    id: `${id}`,
    title,
    sessionType: { title: sessionTypeTitle },
    offerings: offerings.map(buildOffering),
    ilmSession: buildIlmSession(ilmSession),
  };
};

const buildIlmSession = (ilmSession) => {
  if (!ilmSession) {
    return null;
  }
  const instructors = ilmSession.instructors.map(buildUser);
  const instructorGroups = ilmSession.instructorGroups.map((ig) => {
    const users = ig.users.map(buildUser);
    return {
      id: `${ig.id}`,
      users,
    };
  });

  const { id, dueDate, hours } = ilmSession;
  return { id: `${id}`, dueDate, hours, instructors, instructorGroups };
};

const buildOffering = (offering) => {
  const instructors = offering.instructors.map(buildUser);
  const instructorGroups = offering.instructorGroups.map((ig) => {
    const users = ig.users.map(buildUser);
    return {
      id: `${ig.id}`,
      users,
    };
  });

  const { id, startDate, endDate } = offering;
  return { id: `${id}`, startDate, endDate, instructors, instructorGroups };
};

const buildUser = (user) => {
  const { id, firstName, lastName, middleName, displayName } = user;
  return { id: `${id}`, firstName, lastName, middleName, displayName };
};

const fetchLearnerGroups = (db, ids) => {
  return db.learnerGroup
    .findMany((q) => q.where((lg) => ids.includes(lg.id)))
    .map(({ id, title }) => {
      return { id, title };
    });
};

export const graphQL = { buildCourse, fetchLearnerGroups };
