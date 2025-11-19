import Component from '@glimmer/component';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';
import { mapBy } from 'ilios-common/utils/array-helpers';
import { on } from '@ember/modifier';
import t from 'ember-intl/helpers/t';
import FaIcon from 'ilios-common/components/fa-icon';
import ExpandCollapseButton from 'ilios-common/components/expand-collapse-button';
import NewObjective from 'ilios-common/components/new-objective';
import perform from 'ember-concurrency/helpers/perform';
import ObjectiveList from 'ilios-common/components/session/objective-list';

export default class SessionObjectivesComponent extends Component {
  @service store;
  @service flashMessages;

  @tracked newObjectiveEditorOn = false;
  @tracked newObjectiveTitle;

  get showCollapsible() {
    return this.hasObjectives && !this.isManaging;
  }

  get hasObjectives() {
    return this.objectiveCount > 0;
  }

  get objectiveCount() {
    return this.args.session.hasMany('sessionObjectives').ids().length;
  }

  saveNewObjective = task({ drop: true }, async (title) => {
    const newSessionObjective = this.store.createRecord('session-objective');
    let position = 0;
    const sessionObjectives = await this.args.session.sessionObjectives;
    if (sessionObjectives.length) {
      const positions = mapBy(sessionObjectives, 'position');
      position = Math.max(...positions) + 1;
    }

    newSessionObjective.set('title', title);
    newSessionObjective.set('position', position);
    newSessionObjective.set('session', this.args.session);

    await newSessionObjective.save();

    this.newObjectiveEditorOn = false;
    this.flashMessages.success('general.newObjectiveSaved');
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
  <template>
    <section class="session-objectives" data-test-session-objectives>
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
              ({{this.objectiveCount}})
              <FaIcon @icon="caret-down" />
            </button>
          </div>
        {{else}}
          <h3 class="title" data-test-title>
            {{t "general.objectives"}}
            ({{this.objectiveCount}})
          </h3>
        {{/if}}
        {{#if @editable}}
          <span data-test-actions>
            <ExpandCollapseButton
              @value={{this.newObjectiveEditorOn}}
              @action={{this.toggleNewObjectiveEditor}}
              @expandButtonLabel={{t "general.addNew"}}
              @collapseButtonLabel={{t "general.cancel"}}
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
        <ObjectiveList @session={{@session}} @editable={{@editable}} />
      </div>
    </section>
  </template>
}
