import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { component } from 'ilios/tests/pages/components/program-year/objective-list';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | program-year/objective-list', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders and is accessible', async function(assert) {
    assert.expect(8);
    const programYear = this.server.create('program-year');

    this.server.create('objective', {
      title: 'Objective A',
      position: 0,
      programYears: [programYear],
    });

    this.server.create('objective', {
      title: 'Objective B',
      position: 0,
      programYears: [programYear],
    });
    const programYearModel = await this.owner.lookup('service:store').find('program-year', programYear.id);
    this.set('programYear', programYearModel);

    await render(
      hbs`<ProgramYear::ObjectiveList
        @editable={{true}}
        @programYear={{this.programYear}}
        @manageCompetency={{noop}}
        @manageDescriptors={{noop}}
      />`
    );
    assert.ok(component.sortIsVisible, 'Sort Objectives button is visible');
    assert.equal(component.headers[1].text, 'Description');
    assert.equal(component.headers[2].text, 'Competency');
    assert.equal(component.headers[3].text, 'MeSH Terms');

    assert.equal(component.objectives.length, 2);
    assert.equal(component.objectives[0].description.text, 'Objective B');
    assert.equal(component.objectives[1].description.text, 'Objective A');

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('empty list', async function(assert) {
    assert.expect(2);
    const programYear = this.server.create('programYear');
    const programYearModel = await this.owner.lookup('service:store').find('programYear', programYear.id);
    this.set('programYear', programYearModel);

    await render(
      hbs`<ProgramYear::ObjectiveList
        @editable={{true}}
        @programYear={{this.programYear}}
        @manageCompetency={{noop}}
        @manageDescriptors={{noop}}
      />`
    );
    assert.notOk(component.sortIsVisible);
    assert.equal(component.text, '');
  });

  test('no "sort objectives" button in list with one item', async function(assert) {
    assert.expect(3);
    const programYear = this.server.create('programYear');

    this.server.create('objective', {
      position: 0,
      programYears: [programYear],
    });
    const programYearModel = await this.owner.lookup('service:store').find('programYear', programYear.id);
    this.set('programYear', programYearModel);

    await render(
      hbs`<ProgramYear::ObjectiveList
        @editable={{true}}
        @programYear={{this.programYear}}
        @manageCompetency={{noop}}
        @manageDescriptors={{noop}}
      />`
    );
    assert.notOk(component.sortIsVisible, 'Sort Objectives button is visible');
    assert.equal(component.objectives.length, 1);

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });
});
