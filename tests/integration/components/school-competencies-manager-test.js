import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render, find, fillIn } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Integration | Component | school competencies manager', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function(assert) {

    const programYearObjectives = this.server.createList('programYearObjective', 3);
    const competency1 = this.server.create('competency', { title: 'competency1', programYearObjectives });
    const competency2 = this.server.create('competency', { title: 'competency2' });
    const domain = this.server.create('competency', { title: 'domain1', children: [ competency1, competency2] });
    const domainModel = await this.owner.lookup('service:store').find('competency', domain.id);
    const competencyModel1 = await this.owner.lookup('service:store').find('competency', competency1.id);
    const competencyModel2 = await this.owner.lookup('service:store').find('competency', competency2.id);
    const competencies = [domainModel, competencyModel1, competencyModel2];

    this.set('competencies', competencies);
    await render(hbs`<SchoolCompetenciesManager
      @canUpdate={{true}}
      @canDelete={{true}}
      @canCreate={{true}}
      @add={{noop}}
      @remove={{noop}}
      @competencies={{this.competencies}}
    />`);

    const title = 'h5';
    const input = 'input';
    const domains = '.domain';
    const domain1Title = `${domains} .competency-title-editor:nth-of-type(1)`;
    const comp1Title = `${domains}:nth-of-type(1) li:nth-of-type(1)`;
    const comp1Delete = `${domains}:nth-of-type(1) li:nth-of-type(1) svg.disabled`;
    const comp2Title = `${domains}:nth-of-type(1) li:nth-of-type(2)`;
    const comp2Delete = `${domains}:nth-of-type(1) li:nth-of-type(2) svg.enabled`;

    assert.dom(title).hasText('New Domain');
    assert.dom(input).exists({ count: 2 });
    assert.dom(input).hasAttribute('placeholder', 'Title');
    assert.dom(domain1Title).hasText('domain1');
    assert.equal(find(comp1Title).textContent.replace(/[\t\n\s]+/g, ""), 'competency1(3)');
    assert.equal(find(comp2Title).textContent.replace(/[\t\n\s]+/g, ""), 'competency2(0)');
    assert.dom(comp1Delete).exists({ count: 1 }, 'disabled trashcan is visible.');
    assert.dom(comp2Delete).exists({ count: 1 }, 'enabled trashcan is visible.');
  });

  test('delete fires delete', async function(assert) {
    assert.expect(1);
    const domain = this.server.create('competency', { title: 'domain1' });
    const domainModel = await this.owner.lookup('service:store').find('competency', domain.id);
    const competencies = [ domainModel ];

    this.set('competencies', competencies);
    this.set('remove', (what) => {
      assert.equal(what, domainModel);
    });
    await render(hbs`<SchoolCompetenciesManager
      @canUpdate={{true}}
      @canDelete={{true}}
      @canCreate={{true}}
      @add={{noop}}
      @remove={{this.remove}}
      @competencies={{this.competencies}}
    />`);

    const domains = '.domain';
    const domain1Icon = `${domains} svg`;

    await click(domain1Icon);
  });

  test('add fires add', async function(assert) {
    assert.expect(2);
    const domain = this.server.create('competency', { title: 'domain1' });
    const domainModel = await this.owner.lookup('service:store').find('competency', domain.id);
    const competencies = [ domainModel ];

    this.set('competencies', competencies);
    this.set('add', (what, title) => {
      assert.equal(what, domainModel);
      assert.equal(title, 'new c');
    });
    await render(hbs`<SchoolCompetenciesManager
      @canUpdate={{true}}
      @canDelete={{true}}
      @canCreate={{true}}
      @add={{this.add}}
      @remove={{noop}}
      @competencies={{this.competencies}}
    />`);

    const domains = '.domain';
    const domain1Input = `${domains} input:nth-of-type(1)`;
    const domain1Add = `${domains} button:nth-of-type(1)`;

    fillIn(domain1Input, 'new c');
    await click(domain1Add);
  });
});
