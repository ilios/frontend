<div class="new-subject-search" data-test-reports-subject-new-learning-material>
  <p data-test-search>
    <label for="{{this.uniqueId}}-learning-material-search">
      {{t "general.whichIs"}}
    </label>
    {{#if @currentId}}
      {{#let (load this.loadMaterial) as |p|}}
        {{#if p.isResolved}}
          {{#let p.value as |material|}}
            <button
              class="link-button"
              type="button"
              {{on "click" this.clear}}
              data-test-selected-learning-material
            >
              {{material.title}}
              <FaIcon @icon="xmark" class="remove" />
            </button>
          {{/let}}
        {{else}}
          <LoadingSpinner />
        {{/if}}
      {{/let}}
    {{else}}
      <Reports::Subject::New::Search::Input
        id="{{this.uniqueId}}-learning-material-search"
        @search={{perform this.search}}
        @searchIsRunning={{this.search.isRunning}}
        @searchIsIdle={{this.search.isIdle}}
        @searchReturned={{is-array this.materials}}
        @results={{this.sortedMaterials}}
        as |material|
      >
        <button class="link-button" type="button" {{on "click" (fn @changeId material.id)}}>
          {{material.title}}
        </button>

      </Reports::Subject::New::Search::Input>
    {{/if}}
  </p>
</div>