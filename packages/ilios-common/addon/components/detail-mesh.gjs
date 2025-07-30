import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { dropTask } from 'ember-concurrency';
import { action } from '@ember/object';
import { TrackedAsyncData } from 'ember-async-data';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import perform from 'ember-concurrency/helpers/perform';
import FaIcon from 'ilios-common/components/fa-icon';
import MeshManager from 'ilios-common/components/mesh-manager';
import sortBy from 'ilios-common/helpers/sort-by';
import MeshDescriptorLastTreeNumber from 'ilios-common/components/mesh-descriptor-last-tree-number';

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

  save = dropTask(async () => {
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
              <button
                class="bigadd"
                type="button"
                aria-label={{t "general.save"}}
                {{on "click" (perform this.save)}}
              >
                <FaIcon @icon="check" />
              </button>
              <button
                class="bigcancel"
                type="button"
                aria-label={{t "general.cancel"}}
                {{on "click" this.cancel}}
              >
                <FaIcon @icon="arrow-rotate-left" />
              </button>
            {{else if @editable}}
              <button type="button" {{on "click" this.manage}}>
                {{t "general.meshManageTitle"}}
              </button>
            {{/if}}
          </div>
        </div>
        <div class="content">
          {{#if this.isManaging}}
            <MeshManager
              @editable={{@editable}}
              @terms={{this.bufferedDescriptors}}
              @add={{this.addDescriptorToBuffer}}
              @remove={{this.removeDescriptorFromBuffer}}
            />
          {{else}}
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
          {{/if}}
        </div>
      {{/if}}
    </section>
  </template>
}
