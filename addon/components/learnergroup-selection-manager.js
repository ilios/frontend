import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class LearnergroupSelectionManager extends Component {
  @tracked filter = '';
  @service intl;

  sortByTitle(learnerGroupA, learnerGroupB) {
    const locale = this.intl.get('locale');
    return learnerGroupA.title.localeCompare(learnerGroupB.title, locale, {numeric: true});
  }
}
