<div class="learning-materials-sort-manager" data-test-detail-learning-materials-sort-manager>
  {{#if this.learningMaterials.isResolved}}
    <div class="actions">
      <button class="bigadd" type="button" {{on "click" (perform this.callSave)}} data-test-save>
        <FaIcon
          @icon={{if this.callSave.isRunning "spinner" "check"}}
          @spin={{this.callSave.isRunning}}
        />
      </button>
      <button class="bigcancel" type="button" {{on "click" @cancel}} data-test-cancel>
        <FaIcon @icon="arrow-rotate-left" />
      </button>
    </div>
    <div class="content">
      <ul class="sortable-items">
        {{#each this.items as |item|}}
          <li
            class="item
              {{if (eq this.draggingItem item) 'dragging-item'}}
              {{if (eq this.draggedAboveItem item) 'dragged-above'}}
              {{if (eq this.draggedBelowItem item) 'dragged-below'}}
              "
            draggable="true"
            {{on "drag" (fn this.drag item)}}
            {{on "dragend" this.dragEnd}}
            {{on "dragover" (fn this.dragOver item)}}
          >
            <FaIcon @icon="up-down-left-right" />
            <span class="draggable-object-content">
              <span class="title">
                <LmTypeIcon
                  @type={{item.learningMaterial.type}}
                  @mimetype={{item.learningMaterial.mimetype}}
                />
                <span data-test-title>
                  {{item.learningMaterial.title}}
                </span>
              </span>
              <span class="details">
                {{capitalize item.learningMaterial.type}},
                {{t "general.ownedBy" owner=item.learningMaterial.owningUser.fullName}},
                {{t "general.status"}}:
                {{item.learningMaterial.status.title}}
              </span>
            </span>
          </li>
        {{/each}}
      </ul>
    </div>
  {{/if}}
</div>