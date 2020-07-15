import Component from '@glimmer/component';
import { map } from 'rsvp';
import { tracked } from '@glimmer/tracking';
import { restartableTask } from 'ember-concurrency-decorators';

export default class CollapsedStewardsComponent extends Component {
  @tracked schoolData;

  @restartableTask
  *load(element, [programYear]) {
    if (!programYear) {
      return false;
    }

    const stewards = (yield programYear.stewards).toArray();
    const stewardObjects = yield map(stewards, async steward => {
      const school = await steward.get('school');
      const department = await steward.get('department');
      const departmentId = department ? department.id : 0;
      return {
        schoolId: school.id,
        schoolTitle: school.title,
        departmentId
      };
    });
    const schools = stewardObjects.uniqBy('schoolId');
    this.schoolData = schools.map(obj => {
      const departments = stewardObjects.filterBy('schoolId', obj.schoolId);
      delete obj.departmentId;
      obj.departmentCount = departments.length;

      return obj;
    });
  }
}
