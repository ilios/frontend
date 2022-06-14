import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { use } from 'ember-could-get-used-to-this';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';

export default class CourseLoaderComponent extends Component {
  @service dataLoader;
  @service intl;

  @use loadedCourse = new ResolveAsyncValue(() => [
    this.dataLoader.loadCourse(this.args.course.id),
  ]);

  get isLoaded() {
    return Boolean(this.loadedCourse);
  }
}
