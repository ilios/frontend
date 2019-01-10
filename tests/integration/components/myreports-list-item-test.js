import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { run } from '@ember/runloop';

module('Integration | Component | myreports list item', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('custom title', async function(assert) {
    assert.expect(3);
    const report = this.server.create('report', {
      title: 'Lorem Ipsum'
    });

    const reportModel = await run(() => this.owner.lookup('service:store').find('report', report.id));
    this.set('report', reportModel);
    this.set('selectReport', (param) => {
      assert.equal(param, reportModel);
    });
    await render(hbs`{{myreports-list-item report=report selectReport=(action selectReport)}}`);

    assert.dom(this.element).hasText(report.title);
    assert.dom('.clickable').exists({ count: 1 });
    await click('.clickable');
  });

  test('all competencies in all schools', async function(assert) {
    assert.expect(3);
    const report = this.server.create('report', {
      subject: 'competency'
    });

    const reportModel = await run(() => this.owner.lookup('service:store').find('report', report.id));
    this.set('report', reportModel);
    this.set('selectReport', (param) => {
      assert.equal(param, reportModel);
    });
    await render(hbs`{{myreports-list-item report=report selectReport=(action selectReport)}}`);

    assert.dom(this.element).hasText('All Competencies in All Schools');
    assert.dom('.clickable').exists({ count: 1 });
    await click('.clickable');
  });

  test('all competencies in school X', async function(assert) {
    assert.expect(2);
    const school = this.server.create('school', { title: 'School of Schools' });
    const report = this.server.create('report', {
      school,
      subject: 'competency',
    });

    const reportModel = await run(() => this.owner.lookup('service:store').find('report', report.id));
    this.set('report', reportModel);
    await render(hbs`{{myreports-list-item report=report}}`);
    assert.dom(this.element).hasText('All Competencies in ' + school.title);
    assert.dom('.clickable').exists({ count: 1 });
  });

  test('all competencies for user X in school Y', async function(assert) {
    assert.expect(2);
    const school = this.server.create('school', { title: 'School of Schools' });
    const user = this.server.create('user', {
      firstName: 'Chip',
      lastName: 'Whitley',
    });
    const report = this.server.create('report', {
      school,
      prepositionalObject: 'user',
      subject: 'competency',
      prepositionalObjectTableRowId: user.id,
    });

    const reportModel = await run(() => this.owner.lookup('service:store').find('report', report.id));
    const userModel = await run(() => this.owner.lookup('service:store').find('user', user.id));
    this.set('report', reportModel);
    await render(hbs`{{myreports-list-item report=report}}`);

    assert.dom(this.element).hasText(
      'All Competencies for ' + userModel.get('fullName') +  ' in ' + school.title
    );
    assert.dom('.clickable').exists({ count: 1 });
  });

  test('broken report', async function(assert) {
    assert.expect(2);
    const school = this.server.create('school', { title: 'School of Schools' });
    const report = this.server.create('report', {
      school,
      prepositionalObject: 'user',
      subject: 'competency',
      prepositionalObjectTableRowId: 13,
    });

    const reportModel = await run(() => this.owner.lookup('service:store').find('report', report.id));
    this.set('report', reportModel);

    await render(hbs`{{myreports-list-item report=report}}`);
    assert.dom(this.element).hasText('This report is no longer available.');
    assert.dom('.clickable').doesNotExist();
  });
});
