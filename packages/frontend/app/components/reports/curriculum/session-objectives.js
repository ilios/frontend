import Component from '@glimmer/component';
import { service } from '@ember/service';
import striptags from 'striptags';
import PapaParse from 'papaparse';
import { dropTask, timeout } from 'ember-concurrency';
import createDownloadFile from 'frontend/utils/create-download-file';
import { DateTime } from 'luxon';
import { cached, tracked } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import { chunk } from 'ilios-common/utils/array-helpers';

export default class ReportsCurriculumSessionObjectivesComponent extends Component {
  @service router;
  @service intl;
  @service graphql;
  @service reporting;
  @tracked finishedBuildingReport = false;

  @cached
  get queryPromises() {
    const chunks = chunk(this.args.courses, 5);
    const userData = ['id', 'firstName', 'lastName', 'middleName', 'displayName'].join(', ');
    const sessionData = [
      'id',
      'title',
      'sessionType { title }',
      'sessionObjectives { id, title }',
      `offerings { id, startDate, endDate, instructors { ${userData} }, instructorGroups { id, users { ${userData} } } }`,
      `ilmSession { id, dueDate, hours, instructors { ${userData} }, instructorGroups { id, users { ${userData} } } }`,
    ].join(', ');

    const data = ['id', 'title', 'year', 'school { id, title }', `sessions { ${sessionData} }`];

    return chunks.map((courses) => {
      const courseIds = courses.map((c) => c.id);
      const filters = [`ids: [${courseIds.join(', ')}]`];
      return new TrackedAsyncData(this.graphql.find('courses', filters, data.join(', ')));
    });
  }

  get completedPromises() {
    return this.queryPromises.filter((tad) => tad.isResolved);
  }

  get reportRunning() {
    return this.queryPromises.length > this.completedPromises.length;
  }

  get reportResults() {
    if (this.reportRunning) {
      return [];
    }
    return this.completedPromises
      .map(({ value }) => value)
      .map(({ data }) => data.courses)
      .flat();
  }

  get reportWithInstructors() {
    return this.reportResults.map((c) => {
      c.sessions = c.sessions.map(this.reporting.consolidateSessionInstructorsGraph);

      return c;
    });
  }

  get summary() {
    return this.reportWithInstructors.map((c) => {
      const summary = {
        schoolTitle: c.school?.title,
        courseId: c.id,
        courseTitle: c.title,
        sessionCount: c.sessions.length,
        objectiveCount: c.sessions.reduce((acc, s) => acc + s.sessionObjectives.length, 0),
        instructorsCount: this.reporting.countUniqueValuesInArray(c.sessions, 'instructors'),
      };

      return summary;
    });
  }

  get results() {
    const origin = window.location.origin;
    return this.reportWithInstructors.reduce((acc, c) => {
      c.sessions.forEach((s) => {
        const path = this.router.urlFor('session', c.id, s.id);
        let firstOfferingDate, duration;
        const firstOffering = s.offerings.sort(
          (a, b) => DateTime.fromISO(a.startDate) - DateTime.fromISO(b.startDate),
        )[0];
        if (firstOffering) {
          firstOfferingDate = firstOffering.startDate;
          duration = DateTime.fromISO(firstOffering.endDate).diff(
            DateTime.fromISO(firstOffering.startDate),
            'hours',
          ).hours;
        } else if (s.ilmSession) {
          firstOfferingDate = s.ilmSession.dueDate;
          duration = s.ilmSession.hours;
        }
        s.sessionObjectives.forEach((o) => {
          const title = striptags(o.title);
          const objective = {
            schoolTitle: c.school?.title,
            courseId: c.id,
            courseTitle: c.title,
            sessionTitle: s.title,
            sessionType: s.sessionType.title,
            title,
            link: `${origin}${path}`,
            instructors: s.instructors,
            firstOfferingDate: firstOfferingDate
              ? DateTime.fromISO(firstOfferingDate).toLocaleString(this.intl.primaryLocale)
              : '',
            duration: duration?.toFixed(2) ?? 0,
          };

          acc.push(objective);
        });
      });
      return acc;
    }, []);
  }

  get sortedResults() {
    return this.results.sort(this.sortResults);
  }

  sortResults = (a, b) => {
    if (a.courseTitle !== b.courseTitle) {
      return a.courseTitle.localeCompare(b.courseTitle);
    }

    return a.sessionTitle.localeCompare(b.sessionTitle);
  };

  downloadReport = dropTask(async () => {
    const data = this.sortedResults.map((o) => {
      const rhett = {};

      if (this.args.hasMultipleSchools) {
        rhett[this.intl.t('general.school')] = o.schoolTitle;
      }
      rhett[this.intl.t('general.course')] = o.courseTitle;
      rhett[this.intl.t('general.session')] = o.sessionTitle;
      rhett[this.intl.t('general.sessionType')] = o.sessionType;
      rhett[this.intl.t('general.objective')] = o.title;
      rhett[this.intl.t('general.instructors')] = o.instructors.join(', ');
      rhett[this.intl.t('general.firstOffering')] = o.firstOfferingDate;
      rhett[this.intl.t('general.hours')] = o.duration;
      rhett[this.intl.t('general.link')] = o.link;

      return rhett;
    });
    const csv = PapaParse.unparse(data);
    this.finishedBuildingReport = true;
    createDownloadFile(`objectives.csv`, csv, 'text/csv');
    await timeout(2000);
    this.finishedBuildingReport = false;
  });
}
