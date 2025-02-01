import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ReportsCurriculumRoute extends Route {
  @service session;
  @service store;
  @service graphql;
  @service currentUser;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  async model() {
    const schools = await this.store.findAll('school');
    const result = await this.graphql.find('courses', [], 'id, title, year, externalId');
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
