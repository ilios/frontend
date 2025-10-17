import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { service } from '@ember/service';
import { TrackedAsyncData } from 'ember-async-data';
import includes from 'ilios-common/helpers/includes';
import { on } from '@ember/modifier';
import { fn, array } from '@ember/helper';
import FaIcon from 'ilios-common/components/fa-icon';
import eq from 'ember-truth-helpers/helpers/eq';
import t from 'ember-intl/helpers/t';
import { LinkTo } from '@ember/routing';
import truncate from 'ilios-common/helpers/truncate';
import formatDate from 'ember-intl/helpers/format-date';
import and from 'ember-truth-helpers/helpers/and';
import PublicationStatus from 'ilios-common/components/publication-status';
import not from 'ember-truth-helpers/helpers/not';

export default class SessionsGridRowComponent extends Component {
  @service permissionChecker;

  @cached
  get canDeleteData() {
    return new TrackedAsyncData(
      this.permissionChecker.canDeleteSession(this.args.sessionProxy.session),
    );
  }

  get canDelete() {
    return this.canDeleteData.isResolved ? this.canDeleteData.value : false;
  }

  @cached
  get canUpdateData() {
    return new TrackedAsyncData(
      this.permissionChecker.canUpdateSession(this.args.sessionProxy.session),
    );
  }

  get canUpdate() {
    return this.canUpdateData.isResolved ? this.canUpdateData.value : false;
  }
  <template>
    <div class="sessions-grid-row" data-test-sessions-grid-row>
      <span class="expand-collapse-control" data-test-expand-collapse-control>
        {{#if (includes @sessionProxy.session.id @expandedSessionIds)}}
          <button
            class="link-button"
            type="button"
            aria-label={{t "general.expand"}}
            data-test-collapse
            {{on "click" (fn @closeSession @sessionProxy.session)}}
          >
            <FaIcon @icon="caret-down" />
          </button>
        {{else}}
          <button
            class="link-button {{if (eq @sessionProxy.session.offeringCount 0) 'disabled'}}"
            disabled={{if (eq @sessionProxy.session.offeringCount 0) "disabled"}}
            type="button"
            aria-label={{t "general.close"}}
            data-test-expand
            {{on "click" (fn @expandSession @sessionProxy.session)}}
          >
            <FaIcon
              @icon="caret-right"
              @title={{if (eq @sessionProxy.session.offeringCount 0) (t "general.noOfferings")}}
            />
          </button>
        {{/if}}
      </span>
      <span class="session-grid-title">
        <LinkTo
          @route="session"
          @models={{array @sessionProxy.session.course @sessionProxy.session}}
          aria-label={{@sessionProxy.ariaLabel}}
        >
          {{truncate @sessionProxy.session.title 100 true}}
        </LinkTo>
      </span>
      <span class="session-grid-type">
        {{@sessionProxy.session.sessionType.title}}
      </span>
      <span class="session-grid-groups">
        {{@sessionProxy.session.learnerGroupCount}}
      </span>
      <span class="session-grid-objectives">
        {{@sessionProxy.session.objectiveCount}}
      </span>
      <span class="session-grid-terms">
        {{@sessionProxy.session.termCount}}
      </span>
      <span class="session-grid-first-offering">
        {{#if @sessionProxy.session.firstOfferingDate}}
          {{#if @sessionProxy.session.isIndependentLearning}}
            {{#if @sessionProxy.session.hasPostrequisite}}
              <strong>
                {{t "general.ilm"}}:
                <FaIcon @icon="user-clock" />
                {{t "general.duePriorTo"}}:
              </strong>
              <LinkTo
                @route="session"
                @models={{array
                  @sessionProxy.session.course.id
                  @sessionProxy.session.postrequisite.id
                }}
                title={{@sessionProxy.session.postrequisite.title}}
              >
                {{truncate @sessionProxy.session.postrequisite.title 18 true}}
              </LinkTo>
            {{else}}
              <strong>
                {{t "general.ilm"}}:
                {{t "general.dueBy"}}
              </strong>
              {{formatDate
                @sessionProxy.session.firstOfferingDate
                month="2-digit"
                day="2-digit"
                year="numeric"
              }}
            {{/if}}
          {{else if @sessionProxy.session.hasPostrequisite}}
            <strong>
              <FaIcon @icon="user-clock" />
              {{t "general.duePriorTo"}}:
            </strong>
            <LinkTo
              @route="session"
              @models={{array
                @sessionProxy.session.course.id
                @sessionProxy.session.postrequisite.id
              }}
              title={{@sessionProxy.session.postrequisite.title}}
            >
              {{truncate @sessionProxy.session.postrequisite.title 18 true}}
            </LinkTo>
          {{else}}
            {{formatDate
              @sessionProxy.session.firstOfferingDate
              month="2-digit"
              day="2-digit"
              year="numeric"
              hour12=true
              hour="2-digit"
              minute="numeric"
            }}
          {{/if}}
        {{/if}}
      </span>
      <span class="session-grid-offerings">
        {{@sessionProxy.session.offeringCount}}
      </span>
      <span class="session-grid-status" data-test-status>
        {{#if (and this.canUpdate @sessionProxy.session.prerequisiteCount)}}
          <FaIcon
            @icon="arrow-right-to-bracket"
            @ariaHidden={{false}}
            class="prerequisites"
            @flip="horizontal"
            @title={{t "general.prerequisites"}}
            data-test-prerequisites
          />
        {{/if}}
        {{#if (and this.canUpdate @sessionProxy.session.instructionalNotes.length)}}
          <FaIcon
            @icon="clipboard-list"
            @ariaHidden={{false}}
            class="instructional-notes"
            @title={{t "general.instructionalNotes"}}
          />
        {{/if}}
        <PublicationStatus @item={{@sessionProxy.session}} />
      </span>
      <span class="session-grid-actions" data-test-actions>
        {{#if (and this.canUpdate (not @sessionProxy.session.prerequisiteCount))}}
          <button
            class="link-button"
            type="button"
            {{on "click" (fn @confirmDelete @sessionProxy.session.id)}}
            data-test-delete
          >
            <FaIcon
              @icon="trash"
              @ariaHidden={{false}}
              class="remove enabled"
              @title={{t "general.remove"}}
            />
          </button>
        {{else}}
          <FaIcon
            @icon="trash"
            @ariaHidden={{false}}
            class="disabled"
            data-test-delete-disabled
            @title={{t "general.remove"}}
          />
        {{/if}}
      </span>
    </div>
  </template>
}
