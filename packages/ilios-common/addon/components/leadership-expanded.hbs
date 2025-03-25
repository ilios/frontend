<div class="leadership-expanded" data-test-leadership-expanded>
  <div class="leadership-expanded-header">
    {{#if @isManaging}}
      <h3 class="title" data-test-title>
        {{t "general.leadership"}}
        ({{this.count}})
      </h3>
    {{else}}
      <button
        class="title link-button"
        type="button"
        aria-expanded="true"
        data-test-title
        {{on "click" @collapse}}
      >
        {{t "general.leadership"}}
        ({{this.count}})
        <FaIcon @icon="caret-down" />
      </button>
    {{/if}}
    <div class="actions">
      {{#if @isManaging}}
        <button class="bigadd" type="button" {{on "click" (perform this.save)}} data-test-save>
          <FaIcon
            @icon={{if this.save.isRunning "spinner" "check"}}
            @spin={{this.save.isRunning}}
          />
        </button>
        <button class="bigcancel" type="button" {{on "click" this.close}} data-test-cancel>
          <FaIcon @icon="arrow-rotate-left" />
        </button>
      {{else if @editable}}
        <button type="button" {{on "click" (fn @setIsManaging true)}} data-test-manage>
          {{t "general.manageLeadership"}}
        </button>
      {{/if}}
    </div>
  </div>
  <div class="leadership-expanded-content">
    {{#if @isManaging}}
      <LeadershipManager
        @directors={{this.directors}}
        @showDirectors={{this.modelHasDirectors}}
        @removeDirector={{this.removeDirector}}
        @addDirector={{this.addDirector}}
        @administrators={{this.administrators}}
        @showAdministrators={{this.modelHasAdministrators}}
        @removeAdministrator={{this.removeAdministrator}}
        @addAdministrator={{this.addAdministrator}}
        @studentAdvisors={{this.studentAdvisors}}
        @showStudentAdvisors={{this.modelHasStudentAdvisors}}
        @removeStudentAdvisor={{this.removeStudentAdvisor}}
        @addStudentAdvisor={{this.addStudentAdvisor}}
      />
    {{else}}
      <LeadershipList
        @directors={{this.directors}}
        @administrators={{this.administrators}}
        @studentAdvisors={{this.studentAdvisors}}
        @showAdministrators={{this.modelHasAdministrators}}
        @showDirectors={{this.modelHasDirectors}}
        @showStudentAdvisors={{this.modelHasStudentAdvisors}}
      />
    {{/if}}
  </div>
</div>