import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import t from 'ember-intl/helpers/t';

import MeshDescriptorLastTreeNumber from '../../../mesh-descriptor-last-tree-number';
import MeshManager from '../../../mesh-manager';

export default class ReportsSubjectNewMeshTermComponent extends Component {
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
            <FaIcon @icon={{faXmark}} class="remove" />
          </button>
        {{/if}}
      {{else}}
        <MeshManager @add={{this.chooseMeshTerm}} @editable={{true}} />
      {{/if}}
    </p>
  </template>
}
