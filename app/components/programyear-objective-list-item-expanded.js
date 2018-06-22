import Component from '@ember/component';
import { computed } from '@ember/object';
import { map } from 'rsvp';
import { htmlSafe } from '@ember/string';

export default Component.extend({
  objective: null,
  tagName: '',
  courseObjects: computed('objective.children', async function () {
    const objective = this.objective;
    const children = await objective.children;
    const objectiveObjects = await map(children.toArray(), async courseObjective => {
      const courses = await courseObjective.courses;
      let obj = {
        title: courseObjective.title,
        courseId: null,
        courseTitle: null
      };
      if (courses.length) {
        const course = courses.firstObject;
        obj.courseId = course.id;
        obj.courseTitle = course.title;
      }
      return obj;
    });
    return objectiveObjects.reduce((set, obj) => {
      let existing = set.findBy('id', obj.courseId);
      if (!existing) {
        existing = {
          id: obj.courseId,
          title: obj.courseTitle,
          objectives: []
        };
        set.pushObject(existing);
      }
      existing.objectives.pushObject({
        title: htmlSafe(obj.title)
      });
      return set;
    }, []);
  }),
});
