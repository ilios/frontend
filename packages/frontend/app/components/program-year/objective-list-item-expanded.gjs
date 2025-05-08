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

<table
  class="program-year-objective-list-item-expanded"
  data-test-program-year-objective-list-item-expanded
>
  <thead>
    <th>{{t "general.courses"}}</th>
    <th>{{t "general.objectives"}}</th>
  </thead>
  <tbody>
    {{#if this.courseObjectsLoaded}}
      {{#each (sort-by "title" this.courseObjects) as |obj|}}
        <tr data-test-program-year-objective-list-item-expanded-course>
          <td class="text-top" data-test-title>
            {{obj.title}}
          </td>
          <td class="text-top">
            <ul data-test-course-objectives>
              {{#each (sort-by "title" obj.objectives) as |obj|}}
                <li data-test-course-objective>
                  {{obj.title}}
                </li>
              {{/each}}
            </ul>
          </td>
        </tr>
      {{else}}
        <tr>
          <td colspan="2" data-test-none>{{t "general.none"}}</td>
        </tr>
      {{/each}}
    {{else}}
      <tr>
        <td colspan="2"><LoadingSpinner /></td>
      </tr>
    {{/if}}
  </tbody>
</table>