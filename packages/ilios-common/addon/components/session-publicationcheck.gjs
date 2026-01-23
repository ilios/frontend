import Component from '@glimmer/component';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import Overview from 'ilios-common/components/session/overview';
import { LinkTo } from '@ember/routing';
import { array, hash } from '@ember/helper';
import FaIcon from 'ilios-common/components/fa-icon';
import t from 'ember-intl/helpers/t';
import scrollIntoView from 'ilios-common/modifiers/scroll-into-view';
import hasManyLength from 'ilios-common/helpers/has-many-length';
import { faArrowRotateLeft, faLinkSlash } from '@fortawesome/free-solid-svg-icons';

export default class SessionPublicationCheckComponent extends Component {
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

  <template>
    <div class="session-publicationcheck" data-test-session-publicationcheck>
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
      <div class="results" {{scrollIntoView}}>
        <div class="title" data-test-title>
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
                <th>
                  {{t "general.meshTerms"}}
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
                {{#if @session.meshDescriptors.length}}
                  <td class="yes" data-test-mesh>
                    {{t "general.yes"}}
                    ({{@session.meshDescriptors.length}})
                  </td>
                {{else}}
                  <td class="no" data-test-mesh>
                    {{t "general.no"}}
                  </td>
                {{/if}}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </template>
}
