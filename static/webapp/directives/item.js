feedApp.directive('item', function(){

  return {
    restrict: 'E',
    replace: true,
    scope: {
      scope:'='
    },
    templateUrl: 'templates/item_template.html'
  };

});
