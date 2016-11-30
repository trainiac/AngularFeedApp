baseServices.factory(
  "feedService",
  ["authService", "serverService", function(authService, serverService){

    function listToMap(list) {
      var map = {};

      for(item of list){
        map[item['id']] = item
      }

      return map
    }

    function assignAuthor(people) {

      var peopleMap = listToMap(people)

      return function(item){

        return Object.assign({}, item, {
          author: peopleMap[item.author_id],
          comments: item.comments.map(function(comment){

            return Object.assign({}, comment, {
              author: peopleMap[comment.author_id]
            })

          })
        })

      }

    }

    return {
      get:function(){

        return serverService.makeGetRequest(
          "http://localhost:8080/feed", {}
        ).then(function(data) {

          return data.data.items.map(
            assignAuthor(data.data.people)
          );

        });

      },
      getItem:function(itemId){

        return serverService.makeGetRequest(
          "http://localhost:8080/item?id=" + itemId, {}
        ).then(function(data) {

          return assignAuthor(data.data.people)(data.data.item)

        })

      },
      addComment: function(itemId, text) {

        var currentUser = authService.currentUser()

        return serverService.makePostRequest("http://localhost:8080/item/add_comment", {
          id: itemId,
          author_id: currentUser.id,
          text: text
        }).then(function(data){

          return Object.assign(data.data.comment, {
            author: currentUser
          });

        });

      }
    }
  }]
);