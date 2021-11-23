import Component from '@glimmer/component';
import { use } from 'ember-could-get-used-to-this';
import AsyncProcess from 'ilios-common/classes/async-process';

export default class DashboardSelectedVocabularyComponent extends Component {
  @use topLevelTerms = new AsyncProcess(() => [
    this.args.vocabulary.getTopLevelTerms.bind(this.args.vocabulary),
  ]);
}
