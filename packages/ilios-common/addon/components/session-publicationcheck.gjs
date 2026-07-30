import Component from '@glimmer/component';
import { service } from '@ember/service';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import { action } from '@ember/object';
import Overview from 'ilios-common/components/session/overview';
import { LinkTo } from '@ember/routing';
import { array, hash } from '@ember/helper';
import { on } from '@ember/modifier';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import t from 'ember-intl/helpers/t';
import scrollIntoView from 'ilios-common/modifiers/scroll-into-view';
import hasManyLength from 'ilios-common/helpers/has-many-length';
import { faArrowRotateLeft, faLinkSlash } from '@fortawesome/free-solid-svg-icons';

export default class SessionPublicationCheckComponent extends Component {
  @service router;
  @service intl;
  @service flashMessages;

  @cached
  get courseData() {
    return new TrackedAsyncData(this.args.session.course);
  }

  @cached
  get schoolData() {
    return new TrackedAsyncData(this.course?.school);
  }

  @cached
  get sessionTypesData() {
    return new TrackedAsyncData(this.school?.sessionTypes);
  }

  @cached
  get sessionObjectivesData() {
    return new TrackedAsyncData(this.args.session.sessionObjectives);
  }

  get course() {
    return this.courseData.isResolved ? this.courseData.value : null;
  }

  get school() {
    return this.schoolData.isResolved ? this.schoolData.value : null;
  }

  get sessionTypes() {
    return this.sessionTypesData.isResolved ? this.sessionTypesData.value : null;
  }

  get sessionObjectives() {
    return this.sessionObjectivesData.isResolved ? this.sessionObjectivesData.value : [];
  }

  get showUnlinkIcon() {
    const objectivesWithoutParents = this.sessionObjectives.filter((objective) => {
      return objective.courseObjectives.length === 0;
    });

    return objectivesWithoutParents.length > 0;
  }

  get hasMissingRequirements() {
    return this.args.session.requiredPublicationIssues.length !== 0;
  }

  get hasMissingItems() {
    return this.args.session.allPublicationIssuesLength !== 0;
  }

  @action
  async publish() {
    this.args.session.set('publishedAsTbd', false);
    this.args.session.set('published', true);
    await this.args.session.save();
    this.flashMessages.success(this.intl.t('general.publishedSuccessfully'));
    this.router.transitionTo('session', this.args.session);
  }
  <template>
    <div
      class="session-publicationcheck"
      data-test-session-publicationcheck
      {{scrollIntoView delay=10}}
    >
      <Overview @session={{@session}} @hideCheckLink={{true}} @sessionTypes={{this.sessionTypes}} />
      <div class="back-to-session">
        <LinkTo
          @route="session.index"
          @models={{array this.course @session}}
          data-test-back-to-session
        >
          <FaIcon @icon={{faArrowRotateLeft}} />
          {{t "general.backToTitle" title=@session.title}}
        </LinkTo>
      </div>
      <div class="results">
        <h3 class="title" data-test-title>{{t "general.publicationReview"}}</h3>
        <div class="sub-title" data-test-missing-items>
          {{t "general.missingItems"}}
          ({{@session.allPublicationIssuesLength}})
        </div>
        <div class="session-publicationcheck-content">
          <table class="ilios-table">
            <thead>
              <tr>
                <th>
                  {{t "general.sessionTitle"}}
                </th>
                <th>
                  {{t "general.offerings"}}
                </th>
                <th>
                  {{t "general.terms"}}
                </th>
                <th>
                  {{t "general.objectives"}}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td data-test-session-title>
                  {{@session.title}}
                </td>
                {{#if @session.offerings.length}}
                  <td class="yes" data-test-offerings>
                    {{t "general.yes"}}
                    ({{@session.offerings.length}})
                  </td>
                {{else}}
                  <td class="no" data-test-offerings>
                    {{t "general.no"}}
                  </td>
                {{/if}}
                {{#if @session.terms.length}}
                  <td class="yes" data-test-terms>
                    {{t "general.yes"}}
                    ({{@session.terms.length}})
                  </td>
                {{else}}
                  <td class="no" data-test-terms>
                    {{t "general.no"}}
                  </td>
                {{/if}}
                {{#if (hasManyLength @session "sessionObjectives")}}
                  <td class="yes" data-test-objectives>
                    {{t "general.yes"}}
                    ({{hasManyLength @session "sessionObjectives"}})
                    {{#if this.showUnlinkIcon}}
                      <LinkTo
                        @route="session"
                        @model={{@session}}
                        @query={{hash sessionObjectiveDetails=true}}
                        aria-label={{t "general.backToTitle" title=@session.title}}
                        data-test-unlink
                      >
                        <FaIcon @icon={{faLinkSlash}} />
                      </LinkTo>
                    {{/if}}
                  </td>
                {{else}}
                  <td class="no" data-test-objectives>
                    {{t "general.no"}}
                  </td>
                {{/if}}
              </tr>
            </tbody>
          </table>
        </div>
        <div data-test-session-publicationcheck-actions>
          {{#if this.hasMissingRequirements}}
            <button
              type="button"
              disabled
              title="{{t 'general.canNotPublishSession'}}"
              data-test-publish-missing-requirements
            >
              {{t "general.publishSession"}}
            </button>
          {{else if this.hasMissingItems}}
            <button type="button" {{on "click" this.publish}} data-test-publish-with-missing-items>
              {{t
                "general.publishSessionWithMissingItems"
                missingItemCount=@session.allPublicationIssuesLength
              }}
            </button>
          {{else}}
            <button type="button" {{on "click" this.publish}} data-test-publish>
              {{t "general.publishSession"}}
            </button>
          {{/if}}
        </div>
      </div>
    </div>
  </template>
}
