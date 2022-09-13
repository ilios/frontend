import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { dropTask } from 'ember-concurrency';
import { all } from 'rsvp';
import { mapBy } from '../utils/array-helpers';

export default class ObjectiveListItemTerms extends Component {
  @tracked sortedTerms;

  load = dropTask(async (event, [filteredTerms]) => {
    const proxies = await all(
      filteredTerms.map(async (term) => {
        const title = await term.getTitleWithParentTitles();
        return { term, title };
      })
    );
    const sortedProxies = proxies.sort((a, b) => {
      const titleA = a.title.toLowerCase();
      const titleB = b.title.toLowerCase();
      return titleA > titleB ? 1 : titleA < titleB ? -1 : 0;
    });

    this.sortedTerms = mapBy(sortedProxies, 'term');
  });

  get filteredTerms() {
    if (!this.args.terms) {
      return [];
    }
    return this.args.terms.filter((term) => {
      const vocabId = term.belongsTo('vocabulary').id();
      return vocabId === this.args.vocabulary.id;
    });
  }
}
