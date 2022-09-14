import Component from '@glimmer/component';
import { filterBy } from '../utils/array-helpers';

export default class WeekGlanceEvent extends Component {
  sortString(a, b) {
    return a.localeCompare(b);
  }
  get sessionLearningMaterials() {
    return filterBy(this.args.event.learningMaterials, 'sessionLearningMaterial') ?? [];
  }

  get preworkEvents() {
    if (!this.args.event.prerequisites) {
      return [];
    }
    return this.args.event.prerequisites.map((ev) => {
      const rhett = {
        name: ev.name,
        slug: ev.slug,
        learningMaterials: [],
      };
      rhett.learningMaterials = filterBy(
        this.getTypedLearningMaterialProxies(ev.learningMaterials),
        'sessionLearningMaterial'
      ).sort(this.sessionLearningMaterialSortingCalling);
      return rhett;
    });
  }

  getTypedLearningMaterialProxies(learningMaterials) {
    const lms = learningMaterials || [];
    const handler = {
      get: function (obj, prop) {
        if ('type' === prop) {
          if (obj.isBlanked) {
            return 'unknown';
          }
          if (obj.citation) {
            return 'citation';
          } else if (obj.link) {
            return 'link';
          } else {
            return 'file';
          }
        }
        return obj[prop];
      },
    };

    return lms.map((lm) => {
      return new Proxy(lm, handler);
    });
  }

  sessionLearningMaterialSortingCalling(lm1, lm2) {
    const pos1 = Number(lm1.position) || 0;
    const pos2 = Number(lm2.position) || 0;

    // 1. position, asc
    if (pos1 > pos2) {
      return 1;
    } else if (pos1 < pos2) {
      return -1;
    }

    // 2. session learning material id, desc
    const id1 = lm1.sessionLearningMaterial;
    const id2 = lm2.sessionLearningMaterial;
    if (id1 > id2) {
      return -1;
    } else if (id1 < id2) {
      return 1;
    }
    return 0;
  }
}
