import Component from '@glimmer/component';
import { service } from '@ember/service';
import PapaParse from 'papaparse';
import { dropTask, timeout } from 'ember-concurrency';
import createDownloadFile from 'frontend/utils/create-download-file';
import { DateTime } from 'luxon';
import { cached } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import { uniqueById } from 'ilios-common/utils/array-helpers';

export default class ReportsCurriculumLearnerGroupsComponent extends Component {
  @service router;
  @service intl;
  @service graphql;
  @service reporting;

  @cached
  get reportResultsData() {
    const courseIds = this.args.courses.map((c) => c.id);
    const filters = [`ids: [${courseIds.join(', ')}]`];
    const userData = ['id', 'firstName', 'lastName', 'middleName', 'displayName'].join(', ');
    const sessionData = [
      'id',
      'title',
      `offerings { id, startDate, endDate, instructors { ${userData} }, instructorGroups { id, users { ${userData} } }, learnerGroups { id, title } }`,
      `ilmSession { id, dueDate, hours, instructors { ${userData} }, instructorGroups { id, users { ${userData} } }, learnerGroups { id, title } }`,
    ].join(', ');

    const data = ['id', 'title', 'year', `sessions { ${sessionData} }`];
    return new TrackedAsyncData(this.graphql.find('courses', filters, data.join(', ')));
  }

  get reportResults() {
    if (!this.reportResultsData.isResolved) {
      return [];
    }
    return this.reportResultsData.value.data.courses;
  }

  get reportRunning() {
    return this.reportResultsData.isPending;
  }

  get reportWithInstructors() {
    return this.reportResults.map((c) => {
      c.sessions = c.sessions.map(this.reporting.consolidateSessionInstructorsGraph);

      return c;
    });
  }

  get reportWithLearnerGroups() {
    return this.reportWithInstructors.map((c) => {
      c.sessions = c.sessions.map((s) => {
        const offeringLearnerGroups = s.offerings.map((o) => o.learnerGroups.map((g) => g)).flat();
        const ilmLearnerGroups = s.ilmSession?.learnerGroups.map((g) => g) ?? [];
        const learnerGroups = [...offeringLearnerGroups, ...ilmLearnerGroups];

        s.learnerGroups = uniqueById(learnerGroups)
          .map(({ title }) => title)
          .sort();
        return s;
      });

      return c;
    });
  }

  get summary() {
    return this.reportWithLearnerGroups.map((c) => {
      return {
        courseId: c.id,
        courseTitle: c.title,
        sessionCount: c.sessions.length,
        learnerGroupsCount: c.sessions.reduce((acc, s) => acc + s.learnerGroups.length, 0),
        instructorsCount: c.sessions.reduce((acc, s) => acc + s.instructors.length, 0),
      };
    });
  }

  get results() {
    const origin = window.location.origin;
    return this.reportWithLearnerGroups.reduce((acc, c) => {
      c.sessions.forEach((s) => {
        const path = this.router.urlFor('session', c.id, s.id);
        let firstOfferingDate;
        const firstOffering = s.offerings.sort(
          (a, b) => DateTime.fromISO(a.startDate) - DateTime.fromISO(b.startDate),
        )[0];
        if (firstOffering) {
          firstOfferingDate = firstOffering.startDate;
        } else if (s.ilmSession) {
          firstOfferingDate = s.ilmSession.dueDate;
        }
        s.learnerGroups.forEach((title) => {
          acc.push({
            courseId: c.id,
            courseTitle: c.title,
            year: c.year,
            sessionTitle: s.title,
            firstOfferingDate: firstOfferingDate
              ? DateTime.fromISO(firstOfferingDate).toLocaleString(this.intl.primarlyLocale)
              : '',
            instructors: s.instructors,
            title,
            link: `${origin}${path}`,
          });
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
      rhett[this.intl.t('general.id')] = o.courseId;
      rhett[this.intl.t('general.course')] = o.courseTitle;
      rhett[this.intl.t('general.year')] = o.year;
      rhett[this.intl.t('general.session')] = o.sessionTitle;
      rhett[this.intl.t('general.firstOffering')] = o.firstOfferingDate;
      rhett[this.intl.t('general.instructors')] = o.instructors.join(', ');
      rhett[this.intl.t('general.learnerGroupTitle')] = o.title;
      rhett[this.intl.t('general.link')] = o.link;

      return rhett;
    });
    const csv = PapaParse.unparse(data);
    this.finishedBuildingReport = true;
    createDownloadFile(`learner-groups.csv`, csv, 'text/csv');
    await timeout(2000);
    this.finishedBuildingReport = false;
  });
}
