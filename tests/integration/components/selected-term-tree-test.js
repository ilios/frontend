import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | selected term tree', function(hooks) {
  setupRenderingTest(hooks);

  const tree = [
    EmberObject.create({
      title: 'top 1',
      children: []
    }),
    EmberObject.create({
      title: 'top 2',
      children: [
        EmberObject.create({
          title: 'top 2 child 1',
          children: []
        }),
      ]
    }),
  ];

  test('it renders a tree', async function(assert) {
    this.set('tree', tree);
    this.set('selectedTerms', [tree[1].children[0]]);
    this.set('toggle', () => { });
    await render(hbs`<SelectedTermTree
      @terms={{tree}}
      @selectedTerms={{selectedTerms}}
      @toggle={{action toggle}}
    />`);
    const topTerms = 'ul:nth-of-type(1) > li';
    const firstTopTerm = `${topTerms}:nth-of-type(1)`;
    const firstTopTermCheckbox = `${firstTopTerm} input`;
    const secondTopTerm = `${topTerms}:nth-of-type(2)`;
    const firstTopTermChildren = `${firstTopTerm} ul > li`;
    const secondTopTermChildren = `${secondTopTerm} ul > li`;
    const secondTopTermFirstChildCheckbox = `${secondTopTermChildren}:nth-of-type(1) input`;


    assert.dom(firstTopTerm).hasText('top 1');
    assert.dom(firstTopTermCheckbox).isNotChecked();
    assert.equal(find(secondTopTerm).textContent.replace(/\s/g, ''), 'top2top2child1');
    assert.dom(firstTopTermChildren).doesNotExist();
    assert.dom(secondTopTermChildren).hasText('top 2 child 1');
    assert.dom(secondTopTermFirstChildCheckbox).isChecked();
  });

  test('clicking checkbox fires toggle', async function(assert) {
    assert.expect(1);
    this.set('tree', tree);
    this.set('selectedTerms', []);
    this.set('toggle', (term) => {
      assert.equal(term, tree[1]);
    });
    await render(hbs`<SelectedTermTree
      @terms={{tree}}
      @selectedTerms={{selectedTerms}}
      @toggle={{action toggle}}
    />`);
    const topTerms = 'ul:nth-of-type(1) > li';
    const secondTopTerm = `${topTerms}:nth-of-type(2)`;
    const secondTermCheckbox = `${secondTopTerm} input:nth-of-type(1)`;

    await click(secondTermCheckbox);
  });

  test('clicking title fires toggle', async function(assert) {
    assert.expect(1);
    this.set('tree', tree);
    this.set('selectedTerms', []);
    this.set('toggle', (term) => {
      assert.equal(term, tree[1]);
    });
    await render(hbs`<SelectedTermTree
      @terms={{tree}}
      @selectedTerms={{selectedTerms}}
      @toggle={{action toggle}}
    />`);
    const topTerms = 'ul:nth-of-type(1) > li';
    const secondTopTerm = `${topTerms}:nth-of-type(2)`;
    const secondTermCheckbox = `${secondTopTerm} span:nth-of-type(1)`;

    await click(secondTermCheckbox);
  });
});
