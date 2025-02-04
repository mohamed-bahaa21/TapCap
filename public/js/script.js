window.onload = init;
var video = document.getElementById('video');
var video_time = document.getElementById('video_time');
var videoContainer = document.getElementById('video_container');
var videoControls = document.getElementById('video_controls');

var trackCC = document.getElementById('cc_container');
var tracks = document.querySelectorAll('track');
var cc_list = document.getElementById('cc_list');
var btnArr = [];

var playbtn = document.getElementById('playbtn');
var reset = document.getElementById('reset');
var mute = document.getElementById('mute');
var fullscreen = document.getElementById('fullscreen');
var in_video_captions = document.getElementById('in_video_captions');
var out_video_captions = document.getElementById('out_video_captions');
var video_duration = document.getElementById('video_duration');

var black_screen = document.getElementById('black_screen');
var delete_modal = document.getElementById('delete_modal');

function init() {
    video.controls = false;
    videoControls.setAttribute('data-state', 'visible');
    video.volume = 1;

    updateTimeFrame(video);
    createButtons(tracks);
    loadAllTracks(tracks);
    enableButtons(tracks);

    showCurrentCC(tracks[0]);
    showCCList(tracks[0]);
    updateSeeker(video);
    showCC(video)
}

var global_currTime;
function updateTimeFrame(video) {
    if (video.duration) {
        // console.log("vid dur: " + video.duration);

        var durationTime = secTOtime(video.duration);
        var currentTime = secTOtime(video.currentTime);

        var timeTxt = timeTOtxt(durationTime, currentTime);

        var durationTxt = timeTxt.durationTxt;
        var currentTxt = timeTxt.currentTxt;


        global_currTime = `${durationTxt} / ${currentTxt}`;
        video_duration.innerHTML = `${durationTxt} / ${currentTxt}`;
    } else {
        durationTxt = `00:00:00`;
        video_duration.innerHTML = durationTxt;
    }
}

function play() {
    if (video.paused) {
        video.play();
    } else {
        video.pause();
    }
}

var isFullScreen = function () {
    return !!(document.fullScreen ||
        document.webkitIsFullScreen ||
        document.mozFullScreen ||
        document.msFullscreenElement ||
        document.fullscreenElement);
}

var handleFullscreen = function () {
    // If fullscreen mode is active...	
    if (isFullScreen()) {
        // ...exit fullscreen mode
        // (Note: this can only be called on document)
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
        else if (document.webkitCancelFullScreen) document.webkitCancelFullScreen();
        else if (document.msExitFullscreen) document.msExitFullscreen();
    }
    else {
        // ...otherwise enter fullscreen mode
        // (Note: can be called on document, but here the specific element is used as it will also ensure that the element's children, e.g. the custom controls, go fullscreen also)
        if (video.requestFullscreen) video.requestFullscreen();
        else if (video.mozRequestFullScreen) video.mozRequestFullScreen();
        else if (video.webkitRequestFullScreen) {
            // Safari 5.1 only allows proper fullscreen on the video element. This also works fine on other WebKit browsers as the following CSS (set in styles.css) hides the default controls that appear again, and 
            // ensures that our custom controls are visible:
            // figure[data-fullscreen=true] video::-webkit-media-controls { display:none !important; }
            // figure[data-fullscreen=true] .controls { z-index:2147483647; }
            video.webkitRequestFullScreen();
        }
        else if (video.msRequestFullscreen) video.msRequestFullscreen();
    }
}

function updateSeeker(video) {
    video.addEventListener('timeupdate', function (e) {
        video_time.value = Math.round(video.currentTime * 1000);
        updateTimeFrame(video);
    })
}

function jumpTo(time) {
    video.currentTime = time;
    vidUpdate();
    // video.play();
}

function loadAllTracks(tracks) {
    for (var i = 0; i < tracks.length; i++) {
        var track = tracks[i];
        if (track.readyState === 2) {
            track.track.mode = "hidden";
        } else {
            track.track.mode = "hidden";
        }
    }
}

