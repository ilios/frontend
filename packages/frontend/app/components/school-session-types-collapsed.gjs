import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { filterBy } from 'ilios-common/utils/array-helpers';
import { TrackedAsyncData } from 'ember-async-data';

export default class SchoolSessionTypesCollapseComponent extends Component {
  @cached
  get sessionTypesData() {
    return new TrackedAsyncData(this.args.school.sessionTypes);
  }

  get isLoaded() {
    return this.sessionTypesData.isResolved;
  }

  get sessionTypes() {
    return this.sessionTypesData.isResolved ? this.sessionTypesData.value : [];
  }

  get instructionalMethods() {
    return filterBy(this.sessionTypesData.value, 'assessment', false);
  }

  get assessmentMethods() {
    return filterBy(this.sessionTypesData.value, 'assessment');
  }
}

<section
  class="school-session-types-collapsed"
  data-test-school-session-types-collapsed
  ...attributes
>
  <div>
    <button
      class="title link-button"
      type="button"
      aria-expanded="false"
      data-test-title
      {{on "click" @expand}}
    >
      {{t "general.sessionTypes"}}
      ({{this.sessionTypes.length}})
      <FaIcon @icon="caret-right" />
    </button>
  </div>

  <div class="content">
    <table class="condensed">
      <thead>
        <tr>
          <th class="text-left">
            {{t "general.sessionTypes"}}
          </th>
          <th class="text-left">
            {{t "general.summary"}}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr data-test-session-type-methods>
          <td>
            {{t "general.assessmentMethods"}}
          </td>
          <td class="summary-highlight">
            {{#if this.isLoaded}}
              {{t "general.thereAreXTypes" count=this.assessmentMethods.length}}
            {{/if}}
          </td>
        </tr>
        <tr data-test-session-type-methods>
          <td>
            {{t "general.instructionalMethods"}}
          </td>
          <td class="summary-highlight">
            {{#if this.isLoaded}}
              {{t "general.thereAreXTypes" count=this.instructionalMethods.length}}
            {{/if}}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</section>