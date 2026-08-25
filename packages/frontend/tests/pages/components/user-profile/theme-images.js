import { collection, create, hasClass } from 'ember-cli-page-object';

const definition = {
  studentPreviews: collection('[data-test-student]', {
    isLight: hasClass('light'),
    isDark: hasClass('dark'),
  }),
  nonStudentPreviews: collection('[data-test-non-student]', {
    isLight: hasClass('light'),
    isDark: hasClass('dark'),
    hasFullNavigation: hasClass('has-full-navigation'),
    hasTopNavigation: hasClass('has-top-navigation'),
  }),
};

export default definition;
export const component = create(definition);
