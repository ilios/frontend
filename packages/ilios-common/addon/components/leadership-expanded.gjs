import Component from '@glimmer/component';
import { dropTask, timeout } from 'ember-concurrency';
import { cached, tracked } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import { action } from '@ember/object';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import FaIcon from 'ilios-common/components/fa-icon';
import perform from 'ember-concurrency/helpers/perform';
import { fn } from '@ember/helper';
import LeadershipManager from 'ilios-common/components/leadership-manager';
import LeadershipList from 'ilios-common/components/leadership-list';

export default class LeadershipExpandedComponent extends Component {
  @tracked directorsToAdd = [];
  @tracked directorsToRemove = [];
  @tracked administratorsToAdd = [];
  @tracked administratorsToRemove = [];
  @tracked studentAdvisorsToAdd = [];
  @tracked studentAdvisorsToRemove = [];

  get count() {
    return this.directors.length + this.administrators.length + this.studentAdvisors.length;
  }

  @cached
  get modelHasDirectors() {
    return 'directors' in this.args.model;
  }

  @cached
  get modelHasAdministrators() {
    return 'administrators' in this.args.model;
  }

  @cached
  get modelHasStudentAdvisors() {
    return 'studentAdvisors' in this.args.model;
  }

  @cached
  get modelDirectors() {
    if (this.modelHasDirectors) {
      return new TrackedAsyncData(this.args.model.directors);
    }
    return null;
  }

  @cached
  get modelAdministrators() {
    if (this.modelHasAdministrators) {
      return new TrackedAsyncData(this.args.model.administrators);
    }
    return null;
  }

  @cached
  get modelStudentAdvisors() {
    if (this.modelHasStudentAdvisors) {
      return new TrackedAsyncData(this.args.model.studentAdvisors);
    }
    return null;
  }

  get directors() {
    if (!this.modelHasDirectors) {
      return [];
    }
    const directors = this.modelDirectors.isResolved ? this.modelDirectors.value : [];
    return [...directors, ...this.directorsToAdd].filter(
      (user) => !this.directorsToRemove.includes(user),
    );
  }

  @cached
  get administrators() {
    if (!this.modelHasAdministrators) {
      return [];
    }
    const administrators = this.modelAdministrators.isResolved
      ? this.modelAdministrators.value
      : [];
    return [...administrators, ...this.administratorsToAdd].filter(
      (user) => !this.administratorsToRemove.includes(user),
    );
  }

  @cached
  get studentAdvisors() {
    if (!this.modelHasStudentAdvisors) {
      return [];
    }
    const studentAdvisors = this.modelStudentAdvisors.isResolved
      ? this.modelStudentAdvisors.value
      : [];
    return [...studentAdvisors, ...this.studentAdvisorsToAdd].filter(
      (user) => !this.studentAdvisorsToRemove.includes(user),
    );
  }

  resetBuffers() {
    this.directorsToAdd = [];
    this.directorsToRemove = [];
    this.administratorsToAdd = [];
    this.administratorsToRemove = [];
    this.studentAdvisorsToAdd = [];
    this.studentAdvisorsToRemove = [];
  }

  @action
  addDirector(user) {
    this.directorsToAdd = [...this.directorsToAdd, user];
    this.directorsToRemove = this.directorsToRemove.filter((u) => u !== user);
  }

  @action
  removeDirector(user) {
    this.directorsToRemove = [...this.directorsToRemove, user];
    this.directorsToAdd = this.directorsToAdd.filter((u) => u !== user);
  }

  @action
  addAdministrator(user) {
    this.administratorsToAdd = [...this.administratorsToAdd, user];
    this.administratorsToRemove = this.administratorsToRemove.filter((u) => u !== user);
  }

  @action
  removeAdministrator(user) {
    this.administratorsToRemove = [...this.administratorsToRemove, user];
    this.administratorsToAdd = this.administratorsToAdd.filter((u) => u !== user);
  }

  @action
  addStudentAdvisor(user) {
    this.studentAdvisorsToAdd = [...this.studentAdvisorsToAdd, user];
    this.studentAdvisorsToRemove = this.studentAdvisorsToRemove.filter((u) => u !== user);
  }

  @action
  removeStudentAdvisor(user) {
    this.studentAdvisorsToRemove = [...this.studentAdvisorsToRemove, user];
    this.studentAdvisorsToAdd = this.studentAdvisorsToAdd.filter((u) => u !== user);
  }

  @action
  close() {
    this.resetBuffers();
    this.args.setIsManaging(false);
  }

  save = dropTask(async () => {
    await timeout(10);
    const props = {};
    if (this.modelHasAdministrators) {
      props.administrators = this.administrators;
    }
    if (this.modelHasDirectors) {
      props.directors = this.directors;
    }
    if (this.modelHasStudentAdvisors) {
      props.studentAdvisors = this.studentAdvisors;
    }

    this.args.model.setProperties(props);
    this.args.expand();
    this.resetBuffers();
    await this.args.model.save();
    this.args.setIsManaging(false);
  });
  <template>
    <div class="leadership-expanded" data-test-leadership-expanded>
      <div class="leadership-expanded-header">
        {{#if @isManaging}}
          <h2 class="title" data-test-title>
            {{t "general.leadership"}}
            ({{this.count}})
          </h2>
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
              {{on "click" this.close}}
              data-test-cancel
            >
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
  </template>
}
