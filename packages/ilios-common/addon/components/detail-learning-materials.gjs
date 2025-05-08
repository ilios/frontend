<section
  class="detail-learningmaterials {{if this.displaySearchBox 'display-search-box'}}"
  data-test-detail-learning-materials
>
  <div class="detail-learningmaterials-header">
    <div class="title" id={{this.titleId}}>
      {{#if this.isManaging}}
        <span class="specific-title">
          {{t "general.learningMaterialManageTitle"}}
        </span>
      {{else}}
        {{t "general.learningMaterials"}}
        ({{@subject.learningMaterials.length}})
      {{/if}}
    </div>
    {{#if this.displaySearchBox}}
      <LearningmaterialSearch
        @add={{perform this.addLearningMaterial}}
        @currentMaterialIds={{this.parentMaterialIds}}
      />
    {{/if}}
    <div class="detail-learningmaterials-actions">
      {{#if this.displayAddNewForm}}
        <button
          class="collapse-button"
          type="button"
          {{on "click" (fn (mut this.displayAddNewForm) false)}}
        >
          <FaIcon @icon="minus" />
        </button>
      {{else if (and @editable (not this.isSorting) (not this.isManaging))}}
        <ChooseMaterialType
          @choose={{this.addNewLearningMaterial}}
          @types={{array "file" "link" "citation"}}
        />
      {{/if}}
    </div>
  </div>
  <div class="detail-learningmaterials-content">
    {{#if this.isManaging}}
      <LearningmaterialManager
        @learningMaterial={{this.managingMaterial}}
        @editable={{@editable}}
        @closeManager={{this.closeLearningmaterialManager}}
        @learningMaterialStatuses={{this.learningMaterialStatuses}}
      />
    {{else if this.isSorting}}
      <LearningMaterialsSortManager
        @save={{perform this.saveSortOrder}}
        @cancel={{fn (set this "isSorting") false}}
        @subject={{@subject}}
      />
    {{else if this.displayAddNewForm}}
      <NewLearningmaterial
        @type={{this.type}}
        @learningMaterialStatuses={{this.learningMaterialStatuses}}
        @learningMaterialUserRoles={{this.learningMaterialUserRoles}}
        @save={{perform this.saveNewLearningMaterial}}
        @cancel={{this.closeNewLearningmaterial}}
      />
    {{else if this.materials.length}}
      {{#if (and @editable this.hasMoreThanOneLearningMaterial)}}
        <button
          class="sort-materials-btn"
          type="button"
          {{on "click" (fn (mut this.isSorting) true)}}
          data-test-sort-button
        >
          {{t "general.sortMaterials"}}
        </button>
      {{/if}}
      <table class={{if (gt this.materials.length 10) "sticky-header"}}>
        <thead>
          <tr>
            <th class="text-left" colspan="3">
              {{t "general.displayName"}}
            </th>
            <th class="text-center" colspan="2">
              {{t "general.owner"}}
            </th>
            <th class="text-center" colspan="2">
              {{t "general.required"}}
            </th>
            <th class="text-center" colspan="2">
              {{t "general.notes"}}
            </th>
            <th class="text-center" colspan="2">
              {{t "general.mesh"}}
            </th>
            <th class="text-center" colspan="2">
              {{t "general.status"}}
            </th>
            <th class="text-left" colspan="1">
              {{t "general.actions"}}
            </th>
          </tr>
        </thead>
        <tbody>
          {{#each this.materials as |lm|}}
            <DetailLearningMaterialsItem
              @editable={{@editable}}
              @lm={{lm}}
              @setManagedMaterial={{this.setManagedMaterial}}
              @remove={{this.remove}}
            />
          {{/each}}
        </tbody>
      </table>
    {{/if}}
  </div>
</section>