var info = "http://www.omdbapi.com/?t=";
var title = $('.movie').val();
var url = info + title;
var FIREBASE_URL = "https://flickpicker.firebaseio.com/flicks.json"
var FIREBASE_AUTH = 'https://flickpicker.firebaseio.com';
var fb = new Firebase(FIREBASE_AUTH);
var scoreArr = [];


//taste test button works.
$('.tasteTest').on('click', function(){
  var scoreTotalArr = scoreArr.split(" ").map(Number);
  var $ttResult=$(".rating");
  var total = scoreTotalArr.reduce(function(prev, curr) {
  return prev + curr;
});
if (total >= 45) {
  addTasteTestResult(total);
  $ttResult.append('<img src="http://upload.wikimedia.org/wikipedia/en/thumb/2/2d/Certified_Fresh.svg/150px-Certified_Fresh.svg.png"</img>')
    //alert("Hey, you know good film when you see it!  You should put down your friends opinions about movies now because your opinions are better and have been reaffirmed by me.  Got it?")
  } else if (total >= 40) {
    alert("Alright, you like good movies but have some guilty pleasures.  Its ok.  I like Mean Girls too.")
    }
    else if (total >= 35) {
      alert("Sometimes I wonder if we mean the same thing by 'good'...")
      }
      else if(total >= 30) {
        alert("Step your game up.  Might I recommend starting with 'Goodfellas or The Departed?'")
        }
        else if(total < 30){
          alert("You probably talk and text in theaters and definitely dont deserve a Netflix account.")
          };
});

//appending taste test result to page
function addTasteTestResult(total){
    var $removeBtn = $('.remove')
    var $ttResult=$(".rating");
    $removeBtn.removeClass('hidden');
    $ttResult.append("Taste Test Score: ", total);
    $ttResult.removeClass('hidden');

  }

// //trying to get the taste test result to hide on button click
$('.remove').on('click', function(){
    var $ttResult = $(".rating");
    var $removeBtn = $('.remove')
    $removeBtn.addClass('hidden');
    $ttResult.addClass("hidden");
    $ttResult.empty('.rating');
  })

//on page load it checks if you are logged in.  If you arent, it sends you to login page.
$( document ).ready(function() {
if (window.location.pathname !== '/login.html' && !fb.getAuth()) {
 window.location ='/login.html';
    }
  });

//search button working and done
$('.search').on('click', function() {
  var input = document.querySelector("#movieName");
  var title = input.value;
  var url = info + title;
  var uid = fb.getAuth().uid;
  var token = fb.getAuth().token;
  var postUrl = `${FIREBASE_AUTH}/users/${uid}/flicks.json?auth=${token}`;
  $.get(url, function (data) {
    console.log(data);
    if(data.Response === "True"){
    $.post(postUrl, JSON.stringify(data), function (res) {
    console.log("Post Request Passed")
  });
    addMovieDetail(data);
    } else {
      alert("Sorry! Film not found! Check title and try again!")
    }
  }, 'jsonp');
});

//loads data per user and keeps its persisting
$(document).ready(function(){
  if (window.location.pathname === '/' && fb.getAuth() !== null){
    var uid = fb.getAuth().uid;
    var token = fb.getAuth().token;
    var MovieListUrl = `${FIREBASE_AUTH}/users/${uid}/flicks.json?auth=${token}`;
    $.get(MovieListUrl, function (movies) {
      Object.keys(movies).forEach(function (id) {
      addMovieDetail(movies[id], id);
      });
    });
  }
});


function addMovieDetail(data, id){
  var $table=$(".table");
    $table.append("<tr></tr>");
    var $target=$("tr:last");
    scoreArr = scoreArr + Math.round(data.imdbRating) + " ";
      $target.attr("data-id", id);
      $target.append("<td>" + data.Title + "</td>");
      $target.append("<td>" + data.imdbRating + "</td>");
      $target.append("<td>" + data.Released + "</td>");
      $target.append("<td><img width='200' height='250' src=" + data.Poster + "></img></td>");
      $target.append("<button class='delete'>Delete</button>");
};

///Deletes individual users data from firebase
var $button = $('.table');
$button.on("click", ".delete", function() {
  var uid = fb.getAuth().uid;
  var token = fb.getAuth().token
  var $movieRow = $(this).closest('tr');
  var id = $movieRow.attr('data-id');
  var deleteUrl = FIREBASE_AUTH + '/' + 'users' + '/' + uid + '/' + 'flicks' + '/' + id + '.json';
    $.ajax({
    url: deleteUrl,
    type: 'DELETE',
    success: function() {
      $movieRow.remove();
    }
  })
});

//everything below this point is for login.html

//login button
$('.loginPageForm form').on('submit', function (evt) {
  var email = $('.loginPageForm input[type="email"]').val();
  var password = $('.loginPageForm input[type="password"]').val();
  var onTempPassword = $('.onTempPassword');
  evt.preventDefault();
  fb.authWithPassword({
    email: email,
    password: password
  }, function (err, authData) {
    if (err) {
      alert(err.toString());
    } else if(authData && authData.password.isTemporaryPassword) {
      onTempPassword.removeClass('hidden');
      alert("Please change your password now.")
    } else {
      window.location = '/'
    }
  });
});

// runs when called by registration button if  successful
function doLogin (email, password, cb) {
  fb.authWithPassword({
    email: email,
    password: password
  }, function (err, authData) {
    if (err) {
      alert(err.toString());
    } else {
      saveAuthData(authData);
      typeof cb === 'function' && cb(authData);
      window.location = '/'
      alert("Registration Successful!")
    }
  });
}

//saves the authentication data to firebase
function saveAuthData (authData) {
  $.ajax({
    method: 'PUT',
    url: `${FIREBASE_AUTH}/users/${authData.uid}/profile.json`,
    data: JSON.stringify(authData)
  });
}


//register button
$('.loginPageForm .doRegister').click(function () {
  var email = $('.loginPageForm input[type="email"]').val();
  var password = $('.loginPageForm input[type="password"]').val();

  fb.createUser({
    email: email,
    password: password
  }, function (err, userData) {
    if (err) {
      alert(err.toString());
    } else {
      doLogin(email, password);
    }
  });
  event.preventDefault();
});

//forgot password button
$('.loginPageForm .doResetPassword').click(function () {
  var email = $('.loginPageForm input[type="email"]').val();

  fb.resetPassword({
    email: email
  }, function (err) {
    if (err) {
      alert(err.toString());
    } else {
      alert('Check your email!');
    }
  });
});

//reset password form
$('.onTempPassword form').submit(function () {
  var email = fb.getAuth().password.email;
  var oldPw = $('.onTempPassword input:nth-child(1)').val();
  var newPw = $('.onTempPassword input:nth-child(2)').val();

  fb.changePassword({
    email: email,
    oldPassword: oldPw,
    newPassword: newPw
  }, function(err) {
    if (err) {
      alert(err.toString());
    } else {
      fb.unauth();
    }
  });

  event.preventDefault();
})

//reset password button
$('.onTempPassword form').submit(function () {
  var email = fb.getAuth().password.email;
  var oldPw = $('.onTempPassword input:nth-child(1)').val();
  var newPw = $('.onTempPassword input:nth-child(2)').val();

  fb.changePassword({
    email: email,
    oldPassword: oldPw,
    newPassword: newPw
  }, function(err) {
    if (err) {
      alert(err.toString());
    } else {
      fb.unauth();
      window.location = '/'
    }
  });

  event.preventDefault();
})

//logout button
$('.logout').on('click', function() {
  fb.unauth();
  window.location = '/'
});
