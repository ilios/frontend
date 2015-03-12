/* jshint -W116 */
export default function getOne(id, model){
  var fixture = model.find(function(obj){
    //typeless comparison here since sometimes ids are strings
    return obj.id == id;
  });
  if(!fixture){
    console.log('Unable to find fixture for ' + id);
  }

  return fixture;
}