function showCC() {
    if (cc_list.className === 'hidden') {
        cc_list.classList.remove('hidden');
        cc_list.classList.add('show');
        out_video_captions.classList.add('active')
    } else {
        cc_list.classList.remove('show');
        cc_list.classList.add('hidden');
        out_video_captions.classList.remove('active')
    }
}


function showCCList(track) {
    var cues = track.track.cues;
    console.log(track.track.cue);
    if (track.track.mode === 'hidden') {
        trackCC.innerHTML = "";
        trackCC.innerHTML += `
            <div id="update_form_btns" style="display:flex; justify-content: space-between; align-items: center;">
                <span style="color: #bbb;">* Double-click on time to set to video's current time</span>
                <button id="update_btn" type="submit" disabled>Update</button>
            </div>
        `;
        for (var i = 0; i < cues.length; i++) {
            highlightCC(cues[i]);
            var cueStartTime = secTOtime(cues[i].startTime);
            var cueEndTime = secTOtime(cues[i].endTime);

            var timeTxt = timeTOtxt(cueStartTime, cueEndTime);
            var cueStartTimeTxt = timeTxt.durationTxt;
            var cueEndTimeTxt = timeTxt.currentTxt;

            // var cueStartTimeTxt = `${(cueStartTime.hoursT !== "00") ?
            //     `${cueStartTime.hoursT}:${cueStartTime.minutesT}:${cueStartTime.secondsT}` :
            //     `${cueStartTime.minutesT}:${cueStartTime.secondsT}`}`

            // var cueEndTimeTxt = `${(cueEndTime.hoursT !== "00") ?
            //     `${cueEndTime.hoursT}:${cueEndTime.minutesT}:${cueEndTime.secondsT}` :
            //     `${cueEndTime.minutesT}:${cueEndTime.secondsT}`}`

            var cueId = cues[i].id;
            var cueTxt = cues[i].text;

            trackCC.innerHTML += `
            <span class="cue_time">
                <input class="time" type="text" name="${cueId}" ondblclick="setInputTimeNow(this)" value="${cueStartTimeTxt}" disabled/> 
                <input class="time" type="text" name="${cueId}" ondblclick="setInputTimeNow(this)" value="${cueEndTimeTxt}" disabled/> 
            </span>
            <div class="cue_container cue_item sleepy_cue">
            <li id='${cueId}'
                class=''
                onclick='jumpTo(${cues[i].startTime});'>
                
                <input class="text" type="text" name="${cueId}" value="${cueTxt}" disabled/>
            </li>

            <button id="delete_btn" type="button" onclick='deleteCC(${cueId});' disabled>
                <i class="fa-solid fa-x cue_delete"></i>
            </button>
            </div>
            `;

        }
    }
}

function setInputTimeNow(input) {
    let newTime = secTOtime(video.currentTime);
    let currentTxt = timeTOtxtWithHours(newTime);
    // let currentTxt = `${newTime.hoursT}:${newTime.minutesT}:${newTime.secondsT}.${newTime.milliSecondsT}`;
    input.value = currentTxt;
}

var deleteCue;
function deleteCC(caption) {
    black_screen.classList.remove('hide');
    delete_modal.classList.remove('hide');
    deleteCue = caption;
}

function closeDeleteModal() {
    black_screen.classList.add('hide');
    delete_modal.classList.add('hide');
}

function getCC() {
    axios.get(`/get-captions`)
        .then(function (response) {
            console.log(response.data);
        })
}

function deleteCC_confirmed() {
    axios.get(`/delete-caption/${deleteCue}`)
        .then(function (response) {
            console.log(response.data.data);

            const index = deleteCue;
            if (index > -1) { // only splice array when item is found
                delete tracks[0].track.cues.getCueById(index); // 2nd parameter means remove one item only
            }

            trackCC.innerHTML = ""
            tracks[0].setAttribute('src', './captions/video.vtt');
            showCCList(tracks[0]);
            closeDeleteModal();
            location.reload();
        })
}

