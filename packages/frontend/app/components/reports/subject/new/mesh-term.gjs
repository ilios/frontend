import Component from '@glimmer/component';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import { service } from '@ember/service';
import { action } from '@ember/object';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
import MeshDescriptorLastTreeNumber from 'ilios-common/components/mesh-descriptor-last-tree-number';
import FaIcon from 'ilios-common/components/fa-icon';
import MeshManager from 'ilios-common/components/mesh-manager';

export default class ReportsSubjectNewProgramComponent extends Component {
  @service store;

  @cached
  get selectedMeshTerm() {
    return new TrackedAsyncData(this.store.findRecord('mesh-descriptor', this.args.currentId));
  }

  @action
  chooseMeshTerm(term) {
    this.args.changeId(term.id);
  }
  <template>
    <p data-test-reports-subject-new-mesh-term>
      <label for="new-mesh-term">
        {{t "general.whichIs"}}
      </label>
      {{#if @currentId}}
        {{#if this.selectedMeshTerm.isResolved}}
          <button
            class="link-button"
            type="button"
            {{on "click" (fn @changeId null)}}
            data-test-remove
          >
            <span class="term-title" data-test-name>
              {{this.selectedMeshTerm.value.name}}
            </span>
            <span class="term-details" data-test-details>
              {{this.selectedMeshTerm.id}}
              {{#if this.selectedMeshTerm.value.trees.length}}
                -
                <MeshDescriptorLastTreeNumber @descriptor={{this.selectedMeshTerm.value}} />
              {{/if}}
            </span>
            <FaIcon @icon="xmark" class="remove" />
          </button>
        {{/if}}
      {{else}}
        <MeshManager @add={{this.chooseMeshTerm}} @editable={{true}} />
      {{/if}}
    </p>
  </template>
}
