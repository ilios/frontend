import Component from '@glimmer/component';

export default class WeekGlanceEvent extends Component {

  sortString(a, b){
    return a.localeCompare(b);
  }
}
