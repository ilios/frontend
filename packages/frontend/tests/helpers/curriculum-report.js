export function buildSchoolsFromData(server) {
  const schools = server.db.schools;
  const allCourseData = server.db.courses;
  return schools.map((school) => {
    const courseIds = school.courseIds;
    const courses = allCourseData.filter((course) => courseIds.includes(course.id));
    const years = courses.map(({ year }) => year);
    const uniqueYears = [...new Set(years)].sort().reverse();
    return {
      id: school.id,
      title: school.title,
      years: uniqueYears.map((year) => {
        return {
          year,
          courses: courses.filter((course) => course.year === year),
        };
      }),
    };
  });
}

const fetchCourse = (db, courseId) => {
  const { id, title, year } = db.courses.find(courseId);
  const sessions = db.sessions.where({ courseId }).map((session) => fetchSession(db, session.id));
  return { id, title, year, sessions };
};

const fetchSession = (db, sessionId) => {
  const { id, title, sessionTypeId } = db.sessions.find(sessionId);
  const { title: sessionTypeTitle } = db.sessionTypes.find(sessionTypeId);
  const offerings = db.offerings
    .where({ sessionId })
    .map((offering) => fetchOffering(db, offering));
  const ilmSession = fetchIlmSession(db, db.ilmSessions.findBy({ sessionId }));
  return {
    id,
    title,
    sessionType: { title: sessionTypeTitle },
    offerings,
    ilmSession,
  };
};

const fetchIlmSession = (db, ilmSession) => {
  if (!ilmSession) {
    return null;
  }
  const { id, dueDate, hours, instructorIds, instructorGroupIds } = ilmSession;
  const { instructors, instructorGroups } = fetchInstructors(db, instructorIds, instructorGroupIds);
  return { id, dueDate, hours, instructors, instructorGroups };
};

const fetchOffering = (db, offering) => {
  const { id, startDate, endDate, instructorIds, instructorGroupIds } = offering;
  const { instructors, instructorGroups } = fetchInstructors(db, instructorIds, instructorGroupIds);
  return { id, startDate, endDate, instructors, instructorGroups };
};

const fetchInstructors = (db, instructorIds, instructorGroupIds) => {
  const instructors = db.users.find(instructorIds);
  const instructorGroups = db.instructorGroups.find(instructorGroupIds);
  const instructorData = instructors.map((instructor) => fetchUser(db, instructor.id));
  const instructorGroupData = instructorGroups.map((ig) => {
    const users = ig.userIds.map((id) => fetchUser(db, id));
    return { id: ig.id, users };
  });
  return { instructors: instructorData, instructorGroups: instructorGroupData };
};

const fetchUser = (db, userId) => {
  const { id, firstName, lastName, middleName, displayName } = db.users.find(userId);
  return { id, firstName, lastName, middleName, displayName };
};

const fetchLearnerGroups = (db, ids) => {
  return db.learnerGroups.find(ids).map(({ id, title }) => {
    return { id, title };
  });
};

export const graphQL = { fetchCourse, fetchLearnerGroups };
