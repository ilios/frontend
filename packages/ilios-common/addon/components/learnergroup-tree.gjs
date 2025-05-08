{{#let (unique-id) as |templateId|}}
  <li
    hidden={{this.isHidden}}
    class="learnergroup-tree {{if this.hasChildren 'branch' 'leaf'}}"
    data-test-learnergroup-tree
    data-test-learnergroup-tree-root={{if this.isRoot "true" "false"}}
  >
    <input
      type="checkbox"
      aria-labelledby="learnergroup-label-{{templateId}}"
      checked={{includes @learnerGroup @selectedGroups}}
      {{on
        "click"
        (if
          (includes @learnerGroup @selectedGroups)
          (fn this.remove @learnerGroup)
          (fn this.add @learnerGroup)
        )
      }}
      data-test-checkbox
    />
    <button
      id="learnergroup-label-{{templateId}}"
      class="learnergroup-label"
      type="button"
      {{on
        "click"
        (if
          (includes @learnerGroup @selectedGroups)
          (fn this.remove @learnerGroup)
          (fn this.add @learnerGroup)
        )
      }}
      data-test-checkbox-title
    >
      {{@learnerGroup.title}}
    </button>
    {{#if @learnerGroup.needsAccommodation}}
      <FaIcon
        @icon="universal-access"
        @title={{t "general.accommodationIsRequiredForLearnersInThisGroup"}}
      />
    {{/if}}
    {{#if this.hasChildren}}
      <ul data-test-subgroups>
        {{#if (is-array this.children)}}
          {{#each (sort-by this.sortByTitle this.children) as |child|}}
            <LearnergroupTree
              @learnerGroup={{child}}
              @selectedGroups={{@selectedGroups}}
              @isRoot={{false}}
              @filter={{@filter}}
              @add={{@add}}
              @remove={{@remove}}
            />
          {{/each}}
        {{else}}
          <li>
            <LoadingSpinner />
          </li>
        {{/if}}
      </ul>
    {{/if}}
  </li>
{{/let}}