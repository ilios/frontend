import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { dropTask, restartableTask } from 'ember-concurrency';

export default class SequenceBlockSessionManagerComponent extends Component {
  @service store;
  @tracked excludedSessions = [];
  @tracked linkedSessions = [];
  @tracked sessions = [];

  get allSelected() {
    if (
      !this.linkedSessions ||
      !this.sessions ||
      this.linkedSessions.length < this.sessions.length
    ) {
      return false;
    }
    this.sessions.forEach((session) => {
      if (!this.linkedSessions.includes(session)) {
        return false;
      }
    });
    return true;
  }

  get allExcluded() {
    if (
      !this.excludedSessions ||
      !this.sessions ||
      this.excludedSessions.length < this.sessions.length
    ) {
      return false;
    }
    this.sessions.forEach((session) => {
      if (!this.excludedSessions.includes(session)) {
        return false;
      }
    });
    return true;
  }

  get someSelected() {
    return !this.allSelected && !this.noneSelected;
  }

  get someExcluded() {
    return !this.allExcluded && !this.noneExcluded;
  }

  get noneSelected() {
    if (!this.linkedSessions || !this.sessions) {
      return true;
    }

    let isSelected = false;
    this.linkedSessions.forEach((linkedSession) => {
      if (this.sessions.includes(linkedSession)) {
        isSelected = true;
      }
    });
    return !isSelected;
  }

  get noneExcluded() {
    if (!this.excludedSessions || !this.sessions) {
      return true;
    }

    let isSelected = false;
    this.excludedSessions.forEach((session) => {
      if (this.sessions.includes(session)) {
        isSelected = true;
      }
    });
    return !isSelected;
  }

  get sortedAscending() {
    return this.args.sortBy.search(/desc/) === -1;
  }

  @action
  changeSession(session) {
    if (this.linkedSessions.includes(session)) {
      this.linkedSessions = this.linkedSessions.filter(
        (linkedSession) => linkedSession !== session
      );
    } else {
      this.linkedSessions = [...this.linkedSessions, session];
    }
  }

  @action
  excludeSession(session) {
    if (this.excludedSessions.includes(session)) {
      this.excludedSessions = this.excludedSessions.filter(
        (excludedSession) => excludedSession !== session
      );
    } else {
      this.excludedSessions = [...this.excludedSessions, session];
    }
  }

  @action
  toggleSelectAll() {
    if (this.allSelected) {
      this.linkedSessions = [];
    } else {
      this.linkedSessions = this.sessions.slice();
    }
  }

  @action
  toggleExcludeAll() {
    if (this.allExcluded) {
      this.excludedSessions = [];
    } else {
      this.excludedSessions = this.sessions.slice();
    }
  }

  @action
  changeSortOrder(what) {
    if (this.args.sortBy === what) {
      what += ':desc';
    }
    this.args.setSortBy(what);
  }

  @action
  close() {
    this.args.cancel();
  }

  load = restartableTask(async () => {
    this.linkedSessions = (await this.args.sequenceBlock.sessions).slice();
    this.excludedSessions = (await this.args.sequenceBlock.excludedSessions).slice();
    this.sessions = (await this.args.sessions).slice();
  });

  saveChanges = dropTask(async () => {
    await this.args.save(this.linkedSessions, this.excludedSessions);
  });
}
