import { isEmpty } from '@ember/utils';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { restartableTask } from "ember-concurrency-decorators";
import { filter } from 'rsvp';


export default class SelectableTermsList extends Component {
  @tracked terms = [];

  @restartableTask
  *load(element, [vocabulary, terms, termFilter]) {
    if (vocabulary) {
      const topLevelTerms = yield vocabulary.get('topLevelTerms');
      if (isEmpty(termFilter)) {
        this.terms = topLevelTerms;
      } else {
        const exp = new RegExp(termFilter, 'gi');
        this.terms = yield filter(topLevelTerms.toArray(), async term => {
          const searchString = await term.get('titleWithDescendantTitles');
          return searchString.match(exp);
        });
      }
    } else if (terms) {
      this.terms = terms.toArray();
    } else {
      this.terms = [];
    }
  }
}
