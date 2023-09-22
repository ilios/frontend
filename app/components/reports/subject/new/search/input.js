import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { cleanQuery } from 'ilios-common/utils/query-utils';
import { action } from '@ember/object';

export default class ReportsSubjectNewSearchInputComponent extends Component {
  @tracked showMoreInputPrompt;

  @action
  search(query) {
    const q = cleanQuery(query);
    const noWhiteSpaceTerm = q.replace(/ /g, '');
    this.showMoreInputPrompt = false;
    if (noWhiteSpaceTerm.length > 0 && noWhiteSpaceTerm.length < 3) {
      this.showMoreInputPrompt = true;
      return;
    }

    this.args.search(q);
  }
}
