import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class LearnergroupSelectionManager extends Component {
  @tracked filter = '';
}
