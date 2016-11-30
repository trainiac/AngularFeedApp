baseServices.factory('authService', function() {

  return {
    currentUser: function() {

      return {
        id: 'author_3',
        name: 'Mary'
      }

    }
  };

});