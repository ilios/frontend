<section class="course-objectives" data-test-course-objectives>
  <div class="header">
    {{#if this.showCollapsible}}
      <div>
        <button
          class="title link-button"
          type="button"
          aria-expanded="true"
          data-test-title
          {{on "click" this.collapse}}
        >
          {{t "general.objectives"}}
          ({{this.objectives.length}})
          <FaIcon @icon="caret-down" />
        </button>
      </div>
    {{else}}
      <h3 class="title" data-test-title>
        {{t "general.objectives"}}
        ({{this.objectives.length}})
      </h3>
    {{/if}}
    {{#if @editable}}
      <span data-test-actions>
        <LinkTo
          @route="course-visualize-objectives"
          @model={{@course}}
          aria-label={{t "general.visualizeCourseObjectives"}}
        >
          <Course::VisualizeObjectivesGraph
            @course={{@course}}
            @width={{20}}
            @height={{20}}
            @isIcon={{true}}
          />
        </LinkTo>
        <ExpandCollapseButton
          @value={{this.newObjectiveEditorOn}}
          @action={{this.toggleNewObjectiveEditor}}
          @expandButtonLabel={{t "general.addNew"}}
        />
      </span>
    {{/if}}
  </div>
  <div class="content">
    {{#if this.newObjectiveEditorOn}}
      <NewObjective
        @save={{perform this.saveNewObjective}}
        @cancel={{this.toggleNewObjectiveEditor}}
      />
    {{/if}}
    <Course::ObjectiveList @course={{@course}} @editable={{@editable}} />
  </div>
</section>