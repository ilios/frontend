export default function getOne(id, model){
  return model.find(function(obj){
    return obj.id === parseInt(id, 10);
  });
}
