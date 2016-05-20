import Ember from 'ember';

const { $, Component, on } = Ember;

export default Component.extend({
  classNames: ['click-choice-buttons'],
  firstChoicePicked: true,

  buttonContent1: null,
  buttonContent2: null,

  pressButton: on('didInsertElement', function() {
    let component = this;
    let firstButton = $('.first-button');
    let secondButton = $('.second-button');

    firstButton.click(function() {
      secondButton.removeClass('active');
      firstButton.addClass('active');

      component.sendAction('action', true);
    });

    secondButton.click(function() {
      firstButton.removeClass('active');
      secondButton.addClass('active');

      component.sendAction('action', false);
    });
  })
});
