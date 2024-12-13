import Component from '@glimmer/component';
import { service } from '@ember/service';
import striptags from 'striptags';

export default class CourseReportResultsComponent extends Component {
  @service store;
  @service graphql;
  @service router;

  get results() {
    return this.args.data.map((o) => {
      const title = striptags(o.title);

      const origin = window.location.origin;
      const path = this.router.urlFor('session', o.session.course.id, o.session.id);

      return {
        courseId: o.session.course.id,
        courseTitle: o.session.course.title,
        sessionId: o.session.id,
        sessionTitle: o.session.title,
        sessionType: o.session.sessionType.title,
        title,
        link: `${origin}${path}`,
      };
    });
  }

  get sortedResults() {
    return this.results.sort((a, b) => {
      if (a.courseTitle !== b.courseTitle) {
        return a.courseTitle.localeCompare(b.courseTitle);
      }

      return a.sessionTitle.localeCompare(b.sessionTitle);
    });
  }
}
