var feedApp = angular.module("feedApp", [
  "ngRoute",
  "baseServices"
]);

feedApp.config(function($routeProvider, $sceDelegateProvider) {

  $routeProvider
    .when('/feed', {
      templateUrl: 'templates/feed_template.html',
      controller: 'FeedController'
    })
    .when('/item/:itemId', {
      templateUrl: 'templates/item_template.html',
      controller: 'ItemController'
    })
    .otherwise({redirectTo: '/feed'});

  $sceDelegateProvider.resourceUrlWhitelist([
    'self' // Allow same origin resource loads.
  ]);

});

(function(){

  function addComment(feedService) {

    return function(item, formData){
      if(formData.text){
        feedService.addComment(item.item_id, formData.text).then(function(comment){
          item.comments = item.comments.concat([comment]);
          formData.text = '';
        })
      }

    }

  }

  function createItemScope(isInFeed, addComment){

    return function(item) {

      return {
        item: item,
        formData: {},
        isInFeed: isInFeed,
        addComment: addComment
      }

    }

  }

  feedApp.controller("FeedController",
    ["$scope", "feedService",
    function($scope, feedService) {

      feedService.get()
        .then(function(items) {
          $scope.scopes = items.map(
            createItemScope(
              true,
              addComment(feedService)
            )
          );
        });

    }
  ]);

  feedApp.controller("ItemController",
    ["$scope", "$routeParams", "feedService",
    function($scope, $routeParams, feedService) {

      feedService.getItem($routeParams.itemId)
        .then(function(item) {
          $scope.scope = createItemScope(
            false,
            addComment(feedService)
          )(item)
        });

    }]
  );

})();
