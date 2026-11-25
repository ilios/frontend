import { fn } from '@ember/helper';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import t from 'ember-intl/helpers/t';

import includes from '../../helpers/includes';
import { sortBy } from '../../utils/array-helpers';
import LoadingSpinner from '../loading-spinner';
import FilterCheckbox from './filter-checkbox';

export default class SessionTypesCalendarFilter extends Component {
  @service dataLoader;

  @cached
  get sessionTypesData() {
    return new TrackedAsyncData(this.loadSessionTypes(this.args.school));
  }

  get sessionTypes() {
    return this.sessionTypesData.isResolved ? this.sessionTypesData.value : [];
  }

  get sessionTypesLoaded() {
    return this.sessionTypesData.isResolved;
  }

  async loadSessionTypes(school) {
    await this.dataLoader.loadSchoolForCalendar(school.id);
    const types = await school.sessionTypes;
    return sortBy(types, 'title');
  }

  <template>
    <div
      id="calendar-sessiontypefilter"
      class="calendar-filter-list sessiontypefilter"
      data-test-session-types-calendar-filter
    >
      <h2>
        {{t "general.sessionTypes"}}
      </h2>
      <div class="filters">
        {{#if this.sessionTypesLoaded}}
          {{#if this.sessionTypes.length}}
            <ul data-test-session-types-filter-list>
              {{#each this.sessionTypes as |type|}}
                <li class="clickable" data-test-filter>
                  <FilterCheckbox
                    @checked={{includes type.id @selectedIds}}
                    @add={{fn @add type.id}}
                    @remove={{fn @remove type.id}}
                    @targetId={{type.id}}
                  >
                    {{type.title}}
                  </FilterCheckbox>
                </li>
              {{/each}}
            </ul>
          {{else}}
            <div data-test-session-type-filter-list></div>
          {{/if}}
        {{else}}
          <LoadingSpinner />
        {{/if}}
      </div>
    </div>
  </template>
}
