$(document).ready(function() {
	//object to hold current user info
	var User = {
		//placeholder default data
		id: "Team SpotiTube",
		email: "mail@SpotiTube.com",
		image: "http://placehold.it/50x50",
		setUserData: function(response) {
			this.id = response.id;
			this.email = response.email;
			this.image = response.images[0].url;
		}
	};
	
	var PlaylistsGroup = {
		playlists: [],
		total: 0,
		playlistId: '',
		nextPage: null,
		prevPage: null,
	};
	
	function Playlist(id, numOfTracks, playlistImg) {
		this.id = id;
		this.numOfTracks = numOfTracks;
		this.playlistImg = playlistImg;
	}
	
    $(".button-collapse").sideNav();

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

	/*
		We will need this var to store/retrieve state value in localstorage either way
		so rather than create two separate vars, we just make this one global.
	 */
	var stateKey = 'spotify_auth_state';

	/*
		Since we're using the same index.html page to redirect to after spotify auth
		we only want the modal to open if it's not a redirect from spotify. 

		There are 3 cases we need to watch for here:
			1) First page load (location.href ends with index.html)
			2) Redirect after successful authentication (location.href ends with hash of parameters)
			3) Redirect after failed authentication (location.href ends with error and state params)

		The first if statement uses a regular expression to test if the end of 
		location.href is index.html, meaning that it's our user's first page load.
		If this looks like complete gibberish to you, that's okay. Ask me - I'm happy to explain.
		http://www.w3schools.com/js/js_regexp.asp
		is a good place to start if you want to learn the basics of regular expressions in JS.

		The next if statement checks to see if there is any value inside location.hash.
		If there is, that means authentication was successful and we can proceed.

		If not, the else statement will be (TODO) filled with something explaining that 
		the user must login to spotify or there's nothing to do on our site. 
		Not a priority issue, but it's worth noting.

		This will likely need to be slightly modified when we deploy to Heroku. (TODO)
	 */
    if (/index\.html$/.test(location.href)) {

	    $('.modal').modal({
	        dismissible: false
	    });

	    $('#modal1').modal('open');


	    /*
	    	I went ahead and registered an app on my spotify developer account.
	    	This is it's client_id. You're more than welcome to use it, but follow my
	    	instructions in slack regarding the chrome extension so that the redirect_uri
	    	will work. Getting the redirect_uri to work properly was probably the biggest
	    	pain in the @$$ out of all of OAuth, so if you value your sanity, I'd recommend
	    	sticking to these parameters and the chrome extension for now. We'll cross that
	    	bridge when it comes time for deployment to Heroku.

	    	The scopes defined here are what the user is agreeing to give us access to when
	    	they approve our app by signing into spotify. Basically all we want is their playlists,
	    	but I added the user email address in there as well in case we wanted it later on for
	    	checking for a returning user or something. We probably won't use it, but it doesn't hurt.

	    	State is a randomly generated string of 16 letters and numbers. We send it as a 
	    	parameter to spotify and they send it back so that we can verify that it is spotify 
	    	(and the current localStorage owner) redirecting back and not malware of some kind.
	     */
	    
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
				
				requestUserData(access_token);
				//requestPlaylists(access_token);
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
	
	function requestUserData(token) {
		$.ajax({
			url: 'https://api.spotify.com/v1/me/',
			headers: {
				'Authorization': 'Bearer ' + token
			},
			success: function(response) {

				/*
					This is the area where you can experiment safely!
					It's essentially the same as the .done(function(response){})).
					Check your console for an example response. You'll want to grab
					and store the response.id in a variable if you want to use the 
					functions in the spotify-web-api.js file I included, but you don't
					necessarily need to use those functions. They're meant to help, but 
					I haven't tested them yet, so it might be easier to use what we know (ajax)
					Play with it and see what you like!

					The documentation to spotify-web-api.js is here:
					https://github.com/jmperez/spotify-web-api-js

					Remember what our scope is when you make calls to the API.
					We can essentially only access their public info and all playlists.
					You'll get an error if you try to access anything else.

					I'll likely be asleep when you guys first see this, so hopefully my 
					comments explain everything well enough for you all to experiment with the api. 
					I'll be online when I wake up to add to this as well. This is just OAuth!!
					I haven't even translated anything over from python yet lol. 

					This is probably the hardest part though, so if my comments are too vague (I'm tired)
					I'll be happy to explain anything that is still not understood when I wake up. 
				 */
				
				User.setUserData(response);
				insertUserData(User);
				console.log(response);
			}
		});
	}
	
	function requestPlaylists(token) {
		$.ajax({
			url: 'https://api.spotify.com/v1/me/playlists',
			headers: {
				'Authorization': 'Bearer ' + token
			},
			success: function(response) {
				
				console.log(response);
			}
		});
	}
	
	function requestTracks(playlistID) {
		$.ajax({
			url: 'https://api.spotify.com/v1/me/playlists/'+ playlistID,
			headers: {
				'Authorization': 'Bearer ' + token
			},
			success: function(response) {
				
				console.log(response);
			}
		});
	}
});