function highlightCC(caption) {
    var li;
    caption.onenter = function (e) {
        li = document.getElementById(this.id);
        li.parentNode.classList.add('active_cue');
        li.parentNode.classList.remove('sleepy_cue');
    }
    caption.onexit = function (e) {
        li.parentNode.classList.add('sleepy_cue');
        li.parentNode.classList.remove('active_cue');
    }
}

function showCurrentCC(track) {
    if (track.track.mode === 'hidden') {
        track.addEventListener('cuechange', function (e) {
            var cue = this.track.activeCues[0];
            if (cue) {
                var cueList = document.querySelectorAll('li');
                cueList.forEach(function (li) {
                    if (li.id === cue.id) {
                        li.scrollIntoView(false);
                    }
                })
            }
        });
    }
}

// Btns Event Listeners ==================================
// Add event listeners for video specific events
video.addEventListener('play', function () {
    changeButtonState('playbtn');
}, false);

video.addEventListener('pause', function () {
    changeButtonState('playbtn');
}, false);

// Add events for all buttons			
playbtn.addEventListener('click', function (e) {
    if (video.paused || video.ended) video.play();
    else video.pause();
});

reset.addEventListener('click', function (e) {
    video.pause();
    video.currentTime = 0;
    vidUpdate();
    // Update the play/pause button's 'data-state' which allows the correct button image to be set via CSS
    changeButtonState('playbtn');
});

mute.addEventListener('click', function (e) {
    video.muted = !video.muted;
    changeButtonState('mute');
});

in_video_captions.addEventListener('click', function (e) {
    if (subtitlesMenu) {
        subtitlesMenu.style.display = (subtitlesMenu.style.display == 'block' ? 'none' : 'block');
        subtitlesMenu.style.display == 'block' ? in_video_captions.classList.add('active') : in_video_captions.classList.remove('active');
    }
});

fullscreen.addEventListener('click', function (e) {
    handleFullscreen();
});

// Creates and returns a menu item for the subtitles language menu
var subtitleMenuButtons = [];
var createMenuItem = function (id, lang, label) {
    var listItem = document.createElement('li');
    var button = listItem.appendChild(document.createElement('button'));

    button.setAttribute('id', id);
    button.classList.add('subtitles-button');

    if (lang.length > 0) button.setAttribute('lang', lang);

    button.value = label;

    button.setAttribute('data-state', 'inactive');
    button.appendChild(document.createTextNode(label));

    button.addEventListener('click', function (e) {
        // Set all buttons to inactive
        subtitleMenuButtons.map(function (v, i, a) {
            subtitleMenuButtons[i].setAttribute('data-state', 'inactive');
        });
        // Find the language to activate
        var lang = this.getAttribute('lang');
        for (var i = 0; i < video.textTracks.length; i++) {
            // For the 'subtitles-off' button, the first condition will never match so all will subtitles be turned off
            if (video.textTracks[i].language == lang) {
                video.textTracks[i].mode = 'showing';
                this.setAttribute('data-state', 'active');
            }
            else {
                video.textTracks[i].mode = 'hidden';
            }
        }
        subtitlesMenu.style.display = 'none';
        subtitlesMenu.style.display == 'block' ? in_video_captions.classList.add('active') : in_video_captions.classList.remove('active');
    });
    subtitleMenuButtons.push(button);

    // if (id == 'subtitles-English') {
    //     video.textTracks[i].mode = 'showing';
    //     subtitleMenuButtons[i].setAttribute('data-state', 'active');
    // }
    return listItem;
}

// === In-video-closed-captions
// create clickable list,  
// clicked mode = "showing" and others modes = "hidden"
var subtitlesMenu;
if (video.textTracks) {
    var subtitlesMenu = document.createElement('ul');
    subtitlesMenu.classList.add('subtitles_menu');

    subtitlesMenu.appendChild(createMenuItem('subtitles-off', '', 'Off'));
    for (var i = 0; i < video.textTracks.length; i++) {
        subtitlesMenu.appendChild(createMenuItem('subtitles-' + video.textTracks[i].language, video.textTracks[i].language, video.textTracks[i].label));
    }
    videoContainer.appendChild(subtitlesMenu);
}

