import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import { map } from 'rsvp';
import { sortBy } from 'ilios-common/utils/array-helpers';

export default class SchoolCompetenciesListComponent extends Component {
  @cached
  get data() {
    return new TrackedAsyncData(this.loadData(this.args.domains));
  }

  get proxies() {
    return this.data.isResolved ? this.data.value : [];
  }

  async loadData(domains) {
    return map(sortBy(domains, 'title'), async (domain) => {
      const competencies = await domain.children;
      return {
        domain,
        competencies: sortBy(competencies, 'title'),
      };
    });
  }
}
