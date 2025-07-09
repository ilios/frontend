import Component from '@glimmer/component';
import { service } from '@ember/service';
import { cached, tracked } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import { findById } from 'ilios-common/utils/array-helpers';
import { dropTask } from 'ember-concurrency';
import FaIcon from 'ilios-common/components/fa-icon';
import gt from 'ember-truth-helpers/helpers/gt';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import pick from 'ilios-common/helpers/pick';
import sortBy from 'ilios-common/helpers/sort-by';
import eq from 'ember-truth-helpers/helpers/eq';
import ExpandCollapseButton from 'ilios-common/components/expand-collapse-button';
import set from 'ember-set-helper/helpers/set';
import not from 'ember-truth-helpers/helpers/not';
import New from 'frontend/components/program/new';
import perform from 'ember-concurrency/helpers/perform';
import { LinkTo } from '@ember/routing';
import List from 'frontend/components/programs/list';

export default class ProgramRootComponent extends Component {
  @service currentUser;
  @service permissionChecker;
  @tracked showNewProgramForm = false;
  @tracked newProgram;

  userModel = new TrackedAsyncData(this.currentUser.getModel());

  get user() {
    return this.userModel.isResolved ? this.userModel.value : null;
  }

  @cached
  get canCreateData() {
    return new TrackedAsyncData(
      this.bestSelectedSchool
        ? this.permissionChecker.canCreateProgram(this.bestSelectedSchool)
        : false,
    );
  }

  @cached
  get programsData() {
    return new TrackedAsyncData(this.bestSelectedSchool.programs);
  }

  get canCreate() {
    return this.canCreateData.isResolved ? this.canCreateData.value : false;
  }

  get programs() {
    return this.programsData.isResolved ? this.programsData.value : [];
  }

  get bestSelectedSchool() {
    if (this.args.schoolId) {
      return findById(this.args.schools, this.args.schoolId);
    }

    const schoolId = this.user?.belongsTo('school').id();
    return schoolId ? findById(this.args.schools, schoolId) : this.args.schools[0];
  }

  saveNewProgram = dropTask(async (newProgram) => {
    newProgram.set('school', this.bestSelectedSchool);
    newProgram.set('duration', 4);
    this.newProgram = await newProgram.save();
    this.showNewProgramForm = false;
  });
  <template>
    <section class="programs-root" data-test-programs>
      <div class="filters">
        <div class="schools" data-test-school-filter>
          <FaIcon @icon="building-columns" @fixedWidth={{true}} />
          {{#if (gt @schools.length 1)}}
            <select
              {{on "change" (pick "target.value" @setSchoolId)}}
              aria-label={{t "general.schools"}}
              data-test-school-selector
            >
              {{#each (sortBy "title" @schools) as |school|}}
                <option selected={{eq school.id this.bestSelectedSchool.id}} value={{school.id}}>
                  {{school.title}}
                </option>
              {{/each}}
            </select>
          {{else}}
            {{this.bestSelectedSchool.title}}
          {{/if}}
        </div>
      </div>

      <div class="main-list">
        <div class="header">
          <h2 class="title">
            {{t "general.programs"}}
          </h2>
          <div class="actions">
            {{#if this.canCreate}}
              <ExpandCollapseButton
                @value={{this.showNewProgramForm}}
                @action={{set this "showNewProgramForm" (not this.showNewProgramForm)}}
                @expandButtonLabel={{t "general.newProgram"}}
                @collapseButtonLabel={{t "general.cancel"}}
              />
            {{/if}}
          </div>
        </div>

        <div class="new">
          {{#if this.showNewProgramForm}}
            <New
              @save={{perform this.saveNewProgram}}
              @cancel={{set this "showNewProgramForm" false}}
            />
          {{/if}}
          {{#if this.newProgram}}
            <div class="saved-result">
              <LinkTo @route="program" @model={{this.newProgram}}>
                <FaIcon @icon="square-up-right" />
                {{this.newProgram.title}}
              </LinkTo>
              {{t "general.savedSuccessfully"}}
            </div>
          {{/if}}
        </div>

        <List @programs={{sortBy "title" this.programs}} />
      </div>
    </section>
  </template>
}
