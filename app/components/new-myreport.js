import Ember from 'ember';
import { translationMacro as t } from "ember-i18n";

export default Ember.Component.extend({
  subjects: ['Courses',
             'Sessions',
             'Programs',
             'Program Years',
             'Instructors',
             'Instructor Groups',
             'Learning Materials',
             'Competencies',
             'Topics',
             'MeSH Terms'
             ],
  prepositionalObjects: ['Session',
                         'Program',
                         'Program Year',
                         'Instructor',
                         'Instructor Group',
                         'Learning Material',
                         'Competency',
                         'Topic',
                         'MeSH Term'
              ],
  actions: {
    toggleEditor() {
      this.set('toggleFn', !this.get('toggleFn'));
    },

    closeEditor() {
      this.set('toggleFn', false);
    }
  }
});
