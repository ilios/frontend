import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { htmlSafe } from '@ember/template';
import { TrackedAsyncData } from 'ember-async-data';
import { map } from 'rsvp';
import { findById } from 'ilios-common/utils/array-helpers';

export default class ProgramYearObjectiveListItemExpandedComponent extends Component {
  @cached
  get courseObjectsData() {
    return new TrackedAsyncData(this.getCourseObjects(this.args.objective));
  }

  get courseObjects() {
    return this.courseObjectsData.isResolved ? this.courseObjectsData.value : [];
  }

  get courseObjectsLoaded() {
    return this.courseObjectsData.isResolved;
  }

  async getCourseObjects(programYearObjective) {
    const courseObjectives = await programYearObjective.courseObjectives;
    const objectiveObjects = await map(courseObjectives, async (courseObjective) => {
      const course = await courseObjective.course;
      return {
        title: courseObjective.title,
        courseId: course.id,
        courseTitle: course.title,
        courseExternalId: course.externalId,
      };
    });
    return objectiveObjects.reduce((set, obj) => {
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
  }
}
