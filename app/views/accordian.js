import Ember from 'ember';

export default Ember.View.extend({
  didInsertElement: function(){
    Ember.$('.accordion-tabs-minimal').each(function() {
      Ember.$(this).children('li').first().children('a').addClass('is-active').next().addClass('is-open').show();
    });

    Ember.$('.accordion-tabs-minimal').on('click', 'li > a', function(event) {
      if (!Ember.$(this).hasClass('is-active')) {
        event.preventDefault();
        var accordionTabs = Ember.$(this).closest('.accordion-tabs-minimal');
        accordionTabs.find('.is-open').removeClass('is-open').hide();

        Ember.$(this).next().toggleClass('is-open').toggle();
        accordionTabs.find('.is-active').removeClass('is-active');
        Ember.$(this).addClass('is-active');
      } else {
        event.preventDefault();
      }
    });
  }
});
