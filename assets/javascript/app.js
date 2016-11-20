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

	    var client_id = '73a053a3263e4777a1424219269f36ce',
	    	redirect_uri = 'http://127.0.0.1:8887/index.html',
	    	scopes = 'user-read-email playlist-read-private playlist-read-collaborative',
	    	state = generateRandomString(16);

	    var auth_params = {
	    	'client_id': client_id,
	    	'response_type': 'token',
	    	'redirect_uri': redirect_uri,
	    	'scope': scopes,
	    	'state': state,
	    	'show_dialog': 'false' 	// Change to 'true' for testing Oauth redirect
	    }

	    var auth_url = 'https://accounts.spotify.com/authorize?' + $.param(auth_params);

	    //	The 'state' parameter allows us to verify that it's actually Spotify
	    //	redirecting to our site. We store this in localStorage for now because the
	    //	window location is about to be changed to spotify's authorization request page.
	    localStorage.setItem(stateKey, state);

	    window.location = auth_url;
	}
	
	function requestUserData(token) {
		$.ajax({
			url: 'https://api.spotify.com/v1/me/',
			headers: {
				'Authorization': 'Bearer ' + token
			},
			success: function(response) {
				
				userData.setUserData(response);
				insertUserData(userData);
				
				console.log("user response");
				console.log(response);
			}
		});
	}
	
	function requestPlaylistsData(token, query) {
		$.ajax({
			url: query,
			headers: {
				'Authorization': 'Bearer ' + token
			},
			success: function(response) {
				
				playlistsData.total = response.total;
				playlistsData.addToPlaylists(response);
				
				if (response.next !== null) {
					
					playlistsQuery = response.next;
					requestPlaylistsData(token, playlistsQuery);
					
				} else {
					
					insertPlaylists(playlistsData);
				}
				
				console.log("playlists response");
				console.log(response);
			}
		});
	}

	function insertUserData(user) {
		$('#userImg').attr('src', user.image);
		$('#userName').html(user.id);
		$('#userEmail').html(user.email);
	}

	function insertPlaylists(playlistData) {
		
		if (playlistData.total > PAGE_LIMIT) {

			totalPages = Math.ceil(playlistData.total / PAGE_LIMIT);
			showPagination();

			let playlists = playlistData.playlists;

			for (var i = 0; i < totalPages; i++) {

				pageList[i] = playlists.splice(0, PAGE_LIMIT);
			}

			console.log(pageList);

			for (var i = 0; i < pageList[0].length; i++) {
				playlistTemplate(pageList[0][i]);
			}

		} else {

			for (let i = 0; i < playlistData.playlists.length; i++) {
				playlistTemplate(playlistData.playlists[i]);
			}

		}

		console.log("adding playlists");
	}

	function playlistTemplate(playlistData) {

		let name = playlistData.playlistName;
		let trackTotal = playlistData.numOfTracks;
		let link = playlistData.tracksLink;
		let img = playlistData.playlistImg;
		let nameLength = playlistData.playlistName.length;
		let albumName = '';
		
		if (nameLength > 17) {
			albumName = 
				 `<marquee behavior="scroll" directions="left">`
				+`<p><span class="title">${name}</span></p>`
				+`</marquee>`;
		} else {
			albumName = `<p><span class="title">${name}</span></p>`;
		}

		let template = $('<li>', {
			'id': 'playlist-' + name.replace(/\s/g, '_'),
			'class': 'collection-item avatar grey darken-4',
			'data-tracks': link,
			'data-total': trackTotal,
			'data-img': img
		}).html(
			`<img src="${img}" alt="playlist art" class="album-art">`
			+`<div class="text-body">`
			+`${albumName}`
			+`<p>Tracks: ${trackTotal}</p>`
			+`</div>`
			+`<a href="#!" class="secondary-content">`
			+`<i class="material-icons">queue_play_next</i></a></div>`
		)

		$(template).on('click', function() {
			playlistClicked($(this));
		});

		$('.collection').append(template);
	}

	function showPagination() {

		for (var i = 1; i <= totalPages; i++) {

			let template = $('<li>', {
				'id': 'page-'+ i,
				'class': 'wave-effect',
				'value': i
			}).html(`<a>${i}</a>`);

			$('#numbers-area').append(template);

			$(template).on('click', function() {
				pageClick($(this));
			})
		}

		$('.pagination').show();
	}

	function pageClick(number) {
		$('.collection').empty();

		let page = (number.val() - 1);

		for (var i = 0; i < pageList[page].length; i++) {
			playlistTemplate(pageList[page][i]);
		}
	}


	///////////////////////////////////////////
	// FUNCTION DECLARATIONS ABOVE THIS LINE //
	///////////////////////////////////////////
	var userData = {
		//placeholder default data
		id: "Team SpotiTube",
		email: "mail@SpotiTube.com",
		image: "assets/images/defaultuser.jpg",
		
		setUserData: function(response) {
			
			this.id = response.id;
			this.email = response.email;
			//see if user has an profile pic
			if(response.images.length !== 0){
			
				this.image = response.images[0].url;
				
			}
		}
	};
	
	var playlistsData = {
		playlists: [],
		total: 0, //total count of users playlists
		
		addToPlaylists: function(response) {
			
			let plData = response.items;
			
			for (var i = 0; i < plData.length; i++) {
				
				//using push instead of index to add to playlists
				//if this is a next page request
				this.playlists.push(
					new Playlist(plData[i].name, plData[i].tracks.total, plData[i].images, plData[i].href) 
				);
				
			}
			
			console.log(playlistsData.playlists);
		}
	};
	
	//protype function for creating playlist objects
	function Playlist(playlistName, numOfTracks, playlistImgs, tracksLink) {
		this.playlistName = playlistName;
		this.numOfTracks = numOfTracks;
		this.tracksLink = tracksLink;
		this.playlistImg;
		if(playlistImgs.length !== 0){
		
			this.playlistImg = playlistImgs[0].url;
			
		} else {

			this.playlistImg = "http://placehold.it/64x64";
		}
	}

	/////////////////////////////////////////
	// OBJECT DECLARATIONS ABOVE THIS LINE //
	/////////////////////////////////////////

	/*
		We will need this var to store/retrieve state value in localstorage either way
		so rather than create two separate vars, we just make this one global.
	 */
	var stateKey = 'spotify_auth_state';

	const PAGE_LIMIT = 16;
	var totalPages = 1;
	var currentPage = 1;
	var pageList = [];
	var playlistsQuery = 'https://api.spotify.com/v1/me/playlists?limit=50';

	//////////////////////////////////////
	// GLOBAL VARIABLES ABOVE THIS LINE //
	//////////////////////////////////////


	///////////////////////////////
	// ALL LOGIC BELOW THIS LINE //
	///////////////////////////////

    $(".button-collapse").sideNav();
	
	$(".pagination").hide();

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

		access_token = args.access_token;
		var state = args.state,
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
				
				console.log("token granted!");
				requestUserData(access_token);
				requestPlaylistsData(access_token, playlistsQuery);
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

	$('.convert-button').on('click', function() {

	   $('.modal').modal({

	   		dismissible: true //change this once algorithm is completed        
	    });

	    $('#modal3').modal('open');

	});
});

