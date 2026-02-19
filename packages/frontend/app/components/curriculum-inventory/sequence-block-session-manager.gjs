import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { on } from '@ember/modifier';
import { fn, uniqueId, concat } from '@ember/helper';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import pick from 'ilios-common/helpers/pick';
import t from 'ember-intl/helpers/t';
import SortableTh from 'ilios-common/components/sortable-th';
import { eq, or } from 'ember-truth-helpers';
import sortBy from 'ilios-common/helpers/sort-by';
import includes from 'ilios-common/helpers/includes';
import { faArrowRotateLeft, faCheck } from '@fortawesome/free-solid-svg-icons';

export default class SequenceBlockSessionManagerComponent extends Component {
  @service store;
  @tracked excludedSessions = [];
  @tracked linkedSessions = [];
  @tracked sessions = [];

  constructor() {
    super(...arguments);
    this.linkedSessions = this.args.linkedSessions;
    this.excludedSessions = this.args.excludedSessions;
    this.sessions = this.args.sessions;
  }

  get allSelected() {
    if (
      !this.linkedSessions ||
      !this.sessions ||
      this.linkedSessions.length < this.sessions.length
    ) {
      return false;
    }
    this.sessions.forEach((session) => {
      if (!this.linkedSessions.includes(session)) {
        return false;
      }
    });
    return true;
  }

  get allExcluded() {
    if (
      !this.excludedSessions ||
      !this.sessions ||
      this.excludedSessions.length < this.sessions.length
    ) {
      return false;
    }
    this.sessions.forEach((session) => {
      if (!this.excludedSessions.includes(session)) {
        return false;
      }
    });
    return true;
  }

  get someSelected() {
    return !this.allSelected && !this.noneSelected;
  }

  get someExcluded() {
    return !this.allExcluded && !this.noneExcluded;
  }

  get noneSelected() {
    if (!this.linkedSessions || !this.sessions) {
      return true;
    }

    let isSelected = false;
    this.linkedSessions.forEach((linkedSession) => {
      if (this.sessions.includes(linkedSession)) {
        isSelected = true;
      }
    });
    return !isSelected;
  }

  get noneExcluded() {
    if (!this.excludedSessions || !this.sessions) {
      return true;
    }

    let isSelected = false;
    this.excludedSessions.forEach((session) => {
      if (this.sessions.includes(session)) {
        isSelected = true;
      }
    });
    return !isSelected;
  }

  get sortedAscending() {
    return this.args.sortBy.search(/desc/) === -1;
  }

  @action
  changeSession(session) {
    if (this.linkedSessions.includes(session)) {
      this.linkedSessions = this.linkedSessions.filter(
        (linkedSession) => linkedSession !== session,
      );
    } else {
      this.linkedSessions = [...this.linkedSessions, session];
    }
  }

  @action
  excludeSession(session) {
    if (this.excludedSessions.includes(session)) {
      this.excludedSessions = this.excludedSessions.filter(
        (excludedSession) => excludedSession !== session,
      );
    } else {
      this.excludedSessions = [...this.excludedSessions, session];
    }
  }

  @action
  toggleSelectAll() {
    if (this.allSelected) {
      this.linkedSessions = [];
    } else {
      this.linkedSessions = this.sessions;
    }
  }

  @action
  toggleExcludeAll() {
    if (this.allExcluded) {
      this.excludedSessions = [];
    } else {
      this.excludedSessions = this.sessions;
    }
  }

