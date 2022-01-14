let stream = null,
  audio = null,
  video = null,
  facecam = document.querySelector(".facecam"),
  mixedStream = null,
  videoStream = null,
  recorder = null,
  startBtn = null,
  stopBtn = null,
  downloadBtn = null,
  recordedVideo = null,
  setting = null,
  echoCheck = document.getElementById("echoCheck"),
  noiseCheck = document.getElementById("noiseCheck"),
  muteCheck = document.getElementById("muteCheck"),
  camCheck = document.getElementById("camCheck"),
  campip = document.querySelector(".campip"),
  pip = null,
  chunks = [];

async function setupStream() {
  try {
    stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true,
    });

    audio = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: echoCheck.checked,
        noiseSuppression: noiseCheck.checked,
        sampleSize: 16,
        channelCount: 2,
        sampleRate: 44100,
      },
      video: camCheck.checked,
    });
    setupVideoFeedback();
  } catch (err) {
    console.log(err);
  }
}

function reqCamera() {
  facecam.requestPictureInPicture();
}

function setupVideoFeedback() {
  camCheck = document.getElementById("camCheck");
  if (stream) {
    video = document.querySelector(".recording-video");
    video.srcObject = stream;
    video.play();
    facecam.srcObject = audio;
    facecam.play();
  } else {
    console.log("No stream available");
  }
}

async function startRecording() {
  await setupStream();
  if (stream && audio) {
    echoCheck = document.getElementById("echoCheck");
    noiseCheck = document.getElementById("noiseCheck");
    muteCheck = document.getElementById("muteCheck");
    camCheck = document.getElementById("camCheck");
    videoStream = new MediaStream([...stream.getTracks()]);
    mixedStream = new MediaStream([
      ...stream.getTracks(),
      ...audio.getTracks(),
    ]);
    if (muteCheck.checked) {
      recorder = new MediaRecorder(videoStream);
    } else {
      recorder = new MediaRecorder(mixedStream);
    }
    recorder.ondataavailable = handleData;
    recorder.onstop = handleStop;
    recorder.start(200);
    startBtn.disabled = true;
    setting.disabled = true;
    stopBtn.disabled = false;
    if (camCheck.checked) {
      pip.disabled = true;
      facecam.onloadeddata = () => {
        campip.click();
      };
    } else pip.disabled = false;
    console.log("Recording started!");
  } else {
    console.log("No stream..");
  }
}

function handleData(e) {
  chunks.push(e.data);
}

function stopRecording() {
  recorder.stop();
  video = null;
  startBtn.disabled = false;
  setting.disabled = false;
  stopBtn.disabled = true;
  pip.disabled = true;
  console.log("Recording stopped...");
  console.log(chunks);
}

function handleStop(e) {
  if (document.pictureInPictureElement) {
    document.exitPictureInPicture();
  }
  const blob = new Blob(chunks, {
    type: "video/mp4",
  });
  chunks = [];
  downloadBtn.href = URL.createObjectURL(blob);
  downloadBtn.download = "video.mp4";
  downloadBtn.disabled = false;
  recordedVideo.src = URL.createObjectURL(blob);
  recordedVideo.onloadeddata = () => {
    recordedVideo.play();
    const rc = document.querySelector(".recorded-part");
    rc.classList.remove("hidden");
    rc.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  stream.getTracks().forEach((track) => {
    track.stop();
  });
  audio.getTracks().forEach((track) => {
    track.stop();
  });
  console.log("recording done!");
}

window.addEventListener("load", () => {
  startBtn = document.querySelector(".start");
  stopBtn = document.querySelector(".stop");
  downloadBtn = document.querySelector(".download");
  recordedVideo = document.querySelector(".recorded-video");
  echoCheck = document.getElementById("echoCheck");
  noiseCheck = document.getElementById("noiseCheck");
  muteCheck = document.getElementById("muteCheck");
  camCheck = document.getElementById("camCheck");
  facecam = document.querySelector(".facecam");
  setting = document.getElementById("settings");
  pip = document.querySelector(".pip");

  startBtn.addEventListener("click", startRecording);
  stopBtn.addEventListener("click", stopRecording);
  pip.addEventListener("click", () => {
    if (document.pictureInPictureElement) {
      // document.exitPictureInPicture();
      alert("Please close the current running PiP first!");
    } else {
      if (video != null && document.pictureInPictureEnabled) {
        video.requestPictureInPicture();
      }
    }
  });
});
