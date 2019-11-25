import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';
import escapeRegExp from 'ilios-common/utils/escape-reg-exp';

export default class SessionPostrequisiteEditorComponent extends Component {
  @tracked filter = '';
  @tracked selectedPostrequisite = null;
  @tracked linkablePostrequisites = [];

  constructor() {
    super(...arguments);
    this.args.session.postrequisite.then(postrequisite => {
      this.selectedPostrequisite = postrequisite;
    });
  }
  @task
  *setup() {
    const { session } = this.args;
    const course = yield session.course;
    const sessions = yield course.sessions;
    this.linkablePostrequisites = sessions.sortBy("title").filter(sessionInCourse => sessionInCourse.id !== session.id);
  }
  @task
  *save() {
    this.args.session.set('postrequisite', this.selectedPostrequisite);
    yield this.args.session.save();
    this.args.close();
  }
  get filteredPostrequisites() {
    if (!this.filter) {
      return this.linkablePostrequisites;
    }
    const exp = new RegExp(escapeRegExp(this.filter), 'gi');
    return this.linkablePostrequisites.filter(session => session.title.match(exp));
  }
}
