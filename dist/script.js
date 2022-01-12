let stream = null,
  audio = null,
  mixedStream = null,
  recorder = null,
  startBtn = null,
  stopBtn = null,
  downloadBtn = null,
  recordedVideo = null,
  chunks = [];

async function setupStream() {
  try {
    stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true,
    });

    audio = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    setupVideoFeedback();
  } catch (err) {
    console.log(err);
  }
}

function setupVideoFeedback() {
  if (stream) {
    const video = document.querySelector(".recording-video");
    video.srcObject = stream;
    video.play();
  } else {
    console.log("No stream available");
  }
}

async function startRecording() {
  await setupStream();
  if (stream && audio) {
    mixedStream = new MediaStream([
      ...stream.getTracks(),
      ...audio.getTracks(),
    ]);
    recorder = new MediaRecorder(mixedStream);
    recorder.ondataavailable = handleData;
    recorder.onstop = handleStop;
    recorder.start(200);
    startBtn.disabled = true;
    stopBtn.disabled = false;
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
  startBtn.disabled = false;
  stopBtn.disabled = true;
  console.log("Recording stopped...");
  console.log(chunks);
}

function handleStop(e) {
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

  startBtn.addEventListener("click", startRecording);
  stopBtn.addEventListener("click", stopRecording);
});
