<section class="school-vocabularies-expanded" data-test-school-vocabularies-expanded ...attributes>
  {{#if this.isLoaded}}
    <div class="school-vocabularies-expanded-header">
      {{#if this.isCollapsible}}
        <button
          class="title link-button"
          type="button"
          aria-expanded="true"
          data-test-vocabularies-title
          {{on "click" this.doCollapse}}
        >
          {{t "general.vocabularies"}}
          ({{@school.vocabularies.length}})
          <FaIcon @icon="caret-down" />
        </button>
      {{else}}
        <div class="title" data-test-vocabularies-title>
          {{t "general.vocabularies"}}
          ({{@school.vocabularies.length}})
        </div>
      {{/if}}
      <div class="actions">
        {{#if (and @canCreateVocabulary (not this.managedTerm) (not this.managedVocabulary))}}
          <ExpandCollapseButton
            @value={{@schoolNewVocabulary}}
            @action={{fn @setSchoolNewVocabulary (not @schoolNewVocabulary)}}
            data-test-new-vocabulary
          />
        {{/if}}
      </div>
    </div>
    <div class="school-vocabularies-expanded-content">
      {{#if @schoolNewVocabulary}}
        <SchoolNewVocabularyForm
          @school={{@school}}
          @close={{fn @setSchoolNewVocabulary null}}
          @save={{this.saveNewVocabulary}}
        />
      {{/if}}
      {{#if this.managedTerm}}
        <SchoolVocabularyTermManager
          @vocabulary={{this.managedVocabulary}}
          @term={{this.managedTerm}}
          @manageTerm={{@setSchoolManagedVocabularyTerm}}
          @manageVocabulary={{@setSchoolManagedVocabulary}}
          @canUpdate={{@canUpdateTerm}}
          @canDelete={{@canDeleteTerm}}
          @canCreate={{@canCreateTerm}}
        />
      {{else if this.managedVocabulary}}
        <SchoolVocabularyManager
          @vocabulary={{this.managedVocabulary}}
          @manageTerm={{@setSchoolManagedVocabularyTerm}}
          @manageVocabulary={{@setSchoolManagedVocabulary}}
          @canUpdate={{@canUpdateVocabulary}}
          @canCreate={{@canCreateTerm}}
        />
      {{else}}
        <SchoolVocabulariesList
          @school={{@school}}
          @manageVocabulary={{@setSchoolManagedVocabulary}}
          @canDelete={{@canDeleteVocabulary}}
          @canCreate={{@canCreateVocabulary}}
        />
      {{/if}}
    </div>
  {{else}}
    <LoadingSpinner />
  {{/if}}
</section>