import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { dropTask } from 'ember-concurrency-decorators';
import sortableByPosition from 'ilios-common/utils/sortable-by-position';

export default class PrintCourseComponent extends Component {
  @service store;

  @tracked sortTitle;
  @tracked sortDirectorsBy;
  @tracked sessions = [];
  @tracked courseLearningMaterials = [];

  @dropTask
  *load(event, [course]) {
    if (!course) {
      return;
    }
    this.courseLearningMaterials = (yield course.learningMaterials).toArray().sort(sortableByPosition);

    let sessions = yield course.sessions;
    if (!this.args.includeUnpublishedSessions) {
      sessions = sessions.filterBy('isPublishedOrScheduled');
    }

    this.sessions = sessions;
  }
}
