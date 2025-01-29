import Component from '@glimmer/component';
import { service } from '@ember/service';
import striptags from 'striptags';
import PapaParse from 'papaparse';
import { dropTask, timeout } from 'ember-concurrency';
import createDownloadFile from 'frontend/utils/create-download-file';
import { DateTime } from 'luxon';

export default class CourseReportResultsComponent extends Component {
  @service router;
  @service intl;

  get summary() {
    return this.args.data
      .reduce((acc, c) => {
        c.sessions.forEach((s) => {
          acc.push({
            courseTitle: c.title,
            sessionTitle: s.title,
            sessionType: s.sessionType.title,
            objectiveCount: s.sessionObjectives.length,
          });
        });
        return acc;
      }, [])
      .sort(this.sortResults);
  }

  getUserName = (user) => {
    if (user.displayName) {
      return user.displayName;
    }
    const middleInitial = user.middleName ? user.middleName.charAt(0) : false;
    if (middleInitial) {
      return `${user.firstName} ${middleInitial}. ${user.lastName}`;
    } else {
      return `${user.firstName} ${user.lastName}`;
    }
  };

  get results() {
    const origin = window.location.origin;
    return this.args.data.reduce((acc, c) => {
      c.sessions.forEach((s) => {
        const path = this.router.urlFor('session', c.id, s.id);
        const offeringInstructors = s.offerings
          .map((o) => o.instructors.map((i) => this.getUserName(i)))
          .flat();
        const ilmInstructors = s.ilmSession?.instructors.map((i) => this.getUserName(i)) ?? [];
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
          acc.push({
            courseId: c.id,
            courseTitle: c.title,
            sessionTitle: s.title,
            sessionType: s.sessionType.title,
            title,
            link: `${origin}${path}`,
            instructors: [...offeringInstructors, ...ilmInstructors].sort(),
            firstOfferingDate: firstOfferingDate
              ? DateTime.fromISO(firstOfferingDate).toLocaleString(this.intl.primarlyLocale)
              : '',
            duration: duration.toFixed(2) ?? 0,
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
