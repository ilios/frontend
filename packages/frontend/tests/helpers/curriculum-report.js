export function buildSchoolsFromData(db) {
  const schools = db.school.all();
  const courses = db.course.all();
  const years = courses.map(({ year }) => year);
  const uniqueYears = [...new Set(years)].sort().reverse();

  const rhett = schools.map((school) => {
    const data = {
      id: school.id.toString(),
      title: school.title,
      years: uniqueYears.map((year) => {
        return {
          year,
          courses: courses
            .filter((course) => course.year == year)
            .map((course) => fetchCourse(db, course)),
        };
      }),
    };
    return data;
  });

  return rhett;
}

const fetchCourse = (db, course) => {
  const { id, title, year } = course;
  const school = { id: course.school.id.toString(), title: course.school.title };
  const sessions = course.sessions.map((session) => fetchSession(db, session));

  return { id: id.toString(), title, year, school, sessions };
};

const fetchSession = (db, session) => {
  const { id, title, sessionTypeId } = session;
  const { title: sessionTypeTitle } = db.sessionType.findFirst(sessionTypeId);
  const sessionId = session.id;
  const offerings = db.offering
    .findMany((q) => q.where({ session: sessionId }))
    .map((offering) => fetchOffering(db, offering));
  const ilmSession = fetchIlmSession(
    db,
    db.ilmSession.findFirst((q) => q.where({ session: sessionId })),
  );
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
  const instructors = db.user.findMany(instructorIds);
  const instructorGroups = db.instructorGroup.findMany(instructorGroupIds);
  const instructorData = instructors.map((instructor) => fetchUser(db, instructor.id));
  const instructorGroupData = instructorGroups.map((ig) => {
    const users = ig.users.map((u) => u.id).map((id) => fetchUser(db, id));
    return { id: ig.id, users };
  });
  return { instructors: instructorData, instructorGroups: instructorGroupData };
};

const fetchUser = (db, userId) => {
  const { id, firstName, lastName, middleName, displayName } = db.user.findFirst((q) =>
    q.where({ id: userId }),
  );
  return { id, firstName, lastName, middleName, displayName };
};

const fetchLearnerGroups = (db, ids) => {
  return db.learnerGroup
    .findMany((q) => q.where((lg) => ids.includes(lg.id)))
    .map(({ id, title }) => {
      return { id, title };
    });
};

export const graphQL = { fetchCourse, fetchLearnerGroups };
