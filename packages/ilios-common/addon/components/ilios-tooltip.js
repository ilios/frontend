import Component from '@glimmer/component';

export default class TooltipComponent extends Component {
  get applicationElement() {
    return document.querySelector('.ember-application');
  }
}
