import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render, settled } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';
import { resolve } from 'rsvp';

module('Integration | Component | collapsed-objectives-program-years', function(hooks) {
  setupRenderingTest(hooks);

  const hasMesh = EmberObject.create({
    meshDescriptors: resolve([1, 2])
  });
  const hasCompetency = EmberObject.create({
    competency: resolve(EmberObject.create())
  });
  const plain = EmberObject.create();

  test('displays summary data', async function(assert) {
    assert.expect(9);

    const subject = EmberObject.create({
      objectives: resolve([hasMesh, hasCompetency, plain])
    });
    this.setProperties({ subject, click: () => {} });
    await render(hbs`<CollapsedObjectivesProgramYears
      @subject={{subject}}
      @expand={{action click}}
    />`);
    assert.dom('.title').hasText('Objectives (3)');
    assert.dom('table tr').exists({ count: 4 });
    assert.dom('tr td').hasText('There are 3 objectives');
    assert.dom('tr:nth-of-type(2) td').includesText("1 has a linked competency");
    assert.dom('tr:nth-of-type(3) td').includesText("1 has MeSH");
    assert.dom('tr td:nth-of-type(2) svg').hasClass('fa-circle', 'correct icon for parent objectives');
    assert.dom('tr td:nth-of-type(2) svg').hasClass('maybe', 'correct class for parent objectives');
    assert.dom('tr td:nth-of-type(3) svg').hasClass('fa-circle', 'correct icon for mesh links');
    assert.dom('tr td:nth-of-type(3) svg').hasClass('maybe', 'correct class for mesh links');
  });

  test('clicking expand icon opens full view', async function(assert) {
    assert.expect(2);

    const subject = EmberObject.create();
    this.setProperties({ subject, click: () => assert.ok(true) });
    await render(hbs`<CollapsedObjectivesProgramYears
      @subject={{subject}}
      @expand={{action click}}
    />`);
    await settled();
    assert.dom('.title').hasText('Objectives ()');
    await click('.title');
  });

  test('icons all linked competencies correctly', async function(assert) {
    assert.expect(4);

    const subject = EmberObject.create({
      objectives: resolve([hasCompetency])
    });
    this.setProperties({ subject, click: () => {} });
    await render(hbs`<CollapsedObjectivesProgramYears
      @subject={{subject}}
      @expand={{action click}}
    />`);
    await settled();
    assert.dom('.title').hasText('Objectives (1)');
    assert.dom('table tr').exists({ count: 4 });
    assert.dom('tr td:nth-of-type(2) svg').hasClass('fa-circle', 'has the correct icon');
    assert.dom('tr td:nth-of-type(2) svg').hasClass('yes', 'icon has the right class');
  });

  test('icons no parents correctly', async function(assert) {
    assert.expect(4);

    const subject = EmberObject.create({
      objectives: resolve([plain])
    });
    this.setProperties({ subject, click: () => {} });
    await render(hbs`<CollapsedObjectivesProgramYears
      @subject={{subject}}
      @expand={{action click}}
    />`);
    await settled();
    assert.dom('.title').hasText('Objectives (1)');
    assert.dom('table tr').exists({ count: 4 });
    assert.dom('tr td:nth-of-type(2) svg').hasClass('fa-ban', 'has the correct icon');
    assert.dom('tr td:nth-of-type(2) svg').hasClass('no', 'icon has the right class');
  });

  test('icons all mesh correctly', async function(assert) {
    assert.expect(4);

    const subject = EmberObject.create({
      objectives: resolve([hasMesh])
    });
    this.setProperties({ subject, click: () => {} });
    await render(hbs`<CollapsedObjectivesProgramYears
      @subject={{subject}}
      @expand={{action click}}
    />`);
    await settled();
    assert.dom('.title').hasText('Objectives (1)');
    assert.dom('table tr').exists({ count: 4 });
    assert.dom('tr td:nth-of-type(3) svg').hasClass('fa-circle', 'has the correct icon');
    assert.dom('tr td:nth-of-type(3) svg').hasClass('yes', 'icon has the right class');
  });

  test('icons no mesh correctly', async function(assert) {
    assert.expect(4);

    const subject = EmberObject.create({
      objectives: resolve([plain])
    });
    this.setProperties({ subject, click: () => {} });
    await render(hbs`<CollapsedObjectivesProgramYears
      @subject={{subject}}
      @expand={{action click}}
    />`);
    await settled();
    assert.dom('.title').hasText('Objectives (1)');
    assert.dom('table tr').exists({ count: 4 });
    assert.dom('tr td:nth-of-type(3) svg').hasClass('fa-ban', 'has the correct icon');
    assert.dom('tr td:nth-of-type(3) svg').hasClass('no', 'icon has the right class');
  });
});
