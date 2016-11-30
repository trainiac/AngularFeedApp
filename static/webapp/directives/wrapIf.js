feedApp.directive('wrapIf', ['$compile', function($compile){

  return {
    restrict: 'A',
    transclude: false,
    compile: function(){

      return {
        pre: function(scope, el, attrs){

          if (!Boolean(attrs.wrapIf)) {
            el.replaceWith(
              $compile(el.html())(scope)
            );
          }

        }
      }

    }
  }

}]);