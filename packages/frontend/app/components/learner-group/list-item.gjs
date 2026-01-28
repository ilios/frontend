import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { all, filter, map } from 'rsvp';
import { TrackedAsyncData } from 'ember-async-data';
import { service } from '@ember/service';
import { LinkTo } from '@ember/routing';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import t from 'ember-intl/helpers/t';
import and from 'ember-truth-helpers/helpers/and';
import not from 'ember-truth-helpers/helpers/not';
import { on } from '@ember/modifier';
import perform from 'ember-concurrency/helpers/perform';
import set from 'ember-set-helper/helpers/set';
import { faCopy, faTrash, faUniversalAccess } from '@fortawesome/free-solid-svg-icons';

export default class LearnerGroupListItemComponent extends Component {
  @service permissionChecker;
  @tracked showRemoveConfirmation = false;
  @tracked showCopyConfirmation = false;

  @cached
  get sortedTitlesOfSubgroupsInNeedOfAccommodationData() {
    return new TrackedAsyncData(
      this.getSortedTitlesOfSubgroupsInNeedOfAccommodation(
        this.args.learnerGroup.getSubgroupsInNeedOfAccommodation,
      ),
    );
  }

  get sortedTitlesOfSubgroupsInNeedOfAccommodation() {
    return this.sortedTitlesOfSubgroupsInNeedOfAccommodationData.isResolved
      ? this.sortedTitlesOfSubgroupsInNeedOfAccommodationData.value
      : '';
  }

  @cached
  get canDeleteData() {
    return new TrackedAsyncData(
      this.permissionChecker.canDeleteLearnerGroup(this.args.learnerGroup),
    );
  }

  @cached
  get canCreateData() {
    return new TrackedAsyncData(
      this.school ? this.permissionChecker.canCreateLearnerGroup(this.school) : false,
    );
  }

  @cached
  get schoolData() {
    return new TrackedAsyncData(this.getSchool(this.args.learnerGroup));
  }

  @cached
  get isLinkedData() {
    return new TrackedAsyncData(this.isLinkedToOfferingsOrIlms(this.args.learnerGroup));
  }

  get school() {
    return this.schoolData.isResolved ? this.schoolData.value : null;
  }

  @cached
  get isLinked() {
    return this.isLinkedData.isResolved ? this.isLinkedData.value : null;
  }

  get canDelete() {
    if (this.isLinked) {
      return false;
    }
    return this.canDeleteData.isResolved ? this.canDeleteData.value && !this.isLinked : false;
  }

  get canCreate() {
    return this.canCreateData.isResolved ? this.canCreateData.value && this.school : false;
  }

  async getSortedTitlesOfSubgroupsInNeedOfAccommodation(groups) {
    const titles = await map(groups, (group) => group.getTitleWithParentTitles());
    return titles.sort().join(', ');
  }

  async getSchool(learnerGroup) {
    const cohort = await learnerGroup.cohort;
    const programYear = await cohort.programYear;
    const program = await programYear.program;
    return program.school;
  }

  async isLinkedToOfferingsOrIlms(learnerGroup) {
    const offerings = await learnerGroup.offerings;
    if (offerings.length) {
      return true;
    }
    const ilms = await learnerGroup.ilmSessions;
    if (ilms.length) {
      return true;
    }
    const children = await learnerGroup.children;
    const linkedChildren = await filter(children, async (child) => {
      return this.isLinkedToOfferingsOrIlms(child);
    });
    return !!linkedChildren.length;
  }

  remove = task({ drop: true }, async () => {
    const descendants = await this.args.learnerGroup.allDescendants;
    await all([
      ...descendants.map((descendant) => descendant.destroyRecord()),
      this.args.learnerGroup.destroyRecord(),
    ]);
  });

  @action
  copyWithLearners() {
    this.args.copyGroup(true, this.args.learnerGroup);
  }

  @action
  copyWithoutLearners() {
    this.args.copyGroup(false, this.args.learnerGroup);
  }

  @action
  showCopy() {
    this.showCopyConfirmation = true;
    this.showRemoveConfirmation = false;
  }

