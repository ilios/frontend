import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { htmlSafe } from '@ember/template';
import FaIcon from 'ilios-common/components/fa-icon';

module('Integration | Component | fa-icon', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders coffee', async function (assert) {
    await render(<template><FaIcon @icon="coffee" /></template>);

    assert.dom('*').hasText('');
    assert.dom('svg').hasAttribute('data-icon', 'coffee');
    assert.dom('svg').hasClass('fa-coffee');
    assert.dom('svg use').exists();
    assert.dom('svg use').hasAttribute('xlink:href', '/fontawesome/solid.svg#coffee');
  });

  test('it renders extra classes', async function (assert) {
    this.set('class', 'foo-xyz');
    await render(<template><FaIcon @icon="coffee" class={{this.class}} /></template>);
    assert.dom('svg').hasClass('foo-xyz');
    this.set('class', 'foo-new-class');
    assert.dom('svg').doesNotHaveClass('foo-xyz');
    assert.dom('svg').hasClass('foo-new-class');
  });

  test('it optionally renders spin class', async function (assert) {
    this.set('isSpinning', false);
    await render(<template><FaIcon @icon="coffee" @spin={{this.isSpinning}} /></template>);
    assert.dom('svg').doesNotHaveClass('spin');
    this.set('isSpinning', true);
    assert.dom('svg').hasClass('spin');
  });

  test('it optionally renders fixed-width class', async function (assert) {
    this.set('fixedWidth', false);
    await render(<template><FaIcon @icon="coffee" @fixedWidth={{this.fixedWidth}} /></template>);
    assert.dom('svg').doesNotHaveClass('fixed-width');
    this.set('fixedWidth', true);
    assert.dom('svg').hasClass('fixed-width');
  });

  test('it renders vertically and horizontally flipped', async function (assert) {
    this.set('flip', '');
    await render(<template><FaIcon @icon="coffee" @flip={{this.flip}} /></template>);
    assert.dom('svg').doesNotHaveClass('flip-horizontal');
    assert.dom('svg').doesNotHaveClass('flip-vertical');
    this.set('flip', 'horizontal');
    assert.dom('svg').hasClass('flip-horizontal');
    assert.dom('svg').doesNotHaveClass('flip-vertical');
    this.set('flip', 'vertical');
    assert.dom('svg').doesNotHaveClass('flip-horizontal');
    assert.dom('svg').hasClass('flip-vertical');
    this.set('flip', 'both');
    assert.dom('svg').hasClass('flip-horizontal');
    assert.dom('svg').hasClass('flip-vertical');
  });

  test('it binds title', async function (assert) {
    const title = 'awesome is as awesome does';
    this.set('title', title);
    await render(<template><FaIcon @icon="coffee" @title={{this.title}} /></template>);
    assert.dom('svg title').exists({ count: 1 }, 'has title element');
    assert.dom('svg title').hasText(title, 'title is correct');
    assert.dom('svg').hasAria('labelledby', { any: true });
  });

  test('no title attribute gives no title element', async function (assert) {
    await render(<template><FaIcon @icon="coffee" /></template>);
    assert.dom('svg title').doesNotExist('has not title element');
  });

  test('title from string like object', async function (assert) {
    const title = 'awesome is as awesome does';
    this.set('title', htmlSafe(title));
    await render(<template><FaIcon @icon="coffee" @title={{this.title}} /></template>);
    assert.dom('svg title').exists({ count: 1 }, 'has title element');
    assert.dom('svg title').hasText(title, 'title is correct');
  });

  test('it renders with the default focusable attribute as false', async function (assert) {
    await render(<template><FaIcon @icon="coffee" /></template>);
    assert.dom('svg').hasAttribute('focusable', 'false');
  });

  test('it should change the focusable attribute to true', async function (assert) {
    await render(<template><FaIcon @icon="coffee" focusable="true" /></template>);
    assert.dom('svg').hasAttribute('focusable', 'true');
  });

  test('it defaults to ariaHidden', async function (assert) {
    await render(<template><FaIcon @icon="coffee" /></template>);
    assert.dom('svg').hasAttribute('aria-hidden', 'true');
  });

  test('it binds ariaHidden', async function (assert) {
    this.set('ariaHidden', 'true');
    await render(<template><FaIcon @icon="coffee" aria-hidden={{this.ariaHidden}} /></template>);
    assert.dom('svg').hasAttribute('aria-hidden', 'true');
    this.set('ariaHidden', 'false');
    assert.dom('svg').hasAttribute('aria-hidden', 'false');
    this.set('ariaHidden', false);
    assert.dom('svg').doesNotHaveAttribute('aria-hidden');
  });

  test('role defaults to img', async function (assert) {
    await render(<template><FaIcon @icon="coffee" /></template>);
    assert.dom('svg').hasAttribute('role', 'img');
  });

  test('it binds role', async function (assert) {
    this.set('role', 'img');
    await render(<template><FaIcon @icon="coffee" role={{this.role}} /></template>);
    assert.dom('svg').hasAttribute('role', 'img');
    this.set('role', 'presentation');
    assert.dom('svg').hasAttribute('role', 'presentation');
    this.set('role', false);
    assert.dom('svg').doesNotHaveAttribute('role');
  });

  test('it binds attributes', async function (assert) {
    this.set('height', '5px');
    this.set('width', '6px');
    this.set('x', '19');
    this.set('y', '81');

    await render(
      <template>
        <FaIcon
          @icon="coffee"
          height={{this.height}}
          width={{this.width}}
          x={{this.x}}
          y={{this.y}}
        />
      </template>,
    );

    assert.dom('svg').hasAttribute('height', '5px');
    assert.dom('svg').hasAttribute('width', '6px');
    assert.dom('svg').hasAttribute('x', '19');
    assert.dom('svg').hasAttribute('y', '81');
    this.set('height', '10rem');
    this.set('width', '10rem');
    this.set('x', '2');
    this.set('y', '2');
    assert.dom('svg').hasAttribute('height', '10rem');
    assert.dom('svg').hasAttribute('width', '10rem');
    assert.dom('svg').hasAttribute('x', '2');
    assert.dom('svg').hasAttribute('y', '2');
  });

  test('it renders no surrounding whitespace', async function (assert) {
    await render(<template><FaIcon @icon="coffee" /></template>);
    assert.ok(this.element.innerHTML.startsWith('<svg '));
    assert.ok(this.element.innerHTML.endsWith('</svg>'));
  });

  test('it accepts listItem', async function (assert) {
    this.set('listItem', false);
    await render(<template><FaIcon @icon="coffee" @listItem={{this.listItem}} /></template>);
    assert.dom('svg').doesNotHaveClass('list-item');
    this.set('listItem', true);
    assert.dom('svg').hasClass('list-item');
  });
});
