import Component from '@ember/component';

export default Component.extend({
  classNames: ['toggle-icons'],
  firstOptionSelected: true,

  firstLabel: null,
  secondLabel: null,
  firstIcon: null,
  secondIcon: null,

  actions: {
    firstChoice(){
      const firstOptionSelected = this.get('firstOptionSelected');
      const toggle = this.get('toggle');
      if (!firstOptionSelected) {
        toggle(true);
      }
    },
    secondChoice(){
      const firstOptionSelected = this.get('firstOptionSelected');
      const toggle = this.get('toggle');
      if (firstOptionSelected) {
        toggle(false);
      }
    }
  }
});
