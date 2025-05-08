<div class="publish-all-sessions" data-test-publish-all-sessions>
  <section class="publish-all-sessions-unpublishable" data-test-unpublishable>
    <div>
      <button
        class="title link-button"
        type="button"
        aria-expanded={{if this.unPublishableCollapsed "true" "false"}}
        data-test-expand-collapse
        data-test-title
        {{on "click" (set this "unPublishableCollapsed" (not this.unPublishableCollapsed))}}
      >
        {{t "general.incompleteSessions"}}
        ({{this.unPublishableSessions.length}})
        <FaIcon @icon={{if this.unPublishableCollapsed "caret-right" "caret-down"}} />
      </button>
    </div>
    {{#unless this.unPublishableCollapsed}}
      <div class="content" data-test-content>
        <table>
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
            {{#each this.unPublishableSessions as |session|}}
              <tr>
                <td data-test-title>
                  <LinkTo @route="session" @model={{session}}>
                    {{session.title}}
                  </LinkTo>
                </td>
                {{#if session.offerings.length}}
                  <td class="yes" data-test-offerings>
                    {{t "general.yes"}}
                    ({{session.offerings.length}})
                  </td>
                {{else}}
                  <td class="no" data-test-offerings>
                    {{t "general.no"}}
                  </td>
                {{/if}}
                {{#if session.terms.length}}
                  <td class="yes" data-test-terms>
                    {{t "general.yes"}}
                    ({{session.terms.length}})
                  </td>
                {{else}}
                  <td class="no" data-test-terms>
                    {{t "general.no"}}
                  </td>
                {{/if}}
                {{#if session.sessionObjectives.length}}
                  <td class="yes" data-test-objectives>
                    {{t "general.yes"}}
                    ({{session.sessionObjectives.length}})
                    {{#if session.showUnlinkIcon}}
                      <button
                        class="link-button"
                        type="button"
                        {{on "click" (fn this.transitionToSession session)}}
                        data-test-session-link
                      >
                        <FaIcon @icon="link-slash" />
                      </button>
                    {{/if}}
                  </td>
                {{else}}
                  <td class="no" data-test-objectives>
                    {{t "general.no"}}
                  </td>
                {{/if}}
                {{#if session.meshDescriptors.length}}
                  <td class="yes" data-test-mesh-descriptors>
                    {{t "general.yes"}}
                    ({{session.meshDescriptors.length}})
                  </td>
                {{else}}
                  <td class="no" data-test-mesh-descriptors>
                    {{t "general.no"}}
                  </td>
                {{/if}}
              </tr>
            {{/each}}
          </tbody>
        </table>
      </div>
    {{/unless}}
  </section>
  <section class="publish-all-sessions-publishable" data-test-publishable>
    <div>
      <button
        class="title link-button"
        type="button"
        aria-expanded={{if this.publishableCollapsed "true" "false"}}
        data-test-expand-collapse
        data-test-title
        {{on "click" (set this "publishableCollapsed" (not this.publishableCollapsed))}}
      >
        {{t "general.completeSessions"}}
        ({{this.publishableSessions.length}})
        <FaIcon @icon={{if this.publishableCollapsed "caret-right" "caret-down"}} />
      </button>
    </div>
    {{#unless this.publishableCollapsed}}
      <div class="content" data-test-content>
        <table>
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
            {{#each this.publishableSessions as |session|}}
              <tr>
                <td data-test-title>
                  <LinkTo @route="session" @model={{session}}>
                    {{session.title}}
                  </LinkTo>
                </td>
                {{#if session.offerings.length}}
                  <td class="yes" data-test-offerings>
                    {{t "general.yes"}}
                    ({{session.offerings.length}})
                  </td>
                {{else}}
                  <td class="no" data-test-offerings>
                    {{t "general.no"}}
                  </td>
                {{/if}}
                {{#if session.terms.length}}
                  <td class="yes" data-test-terms>
                    {{t "general.yes"}}
                    ({{session.terms.length}})
                  </td>
                {{else}}
                  <td class="no" data-test-terms>
                    {{t "general.no"}}
                  </td>
                {{/if}}
                {{#if session.sessionObjectives.length}}
                  <td class="yes" data-test-objectives>
                    {{t "general.yes"}}
                    ({{session.sessionObjectives.length}})
                    {{#if session.showUnlinkIcon}}
                      <button
                        class="link-button"
                        type="button"
                        {{on "click" (fn this.transitionToSession session)}}
                        data-test-session-link
                      >
                        <FaIcon @icon="link-slash" />
                      </button>
                    {{/if}}
                  </td>
                {{else}}
                  <td class="no" data-test-objectives>
                    {{t "general.no"}}
                  </td>
                {{/if}}
                {{#if session.meshDescriptors.length}}
                  <td class="yes" data-test-mesh-descriptors>
                    {{t "general.yes"}}
                    ({{session.meshDescriptors.length}})
                  </td>
                {{else}}
                  <td class="no" data-test-mesh-descriptors>
                    {{t "general.no"}}
                  </td>
                {{/if}}
              </tr>
            {{/each}}
          </tbody>
        </table>
      </div>
    {{/unless}}
  </section>
  <section class="publish-all-sessions-overridable" data-test-overridable>
    <div class="title" data-test-title>
      {{t "general.reviewSessions"}}
      ({{this.overridableSessions.length}})
    </div>
    <div class="content">
      {{#if this.overridableSessions.length}}
        <button
          type="button"
          disabled={{this.allSessionsPublished}}
          {{on "click" this.publishAllAsIs}}
          data-test-publish-all-as-is
        >
          {{t "general.publishAsIs"}}
        </button>
        <button
          type="button"
          disabled={{this.allSessionsScheduled}}
          {{on "click" this.scheduleAll}}
          data-test-mark-all-as-scheduled
        >
          {{t "general.markAsScheduled"}}
        </button>
        <table>
          <thead>
            <tr>
              <th>
                {{t "general.actions"}}
              </th>
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
            {{#each this.overridableSessions as |session|}}
              <tr>
                <td>
                  <ul>
                    <li>
                      <label>
                        <input
                          type="checkbox"
                          checked={{includes session.id (map-by "id" this.sessionsToPublish)}}
                          {{on "click" (fn this.toggleSession session)}}
                          data-test-publish-as-is
                        />
                        {{t "general.publishAsIs"}}
                      </label>
                    </li>
                    <li>
                      <label>
                        <input
                          type="checkbox"
                          checked={{includes session.id (map-by "id" this.sessionsToSchedule)}}
                          {{on "click" (fn this.toggleSession session)}}
                          data-test-mark-as-scheduled
                        />
                        {{t "general.markAsScheduled"}}
                      </label>
                    </li>
                  </ul>
                </td>
                <td data-test-title>
                  <LinkTo @route="session" @model={{session}}>
                    {{session.title}}
                  </LinkTo>
                </td>
                {{#if session.offerings.length}}
                  <td class="yes" data-test-offerings>
                    {{t "general.yes"}}
                    ({{session.offerings.length}})
                  </td>
                {{else}}
                  <td class="no" data-test-offerings>
                    {{t "general.no"}}
                  </td>
                {{/if}}
                {{#if session.terms.length}}
                  <td class="yes" data-test-terms>
                    {{t "general.yes"}}
                    ({{session.terms.length}})
                  </td>
                {{else}}
                  <td class="no" data-test-terms>
                    {{t "general.no"}}
                  </td>
                {{/if}}
                {{#if session.sessionOjectives.length}}
                  <td class="yes" data-test-objectives>
                    {{t "general.yes"}}
                    ({{session.sessionObjectives.length}})
                    {{#if session.showUnlinkIcon}}
                      <button
                        class="link-button"
                        type="button"
                        {{on "click" (fn this.transitionToSession session)}}
                        data-test-session-link
                      >
                        <FaIcon @icon="link-slash" />
                      </button>
                    {{/if}}
                  </td>
                {{else}}
                  <td class="no" data-test-objectives>
                    {{t "general.no"}}
                  </td>
                {{/if}}
                {{#if session.meshDescriptors.length}}
                  <td class="yes" data-test-mesh-descriptors>
                    {{t "general.yes"}}
                    ({{session.meshDescriptors.length}})
                  </td>
                {{else}}
                  <td class="no" data-test-mesh-descriptors>
                    {{t "general.no"}}
                  </td>
                {{/if}}
              </tr>
            {{/each}}
          </tbody>
        </table>
      {{/if}}
    </div>
  </section>
  <div class="publish-all-sessions-review" data-test-review>
    {{#if this.showWarning}}
      <span class="unlinked-warning" data-test-unlinked-warning>
        {{t "general.unlinkedObjectives"}}
      </span>
      <button
        class="link-button"
        type="button"
        {{on "click" this.transitionToCourse}}
        data-test-course-link
      >
        <FaIcon @icon="link-slash" />
      </button>
      <button
        class="link-button"
        type="button"
        {{on "click" this.transitionToVisualizeObjectives}}
        data-test-visualize
      >
        <FaIcon @icon="chart-column" />
      </button>
    {{/if}}
    <p data-test-confirmation>
      {{t
        "general.publishAllConfirmation"
        publishCount=this.publishCount
        scheduleCount=this.scheduleCount
        ignoreCount=this.ignoreCount
      }}
    </p>
    <SaveButton
      @isSaving={{this.save.isRunning}}
      @saveProgressPercent={{this.saveProgressPercent}}
      {{on "click" (perform this.save)}}
      data-test-save
    >
      {{t "general.go"}}
    </SaveButton>
  </div>
</div>