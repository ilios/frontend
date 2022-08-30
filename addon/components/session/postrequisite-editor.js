import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import escapeRegExp from 'ilios-common/utils/escape-reg-exp';

export default class SessionPostrequisiteEditorComponent extends Component {
  @tracked filter = '';
  @tracked selectedPostrequisite = null;
  @tracked linkablePostrequisites = [];

  constructor() {
    super(...arguments);
    this.args.session.postrequisite.then((postrequisite) => {
      this.selectedPostrequisite = postrequisite;
    });
  }

  setup = task(async () => {
    const { session } = this.args;
    const course = await session.course;
    const sessions = await course.sessions;
    this.linkablePostrequisites = sessions
      .sortBy('title')
      .filter((sessionInCourse) => sessionInCourse.id !== session.id);
  });

  save = task(async () => {
    this.args.session.set('postrequisite', this.selectedPostrequisite);
    await this.args.session.save();
    this.args.close();
  });

  get filteredPostrequisites() {
    if (!this.filter) {
      return this.linkablePostrequisites;
    }
    const exp = new RegExp(escapeRegExp(this.filter), 'gi');
    return this.linkablePostrequisites.filter((session) => session.title.match(exp));
  }
}
