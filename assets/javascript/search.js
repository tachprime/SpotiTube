var DEV_KEY = 'AIzaSyDPKHG2v-oa9L4B-Au0tEsmTU9LAjjiVws'; // this one actually does need to be hidden

function search(tracksArray) {
	console.log('in search function');

	activateLoadAnim();
	
	global_init(tracksArray);

	gapi.client.setApiKey(DEV_KEY);
	gapi.client.load('youtube', 'v3', function() { requestVideosData(0); });
}

function global_init(tracksArray) {
	youtube_results = {'items': {}};
	tracks = [...tracksArray];
	width = 0;
	progress = (Math.round(( (100 / tracks.length ) * 100 )) / 100 );
}

function moveProgress() {
	width = Math.floor(width + progress);
	$('#loading span').text(`${width}%`);
}

function requestVideosData(count) {

	if (count == tracks.length) {
		/*rank*/ 
		console.log('ranking\n', youtube_results); 
		return rank(youtube_results, tracks);
	}
	else {

		let spot_id = tracks[count].spot_id;
		let query = tracks[count].artists[0] + ' ' + tracks[count].trackName;

		youtube_results['items'][spot_id] = [];
		let youtube_ids = [];

		let search_request = gapi.client.youtube.search.list({
			q: query,
			part: 'id,snippet',
			type: 'video',
			maxResults: 5
		});

		search_request.execute(function(response) {
			let items = response.items;
			for (let k = 0; k < items.length; k++) {
				let thumbnail;
				if (items[k].snippet.thumbnails.high.url) {
					thumbnail = items[k].snippet.thumbnails.high.url;
				}
				else if (items[k].snippet.thumbnails.medium.url) {
					thumbnail = items[k].snippet.thumbnails.medium.url;
				}
				else {
					thumbnail = items[k].snippet.thumbnails.default.url;
				}
				youtube_results['items'][spot_id].push(
					[items[k].id.videoId,
					items[k].snippet.title,
					items[k].snippet.channelTitle,
					thumbnail]);

				youtube_ids.push(items[k].id.videoId);
			}

			let video_request = gapi.client.youtube.videos.list({
				id: youtube_ids.join(','),
				part: 'contentDetails'
			});

			video_request.execute(function(response) {
				let videos = response.items;

				for (let j = 0; j < videos.length; j++) {
					youtube_results['items'][spot_id][j].push(videos[j].contentDetails.duration);
				}

				youtube_results['items'][spot_id].push(count);
				moveProgress();
				requestVideosData(count + 1);
			})
		});
	}
}

function activateLoadAnim() {
	$('#loading').removeClass('animate');
	$('.convert-button').css('visibility', 'hidden');
	$('#loading').addClass('animate');
}