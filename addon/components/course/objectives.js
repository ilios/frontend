import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { dropTask } from 'ember-concurrency-decorators';
import { action } from '@ember/object';

export default class CourseObjectivesComponent extends Component {
  @service store;
  @service flashMessages;

  @tracked newObjectiveEditorOn = false;
  @tracked newObjectiveTitle;
  @tracked objectiveCount;

  get showCollapsible(){
    return this.hasObjectives && !this.isManaging;
  }

  get hasObjectives() {
    return this.objectiveCount > 0;
  }

  @action
  load(element, [course]) {
    this.objectiveCount = course.hasMany('courseObjectives').ids().length;
  }

  @dropTask
  *saveNewObjective(title) {
    const newObjective = this.store.createRecord('objective');
    const newCourseObjective = this.store.createRecord('course-objective');
    newObjective.set('title', title);
    let position = 0;
    const courseObjectives = yield this.args.course.courseObjectives;
    if (courseObjectives.length) {
      position = courseObjectives.sortBy('position').lastObject.position + 1;
    }

    yield newObjective.save();

    newCourseObjective.set('position', position);
    newCourseObjective.set('objective', newObjective);
    newCourseObjective.set('course', this.args.course);

    yield newCourseObjective.save();

    this.newObjectiveEditorOn = false;
    this.flashMessages.success('general.newObjectiveSaved');
  }

  @action
  toggleNewObjectiveEditor() {
    //force expand the objective component
    //otherwise adding the first new objective will cause it to close
    this.args.expand();
    this.newObjectiveEditorOn = !this.newObjectiveEditorOn;
  }
  @action
  collapse() {
    if (this.hasObjectives) {
      this.args.collapse();
    }
  }
}
