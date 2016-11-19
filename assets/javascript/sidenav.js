const PAGE_LIMIT = 20;
var totalPages = 1;
var list = [];

function insertUserData(user) {
	$('#userImg').attr('src', user.image);
	$('#userName').html(user.id);
	$('#userEmail').html(user.email);
}

function insertPlaylists(playlistData) {

	if (playlistData.total > PAGE_LIMIT) {

		totalPages = Math.ceil(playlistData.total / PAGE_LIMIT);
		showPagination();

	}
	
	for (var i = 0; i < playlistData.playlists.length; i++) {
		playlistTemplate(playlistData.playlists[i]);
	}
	
	console.log("adding playlists");
}

function playlistTemplate(playlistData) {
	
	let name = playlistData.playlistName;
	let trackTotal = playlistData.numOfTracks;
	let link = playlistData.tracksLink;
	let img = playlistData.playlistImg;
	
	let template =
		
		 `<li id="playlist-${name.replace(/\s/g, '_')}" `
		+`class="collection-item avatar grey darken-4" `
		+`data-tracks="${link} data-total="${trackTotal}">`
			+`<img src="${img}" alt="playlist art">`
			+`<span class="title">${name}</span>`
			+`<p>Tracks: ${trackTotal}</p>`
			+`<a href="#!" class="secondary-content">`
			+`<i class="material-icons grey lighten-5">music video</i></a></div>`
		+`</li>`;
	
	$('.collection').append(template);
}
	
function showPagination() {
		
	for (var i = 1; i <= totalPages; i++) {
		let template =
			
			`<li class="wave-effect" value="${i}"><a href="#!">${i}</a></li>`;
		
		$('#numbers-area').append(template);
	}
	
	$('.pagination').show();
}
