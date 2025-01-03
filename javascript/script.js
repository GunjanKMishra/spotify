console.log('lets write javascript');
let currentSong = new Audio();
let songs;
let currFolder;
// Define the media query
const mediaQuery = window.matchMedia("(max-width: 1400px)"); // Media query definition
const hamburger = document.querySelector(".hamburger"); // Cached DOM reference
const sidebar = document.querySelector(".left"); // Cached DOM reference for sidebar

// Function to toggle the sidebar visibility
function toggleMenu() {
  if (sidebar.style.left === "0px") {
    // Sidebar is open, reset to off-screen position
    sidebar.style.left = "-130%";
  } else {
    // Sidebar is closed, bring it into view
    sidebar.style.left = "0";
  }
}

// Function to handle media query changes
function handleMediaQueryChange(e) {
  if (e.matches) {
    // Add event listener if media query matches
    hamburger.addEventListener("click", toggleMenu);
  } else {
    // Remove event listener if media query does not match
    hamburger.removeEventListener("click", toggleMenu);

    // Reset sidebar to its default position when media query doesn't match

  }
}

function convertSecondsToTime(seconds) {
  // Calculate minutes and remaining seconds
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  // Format minutes and seconds to always be two digits
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(remainingSeconds).padStart(2, '0');

  // Return the formatted time
  return `${formattedMinutes}:${formattedSeconds}`;
}



async function getSongs(folder) {
  currFolder = folder;
  let a = await fetch(`/${folder}/`)
  let response = await a.text();

  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a")
  songs = []
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1])
    }
  }

  let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0]
  songUL.innerHTML = ""
  //show all songs in playlist
  for (const song of songs) {
    songUL.innerHTML = songUL.innerHTML + `<li>
      <img class="invert" src="images/music.svg" alt="">
      <div class="info">
        <div>${song.replaceAll("%20", " ")}</div>
        <div>Aditya choubey</div>
      </div>
      <div class="playnow">
        <span>Play Now</span>
      <img  class="invert" src="images/play.svg" alt="">
    </div></li>`;

  }
  return songs;
}

const playMusic = (track, pause = false) => {
  // let audio = new Audio("/songs/" + track);
  currentSong.src = `/${currFolder}/` + track
  if (!pause) {
    currentSong.play();
    play.src = "images/pause.svg";
  }


  document.querySelector(".songinfo").innerHTML = decodeURI(track)
  document.querySelector(".songtime").innerHTML = "00:00/00:00"
}


async function displayAlbums() {
  let a = await fetch("/songs/")
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;

  let anchors = div.getElementsByTagName("a");
  let cardcontainer = document.querySelector(".cardcontainer")
  let array = Array.from(anchors)
  for (let index = 0;
    index < array.length; index++) {
    const e = array[index];

    if (e.href.includes("/songs")) {
      let folder = e.href.split("/").slice(-2)[0]
      //get the metadata of the folder
      let a = await fetch(`/songs/${folder}/info.json`)
      let response = await a.json();

      cardcontainer.innerHTML = cardcontainer.innerHTML + `  <div data-folder="${folder}"  class="card ">
               <div  class="play">
                 <svg data-encore-id="icon" role="img" aria-hidden="true" viewBox="0 0 24 24"
                   style="fill: black; width: 100%; height: 100%;">
                   <path
                     d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z">
                   </path>
                 </svg>
               </div>
               <img src="/songs/${folder}/cover.jpg" alt="">
               <h2>${response.title}</h2>
               <p>${response.description}</p>
             </div>`
    }
  }
  //load the playlist whenever card is clicked
  Array.from(document.getElementsByClassName("card")).forEach(e => {
    e.addEventListener("click", async item => {
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
      playMusic(songs[0]);

    })
  })

}






async function main() {


  // get the list of all songs
  await getSongs("songs/playlist1");
  playMusic(songs[0], true);

  // display all container on page
  displayAlbums()

  // attach an event listener to each song
  Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
    e.addEventListener("click", element => {

      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());

    })

  })

  //attach event listener to play next and previous
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "images/pause.svg"
    }
    else {
      currentSong.pause();
      play.src = "images/play.svg"
    }
  })

  // listen for timeupdate event 



  currentSong.addEventListener("timeupdate", () => {

    // console.log(currentSong.duration,currentSong.currentTime)


    document.querySelector(".songtime").innerHTML = `${convertSecondsToTime(currentSong.currentTime)} / ${convertSecondsToTime(currentSong.duration)}`
    document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";

  })
  // add an event listener to seekbar
  document.querySelector(".seekbar").addEventListener("click", e => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = ((currentSong.duration) * percent) / 100

  })
  //add an event listener for hamburger

  // Initial check
  handleMediaQueryChange(mediaQuery);

  // Listen for media query changes
  mediaQuery.addEventListener("change", handleMediaQueryChange);




  // add an event listener to previous and next
  previous.addEventListener("click", () => {
    currentSong.pause();
    console.log("Previous clicked")
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
    if ((index - 1) >= 0) {
      playMusic(songs[index - 1])
    }
  })


  next.addEventListener("click", () => {
    currentSong.pause();
    console.log("next clicked")
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
    if ((index + 1) < songs.length) {
      playMusic(songs[index + 1])
    }
  })
  //add an event to volume
  document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
    currentSong.volume = parseInt(e.target.value) / 100
    if (currentSong.volume > 0) {
      document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg");
    }

  })
  // add event listener to mute the track
  document.querySelector(".volume>img").addEventListener("click", e => {
    if (e.target.src.includes("volume.svg")) {
      e.target.src = e.target.src.replace("volume.svg", "mute.svg")
      currentSong.volume = 0;
      document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
    }
    else {
      e.target.src = e.target.src.replace("mute.svg", "volume.svg");
      currentSong.volume = .10;
      document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
    }
  })

}
main()