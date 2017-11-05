/* eslint-env node */
'use strict';

const path = require('path');
const GenerateIcons = require('./generate-icons');
const Funnel = require('broccoli-funnel');
const MergeTrees = require('broccoli-merge-trees');

module.exports = {
  name: 'build-icons',
  included(app) {
    this.app = app;
  },
  treeForPublic(publicTree) {
    const images = path.join(__dirname, 'images');
    const imageNode = new Funnel(images, {
      include: ['ilios-sunburst.svg']
    });
    const icons = new GenerateIcons(imageNode, {
      sizes: [16, 32, 48, 70, 96, 128, 256, 270, 310, 512],
      fileName: 'ilios-sunburst',
      project: this.app.project,
    });
    const appleFlatIcons = new GenerateIcons(imageNode, {
      sizes: [120, 152, 167, 180],
      fileName: 'ilios-sunburst-apple',
      background: {r: 255, g: 255, b: 255, alpha: 0},
      project: this.app.project,
    });
    let trees = [];
    const iconFunnel = new Funnel(icons, {
      destDir: 'assets/icons'
    });
    trees.push(iconFunnel);
    const appleFlatIconFunnel = new Funnel(appleFlatIcons, {
      destDir: 'assets/icons'
    });
    trees.push(appleFlatIconFunnel);

    if (publicTree) {
      trees.push(publicTree);
    }

    return new MergeTrees(trees);
  },
};
