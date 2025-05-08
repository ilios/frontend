import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { service } from '@ember/service';
import { TrackedAsyncData } from 'ember-async-data';

export default class SessionsGridRowComponent extends Component {
  @service permissionChecker;

  @cached
  get canDeleteData() {
    return new TrackedAsyncData(this.permissionChecker.canDeleteSession(this.args.session));
  }

  get canDelete() {
    return this.canDeleteData.isResolved ? this.canDeleteData.value : false;
  }

  @cached
  get canUpdateData() {
    return new TrackedAsyncData(this.permissionChecker.canUpdateSession(this.args.session));
  }

  get canUpdate() {
    return this.canUpdateData.isResolved ? this.canUpdateData.value : false;
  }
}

<div class="sessions-grid-row" data-test-sessions-grid-row>
  <span class="expand-collapse-control" data-test-expand-collapse-control>
    {{#if (includes @session.id @expandedSessionIds)}}
      <button
        class="link-button"
        type="button"
        data-test-collapse
        {{on "click" (fn @closeSession @session)}}
      >
        <FaIcon @icon="caret-down" />
      </button>
    {{else}}
      <button
        class="link-button {{if (eq @session.offeringCount 0) 'disabled'}}"
        disabled={{if (eq @session.offeringCount 0) "disabled"}}
        type="button"
        data-test-expand
        {{on "click" (fn @expandSession @session)}}
      >
        <FaIcon
          @icon="caret-right"
          @title={{if (eq @session.offeringCount 0) (t "general.noOfferings")}}
        />
      </button>
    {{/if}}
  </span>
  <span class="session-grid-title">
    <LinkTo @route="session" @models={{array @session.course @session}}>
      {{truncate @session.title 100 true}}
    </LinkTo>
  </span>
  <span class="session-grid-type">
    {{@session.sessionType.title}}
  </span>
  <span class="session-grid-groups">
    {{@session.learnerGroupCount}}
  </span>
  <span class="session-grid-objectives">
    {{@session.objectiveCount}}
  </span>
  <span class="session-grid-terms">
    {{@session.termCount}}
  </span>
  <span class="session-grid-first-offering">
    {{#if @session.firstOfferingDate}}
      {{#if @session.isIndependentLearning}}
        {{#if @session.hasPostrequisite}}
          <strong>
            {{t "general.ilm"}}:
            <FaIcon @icon="user-clock" />
            {{t "general.duePriorTo"}}:
          </strong>
          <LinkTo @route="session" @models={{array @session.course.id @session.postrequisite.id}}>
            {{truncate @session.postrequisite.title 18 true}}
          </LinkTo>
        {{else}}
          <strong>
            {{t "general.ilm"}}:
            {{t "general.dueBy"}}
          </strong>
          {{format-date @session.firstOfferingDate month="2-digit" day="2-digit" year="numeric"}}
        {{/if}}
      {{else if @session.hasPostrequisite}}
        <strong>
          <FaIcon @icon="user-clock" />
          {{t "general.duePriorTo"}}:
        </strong>
        <LinkTo @route="session" @models={{array @session.course.id @session.postrequisite.id}}>
          {{truncate @session.postrequisite.title 18 true}}
        </LinkTo>
      {{else}}
        {{format-date
          @session.firstOfferingDate
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
    {{@session.offeringCount}}
  </span>
  <span class="session-grid-status" data-test-status>
    {{#if (and this.canUpdate @session.prerequisiteCount)}}
      <FaIcon
        @icon="arrow-right-to-bracket"
        @ariaHidden={{false}}
        class="prerequisites"
        @flip="horizontal"
        @title={{t "general.prerequisites"}}
        data-test-prerequisites
      />
    {{/if}}
    {{#if (and this.canUpdate @session.instructionalNotes.length)}}
      <FaIcon
        @icon="clipboard-list"
        @ariaHidden={{false}}
        class="instructional-notes"
        @title={{t "general.instructionalNotes"}}
      />
    {{/if}}
    <PublicationStatus @item={{@session}} />
  </span>
  <span class="session-grid-actions" data-test-actions>
    {{#if (and this.canUpdate (not @session.prerequisiteCount))}}
      <button
        class="link-button"
        type="button"
        {{on "click" (fn @confirmDelete @session.id)}}
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