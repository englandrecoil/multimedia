const images = ["images/GodIsKanyeWest.png", "images/InMyFeelingsDrake.jpeg", 
                "images/HooBanginWestside.jpeg", "images/BadHabit.jpg", "images/ShouldBeDancing.jpg"]; 
const captions = ["Kanye West - God Is", "Drake - In My Feelings", 
                  "Westside Connection - Hoo Bangin", "Steve Lacy - Bad Habit", "Bee Gees - You Should Be Dancing"]; 
const audioFiles = ["audio/InMyFeelings.mp3", "audio/GodIs.mp3", 
                    "audio/HooBangin.mp3", "audio/BadHabit.mp3", "audio/ShouldBeDancing.mp3"];

const imageElement = document.getElementById('gallery-image');
const captionElement = document.getElementById('image-caption');
const timingInput = document.getElementById('timing');
const soundtracksSelect = document.getElementById('soundtracks');
const autoPlay = document.getElementById('autoplay-checkbox');
const playButton = document.getElementById('play-btn');
const volumeSlider = document.getElementById('volume-slider');
const toggleSoundButton = document.getElementById('toggle-sound');
const audioElement = document.getElementById('audio');
const progressBar = document.getElementById('progress-bar');
const timeLeft = document.getElementById('time-left');
const changeTimingButton = document.getElementById('change-timing');
const container = document.getElementById("container");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const audioCtx = new AudioContext();
const volume = audioCtx.createGain();

let currentIndex = 4;
let slideshowInterval;
let isPlaying = false;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let audioSource = null;
let analyser = null;
audioSource = audioCtx.createMediaElementSource(audioElement);


window.onload = () => {
    showImage(currentIndex);
    volume.gain.value = 0.2;

};

// AUDIO
function playAudio(index) {
    audioElement.src = audioFiles[index];
    audioElement.play();
    audioSource.connect(volume);
    analyser = audioCtx.createAnalyser();
    volume.connect(analyser);
    analyser.connect(audioCtx.destination);

    analyser.fftSize = 256 ; // сколько data point будем получать из нашей песни(чем выше значение - больше данных,
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const barWidth = canvas.width / bufferLength; // ширина каждой колонки

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        analyser.getByteFrequencyData(dataArray);
        drawVisualizer({ bufferLength, dataArray, barWidth });
        requestAnimationFrame(animate);
      }

      const drawVisualizer = ({ bufferLength, dataArray, barWidth }) => {
        for (let i = 0; i < bufferLength; i++) {
            const barHeight = dataArray[i] * 2;
            const x = (canvas.width / 2) - (barWidth / 2);
            const y = canvas.height - barHeight;
            ctx.fillStyle = '#FFDB8B';
            ctx.fillRect(x - (i * barWidth), y, barWidth, barHeight);
            ctx.fillRect(x + ((i + 1) * barWidth), y, barWidth, barHeight);
        }
    };

    animate();
}

function pauseAudio() {
    audioElement.pause();
}

function toggleAudio() {
    if (audioElement.paused) {
        playAudio(currentIndex);
    } else {
        pauseAudio();
    }
}

// PROGRESS BAR
function updateProgressBar() {
    const currentTime = audioElement.currentTime;
    const duration = audioElement.duration;
    const progress = (currentTime / duration) * 100;
    progressBar.value = progress;

    const minutesLeft = Math.floor((duration - currentTime) / 60);
    const secondsLeft = Math.floor((duration - currentTime) % 60);
    timeLeft.textContent = `-${minutesLeft}:${secondsLeft < 10 ? '0' : ''}${secondsLeft}`;
}

progressBar.addEventListener('click', (event) => {
    const clickedX = event.offsetX;
    const width = progressBar.offsetWidth;
    const percent = (clickedX / width);
    const duration = audioElement.duration;
    const newTime = percent * duration;

    audioElement.currentTime = newTime;
});

audioElement.addEventListener('timeupdate', updateProgressBar);


// SLIDE-SHOW
function showImage(index) {
    imageElement.src = images[index];
    captionElement.textContent = captions[index];
}

function playSlideshow() {
    slideshowInterval = setInterval(() => {
        currentIndex = (currentIndex + 1) % images.length;
        showImage(currentIndex);
    }, timingInput.value * 1000);
    isPlaying = true;
    playButton.innerHTML = '<i class="fa-solid fa-pause"></i>';
}

function pauseSlideshow() {
    clearInterval(slideshowInterval);
    isPlaying = false;
    playButton.innerHTML ='<i class="fa-solid fa-play"></i>';
}

function toggleSlideshow() {
    if (isPlaying) {
        pauseSlideshow();
        pauseAudio();
    } else {
        playSlideshow();
        playAudio(currentIndex);
    }
}

audioElement.addEventListener('ended', () => {
    currentIndex = (currentIndex + 1) % images.length;
    playAudio(currentIndex);
});

changeTimingButton.addEventListener('click', () => {
    clearInterval(slideshowInterval); 
    timingInputChanged = true; 
    playSlideshow();
});

// VOLUME
toggleSoundButton.addEventListener('click', function() {
    volumeSlider.style.display = volumeSlider.style.display === 'block' ? 'none' : 'block';
});

volumeSlider.addEventListener('input', function() {
    const newVolume = parseFloat(this.value);
    volume.gain.value = newVolume;
    console.log("Volume changed:", volume.gain.value);
    if (volume.gain.volume == 0) {

    }
});


// BUTTONS 
document.getElementById('prev-btn').addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    showImage(currentIndex);
});

document.getElementById('next-btn').addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % images.length;
    showImage(currentIndex);
});

document.getElementById('prev-btn-music').addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + audioFiles.length) % audioFiles.length;
    playAudio(currentIndex);
});

document.getElementById('next-btn-music').addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % audioFiles.length;
    playAudio(currentIndex);
});

document.getElementById('play-btn').addEventListener('click', toggleSlideshow);