function playlistClicked(item) {
	console.log('FINALLY');
	tracksData.tracks.length = 0;
	requestTracksData(item[0].dataset.tracks);
}

function requestTracksData(query) {
	var next = null;

	$.ajax({
		url: query,
		headers: {
			'Authorization': 'Bearer ' + access_token
		},
		success: function(response) {
			console.log("tracks response");
			console.log(response);
			
			try {
				next = response.tracks.next;
				tracksData.addToTracks(response.tracks);
			}
			catch(error) {
				next = response.next;
				tracksData.addToTracks(response);
			}
		},
		complete: function() {
			if (next) { requestTracksData(next); }
		}
	});
}

var tracksData = {
	tracks: [],
	total: 0, //total count of playlists tracks
	
	addToTracks: function(response) {
		
		let tData = response.items;
		
		for (var i = 0; i < tData.length; i++) {

			let t = tData[i].track;
			
			let arr = [];
			t.artists.map(x => arr.push(x.name));

			let mins = (t.duration_ms/1000/60) << 0;
			let secs = (Math.round((t.duration_ms/1000) % 60)).toString();
			secs = secs.length == 1 ? `0${secs}` : secs;

			let duration = mins + ':' + secs;

			let albumImg = t.album.album_type != null ? t.album.images[1].url : 'https://placehold.it/300x300'
			
			this.tracks.push(
				new Track(
					t.name,
					t.album.name,
					albumImg,
					arr,
					duration,
					t.preview_url,
					t.id
				) 
			);
		}
		console.log(this.tracks);
	}
};

function Track(trackName, albumName, albumArt, artists, trackDuration, preview_url, spot_id) {
		this.trackName = trackName;
		this.albumName = albumName;
		this.albumArt = albumArt;
		this.artists = artists; // this is an array, even if there's only one artist
		this.trackDuration = trackDuration;
		this.preview_url = preview_url;
		this.spot_id = spot_id;
	}
