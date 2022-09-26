import Component from '@glimmer/component';
import { restartableTask } from 'ember-concurrency';
import { map } from 'rsvp';
import { htmlSafe } from '@ember/template';
import { tracked } from '@glimmer/tracking';
import { findById } from 'ilios-common/utils/array-helpers';

export default class ProgramYearObjectiveListItemExpandedComponent extends Component {
  @tracked courseObjects;

  load = restartableTask(async (element, [programYearObjective]) => {
    if (!programYearObjective) {
      return;
    }
    const courseObjectives = (await programYearObjective.courseObjectives).slice();
    const objectiveObjects = await map(courseObjectives, async (courseObjective) => {
      const course = await courseObjective.course;
      return {
        title: courseObjective.title,
        courseId: course.id,
        courseTitle: course.title,
        courseExternalId: course.externalId,
      };
    });
    this.courseObjects = objectiveObjects.reduce((set, obj) => {
      let existing = findById(set, obj.courseId);
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
        set.push(existing);
      }
      existing.objectives.push({
        title: htmlSafe(obj.title),
      });
      return set;
    }, []);
  });
}
