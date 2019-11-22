import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class WeekGlanceEvent extends Component {

  @action
  sortString(a, b){
    return a.localeCompare(b);
  }
}
