import Ember from 'ember';

export default Ember.View.extend({
    templateName: 'navigation',
    didInsertElement: function(){
      var menu = Ember.$('#navigation-menu');
      var menuToggle = Ember.$('#js-mobile-menu');

      Ember.$(menuToggle).on('click', function(e) {
        e.preventDefault();
        menu.slideToggle(function(){
          if(menu.is(':hidden')) {
            menu.removeAttr('style');
          }
        });
      });

      // underline under the active nav item
      Ember.$(".nav .nav-link").click(function() {
        Ember.$(".nav .nav-link").each(function() {
          Ember.$(this).removeClass("active-nav-item");
        });
        Ember.$(this).addClass("active-nav-item");
        Ember.$(".nav .more").removeClass("active-nav-item");
      });
    }
});
