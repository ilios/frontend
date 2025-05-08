<section class="instructor-group-users" data-test-instructor-group-users ...attributes>
  <div class="instructor-group-users-header" data-test-header>
    <h3 class="title" data-test-title>
      {{#if this.isManaging}}
        {{t "general.instructorsManageTitle"}}
      {{else}}
        {{t "general.instructors"}}
        ({{@instructorGroup.users.length}})
      {{/if}}
    </h3>
    <div class="actions">
      {{#if this.isManaging}}
        <button class="bigadd" type="button" {{on "click" (perform this.save)}} data-test-save>
          <FaIcon
            @icon={{if this.save.isRunning "spinner" "check"}}
            @spin={{this.save.isRunning}}
          />
        </button>
        <button
          class="bigcancel"
          type="button"
          {{on "click" (set this "isManaging" false)}}
          data-test-cancel
        >
          <FaIcon @icon="arrow-rotate-left" />
        </button>
      {{else if @canUpdate}}
        <button type="button" {{on "click" (perform this.manage)}} data-test-manage>
          {{t "general.instructorsManageTitle"}}
        </button>
      {{/if}}
    </div>
  </div>
  <div class="instructor-group-users-content">
    {{#if this.isManaging}}
      {{#unless this.manage.isRunning}}
        <InstructorGroup::InstructorManager
          @instructors={{this.usersBuffer}}
          @add={{this.addUser}}
          @remove={{this.removeUser}}
        />
      {{/unless}}
    {{else}}
      <ul class="instructor-group-users-list" data-test-users-list>
        {{#each (sort-by "fullName" this.users) as |user|}}
          <li data-test-user>
            <UserNameInfo @user={{user}} />
          </li>
        {{/each}}
      </ul>
    {{/if}}
  </div>
</section>