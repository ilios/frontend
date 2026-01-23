import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { TrackedAsyncData } from 'ember-async-data';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
import LmTypeIcon from 'ilios-common/components/lm-type-icon';
import UserNameInfo from 'ilios-common/components/user-name-info';
import t from 'ember-intl/helpers/t';
import FaIcon from 'ilios-common/components/fa-icon';
import sortBy from 'ilios-common/helpers/sort-by';
import or from 'ember-truth-helpers/helpers/or';
import set from 'ember-set-helper/helpers/set';
import perform from 'ember-concurrency/helpers/perform';
import { faClock, faEye, faPenToSquare, faTrash } from '@fortawesome/free-solid-svg-icons';

export default class DetailLearningMaterialsItemComponent extends Component {
  @tracked showRemoveConfirmation = false;

  @cached
  get owningUserData() {
    return new TrackedAsyncData(this.getOwningUser(this.args.lm));
  }

  get owningUser() {
    return this.owningUserData.isResolved ? this.owningUserData.value : null;
  }

  @cached
  get meshDescriptorsData() {
    return new TrackedAsyncData(this.args.lm.meshDescriptors);
  }

  get meshDescriptors() {
    return this.meshDescriptorsData.isResolved ? this.meshDescriptorsData.value : [];
  }

  get meshDescriptorsLoaded() {
    return this.meshDescriptorsData.isResolved;
  }

  async getOwningUser(lm) {
    const learningMaterial = await lm.learningMaterial;
    return await learningMaterial.owningUser;
  }

  remove = task({ drop: true }, async (lm) => {
    await this.args.remove.perform(lm);
  });
  <template>
    <tr
      class={{if this.showRemoveConfirmation "confirm-removal"}}
      data-test-detail-learning-materials-item
    >
      <td colspan="3">
        <button
          type="button"
          class="lm-title text-wrap"
          {{on "click" (fn @setManagedMaterial @lm)}}
          data-test-title-manage
        >
          <LmTypeIcon
            @type={{@lm.learningMaterial.type}}
            @mimetype={{@lm.learningMaterial.mimetype}}
          />
          <span data-test-title>
            {{@lm.learningMaterial.title}}
          </span>
        </button>
      </td>
      <td class="text-center" colspan="2">
        <UserNameInfo @user={{this.owningUser}} />
      </td>
      <td class="text-center" colspan="2" data-test-required>
        {{#if @lm.required}}
          <span class="add">
            {{t "general.yes"}}
          </span>
        {{else}}
          <span class="remove">
            {{t "general.no"}}
          </span>
        {{/if}}
      </td>
      <td class="text-center" colspan="2">
        {{#if @lm.notes}}
          <span class="add" data-test-notes>
            {{t "general.yes"}}
          </span>
          {{#if @lm.publicNotes}}
            <FaIcon
              @icon={{faEye}}
              @title={{t "general.visibleToStudents"}}
              data-test-visible-to-students
            />
          {{/if}}
        {{else}}
          <span class="remove" data-test-notes>
            {{t "general.no"}}
          </span>
        {{/if}}
      </td>
      <td class="text-center" colspan="2" data-test-mesh>
        {{#if this.meshDescriptorsLoaded}}
          {{#if this.meshDescriptors.length}}
            <ul>
              {{#each (sortBy "name" this.meshDescriptors) as |descriptor|}}
                <li>
                  {{descriptor.name}}
                </li>
              {{/each}}
            </ul>
          {{else}}
            <em>{{t "general.none"}}</em>
          {{/if}}
        {{/if}}
      </td>
      <td class="text-center" colspan="2">
        <span data-test-status>
          {{@lm.learningMaterial.status.title}}
        </span>
        {{#if (or @lm.startDate @lm.endDate)}}
          <FaIcon @icon={{faClock}} @title={{t "general.timedRelease"}} data-test-timed-release />
        {{/if}}
      </td>
      <td class="text-left text-center" colspan="1" data-test-actions>
        {{#if @editable}}
          <button
            type="button"
            class="icon-button"
            aria-label={{t "general.edit"}}
            {{on "click" (fn @setManagedMaterial @lm)}}
            data-test-edit
          >
            <FaIcon @icon={{faPenToSquare}} />
          </button>
          <button
            type="button"
            class="icon-button remove"
            aria-label={{t "general.remove"}}
            {{on "click" (set this "showRemoveConfirmation" true)}}
            data-test-remove
          >
            <FaIcon @icon={{faTrash}} />
          </button>
        {{else}}
          <FaIcon @icon={{faTrash}} class="disabled" />
        {{/if}}
      </td>
    </tr>
    {{#if this.showRemoveConfirmation}}
      <tr class="confirm-removal" data-test-confirm-removal>
        <td colspan="14">
          <div class="confirm-message">
            {{t "general.confirmRemoval"}}
            <br />
            <div class="confirm-buttons">
              <button
                class="remove text"
                type="button"
                {{on "click" (perform this.remove @lm)}}
                data-test-confirm
              >
                {{t "general.yes"}}
              </button>
              <button
                class="done text"
                type="button"
                {{on "click" (set this "showRemoveConfirmation" false)}}
                data-test-cancel
              >
                {{t "general.cancel"}}
              </button>
            </div>
          </div>
        </td>
      </tr>
    {{/if}}
  </template>
}
