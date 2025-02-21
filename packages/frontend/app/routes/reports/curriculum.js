import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { DateTime } from 'luxon';

export default class ReportsCurriculumRoute extends Route {
  @service session;
  @service store;
  @service graphql;
  @service currentUser;

  queryParams = {
    courses: {
      replace: true,
    },
  };

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  async model() {
    const schools = await this.store.findAll('school');
    const threeYearsAgo = DateTime.now().year - 3;
    // Limit query to surounding years
    const years = [...Array(7).keys()].map((i) => threeYearsAgo + i);
    const result = await this.graphql.find(
      'courses',
      [`academicYears: [${years.join(', ')}]`],
      'id, title, year, externalId',
    );
    const allCourseData = result.data.courses;

    return schools.map((school) => {
      const courseIds = school.hasMany('courses').ids();
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

  async afterModel() {
    return this.currentUser.getModel();
  }
}