  @action
  showRemove() {
    this.showRemoveConfirmation = true;
    this.showCopyConfirmation = false;
  }
  <template>
    <tr
      class="{{if this.showRemoveConfirmation 'confirm-removal'}}
        {{if this.showCopyConfirmation 'confirm-copy content-row'}}"
      data-test-learner-group-list-item
    >
      <td class="text-left" colspan="2" data-test-title>
        <LinkTo @route="learner-group" @model={{@learnerGroup}}>
          {{@learnerGroup.title}}
        </LinkTo>
        {{#if @learnerGroup.needsAccommodation}}
          <FaIcon
            @icon={{faUniversalAccess}}
            @title={{t "general.accommodationIsRequiredForLearnersInThisGroup"}}
            data-test-needs-accommodation
          />
        {{/if}}
      </td>
      <td class="text-center hide-from-small-screen" data-test-users>
        {{@learnerGroup.usersCount}}
      </td>
      <td class="text-center hide-from-small-screen" data-test-children>
        <span data-test-children-count>{{@learnerGroup.childrenCount}}</span>
        {{#if @learnerGroup.hasSubgroupsInNeedOfAccommodation}}
          <FaIcon
            @icon={{faUniversalAccess}}
            @title={{t
              "general.accommodationIsRequiredForLearnersInSubgroups"
              groups=this.sortedTitlesOfSubgroupsInNeedOfAccommodation
            }}
            data-test-subgroup-needs-accommodation
          />
        {{/if}}
      </td>
      <td class="text-right">
        {{#if (and this.canDelete (not this.showRemoveConfirmation))}}
          <button
            class="link-button"
            type="button"
            {{on "click" this.showRemove}}
            title={{t "general.remove"}}
            data-test-remove
          >
            <FaIcon @icon={{faTrash}} />
          </button>
        {{else}}
          <FaIcon @icon={{faTrash}} class="disabled" />
        {{/if}}
        {{#if (and this.canCreate (not this.showCopyConfirmation))}}
          <button
            class="link-button"
            type="button"
            {{on "click" this.showCopy}}
            title={{t "general.copy"}}
            data-test-copy
          >
            <FaIcon @icon={{faCopy}} />
          </button>
        {{else}}
          <FaIcon @icon={{faCopy}} class="disabled" />
        {{/if}}
      </td>
    </tr>
    {{#if this.showRemoveConfirmation}}
      <tr class="confirm-removal" data-test-confirm-removal>
        <td class="hide-from-small-screen"></td>
        <td colspan="3" class="confirm-message">
          {{t "general.confirmRemoveLearnerGroup" subgroupCount=@learnerGroup.children.length}}
          <br />
          <div class="confirm-buttons">
            <button
              type="button"
              class="remove text"
              {{on "click" (perform this.remove)}}
              data-test-confirm
            >
              {{t "general.yes"}}
            </button>
            <button
              type="button"
              class="done text"
              {{on "click" (set this "showRemoveConfirmation" false)}}
              data-test-cancel
            >
              {{t "general.cancel"}}
            </button>
          </div>
        </td>
        <td class="hide-from-small-screen"></td>
      </tr>
    {{/if}}
    {{#if this.showCopyConfirmation}}
      <tr class="confirm-copy actions-row" data-test-confirm-copy>
        <td colspan="3">
          <div class="confirm-buttons">
            {{#if @canCopyWithLearners}}
              <button
                type="button"
                class="done text"
                {{on "click" this.copyWithLearners}}
                data-test-confirm-with-learners
              >
                {{t "general.copyWithLearners"}}
              </button>
              <button
                type="button"
                class="done text"
                {{on "click" this.copyWithoutLearners}}
                data-test-confirm-without-learners
              >
                {{t "general.copyWithoutLearners"}}
              </button>
            {{else}}
              <button
                type="button"
                class="done text"
                {{on "click" this.copyWithoutLearners}}
                data-test-confirm-without-learners
              >
                {{t "general.copy"}}
              </button>
            {{/if}}
            <button
              type="button"
              class="cancel text"
              {{on "click" (set this "showCopyConfirmation" false)}}
              data-test-cancel
            >
              {{t "general.cancel"}}
            </button>
          </div>
        </td>
        <td class="hide-from-small-screen"></td>
        <td class="hide-from-small-screen"></td>
      </tr>
    {{/if}}
  </template>
}
