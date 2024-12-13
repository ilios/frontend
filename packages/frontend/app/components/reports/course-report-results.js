import Component from '@glimmer/component';
import { service } from '@ember/service';
import { DateTime } from 'luxon';

export default class CourseReportResultsComponent extends Component {
  @service store;
  @service graphql;
  @service router;

  get results() {
    return this.args.data
      .map((course) => {
        return course.sessions
          .map((session) => {
            const offerings = session.offerings.map(({ startDate, endDate }) => {
              const luxonStartDate = DateTime.fromISO(startDate);
              const luxonEndDate = DateTime.fromISO(endDate);
              const { minutes } = luxonEndDate.diff(luxonStartDate, 'minutes').toObject();
              return {
                startDate,
                endDate,
                luxonStartDate,
                minutes,
              };
            });

            if (session.ilmSession) {
              const { hours, dueDate } = session.ilmSession;
              const luxonStartDate = DateTime.fromISO(dueDate);
              const luxonEndDate = luxonStartDate.plus({ hours });
              const { minutes } = luxonEndDate.diff(luxonStartDate, 'minutes').toObject();
              offerings.push({
                startDate: dueDate,
                luxonStartDate,
                minutes,
              });
            }

            offerings.sort((a, b) => a.luxonStartDate - b.luxonStartDate);

            const startDate = offerings.length ? offerings[0].startDate : null;
            const minutes = offerings.length ? offerings[0].minutes : null;
            const origin = window.location.origin;
            const path = this.router.urlFor('session', course.id, session.id);

            return {
              courseId: course.id,
              courseTitle: course.title,
              sessionId: session.id,
              sessionTitle: session.title,
              sessionType: session.sessionType.title,
              startDate,
              minutes,
              link: `${origin}${path}`,
            };
          })
          .filter(Boolean);
      })
      .flat();
  }
}
