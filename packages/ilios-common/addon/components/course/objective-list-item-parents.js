import Component from '@glimmer/component';
import sortableByPosition from 'ilios-common/utils/sortable-by-position';

export default class CourseObjectiveListItemParentsComponent extends Component {
  get parents() {
    return this.args.parents
      .slice()
      .sort(sortableByPosition)
      .map((t) => t.title);
  }
}
