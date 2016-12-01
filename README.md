

<snippet>
  <content><![CDATA[
# ${1:Spotitube}
TODO: Users login with their Spotify account and we find matching YouTube videos for songs in their playlist of choice.
## How It All Began
TODO: Spotitube was originally designed by Morgan Sliman using a different programming language, Python. Our group of up and coming web developers Alex Rivera, Windsor Edeling, Lakayla Wilhite and of course Morgan Sliman, began to transform the Python language to Javascript. SpotiTube contains multiple programming languages designed to make user usage easy and pleasing to the eye. Programs include Javascript, HTMl, CSS with the help of Materialize, OAuth and the Spotify and Youtube Api's.
## Steps
TODO: 
1.So the first thing we had to do is have a modal pop up immediately displaying the Spotify login, with a Welcoming message about what our website actually does. If the user denies access to Spotify display a different modal explaining that our website needs access to their Spotify account in order to function, then we another login to Spotify button would appear to redirect them to login again.

2.After that we needed another modal to pop up which is the progress bar indicating how far along the loading is going when the user clicks on the "convert to youtube" button. The user cannot close the modal, but the modal closes automatically after the Videos have been converted and sorted from Youtube.

3.Then we had to Display the users Playlists. On our website we load 20 playlist for the user,and if the user has more than 20 playlist there is a button appended to the bottom that the user can press to load more of their playlist. Then we focused on when the page is redirected back to our site after successful authentication, and after we request the playlist data from Spotify, the side menu automatically, then when the User selects the playlist for Youtube conversion on the side menu, the side bar closes.Then we had to get the tracks info from Spotify API for selected playlist and store data for each track into an array of objects.

4.Then came the styling for the left side. We set the tracks table to not extend past the height of the window.For larger playlists, we made it scrollable.Then we made it so that the user was able to scroll on the left side without it affecting the right side. Then we made the player take up the entire space of the left side.

5.After all the styling on the Spotify side, we looped through our trackData array to search YouTube for 5 videos for each song which we then used to create data structures to hold temporary search results. We later wrote the algorithm to rank the search results in terms of relativity to the track and pick the highest scorer.After all of that we moved the  progress bar at appropriate intervals which closed the modal upon completion.

6.One of the last parts to our project was the completion of the styling to the Youtube side.We had to display the Users YouTube videos after the ranking, and when the user clicks on the video thumbnails, the video opens for viewing above the other grids of videos. The video that is being viewed changes as user clicks on different thumbnails.

7.The very last part was this, our ReadMe file to expalin all of this to you.
## Future Development

- Make an App for smartphones
- Extend the app to other music services, like Deezer, Pandora, Google Play Music, Sound Cloud, iTunes, SoundHound etc
- Enable the user to download the videos (subject to copyright)
- Enable the user to create new playlists right from our site
- Add a functionality that suggests new artists to the user, according to the user's music taste
- Link the user to the official YouTube channel of his favorite artists - notify when they publish a new video
- Add in options for different types of video responses (like music videos, lyrics videos, etc)
- Add in the ability for users to sign into their youtube account to save their new video playlist

## Credits
TODO:Morgan Sliman 
	 Alex Rivera
	 Windsor Edeling
	 Lakayla Wilhite

]]></content>
  <tabTrigger>readme</tabTrigger>
</snippet>