import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { action } from '@ember/object';
import { TrackedAsyncData } from 'ember-async-data';
import { on } from '@ember/modifier';
import t from 'ember-intl/helpers/t';
import FaIcon from 'ilios-common/components/fa-icon';
import { faCaretDown } from '@fortawesome/free-solid-svg-icons';

export default class DetailCompetenciesComponent extends Component {
  @cached
  get courseCompetenciesData() {
    return new TrackedAsyncData(this.args.course.competencies);
  }

  get competencyCount() {
    if (!this.courseCompetenciesData.isResolved) {
      return 0;
    }
    return this.courseCompetenciesData.value.length;
  }

  get hasCompetencies() {
    return this.competencyCount > 0;
  }

  @action
  collapse() {
    if (this.courseCompetenciesData.isResolved && this.hasCompetencies) {
      this.args.collapse();
    }
  }
  <template>
    <section class="detail-competencies" data-test-detail-competencies>
      {{#if this.hasCompetencies}}
        <button
          class="title link-button"
          type="button"
          aria-expanded="false"
          data-test-title
          {{on "click" this.collapse}}
        >
          {{t "general.competencies"}}
          ({{this.competencyCount}})
          <FaIcon @icon={{faCaretDown}} />
        </button>
        <div class="detail-competencies-content">
          <ul class="static-list">
            {{#each @course.domainsWithSubcompetencies as |domain|}}
              <li data-test-domain>
                {{domain.title}}
                {{#if domain.subCompetencies}}
                  <ul>
                    {{#each domain.subCompetencies as |competency|}}
                      <li data-test-competency>
                        {{competency.title}}
                      </li>
                    {{/each}}
                  </ul>
                {{/if}}
              </li>
            {{/each}}
          </ul>
        </div>
      {{else}}
        <div class="title" data-test-title>
          {{t "general.competencies"}}
          ({{this.competencyCount}})
        </div>
      {{/if}}
    </section>
  </template>
}
