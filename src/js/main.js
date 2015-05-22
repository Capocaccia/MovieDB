var info = "http://www.omdbapi.com/?t=";
var title = $('.movie').val();
var url = info + title;
var FIREBASE_URL = "https://flickpicker.firebaseio.com/flicks.json"
var FIREBASE_AUTH = 'https://flickpicker.firebaseio.com/';
var fb = new Firebase(FIREBASE_AUTH);

$('.search').on('click', function() {
  var input = document.querySelector("#movieName");
  var title = input.value;
  var url = info + title;
  var uid = fb.getAuth().uid;
  var token = fb.getAuth().token;
  var postUrl = `${FIREBASE_AUTH}/users/${uid}/flicks.json?auth=${token}`;
  $.get(url, function (data) {
    $.post(postUrl, JSON.stringify(data), function (res) {
    console.log("Post Request Passed")
  });
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
  $target.append("<button class='delete button-primary'>Delete</button>");
};

// $.get(FIREBASE_URL, function (movies) {
//   Object.keys(movies).forEach(function (id) {
// 		addMovieDetail(movies[id], id);
//   });
// });

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
    } else {
      //cb(authData);
      console.log("logged in")
      window.location = '/'
    }
  });
});
///ideas for posting UID to FB.
// $('.loginPageForm form').on('submit', function (evt) {
//   var email = $('.loginPageForm input[type="email"]').val();
//   var password = $('.loginPageForm input[type="password"]').val();
//   var onTempPassword = $('.onTempPassword');
//   evt.preventDefault();
//   fb.authWithPassword({
//     email: email,
//     password: password
//   }, function (err, authData) {
//     if (err) {
//       alert(err.toString());
//     } else if(authData && authData.password.isTemporaryPassword) {
//       onTempPassword.removeClass('hidden');
//     } else {
//       debugger;
//       var title = $('.input input[type="text"]').val();
//       var uid = authData.uid;
//       var token = authData.token;
//       var postUrl = `${FIREBASE_AUTH}/users/${uid}/flicks.json?auth=${token}`;
//       $.post(postUrl, JSON.stringify(title), function (res) {
//         console.log("Post Request Passed");
//     //addPhotosToDom({url: url});
//     //clearForms();
//     // res = { name: '-Jk4dfDd123' }
//     })
//       console.log("logged in")
//       window.location = '/'
//     }
//   });
// });

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

//on page load it checks if you are logged in.  If you arent, it sends you to login page.
$( document ).ready(function() {
if (window.location.pathname !== '/login.html' && !fb.getAuth()) {
 window.location ='/login.html';
    }
  });
