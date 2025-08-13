import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { dropTask, timeout } from 'ember-concurrency';
import { TrackedAsyncData } from 'ember-async-data';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import perform from 'ember-concurrency/helpers/perform';
import FaIcon from 'ilios-common/components/fa-icon';
import set from 'ember-set-helper/helpers/set';
import InstructorManager from 'frontend/components/instructor-group/instructor-manager';
import sortBy from 'ilios-common/helpers/sort-by';
import UserNameInfo from 'ilios-common/components/user-name-info';
import UserStatus from 'ilios-common/components/user-status';

export default class InstructorGroupUsersComponent extends Component {
  @tracked usersBuffer = [];
  @tracked isManaging = false;

  @cached
  get usersData() {
    return new TrackedAsyncData(this.args.instructorGroup.users);
  }

  get users() {
    return this.usersData.isResolved ? this.usersData.value : [];
  }

  @action
  addUser(user) {
    this.usersBuffer = [...this.usersBuffer, user];
  }
  @action
  removeUser(user) {
    this.usersBuffer = this.usersBuffer.filter((obj) => obj !== user);
  }

  manage = dropTask(async () => {
    this.usersBuffer = await this.args.instructorGroup.users;
    this.isManaging = true;
  });

  save = dropTask(async () => {
    await timeout(10);
    this.args.instructorGroup.set('users', this.usersBuffer);
    await this.args.instructorGroup.save();
    this.isManaging = false;
  });
  <template>
    <section class="instructor-group-users" data-test-instructor-group-users ...attributes>
      <div class="instructor-group-users-header" data-test-header>
        <h2 class="title" data-test-title>
          {{#if this.isManaging}}
            {{t "general.instructorsManageTitle"}}
          {{else}}
            {{t "general.instructors"}}
            ({{@instructorGroup.users.length}})
          {{/if}}
        </h2>
        <div class="actions">
          {{#if this.isManaging}}
            <button
              class="bigadd"
              type="button"
              aria-label={{t "general.save"}}
              {{on "click" (perform this.save)}}
              data-test-save
            >
              <FaIcon
                @icon={{if this.save.isRunning "spinner" "check"}}
                @spin={{this.save.isRunning}}
              />
            </button>
            <button
              class="bigcancel"
              type="button"
              aria-label={{t "general.cancel"}}
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
            <InstructorManager
              @instructors={{this.usersBuffer}}
              @add={{this.addUser}}
              @remove={{this.removeUser}}
            />
          {{/unless}}
        {{else}}
          {{#if this.users.length}}
            <ul class="instructor-group-users-list" data-test-users-list>
              {{#each (sortBy "fullName" this.users) as |user|}}
                <li data-test-user>
                  <UserStatus @user={{user}} />
                  <UserNameInfo @user={{user}} />
                </li>
              {{/each}}
            </ul>
          {{/if}}
        {{/if}}
      </div>
    </section>
  </template>
}
