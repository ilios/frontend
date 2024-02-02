import IliosSerializer from 'ilios-common/serializers/ilios';

export default class SchoolConfigSerializer extends IliosSerializer {
  serialize(snapshot, options) {
    const originalValue = snapshot.attr('value');
    let json = super.serialize(snapshot, options);

    if (originalValue === false) {
      json.data.attributes.value = 'false';
    }

    return json;
  }
}
