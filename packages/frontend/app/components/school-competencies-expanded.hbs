<section class="school-competencies-expanded" data-test-school-competencies-expanded ...attributes>
  <div class="school-competencies-expanded-header" data-test-header>
    {{#if @isManaging}}
      <div class="title" data-test-title>
        {{t "general.competencies"}}
      </div>
    {{else}}
      {{#if this.showCollapsible}}
        <button
          class="title link-button"
          type="button"
          aria-expanded="true"
          data-test-title
          {{on "click" this.collapse}}
        >
          {{t "general.competencies"}}
          ({{this.domains.length}}/{{this.childCompetencies.length}})
          <FaIcon @icon="caret-down" />
        </button>
      {{else}}
        <div class="title" data-test-title>
          {{t "general.competencies"}}
          ({{this.domains.length}}/{{this.childCompetencies.length}})
        </div>
      {{/if}}
    {{/if}}
    <div class="actions" data-test-actions>
      {{#if @isManaging}}
        <button type="button" class="bigadd" {{on "click" (perform this.save)}} data-test-save>
          <FaIcon
            @icon={{if this.save.isRunning "spinner" "check"}}
            @spin={{this.save.isRunning}}
          />
        </button>
        <button type="button" class="bigcancel" {{on "click" this.stopManaging}} data-test-cancel>
          <FaIcon @icon="arrow-rotate-left" />
        </button>
      {{else if (or @canUpdate @canDelete @canCreate)}}
        <button
          type="button"
          {{on "click" (fn @setSchoolManageCompetencies true)}}
          data-test-manage
        >
          {{t "general.manageCompetencies"}}
        </button>
      {{/if}}
    </div>
  </div>
  <div class="school-competencies-expanded-content">
    {{#if @isManaging}}
      <SchoolCompetenciesManager
        @canUpdate={{@canUpdate}}
        @canDelete={{@canDelete}}
        @canCreate={{@canCreate}}
        @competencies={{this.competencies}}
        @add={{this.addCompetency}}
        @remove={{this.removeCompetency}}
      />
    {{else if this.domains.length}}
      <SchoolCompetenciesList @domains={{this.domains}} @canUpdate={{@canUpdate}} />
    {{/if}}
  </div>
</section>