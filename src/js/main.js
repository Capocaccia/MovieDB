var info = "http://www.omdbapi.com/?t=";
var title = $('.movie').val();
var url = info + title;
var FIREBASE_URL = "https://flickpicker.firebaseio.com/flicks.json"
var FIREBASE_AUTH = 'https://buildscripts.firebaseio.com/';
var fb = new Firebase(FIREBASE_AUTH);

$('.search').on('click', function() {
  var input = document.querySelector("#movieName");
  var title = input.value;
  var url = info + title;
  console.log("hello");

  $.get(url, function (data) {
    $.post(FIREBASE_URL, JSON.stringify(data));
    addMovieDetail(data);
  }, 'jsonp');
});

function addMovieDetail(data, id){
  var $table=$(".table");
  $table.append("<tr></tr>");
  var $target=$("tr:last");
  $target.attr("data-id", id);
  $target.append("<td>" + data.Title + "</td>");
  $target.append("<td>" + data.imdbRating + "</td>");
  $target.append("<td>" + data.Year + "</td>");
  $target.append("<td><img width='200' height='250' src=" + data.Poster + "></img></td>");
  $target.append("<button class='delete'>Delete</button>");
};

$.get(FIREBASE_URL, function (movies) {
  Object.keys(movies).forEach(function (id) {
		addMovieDetail(movies[id], id);
  });
});

///Playing with my delete on click function here
var $button = $('.table');
$button.on("click", ".delete", function() {
  var $movieRow = $(this).closest('tr');
  var id = $movieRow.attr('data-id');
  var deleteUrl = FIREBASE_URL.slice(0, -5) + '/' + id + '.json';
    $.ajax({
    url: deleteUrl,
    type: 'DELETE',
    success: function() {
      $movieRow.remove();
    }
  })
});
//end playing
//Im not sure how to add the data ID to each td and then select that id like im trying to do in lines 38 and 39
//starting testing for firebase logns wed may 20th
//everything below this point is for login.html
$('.loginPageForm form').on('submit', function (evt) {
  var email = $('.loginPageForm input[type="email"]').val();
  var password = $('.loginPageForm input[type="password"]').val();
  evt.preventDefault();
  fb.authWithPassword({
    email: email,
    password: password
  }, function (err, authData) {
    if (err) {
      alert(err.toString());
    } else  {
      //cb(authData);
      console.log("logged in")
      window.location = '/'
    }
  });
});

//working on having it land on the login page if not logged in
// if (window.location.pathname !== '/login/login && !fb.getAuth()) {
//  window.location ='/login';
// }
$( document ).ready(function() {
  debugger;
if (window.location.pathname !== '/login.html' && !fb.getAuth()) {
  console.log("Hello");
 window.location ='/login.html';
  }
});
