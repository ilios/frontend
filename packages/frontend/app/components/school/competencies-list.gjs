import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import { map } from 'rsvp';
import { sortBy } from 'ilios-common/utils/array-helpers';
import t from 'ember-intl/helpers/t';
import CompetenciesListItem from 'frontend/components/school/competencies-list-item';

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
  <template>
    <div class="school-competencies-list" data-test-school-competencies-list ...attributes>
      <div class="grid-row headers">
        <div class="grid-item">{{t "general.competency"}}</div>
        <div class="grid-item">{{t "general.aamcPcrs"}}</div>
      </div>
      {{#each this.proxies as |proxy|}}
        <CompetenciesListItem
          @competency={{proxy.domain}}
          @isDomain={{true}}
          @canUpdate={{@canUpdate}}
        />
        {{#each proxy.competencies as |competency|}}
          <CompetenciesListItem
            @competency={{competency}}
            @isDomain={{false}}
            @canUpdate={{@canUpdate}}
          />
        {{/each}}
      {{/each}}
    </div>
  </template>
}