  @action
  changeSortOrder(what) {
    if (this.args.sortBy === what) {
      what += ':desc';
    }
    this.args.setSortBy(what);
  }
  <template>
    <section
      class="curriculum-inventory-sequence-block-session-manager resultslist"
      data-test-curriculum-inventory-sequence-block-session-manager
      ...attributes
    >
      <div class="actions">
        <button
          type="button"
          class="bigadd"
          aria-label={{t "general.save"}}
          {{on "click" (fn @save this.linkedSessions this.excludedSessions)}}
          data-test-save
        >
          <FaIcon @icon={{faCheck}} />
        </button>
        <button
          type="button"
          class="bigcancel"
          aria-label={{t "general.cancel"}}
          {{on "click" @cancel}}
          data-test-cancel
        >
          <FaIcon @icon={{faArrowRotateLeft}} />
        </button>
      </div>
      <div class="list">
        {{#let (uniqueId) (uniqueId) as |countAsOneLabelId excludedLabelId|}}
          <table class="ilios-table ilios-table-colors ilios-zebra-table">
            <thead>
              <tr>
                <th class="text-center count-as-one-header" colspan="2">
                  <input
                    type="checkbox"
                    checked={{this.allSelected}}
                    indeterminate={{this.someSelected}}
                    aria-labelledby={{countAsOneLabelId}}
                    {{on "click" (pick "target.value" this.toggleSelectAll)}}
                  />
                  <label id={{countAsOneLabelId}}>{{t "general.countAsOneOffering"}}</label>
                </th>
                <th class="text-center count-as-one-header" colspan="2">
                  <input
                    type="checkbox"
                    checked={{this.allExcluded}}
                    indeterminate={{this.someExcluded}}
                    aria-labelledby={{excludedLabelId}}
                    {{on "click" (pick "target.value" this.toggleExcludeAll)}}
                  />
                  <label id={{excludedLabelId}}>{{t "general.exclude"}}</label>
                </th>
                <SortableTh
                  @colspan={{3}}
                  @onClick={{fn this.changeSortOrder "title"}}
                  @sortedBy={{or (eq @sortBy "title") (eq @sortBy "title:desc")}}
                  @sortedAscending={{this.sortedAscending}}
                >
                  {{t "general.sessionTitle"}}
                </SortableTh>
                <SortableTh
                  @colspan={{3}}
                  @onClick={{fn this.changeSortOrder "sessionType.title"}}
                  @sortedBy={{or
                    (eq @sortBy "sessionType.title")
                    (eq @sortBy "sessionType.title:desc")
                  }}
                  @sortedAscending={{this.sortedAscending}}
                >
                  {{t "general.sessionType"}}
                </SortableTh>
                <th class="text-center" colspan="1">
                  {{t "general.totalTime"}}
                </th>
                <SortableTh
                  @colspan={{1}}
                  @onClick={{fn this.changeSortOrder "offerings.length"}}
                  @sortedBy={{or
                    (eq @sortBy "offerings.length")
                    (eq @sortBy "offerings.length:desc")
                  }}
                  @sortedAscending={{this.sortedAscending}}
                  @sortType="numeric"
                >
                  {{t "general.offerings"}}
                </SortableTh>
              </tr>
            </thead>
            <tbody>
              {{#each (sortBy @sortBy this.sessions) as |session|}}
                {{#let (uniqueId) as |sessionTitleLabelId|}}
                  <tr>
                    <td class="text-center" colspan="2">
                      <input
                        type="checkbox"
                        checked={{includes session this.linkedSessions}}
                        aria-labelledby={{concat countAsOneLabelId " " sessionTitleLabelId}}
                        {{on "change" (fn this.changeSession session)}}
                      />
                    </td>
                    <td class="text-center" colspan="2">
                      <input
                        type="checkbox"
                        checked={{includes session this.excludedSessions}}
                        aria-labelledby={{concat excludedLabelId " " sessionTitleLabelId}}
                        {{on "change" (fn this.excludeSession session)}}
                      />
                    </td>
                    <td class="text-left" colspan="3">
                      <label id={{sessionTitleLabelId}}>
                        {{#if session.isIndependentLearning}}
                          <strong>
                            ({{t "general.ilm"}})
                          </strong>
                        {{/if}}
                        {{session.title}}
                      </label>
                    </td>
                    <td class="text-left" colspan="3">
                      {{session.sessionType.title}}
                    </td>
                    <td class="text-center" colspan="1">
                      {{#if (includes session this.linkedSessions)}}
                        {{session.maxDuration}}
                      {{else}}
                        {{session.totalSumDuration}}
                      {{/if}}
                    </td>
                    <td class="text-center" colspan="1">
                      {{session.offerings.length}}
                    </td>
                  </tr>
                {{/let}}
              {{/each}}
            </tbody>
          </table>
        {{/let}}
      </div>
    </section>
  </template>
}
