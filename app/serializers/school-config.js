import ApplicationSerializer from './application';

export default class SchoolConfigSerializer extends ApplicationSerializer {
  serialize(snapshot, options) {
    const originalValue = snapshot.attr('value');
    let json = super.serialize(snapshot, options);

    if (originalValue === false) {
      json.data.attributes.value = 'false';
    }

    return json;
  }
}
