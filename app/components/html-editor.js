/* eslint ember/order-in-components: 0 */
import $ from 'jquery';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { computed } from '@ember/object';
import { dom } from '@fortawesome/fontawesome-svg-core';
import { next } from '@ember/runloop';

const defaultButtons = [
  'bold',
  'italic',
  'subscript',
  'superscript',
  'formatOL',
  'formatUL',
  'insertLink',
  'html'
];
export default Component.extend({
  i18n: service(),
  content: '',

  /**
   * Disable Froala's built in beacon tracking
   * Has to be done on the global jQuery plugin object
   */
  init() {
    this._super(...arguments);
    $.FE.DT = true;
  },
  /**
   * Convert `<i>` tags from froala into SVG icons
   * Uses: https://fontawesome.com/how-to-use/with-the-api/methods/dom-i2svg
   */
  didRender() {
    next(() => {
      dom.i2svg({node: this.element});
    });
  },
  options: computed('i18n.locale', function(){
    const i18n = this.get('i18n');
    const language = i18n.get('locale');

    return {
      key   : '3A9A5C4A3gC3E3C3E3B7A4A2F4B2D2zHMDUGENKACTMXQL==',
      theme : 'gray',
      language,
      toolbarInline: false,
      placeholderText: '',
      allowHTML: true,
      saveInterval: false,
      pastePlain: true,
      spellcheck: true,
      toolbarButtons: defaultButtons,
      toolbarButtonsMD: defaultButtons,
      toolbarButtonsSM: defaultButtons,
      toolbarButtonsXS: defaultButtons,
      quickInsertButtons: false,
      pluginsEnabled: ['lists', 'code_view', 'link'],
      iconsTemplate: 'font_awesome_5',
    };
  })

});
