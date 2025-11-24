import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import escapeRegExp from 'ilios-common/utils/escape-reg-exp';
import { sortBy } from 'ilios-common/utils/array-helpers';
import { TrackedAsyncData } from 'ember-async-data';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import set from 'ember-set-helper/helpers/set';
import FaIcon from 'ilios-common/components/fa-icon';
import pick from 'ilios-common/helpers/pick';
import eq from 'ember-truth-helpers/helpers/eq';
import formatDate from 'ember-intl/helpers/format-date';
import perform from 'ember-concurrency/helpers/perform';
import LoadingSpinner from 'ilios-common/components/loading-spinner';

export default class SessionPostrequisiteEditorComponent extends Component {
  @tracked filter = '';
  @tracked userSelectedPostrequisite = false;

  @cached
  get currentPostrequisiteData() {
    return new TrackedAsyncData(this.args.session.postrequisite);
  }

  get currentPostrequisite() {
    return this.currentPostrequisiteData.isResolved ? this.currentPostrequisiteData.value : null;
  }

  @cached
  get courseData() {
    return new TrackedAsyncData(this.args.session.course);
  }

  get course() {
    return this.courseData.isResolved ? this.courseData.value : null;
  }

  @cached
  get sessionsData() {
    return new TrackedAsyncData(this.course?.sessions);
  }

  get sessions() {
    return this.sessionsData.isResolved ? this.sessionsData.value : [];
  }

  get selectedPostrequisite() {
    if (this.userSelectedPostrequisite !== false) {
      return this.userSelectedPostrequisite;
    }
    return this.currentPostrequisite;
  }

  get linkablePostrequisites() {
    if (!this.sessions) {
      return [];
    }
    return sortBy(
      this.sessions.filter((session) => session.id !== this.args.session.id),
      'title',
    );
  }

  save = task(async () => {
    this.args.session.set('postrequisite', this.selectedPostrequisite);
    await this.args.session.save();
    this.args.close();
  });

  get filteredPostrequisites() {
    if (!this.filter) {
      return this.linkablePostrequisites;
    }
    const exp = new RegExp(escapeRegExp(this.filter), 'gi');
    return this.linkablePostrequisites.filter((session) => session.title.match(exp));
  }
  <template>
    <div class="session-postrequisite-editor" data-test-session-postrequisite-editor>
      <div class="info">
        <span data-test-selected-postrequisite>
          <strong data-test-label>{{t "general.duePriorTo"}}:</strong>
          {{#if this.selectedPostrequisite}}
            <span data-test-title>{{this.selectedPostrequisite.title}}</span>
            <button
              {{on "click" (set this "userSelectedPostrequisite" null)}}
              class="remove"
              type="button"
              data-test-remove
            >
              <FaIcon @icon="xmark" @title={{t "general.remove"}} />
            </button>
          {{else}}
            <span data-test-title>{{t "general.none"}}</span>
          {{/if}}
        </span>
        <input
          aria-label={{t "general.filterPlaceholder"}}
          placeholder={{t "general.filterPlaceholder"}}
          type="text"
          value={{this.filter}}
          {{on "input" (pick "target.value" (set this "filter"))}}
          data-test-filter
        />
      </div>
      <div class="table-wrapper">
        <table class="ilios-table ilios-zebra-table" data-test-postrequisites>
          <thead>
            <tr>
              <th colspan="10">{{t "general.session"}}</th>
              <th colspan="3">{{t "general.firstOffering"}}</th>
            </tr>
          </thead>
          <tbody>
            {{#each this.filteredPostrequisites as |postrequisite|}}
              <tr
                class={{if (eq postrequisite.id this.selectedPostrequisite.id) "active"}}
                data-test-postrequisite
              >
                <td colspan="10">
                  <button
                    type="button"
                    {{on
                      "click"
                      (set
                        this
                        "userSelectedPostrequisite"
                        (if (eq postrequisite.id this.selectedPostrequisite.id) null postrequisite)
                      )
                    }}
                  >
                    {{#if (eq postrequisite.id this.selectedPostrequisite.id)}}
                      <FaIcon @icon="minus" @title={{t "general.remove"}} />
                    {{else}}
                      <FaIcon @icon="plus" class="add" @title={{t "general.add"}} />
                    {{/if}}
                    <span data-test-title>{{postrequisite.title}}</span>
                  </button>
                </td>
                <td colspan="3">
                  <button
                    type="button"
                    aria-label={{t "general.add"}}
                    {{on
                      "click"
                      (set
                        this
                        "userSelectedPostrequisite"
                        (if (eq postrequisite.id this.selectedPostrequisite.id) null postrequisite)
                      )
                    }}
                  >
                    {{#if postrequisite.firstOfferingDate}}
                      {{#if postrequisite.ilmSession}}
                        <strong>{{t "general.ilm"}}: {{t "general.dueBy"}}</strong>
                        {{formatDate
                          postrequisite.firstOfferingDate
                          month="2-digit"
                          day="2-digit"
                          year="numeric"
                        }}
                      {{else}}
                        {{formatDate
                          postrequisite.firstOfferingDate
                          month="2-digit"
                          day="2-digit"
                          year="numeric"
                          hour12=true
                          hour="2-digit"
                          minute="2-digit"
                        }}
                      {{/if}}
                    {{/if}}
                  </button>
                </td>
              </tr>
            {{/each}}
          </tbody>
        </table>
      </div>
      <div class="buttons">
        <button class="done" type="button" {{on "click" (perform this.save)}} data-test-save>
          {{#if this.save.isRunning}}
            <LoadingSpinner />
          {{else}}
            {{t "general.done"}}
          {{/if}}
        </button>
        <button class="cancel" type="button" {{on "click" @close}} data-test-cancel>
          {{t "general.cancel"}}
        </button>
      </div>
    </div>
  </template>
}
