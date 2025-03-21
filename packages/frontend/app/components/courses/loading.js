import Component from '@glimmer/component';
import { service } from '@ember/service';

export default class CoursesLoading extends Component {
  @service store;

  today = new Date();

  get schools() {
    return this.store.peekAll('school');
  }

  get hasMoreThanOneSchool() {
    return this.schools.length > 1;
  }
}
