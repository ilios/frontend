import Component from '@glimmer/component';
import { restartableTask } from 'ember-concurrency';
import { map } from 'rsvp';
import { htmlSafe } from '@ember/template';
import { tracked } from '@glimmer/tracking';

export default class ProgramYearObjectiveListItemExpandedComponent extends Component {
  @tracked courseObjects;

  @restartableTask
  *load(element, [programYearObjective]) {
    if (!programYearObjective) {
      return;
    }
    const courseObjectives = (yield programYearObjective.courseObjectives).slice();
    const objectiveObjects = yield map(courseObjectives, async (courseObjective) => {
      const course = await courseObjective.course;
      return {
        title: courseObjective.title,
        courseId: course.id,
        courseTitle: course.title,
        courseExternalId: course.externalId,
      };
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
          objectives: [],
        };
        set.pushObject(existing);
      }
      existing.objectives.pushObject({
        title: htmlSafe(obj.title),
      });
      return set;
    }, []);
  }
}
