import Component from '@glimmer/component';
import { restartableTask } from 'ember-concurrency';
import { all, map } from 'rsvp';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { findById } from '../../utils/array-helpers';

export default class DashboardFilterTagsComponent extends Component {
  @service store;
  @service intl;
  @tracked filterTags = [];

  get activeFilters() {
    return [].concat(
      this.args.selectedSessionTypeIds || [],
      this.args.selectedCourseLevels || [],
      this.args.selectedCohortIds || [],
      this.args.selectedCourseIds || [],
      this.args.selectedTermIds || []
    );
  }

  load = restartableTask(async () => {
    const tags = await all([
      this.getCourseLevelTags(),
      this.getSessionTypeTags(),
      this.getCohortTags(),
      this.getTermTags(),
      this.getCourseTags(),
    ]);
    this.filterTags = tags.flat();
  });

  async fetchModel(modelName, id) {
    const model = this.store.peekRecord(modelName, id);
    return model ? model : this.store.findRecord(modelName, id);
  }

  getCourseLevelTags() {
    return this.args.selectedCourseLevels.map((level) => {
      return {
        id: level,
        class: 'tag-course-level',
        remove: this.args.removeCourseLevel,
        name: this.intl.t('general.courseLevel', { level }),
      };
    });
  }
  async getSessionTypeTags() {
    return map(this.args.selectedSessionTypeIds, async (id) => {
      const sessionType = await this.fetchModel('session-type', id);
      return {
        id,
        class: 'tag-session-type',
        remove: this.args.removeSessionTypeId,
        name: sessionType.title,
      };
    });
  }
  getCohortTags() {
    return this.args.selectedCohortIds.map((id) => {
      const proxy = findById(this.args.cohortProxies, id);
      return {
        id,
        class: 'tag-cohort',
        remove: this.args.removeCohortId,
        name: `${proxy.displayTitle} ${proxy.programTitle}`,
      };
    });
  }
  async getTermTags() {
    return map(this.args.selectedTermIds, async (id) => {
      const term = await this.fetchModel('term', id);
      const allTitles = await term.getTitleWithParentTitles();
      const vocabulary = await term.get('vocabulary');
      const title = vocabulary.get('title');
      return {
        id,
        class: 'tag-term',
        remove: this.args.removeTermId,
        name: `${title} > ${allTitles}`,
      };
    });
  }
  async getCourseTags() {
    return map(this.args.selectedCourseIds, async (id) => {
      const course = await this.fetchModel('course', id);
      return {
        id,
        class: 'tag-course',
        remove: this.args.removeCourseId,
        name: `${course.year} ${course.title}`,
      };
    });
  }
}
