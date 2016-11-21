var DEV_KEY = 'xxxxxxxxxxxxxxxxxxxxxx'; // this one actually does need to be hidden

function search(tracksArr) {
	console.log('in search function');
	
	tracks = Array.from(tracksArr);

	gapi.client.setApiKey(DEV_KEY);
	gapi.client.load('youtube', 'v3', function() { requestVideosData(); });
}

function makeSearchRequest(query) {
	var request = gapi.client.youtube.search.list({
		q: query,
		part: 'id,snippet',
		type: 'video',
		maxResults: 5
	});

	return new Promise(function(resolve, reject) {
		request.execute(function(response) {
			console.log('searching...');
			
			resolve(response);		
		});
	});
}

function makeVideoRequest(query) {
	var request = gapi.client.youtube.videos.list({
		id: query,
		part: 'contentDetails',
	});

	return new Promise(function(resolve, reject) {
		request.execute(function(response) {
			console.log('grabbing video...');
			console.log(response);
			resolve(response);		
		});
	});
}

function requestVideosData() {
	var youtube_results = {'items': {}};

	for (let i = 0; i < tracks.length; i++) {

		var spot_id = tracks[i].spot_id;
		var query = tracks[i].artists.join(' ') + tracks[i].trackName;

		youtube_results['items'][spot_id] = [];
		var youtube_ids = [];

		makeSearchRequest(query)

		.then(function(response) {
			console.log(response);

			let items = response.items;

			for (let k = 0; k < items.length; k++) {
				youtube_results['items'][spot_id].push(
					[items[k].id.videoId, 
					items[k].snippet.title, 
					items[k].snippet.channelTitle]);

				youtube_ids.push(items[k].id.videoId);
			}

			return youtube_ids.join(',');
		})

		.then(function(video_ids) {

			makeVideoRequest(video_ids)

			.then(function(response) {
				var videos = response.items;

				for (let i = 0; i < videos.length; i++) {
					youtube_results['items'][spot_id][i].push(videos[i].contentDetails.duration);
				}

				youtube_results['items'][spot_id].push(i);
			});
		});
	}

	console.log('youtube results');
	console.log(youtube_results);
}