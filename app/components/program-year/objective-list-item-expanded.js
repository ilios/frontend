import Component from '@glimmer/component';
import { restartableTask } from 'ember-concurrency-decorators';
import { map } from 'rsvp';
import { htmlSafe } from '@ember/string';
import { tracked } from '@glimmer/tracking';

export default class ProgramYearObjectiveListItemExpandedComponent extends Component {
  @tracked courseObjects;

  @restartableTask
  *load(elemement, [objective]) {
    if (!objective) {
      return;
    }
    const children = (yield objective.children).toArray();
    const objectiveObjects = yield map(children, async courseObjective => {
      const courses = await courseObjective.courses;
      const obj = {
        title: courseObjective.title,
        courseId: null,
        courseTitle: null,
        courseExternalId: null
      };
      if (courses.length) {
        const course = courses.firstObject;
        obj.courseId = course.id;
        obj.courseTitle = course.title;
        obj.courseExternalId = course.externalId;
      }
      return obj;
    });
    this.courseObjects = objectiveObjects.reduce((set, obj) => {
      let existing = set.findBy('id', obj.courseId);
      if (!existing) {
        let title = obj.courseTitle;
        if (obj.courseExternalId) {
          title += ` (${obj.courseExternalId})`;
        }
        existing = {
          id: obj.courseId,
          title,
          objectives: []
        };
        set.pushObject(existing);
      }
      existing.objectives.pushObject({
        title: htmlSafe(obj.title)
      });
      return set;
    }, []);
  }
}
