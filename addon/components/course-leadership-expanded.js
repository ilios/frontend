import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { timeout } from 'ember-concurrency';
import { dropTask } from 'ember-concurrency-decorators';

export default class CoutseLeadershipExpanded extends Component {
  @tracked directors = null;
  @tracked administrators = null;
  get isCollapsible() {
    const administratorIds = this.args.course.hasMany('administrators').ids();
    const directorIds = this.args.course.hasMany('directors').ids();

    return (administratorIds.length > 0 || directorIds.length > 0) && !this.args.isManaging;
  }
  @action
  addDirector(user) {
    this.directors = [...this.directors, user];
  }
  @action
  removeDirector(user){
    this.directors = this.directors.filter(obj => obj !== user);
  }
  @action
  addAdministrator(user) {
    this.administrators = [...this.administrators, user];
  }
  @action
  removeAdministrator(user){
    this.administrators = this.administrators.filter(obj => obj !== user);
  }
  @dropTask
  *manage() {
    const administrators = yield this.args.course.administrators;
    const directors = yield this.args.course.directors;
    this.administrators = administrators.toArray();
    this.directors = directors.toArray();
    this.args.setIsManaging(true);
  }
  @dropTask
  *save(){
    yield timeout(10);
    this.args.course.setProperties({
      directors: this.directors,
      administrators: this.administrators
    });
    this.args.expand();
    yield this.args.course.save();
    this.args.setIsManaging(false);
  }
}
