var info = "http://www.omdbapi.com/?t=";
var title = $('.movie').val();
var url = info + title;
var FIREBASE_URL = "https://flickpicker.firebaseio.com/flicks.json"

$.get(FIREBASE_URL, function (data) {
  Object.keys(data).forEach(function (id) {
		addMovieDetail(data[id]);
  });
});

var $button = $('.movieContainer');
$button.on("click",".btn",function() {
  $($button).children().each(function() {
    this.remove();
  });

})

var movie = document.querySelector('.search');

movie.onclick = function () {
  var input = document.querySelector("#movieName");
  var title = input.value;
  var url = info + title;

  $.get(url, function (data) {
    $.post(FIREBASE_URL, JSON.stringify(data));
    addMovieDetail(data);
  }, 'jsonp');
};

function addMovieDetail(data) {

  var detail = createMovieNode(data);
  var target = $('.movieContainer');

  target.empty();
  target.append(detail);
};

function createMovieNode(flicks){
  var docFragment = document.createDocumentFragment(); // contains all gathered nodes

  var div = document.createElement('div');
  div.setAttribute('class', 'movie2');
  docFragment.appendChild(div);

  var h1 = document.createElement('H1');
  div.appendChild(h1);
  var text = document.createTextNode(flicks.Title);
  h1.appendChild(text);

  var h2 = document.createElement('H2');
  div.appendChild(h2);
  var text_0 = document.createTextNode(flicks.imdbRating);
  h2.appendChild(text_0);

  var btn = document.createElement('button');
  btn.setAttribute('class', 'btn btn-danger');
  var btn_text = document.createTextNode('X');

  btn.appendChild(btn_text);
  div.appendChild(btn);

  return docFragment;
}

//////OG code below
/*  $.getJSON(url, function(data){
    addMovieDetail(data);
    console.log(data);
  });
});
*/

