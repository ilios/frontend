import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';
import { TrackedAsyncData } from 'ember-async-data';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import perform from 'ember-concurrency/helpers/perform';
import MeshManager from 'ilios-common/components/mesh-manager';
import sortBy from 'ilios-common/helpers/sort-by';
import MeshDescriptorLastTreeNumber from 'ilios-common/components/mesh-descriptor-last-tree-number';
import BigAddCancelButtons from 'ilios-common/components/big-add-cancel-buttons';

export default class DetailMeshComponent extends Component {
  @tracked isManaging = false;
  @tracked bufferedDescriptors = null;
  @tracked meshDescriptorRelationship;

  @cached
  get meshDescriptorsData() {
    return new TrackedAsyncData(this.args.subject.meshDescriptors);
  }

  get meshDescriptors() {
    if (!this.meshDescriptorsData.isResolved) {
      return [];
    }

    return this.meshDescriptorsData.value;
  }
  @action
  manage() {
    this.bufferedDescriptors = [...this.meshDescriptors];
    this.isManaging = true;
  }
  @action
  cancel() {
    this.isManaging = false;
    this.bufferedDescriptors = [];
  }
  @action
  addDescriptorToBuffer(descriptor) {
    this.bufferedDescriptors = [...this.bufferedDescriptors, descriptor];
  }
  @action
  removeDescriptorFromBuffer(descriptor) {
    this.bufferedDescriptors = this.bufferedDescriptors.filter((obj) => obj.id !== descriptor.id);
  }

  save = task({ drop: true }, async () => {
    this.args.subject.set('meshDescriptors', this.bufferedDescriptors);
    await this.args.subject.save();
    this.bufferedDescriptors = null;
    this.isManaging = false;
  });
  <template>
    <section class="detail-mesh" data-test-detail-mesh>
      {{#if this.meshDescriptorsData.isResolved}}
        <div class="detail-mesh-header">
          <div class="title">
            {{#if this.isManaging}}
              <span class="detail-specific-title">
                {{t "general.meshManageTitle"}}
              </span>
            {{else}}
              {{t "general.mesh"}}
              ({{this.meshDescriptors.length}})
            {{/if}}
          </div>
          <div class="actions">
            {{#if this.isManaging}}
              <BigAddCancelButtons
                @add={{perform this.save}}
                @cancel={{this.cancel}}
                @disableSave={{this.save.isRunning}}
              />
            {{else if @editable}}
              <button type="button" {{on "click" this.manage}}>
                {{t "general.meshManageTitle"}}
              </button>
            {{/if}}
          </div>
        </div>
        {{#if this.isManaging}}
          <div class="content">
            <MeshManager
              @editable={{@editable}}
              @terms={{this.bufferedDescriptors}}
              @add={{this.addDescriptorToBuffer}}
              @remove={{this.removeDescriptorFromBuffer}}
            />
          </div>
        {{else}}
          <div class="content{{unless this.meshDescriptors.length ' empty'}}">
            {{#if this.meshDescriptors.length}}
              <ul class="selected-mesh-terms">

                {{#each (sortBy "name" this.meshDescriptors) as |term|}}
                  <li>
                    <span class="term-title">
                      {{term.name}}
                    </span>
                    <span class="term-details">
                      {{term.id}}
                      {{#if term.deleted}}
                        -
                        <span class="deprecated">
                          ({{t "general.deprecatedAbbreviation"}})
                        </span>
                      {{else if term.trees.length}}
                        -
                        <MeshDescriptorLastTreeNumber @descriptor={{term}} />
                      {{/if}}
                    </span>
                  </li>
                {{/each}}
              </ul>
            {{/if}}
          </div>
        {{/if}}
      {{/if}}
    </section>
  </template>
}
