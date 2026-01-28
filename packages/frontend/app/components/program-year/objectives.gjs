import Component from '@glimmer/component';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';
import { sortBy } from 'ilios-common/utils/array-helpers';
import { on } from '@ember/modifier';
import t from 'ember-intl/helpers/t';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import ExpandCollapseButton from 'ilios-common/components/expand-collapse-button';
import NewObjective from 'ilios-common/components/new-objective';
import perform from 'ember-concurrency/helpers/perform';
import ObjectiveList from 'frontend/components/program-year/objective-list';
import { faCaretDown } from '@fortawesome/free-solid-svg-icons';

export default class ProgramYearObjectivesComponent extends Component {
  @service store;
  @service flashMessages;
  @service intl;

  @tracked newObjectiveEditorOn = false;
  @tracked newObjectiveTitle;

  get showCollapsible() {
    return this.hasObjectives;
  }

  get hasObjectives() {
    return this.objectiveIdsCount > 0;
  }

  get objectiveIds() {
    return this.args.programYear.hasMany('programYearObjectives').ids();
  }

  get objectiveIdsCount() {
    return this.objectiveIds.length;
  }

  get allObjectivesExpanded() {
    return (
      this.objectiveIdsCount && this.args.expandedObjectiveIds?.length === this.objectiveIdsCount
    );
  }

  saveNewObjective = task({ drop: true }, async (title) => {
    const programYearObjectives = await this.args.programYear.programYearObjectives;
    const position = programYearObjectives.length
      ? sortBy(programYearObjectives, 'position').reverse()[0].position + 1
      : 0;

    const newProgramYearObjective = this.store.createRecord('program-year-objective');
    newProgramYearObjective.set('title', title);
    newProgramYearObjective.set('position', position);
    newProgramYearObjective.set('programYear', this.args.programYear);

    await newProgramYearObjective.save();

    this.newObjectiveEditorOn = false;
    this.flashMessages.success(this.intl.t('general.newObjectiveSaved'));
  });

  @action
  toggleNewObjectiveEditor() {
    //force expand the objective component
    //otherwise adding the first new objective will cause it to close
    this.args.expand();
    this.newObjectiveEditorOn = !this.newObjectiveEditorOn;
  }
  @action
  collapse() {
    if (this.hasObjectives) {
      this.args.collapse();
    }
  }
  @action
  toggleExpandAll() {
    if (this.args.expandedObjectiveIds?.length === this.objectiveIdsCount) {
      this.args.setExpandedObjectiveIds(null);
    } else {
      this.args.setExpandedObjectiveIds(this.objectiveIds);
    }
  }
  <template>
    <section class="program-year-objectives" data-test-program-year-objectives>
      <div class="header">
        {{#if this.showCollapsible}}
          <div>
            <button
              class="title link-button"
              type="button"
              aria-expanded="true"
              data-test-title
              {{on "click" this.collapse}}
            >
              {{t "general.objectives"}}
              ({{this.objectiveIdsCount}})
              <FaIcon @icon={{faCaretDown}} data-test-collapse />
            </button>
          </div>
        {{else}}
          <h3 class="title" data-test-title>
            {{t "general.objectives"}}
            ({{this.objectiveIdsCount}})
          </h3>
        {{/if}}
        {{#if @editable}}
          <span data-test-actions>
            <ExpandCollapseButton
              @value={{this.newObjectiveEditorOn}}
              @action={{this.toggleNewObjectiveEditor}}
              @expandButtonLabel={{t "general.addNew"}}
              @collapseButtonLabel={{t "general.close"}}
            />
          </span>
        {{/if}}
      </div>
      <div class="content">
        {{#if this.newObjectiveEditorOn}}
          <NewObjective
            @save={{perform this.saveNewObjective}}
            @cancel={{this.toggleNewObjectiveEditor}}
          />
        {{/if}}
        <ObjectiveList
          @programYear={{@programYear}}
          @allObjectivesExpanded={{this.allObjectivesExpanded}}
          @toggleExpandAll={{this.toggleExpandAll}}
          @editable={{@editable}}
          @expandedObjectiveIds={{@expandedObjectiveIds}}
          @setExpandedObjectiveIds={{@setExpandedObjectiveIds}}
        />
      </div>
    </section>
  </template>
}
