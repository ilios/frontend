import Component from '@glimmer/component';
import config from 'ilios/config/environment';
const {
  IliosFeatures: { programYearVisualizations },
} = config;

export default class ProgramYearOverviewComponent extends Component {
  programYearVisualizations = programYearVisualizations;
}