// Helpers ===============================================
function createButtons(tracks) {
    for (var i = 0; i < tracks.length; i++) {
        var track = tracks[i];
        if (track.kind !== 'chapters') {
            button = document.createElement('button');
            button.classList.add('cc_lang');
            button.id = tracks[i].label;
            button.disabled = true;
            button.innerHTML = tracks[i].srclang;
            btnArr.push(button);
            var li = document.createElement('li');
            li.appendChild(button);
            cc_list.appendChild(li);
        }
    }
}

function enableButtons(tracks) {
    for (var i = 0; i < tracks.length; i++) {
        if (tracks[i].track.mode === 'hidden') {
            var track = tracks[i];
            btnArr.forEach(function (btn) {
                btn.disabled = false;
                addEvents(btn, track);
            });
        }
    }
}

function addEvents(b, track) {
    b.addEventListener('click', function (e) {
        if (this.id === track.label) {
            if (track.track.mode === 'disabled') {
                track.track.mode = 'hidden';
            }
            console.log('here');
            showCurrentCC(track);
            showCCList(track);
            // video.play();
        } else if (track.label === 'thumbnails') {
            track.track.mode = 'hidden';
        } else {
            track.track.mode = 'disabled';
        }
        showCC();
    })
}

var changeButtonState = function (type) {
    // Play/Pause button
    if (type == 'playbtn') {
        if (video.paused || video.ended) {
            playbtn.setAttribute('data-state', 'play');
            playbtn.innerHTML = `<i class="fa-solid fa-play"></i>`
        }
        else {
            playbtn.setAttribute('data-state', 'pause');
            playbtn.innerHTML = `<i class="fa-solid fa-pause"></i>`
        }
    }
    // Mute button
    else if (type == 'mute') {
        mute.setAttribute('data-state', video.muted ? 'unmute' : 'mute');
        mute.innerHTML = video.muted ? '<i class="fa-solid fa-volume-xmark"></i>' : '<i class="fa-solid fa-volume-high"></i>'
    }
}

function secTOtime(base) {
    // console.log(base);

    const millieSeconds = String(base.toFixed(3)).split('.')[1];
    const seconds = Math.floor((base) % 60);
    const minutes = Math.floor((base / 60) % 60);
    const hours = Math.floor(base / 3600);

    const milliSecondsT = millieSeconds.padStart(3, "0");
    const secondsT = `${seconds}`.padStart(2, "0");
    const minutesT = `${minutes}`.padStart(2, "0");
    const hoursT = `${hours}`.padStart(2, "0");

    return {
        milliSecondsT,
        secondsT,
        minutesT,
        hoursT
    }
}
function timeTOtxtWithHours(currentTime) {
    let currentTxt;
    if (currentTime.hoursT == "00") {
        currentTxt = `${currentTime.minutesT}:${currentTime.secondsT}.${currentTime.milliSecondsT}`;
    } else {
        currentTxt = `${currentTime.hoursT}:${currentTime.minutesT}:${currentTime.secondsT}.${currentTime.milliSecondsT}`;
    }

    return currentTxt;
}

function timeTOtxt(durationTime, currentTime) {
    let durationTxt, currentTxt;
    if (durationTime.hoursT == "00") {
        durationTxt = `${durationTime.minutesT}:${durationTime.secondsT}.${durationTime.milliSecondsT}`;
        currentTxt = `${currentTime.minutesT}:${currentTime.secondsT}.${currentTime.milliSecondsT}`;
    } else {
        durationTxt = `${durationTime.hoursT}:${durationTime.minutesT}:${durationTime.secondsT}.${durationTime.milliSecondsT}`;
        currentTxt = `${currentTime.hoursT}:${currentTime.minutesT}:${currentTime.secondsT}.${currentTime.milliSecondsT}`;
    }

    return {
        durationTxt, currentTxt
    }
}