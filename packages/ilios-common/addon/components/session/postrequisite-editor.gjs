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
    <table data-test-postrequisites>
      <thead>
        <tr>
          <th></th>
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
            <td>
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
                  <FaIcon @icon="minus" />
                {{else}}
                  <FaIcon @icon="plus" class="add" />
                {{/if}}
              </button>
            </td>
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
                {{postrequisite.title}}
              </button>
            </td>
            <td colspan="3">
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
                {{#if postrequisite.firstOfferingDate}}
                  {{#if postrequisite.ilmSession}}
                    <strong>{{t "general.ilm"}}: {{t "general.dueBy"}}</strong>
                    {{format-date
                      postrequisite.firstOfferingDate
                      month="2-digit"
                      day="2-digit"
                      year="numeric"
                    }}
                  {{else}}
                    {{format-date
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