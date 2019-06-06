import { module, test } from 'qunit';
import Service from '@ember/service';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | ilios-navigation', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    const currentUserMock = Service.extend({
      performsNonLearnerFunction: true,
    });
    this.owner.register('service:currentUser', currentUserMock);

    await render(hbs`{{ilios-navigation}}`);
    const link = '.navigation-links li:nth-of-type';

    assert.dom(`${link}(1)`).includesText('Dashboard');
    assert.dom(`${link}(2)`).includesText('Courses');
    assert.dom(`${link}(3)`).includesText('Learner Groups');
    assert.dom(`${link}(4)`).includesText('Instructor Groups');
    assert.dom(`${link}(5)`).includesText('Schools');
    assert.dom(`${link}(6)`).includesText('Programs');
    assert.dom(`${link}(7)`).includesText('Curriculum Inventory');
  });

  test('Privileged Users can access Admin', async function (assert) {
    const currentUserMock = Service.extend({
      performsNonLearnerFunction: true,
      canCreateOrUpdateUserInAnySchool: true,
    });
    this.owner.register('service:currentUser', currentUserMock);

    await render(hbs`{{ilios-navigation}}`);
    const link = '.navigation-links li:nth-of-type';

    assert.dom(`${link}(1)`).includesText('Dashboard');
    assert.dom(`${link}(2)`).includesText('Courses');
    assert.dom(`${link}(3)`).includesText('Learner Groups');
    assert.dom(`${link}(4)`).includesText('Instructor Groups');
    assert.dom(`${link}(5)`).includesText('Schools');
    assert.dom(`${link}(6)`).includesText('Programs');
    assert.dom(`${link}(7)`).includesText('Admin');
    assert.dom(`${link}(8)`).includesText('Curriculum Inventory');
  });
});
