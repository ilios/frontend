import Component from '@glimmer/component';
import { service } from '@ember/service';
import { cached, tracked } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import { findById } from 'ilios-common/utils/array-helpers';
import { dropTask } from 'ember-concurrency';

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
}

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
          {{#each (sort-by "title" @schools) as |school|}}
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
          />
        {{/if}}
      </div>
    </div>

    <div class="new">
      {{#if this.showNewProgramForm}}
        <Program::New
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

    <Programs::List @programs={{sort-by "title" this.programs}} />
  </div>
</section>