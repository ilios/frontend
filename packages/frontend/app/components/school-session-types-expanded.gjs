import Component from '@glimmer/component';
import { service } from '@ember/service';
import { cached } from '@glimmer/tracking';
import { dropTask } from 'ember-concurrency';
import { action } from '@ember/object';
import { findById } from 'ilios-common/utils/array-helpers';
import { TrackedAsyncData } from 'ember-async-data';
import { on } from '@ember/modifier';
import t from 'ember-intl/helpers/t';
import FaIcon from 'ilios-common/components/fa-icon';
import and from 'ember-truth-helpers/helpers/and';
import not from 'ember-truth-helpers/helpers/not';
import ExpandCollapseButton from 'ilios-common/components/expand-collapse-button';
import { fn } from '@ember/helper';
import SchoolSessionTypeForm from 'frontend/components/school-session-type-form';
import perform from 'ember-concurrency/helpers/perform';
import SchoolSessionTypeManager from 'frontend/components/school-session-type-manager';
import SchoolSessionTypesList from 'frontend/components/school-session-types-list';

export default class SchoolSessionTypesExpandedComponent extends Component {
  @service store;

  get isManaging() {
    return !!this.args.managedSessionTypeId;
  }

  @cached
  get sessionTypesData() {
    return new TrackedAsyncData(this.args.school.sessionTypes);
  }

  get isLoaded() {
    return this.sessionTypesData.isResolved;
  }

  get isCollapsible() {
    return (
      !this.isManaging && this.sessionTypesData.isResolved && this.sessionTypesData.value.length
    );
  }

  get sessionTypes() {
    return this.sessionTypesData.isResolved ? this.sessionTypesData.value : [];
  }

  get managedSessionType() {
    if (!this.sessionTypesData.isResolved) {
      return null;
    }
    return findById(this.sessionTypes, this.args.managedSessionTypeId);
  }

  @action
  collapse() {
    if (this.isCollapsible) {
      this.args.collapse();
      this.args.setSchoolManagedSessionType(null);
    }
  }

  save = dropTask(
    async (title, calendarColor, assessment, assessmentOption, aamcMethod, isActive) => {
      this.args.setSchoolNewSessionType(null);
      const sessionType = this.store.createRecord('session-type');
      const aamcMethods = aamcMethod ? [aamcMethod] : [];
      sessionType.setProperties({
        school: this.args.school,
        title,
        calendarColor,
        assessment,
        assessmentOption,
        aamcMethods,
        active: isActive,
      });

      this.args.setNewSavedSessionType(sessionType);

      await sessionType.save();
    },
  );

  update = dropTask(
    async (title, calendarColor, assessment, assessmentOption, aamcMethod, isActive) => {
      const aamcMethods = aamcMethod ? [aamcMethod] : [];
      const sessionType = this.managedSessionType;
      this.args.setSchoolManagedSessionType(null);
      sessionType.setProperties({
        title,
        calendarColor,
        assessment,
        assessmentOption,
        aamcMethods,
        active: isActive,
      });

      await sessionType.save();
    },
  );
  <template>
    <section
      class="school-session-types-expanded"
      data-test-school-session-types-expanded
      ...attributes
    >
      <div class="school-session-types-header" data-test-header>
        {{#if this.isCollapsible}}
          <button
            class="title link-button"
            type="button"
            aria-expanded="true"
            data-test-title
            {{on "click" @collapse}}
          >
            {{t "general.sessionTypes"}}
            ({{this.sessionTypes.length}})
            <FaIcon @icon="caret-down" />
          </button>
        {{else}}
          <div class="title" data-test-title>
            {{t "general.sessionTypes"}}
            ({{this.sessionTypes.length}})
          </div>
        {{/if}}
        <div class="actions">
          {{#if (and @canCreate (not @managedSessionTypeId))}}
            <ExpandCollapseButton
              @value={{@schoolNewSessionType}}
              @action={{fn @setSchoolNewSessionType (not @schoolNewSessionType)}}
            />
          {{/if}}
        </div>
      </div>
      <div class="school-session-types-expanded-content">
        {{#if @schoolNewSessionType}}
          <SchoolSessionTypeForm
            @title={{null}}
            @calendarColor="#ffffff"
            @assessment={{false}}
            @isActive={{true}}
            @canEditTitle={{true}}
            @canEditAamcMethod={{true}}
            @canEditCalendarColor={{true}}
            @canEditAssessment={{true}}
            @canEditAssessmentOption={{true}}
            @canEditActive={{true}}
            @canUpdate={{true}}
            @save={{perform this.save}}
            @close={{fn @setSchoolNewSessionType false}}
            @newSavedSessionType={{@newSavedSessionType}}
            @setNewSavedSessionType={{@setNewSavedSessionType}}
          />
        {{/if}}
        {{#if @newSavedSessionType}}
          <div class="saved-result" data-test-saved-result>
            <button
              class="link-button"
              type="button"
              {{on "click" (fn @setSchoolManagedSessionType @newSavedSessionType.id)}}
            >
              <FaIcon @icon="square-up-right" />
              {{@newSavedSessionType.title}}
            </button>
            {{t "general.savedSuccessfullyWithTitle"}}
          </div>
        {{/if}}
        {{#if this.managedSessionType}}
          <SchoolSessionTypeManager
            @sessionType={{this.managedSessionType}}
            @close={{fn @setSchoolManagedSessionType null}}
            @save={{perform this.update}}
            @canUpdate={{@canUpdate}}
          />
        {{else if (and this.isLoaded this.sessionTypes.length)}}
          <SchoolSessionTypesList
            @sessionTypes={{this.sessionTypes}}
            @manageSessionType={{@setSchoolManagedSessionType}}
            @canDelete={{@canDelete}}
          />
        {{/if}}
      </div>
    </section>
  </template>
}
