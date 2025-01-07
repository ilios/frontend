import Component from '@glimmer/component';
import { service } from '@ember/service';
import striptags from 'striptags';
import PapaParse from 'papaparse';
import { dropTask, timeout } from 'ember-concurrency';
import createDownloadFile from 'frontend/utils/create-download-file';

export default class CourseReportResultsComponent extends Component {
  @service router;
  @service intl;

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

  downloadReport = dropTask(async () => {
    const data = this.sortedResults.map((o) => {
      const rhett = {};
      rhett[this.intl.t('general.course')] = o.courseTitle;
      rhett[this.intl.t('general.session')] = o.sessionTitle;
      rhett[this.intl.t('general.sessionType')] = o.sessionType;
      rhett[this.intl.t('general.objective')] = o.title;
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
