import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { dropTask } from 'ember-concurrency';
import t from 'ember-intl/helpers/t';
import ExpandCollapseButton from 'ilios-common/components/expand-collapse-button';
import NewSequenceBlock from 'frontend/components/curriculum-inventory/new-sequence-block';
import perform from 'ember-concurrency/helpers/perform';
import { LinkTo } from '@ember/routing';
import FaIcon from 'ilios-common/components/fa-icon';
import sortBy from 'ilios-common/helpers/sort-by';
import SequenceBlockListItem from 'frontend/components/curriculum-inventory/sequence-block-list-item';

export default class SequenceBlockListComponent extends Component {
  @service store;

  @tracked editorOn = false;
  @tracked savedBlock;

  get isInOrderedSequence() {
    return this.args.parent && this.args.parent.isOrdered;
  }

  @action
  toggleEditor() {
    this.editorOn = !this.editorOn;
    this.savedBlock = null;
  }

  @action
  cancel() {
    this.editorOn = false;
  }

  save = dropTask(async (block) => {
    this.editorOn = false;
    this.savedBlock = await block.save();
    // adding/updating a sequence block will have side-effects on its siblings if the given block is nested
    // inside an "ordered" sequence block. they all get re-sorted server-side.
    // therefore, we must reload them here in order to get those updated sort order values.
    // [ST 2021/03/16]
    if (this.args.parent) {
      await this.store.findRecord('curriculum-inventory-sequence-block', this.args.parent.id, {
        include: 'children',
        reload: true,
      });
    }
  });
  <template>
    <div
      class="curriculum-inventory-sequence-block-list"
      data-test-curriculum-inventory-sequence-block-list
      ...attributes
    >
      <div class="header" data-test-header>
        <div class="title" data-test-title>
          {{t "general.sequenceBlocks"}}
          ({{@sequenceBlocks.length}})
        </div>
        <div class="actions">
          {{#if @canUpdate}}
            <ExpandCollapseButton @value={{this.editorOn}} @action={{this.toggleEditor}} />
          {{/if}}
        </div>
      </div>
      <div class="new" data-test-new>
        {{#if this.editorOn}}
          <NewSequenceBlock
            @parent={{@parent}}
            @report={{@report}}
            @save={{perform this.save}}
            @cancel={{this.cancel}}
          />
        {{/if}}
        {{#if this.savedBlock}}
          <div class="saved-result">
            <LinkTo @route="curriculum-inventory-sequence-block" @model={{this.savedBlock}}>
              <FaIcon @icon="square-up-right" />
              {{this.savedBlock.title}}
            </LinkTo>
            {{t "general.savedSuccessfully"}}
          </div>
        {{/if}}
      </div>
      {{#if @sequenceBlocks.length}}
        <div class="list" data-test-list>
          <table>
            <thead>
              <tr>
                <th class="text-center" colspan="4">
                  {{t "general.sequenceBlock"}}
                </th>
                <th class="text-center" colspan="1">
                  {{t "general.startLevel"}}
                </th>
                <th class="text-center" colspan="1">
                  {{t "general.endLevel"}}
                </th>
                <th class="text-center" colspan="2">
                  {{t "general.sequenceNumber"}}
                </th>
                <th class="text-center hide-from-small-screen" colspan="2">
                  {{t "general.startDate"}}
                </th>
                <th class="text-center hide-from-small-screen" colspan="2">
                  {{t "general.endDate"}}
                </th>
                <th class="text-center hide-from-small-screen" colspan="2">
                  {{t "general.course"}}
                </th>
                <th class="text-left" colspan="1">
                  {{t "general.actions"}}
                </th>
              </tr>
            </thead>
            <tbody>
              {{#each
                (if
                  this.isInOrderedSequence
                  (sortBy "orderInSequence" "title" "startDate" "id" @sequenceBlocks)
                  (sortBy "title" "startDate" "id" @sequenceBlocks)
                )
                as |sequenceBlock|
              }}
                <SequenceBlockListItem
                  @sequenceBlock={{sequenceBlock}}
                  @canUpdate={{@canUpdate}}
                  @remove={{@remove}}
                  @isInOrderedSequence={{this.isInOrderedSequence}}
                />
              {{/each}}
            </tbody>
          </table>
        </div>
      {{else if @parent}}
        <div class="default-message" data-test-no-sub-sequence-blocks>
          {{t "general.noSubSequenceBlocks"}}
        </div>
      {{else}}
        <div class="default-message" data-test-no-sequence-blocks>
          {{t "general.noSequenceBlocks"}}
        </div>
      {{/if}}
    </div>
  </template>
}
