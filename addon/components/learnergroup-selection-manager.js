import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class LearnergroupSelectionManager extends Component {
  @tracked filter = '';

  sortByTitle(learnerGroupA, learnerGroupB) {
    const locale = this.intl.get('locale');
    return learnerGroupA.title.localeCompare(learnerGroupB.title, locale, {numeric: true});
  }
}
