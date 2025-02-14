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
