<p data-test-reports-subject-new-mesh-term>
  <label for="new-mesh-term">
    {{t "general.whichIs"}}
  </label>
  {{#if @currentId}}
    {{#if this.selectedMeshTerm.isResolved}}
      <button class="link-button" type="button" {{on "click" (fn @changeId null)}} data-test-remove>
        <span class="term-title" data-test-name>
          {{this.selectedMeshTerm.value.name}}
        </span>
        <span class="term-details" data-test-details>
          {{this.selectedMeshTerm.id}}
          {{#if this.selectedMeshTerm.value.trees.length}}
            -
            <MeshDescriptorLastTreeNumber @descriptor={{this.selectedMeshTerm.value}} />
          {{/if}}
        </span>
        <FaIcon @icon="xmark" class="remove" />
      </button>
    {{/if}}
  {{else}}
    <MeshManager @add={{this.chooseMeshTerm}} @editable={{true}} />
  {{/if}}
</p>