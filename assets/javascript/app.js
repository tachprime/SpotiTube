$(document).ready(function() {
    /**
     * Generates a string of random numbers and letters
     * @param  {int} length [length of desired string]
     * @return {string}        [string of random letters and numbers]
     */
    function generateRandomString(length) {
		var text = '';
		var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

		for (var i = 0; i < length; i++) {
			text += possible.charAt(Math.floor(Math.random() * possible.length));
		}

		return text;
	};

	
	/**
	 * Handles OAuth params and redirects user to authorization page
	 * @return {none} window redirect
	 */
	function spotifyLogin() {

	    var client_id = '73a053a3263e4777a1424219269f36ce', 	// substitute client_id for x's
	    	redirect_uri = 'http://127.0.0.1:8887/index.html',
	    	scopes = 'user-read-email playlist-read-private playlist-read-collaborative',
	    	state = generateRandomString(16);

	    var auth_params = {
	    	'client_id': client_id,
	    	'response_type': 'token',
	    	'redirect_uri': redirect_uri,
	    	'scope': scopes,
	    	'state': state,
	    	'show_dialog': 'true' 	// I added this for testing purposes so we always have to approve auth
	    }

	    var auth_url = 'https://accounts.spotify.com/authorize?' + $.param(auth_params);

	    //	The 'state' parameter allows us to verify that it's actually Spotify
	    //	redirecting to our site. We store this in localStorage for now because the
	    //	window location is about to be changed to spotify's authorization request page.
	    localStorage.setItem(stateKey, state);

	    window.location = auth_url;
	}





	///////////////////////////////////////////
	// FUNCTION DECLARATIONS ABOVE THIS LINE //
	///////////////////////////////////////////










	/////////////////////////////////////////
	// OBJECT DECLARATIONS ABOVE THIS LINE //
	/////////////////////////////////////////


	/*
		We will need this var to store/retrieve state value in localstorage either way
		so rather than create two separate vars, we just make this one global.
	 */
	var stateKey = 'spotify_auth_state';


	//////////////////////////////////////
	// GLOBAL VARIABLES ABOVE THIS LINE //
	//////////////////////////////////////


	///////////////////////////////
	// ALL LOGIC BELOW THIS LINE //
	///////////////////////////////

    $(".button-collapse").sideNav();

	
    if (/index\.html$/.test(location.href)) {

	    $('.modal').modal({
	        dismissible: false
	    });

	    $('#modal1').modal('open');
	    
	    $('.login-button').on('click', function() {

	    	spotifyLogin();
	    	
	    });
	}
	else if (location.hash) {

		// Here we're using a short regular expression to replace the # in location.hash
		// then we're using a series of split() functions to get and store the key/value
		// pairs returned from spotify. 
		var hash = location.hash.replace(/#/g, '');
		var all = hash.split('&');
		var args = {};

		all.forEach(function(keyvalue) {
			var key = keyvalue.split('=')[0],
				value = keyvalue.split('=')[1];
			args[key] = value;
		});

		//	If you want to see what spotify returns, you can take a look at their docs..
		//	... or look at your console.
		console.log(args);

		//	Here we're grabbing the access token and returned state from spotify,
		//	as well as retrieving our sent state value from localStorage.
		var access_token = args.access_token,
			state = args.state,
			storedState = localStorage.getItem(stateKey);

		// Here we're making sure everything is authentic (pun intended).
		// If the redirected url doesn't contain a state parameter or if it doesn't
		// match our storedState value, we don't want to continue because something
		// went wrong somewhere (or someone is likely trying to hack us).
		if (access_token && (state == null || state != storedState)) {

			alert('There was an error during the authentication');

		}
		//	If everything checks out, then we continue
		else {

			// removing our stored state value from localStorage because we won't 
			// use it again. If we need to re-authenticate it will generate a new state.
			localStorage.removeItem(stateKey);

			// Obviously we only want to make our requests to spotify's api if we
			// received our access token. If it doesn't exist, we should probably add
			// some error message and handling to an else statement (TODO)
			if (access_token) {
				$.ajax({
					url: 'https://api.spotify.com/v1/me',
					headers: {
						'Authorization': 'Bearer ' + access_token
					},
					success: function(response) {
						
						console.log(response);
					}
				});
			}
		}
	}
	else {

		$('.modal').modal({
	        dismissible: false
	    });

	    $('#modal2').modal('open');

	    $('.login-button').on('click', function() {

	    	spotifyLogin();
	    	
	    });

		console.log('access denied');
	}
});
