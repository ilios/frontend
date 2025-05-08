<div
  class="single-event-learningmaterial-list"
  data-test-single-event-learningmaterial-list
  ...attributes
>
  {{#if @prework.length}}
    <ul class="static-list prework">
      {{#each @prework as |event|}}
        <li data-test-prework-event>
          <FaIcon @title={{t "general.preWork"}} @icon="person-chalkboard" />
          <LinkTo @route="events" @model={{event.slug}} data-test-name>
            {{event.name}}
          </LinkTo>
          {{#each event.learningMaterials as |lm|}}
            <SingleEventLearningmaterialListItem @learningMaterial={{lm}} />
          {{/each}}
        </li>
      {{/each}}
    </ul>
  {{/if}}
  {{#if @learningMaterials.length}}
    <ul class="static-list">
      {{#each @learningMaterials as |lm|}}
        <SingleEventLearningmaterialListItem @learningMaterial={{lm}} @linked={{true}} />
      {{/each}}
    </ul>
  {{/if}}
  {{#if (and (not @learningMaterials.length) (not @prework.length))}}
    <p class="no-content" data-test-no-content>
      {{t "general.none"}}
    </p>
  {{/if}}
</div>