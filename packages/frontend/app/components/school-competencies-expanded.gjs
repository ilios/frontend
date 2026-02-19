import Component from '@glimmer/component';
import { service } from '@ember/service';
import { all } from 'rsvp';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { filterBy, uniqueValues } from 'ilios-common/utils/array-helpers';
import { TrackedAsyncData } from 'ember-async-data';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import perform from 'ember-concurrency/helpers/perform';
import { or } from 'ember-truth-helpers';
import { fn } from '@ember/helper';
import SchoolCompetenciesManager from 'frontend/components/school-competencies-manager';
import SchoolCompetenciesList from 'frontend/components/school-competencies-list';
import {
  faArrowRotateLeft,
  faCaretDown,
  faCheck,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';

export default class SchoolCompetenciesExpandedComponent extends Component {
  @service store;
  @tracked competenciesToAdd = [];
  @tracked competenciesToRemove = [];

  @cached
  get schoolCompetenciesData() {
    return new TrackedAsyncData(this.args.school.competencies);
  }

  get competencies() {
    if (!this.schoolCompetenciesData.isResolved) {
      return [];
    }
    const arr = [...this.schoolCompetenciesData.value, ...this.competenciesToAdd];
    return uniqueValues(
      arr.filter((competency) => !this.competenciesToRemove.includes(competency)),
    );
  }

  get domains() {
    return this.competencies.filter((competency) => {
      return !competency.belongsTo('parent').id();
    });
  }

  get childCompetencies() {
    return this.competencies.filter((competency) => {
      return competency.belongsTo('parent').id();
    });
  }

  get showCollapsible() {
    return this.competencies.length && !this.args.isManaging;
  }

  cleanup() {
    this.competenciesToAdd = [];
    this.competenciesToRemove = [];
  }

  @action
  collapse() {
    if (this.competencies.length) {
      this.args.collapse();
      this.cleanup();
    }
  }

  @action
  stopManaging() {
    this.cleanup();
    this.args.setSchoolManageCompetencies(false);
  }

  @action
  addCompetency(domain, title) {
    const competency = this.store.createRecord('competency', {
      title,
      active: true,
    });
    if (domain) {
      competency.set('parent', domain);
    }
    this.competenciesToAdd = [...this.competenciesToAdd, competency];
  }
  @action
  removeCompetency(competency) {
    this.competenciesToAdd = this.competenciesToAdd.filter((c) => c !== competency);
    this.competenciesToRemove = [...this.competenciesToRemove, competency];
  }

  save = task({ drop: true }, async () => {
    const competencies = this.schoolCompetenciesData.value;
    const domainsToRemove = competencies.filter((competency) => {
      return !competency.belongsTo('parent').id() && !this.competencies.includes(competency);
    });
    const competenciesToRemove = competencies.filter((competency) => {
      return competency.belongsTo('parent').id() && !this.competencies.includes(competency);
    });

    // delete all removed competencies first, then all removed domains
    await all(competenciesToRemove.map((competency) => competency.destroyRecord()));
    await all(domainsToRemove.map((domain) => domain.destroyRecord()));

    // set the school on new competencies and save them.
    await all(
      filterBy(this.competencies, 'isNew').map((competency) => {
        competency.set('school', this.args.school);
        competency.save();
      }),
    );

    // then update all modified competencies.
    await all(
      filterBy(this.competencies, 'hasDirtyAttributes').map((competency) => competency.save()),
    );

    // cleanup
    this.cleanup();
    this.args.setSchoolManageCompetencies(false);
  });
  <template>
    <section
      class="school-competencies-expanded"
      data-test-school-competencies-expanded
      ...attributes
    >
      <div class="school-competencies-expanded-header" data-test-header>
        {{#if @isManaging}}
          <div class="title" data-test-title>
            {{t "general.competencies"}}
          </div>
        {{else}}
          {{#if this.showCollapsible}}
            <button
              class="title link-button"
              type="button"
              aria-expanded="true"
              data-test-title
              {{on "click" this.collapse}}
            >
              {{t "general.competencies"}}
              ({{this.domains.length}}/{{this.childCompetencies.length}})
              <FaIcon @icon={{faCaretDown}} />
            </button>
          {{else}}
            <div class="title" data-test-title>
              {{t "general.competencies"}}
              ({{this.domains.length}}/{{this.childCompetencies.length}})
            </div>
          {{/if}}
        {{/if}}
        <div class="actions" data-test-actions>
          {{#if @isManaging}}
            <button
              type="button"
              class="bigadd"
              aria-label={{t "general.save"}}
              {{on "click" (perform this.save)}}
              data-test-save
            >
              <FaIcon
                @icon={{if this.save.isRunning faSpinner faCheck}}
                @spin={{this.save.isRunning}}
              />
            </button>
            <button
              type="button"
              class="bigcancel"
              aria-label={{t "general.cancel"}}
              {{on "click" this.stopManaging}}
              data-test-cancel
            >
              <FaIcon @icon={{faArrowRotateLeft}} />
            </button>
          {{else if (or @canUpdate @canDelete @canCreate)}}
            <button
              type="button"
              {{on "click" (fn @setSchoolManageCompetencies true)}}
              data-test-manage
            >
              {{t "general.manageCompetencies"}}
            </button>
          {{/if}}
        </div>
      </div>
      <div class="school-competencies-expanded-content">
        {{#if @isManaging}}
          <SchoolCompetenciesManager
            @canUpdate={{@canUpdate}}
            @canDelete={{@canDelete}}
            @canCreate={{@canCreate}}
            @competencies={{this.competencies}}
            @add={{this.addCompetency}}
            @remove={{this.removeCompetency}}
          />
        {{else if this.domains.length}}
          <SchoolCompetenciesList @domains={{this.domains}} @canUpdate={{@canUpdate}} />
        {{/if}}
      </div>
    </section>
  </template>
}
