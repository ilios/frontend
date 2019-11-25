import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import {
  click,
  render,
  find,
  fillIn
} from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

const Competency = EmberObject.extend({
  id: null,
  title: null,
  parent: null,
  children: null,
  isDomain: false,
  objectives: null,
  belongsTo(){
    const self = this;
    return {
      id(){
        const parentCompetency = self.parent;
        if (parentCompetency) {
          return parentCompetency.id;
        }

        return null;
      }
    };
  }
});

module('Integration | Component | school competencies manager', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    const domain1 = Competency.create({
      id: 1,
      title: 'domain1',
      isDomain: true,
      objectives: [],
      children: [],
    });
    const competency1 = Competency.create({
      id: 2,
      title: 'competency1',
      parent: domain1,
      objectives: [1, 2, 3],
      children: [],
    });
    const competency2 = Competency.create({
      id: 3,
      title: 'competency2',
      parent: domain1,
      objectives: [],
      children: [],
    });
    domain1.set('children', [competency1, competency2]);

    const competencies = [domain1, competency1, competency2];
    this.set('competencies', competencies);
    this.set('nothing', parseInt);
    await render(hbs`<SchoolCompetenciesManager
      @canUpdate={{true}}
      @canDelete={{true}}
      @canCreate={{true}}
      @add={{action nothing}}
      @remove={{action nothing}}
      @competencies={{competencies}}
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
    const domain1 = Competency.create({
      id: 1,
      title: 'domain1',
      isDomain: true,
    });

    const competencies = [domain1];
    this.set('competencies', competencies);
    this.set('nothing', parseInt);
    this.set('remove', (what) => {
      assert.equal(what, domain1);
    });
    await render(hbs`<SchoolCompetenciesManager
      @canUpdate={{true}}
      @canDelete={{true}}
      @canCreate={{true}}
      @add={{action nothing}}
      @remove={{action remove}}
      @competencies={{competencies}}
    />`);

    const domains = '.domain';
    const domain1Icon = `${domains} svg`;

    await click(domain1Icon);
  });

  test('add fires add', async function(assert) {
    const domain1 = Competency.create({
      id: 1,
      title: 'domain1',
      isDomain: true,
    });

    const competencies = [domain1];
    this.set('competencies', competencies);
    this.set('nothing', parseInt);
    this.set('add', (what, title) => {
      assert.equal(what, domain1);
      assert.equal(title, 'new c');
    });
    await render(hbs`<SchoolCompetenciesManager
      @canUpdate={{true}}
      @canDelete={{true}}
      @canCreate={{true}}
      @add={{action add}}
      @remove={{action nothing}}
      @competencies={{competencies}}
    />`);

    const domains = '.domain';
    const domain1Input = `${domains} input:nth-of-type(1)`;
    const domain1Add = `${domains} button:nth-of-type(1)`;

    fillIn(domain1Input, 'new c');
    await click(domain1Add);
  });
});
