import Component from '@glimmer/component';
import { action } from '@ember/object';
import { timeout } from 'ember-concurrency';
import { dropTask } from 'ember-concurrency-decorators';
import { tracked } from '@glimmer/tracking';

export default class SessionLeadershipExpandedComponent extends Component {
  @tracked administrators;
  @tracked administratorBuffer;

  @dropTask
  *load(element, [session]) {
    if (session) {
      this.administrators = (yield session.administrators).toArray();
    }
  }

  @dropTask
  *manage() {
    this.administratorBuffer = (yield this.args.session.administrators).toArray();
    this.args.setIsManaging(true);
  }

  @dropTask
  *save(){
    yield timeout(10);
    this.args.session.set('administrators', this.administratorBuffer);
    this.args.expand();
    yield this.args.session.save();
    this.args.setIsManaging(false);
  }

  @action
  addAdministrator(user) {
    this.administratorBuffer = [...this.administratorBuffer, user];
  }
  @action
  removeAdministrator(user){
    this.administratorBuffer = this.administratorBuffer.filter(obj => obj !== user);
  }
  @action
  cancel() {
    this.administratorBuffer = null;
    this.args.setIsManaging(false);
  }
}
