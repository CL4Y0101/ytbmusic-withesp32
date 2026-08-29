console.log("[YTM ESP32] CONTENT V3 ACTIVE");

// ========================================
// GET MEDIA ELEMENT
// ========================================

function getMedia() {
  const videos = document.querySelectorAll("video");

  for (const video of videos) {
    if (
      video.duration > 0 ||
      video.currentTime > 0
    ) {
      return video;
    }
  }

  return (
    document.querySelector("video") ||
    document.querySelector("audio")
  );
}

// ========================================
// GET TITLE
// ========================================

function getTitle() {
  const selectors = [
    "ytmusic-player-bar .title",
    "ytmusic-player-bar yt-formatted-string.title",
    "ytmusic-player-bar .middle-controls .title",
    "#player-bar-background .title"
  ];

  for (const selector of selectors) {
    const element =
      document.querySelector(selector);

    if (!element) {
      continue;
    }

    const text =
      element.textContent?.trim();

    if (text) {
      return text;
    }
  }

  return "";
}

// ========================================
// GET ARTIST
// ========================================

function getArtist() {
  const selectors = [
    "ytmusic-player-bar .byline",
    "ytmusic-player-bar yt-formatted-string.byline",
    "ytmusic-player-bar .subtitle"
  ];

  for (const selector of selectors) {
    const element =
      document.querySelector(selector);

    if (!element) {
      continue;
    }

    // Biasanya link pertama = artist
    const firstLink =
      element.querySelector("a");

    if (firstLink) {
      const artist =
        firstLink.textContent?.trim();

      if (artist) {
        return artist;
      }
    }

    let text =
      element.textContent?.trim();

    if (!text) {
      continue;
    }

    // Contoh:
    // One Direction • FOUR • 2014

    text =
      text.split("•")[0].trim();

    if (text) {
      return text;
    }
  }

  return "";
}

// ========================================
// DEBUG
// ========================================

let debugCounter = 0;

// Supaya log tidak terlalu spam
let lastTitle = "";
let lastArtist = "";
let lastPaused = null;

// ========================================
// MAIN UPDATE
// ========================================

function updateNowPlaying() {
  const media =
    getMedia();

  const title =
    getTitle();

  const artist =
    getArtist();

  debugCounter++;

  // ======================================
  // DEBUG SETIAP 2 DETIK
  // ======================================

  if (debugCounter >= 4) {
    debugCounter = 0;

    console.log(
      "[YTM DEBUG]",
      {
        mediaFound: !!media,
        title: title,
        artist: artist,
        currentTime:
          media?.currentTime ?? 0,
        duration:
          media?.duration ?? 0,
        paused:
          media?.paused ?? true
      }
    );
  }

  // ======================================
  // MEDIA BELUM READY
  // ======================================

  if (!media) {
    return;
  }

  if (!title) {
    return;
  }

  // ======================================
  // PREPARE DATA
  // ======================================

  const data = {
    title: title,

    artist: artist,

    // ESP32 menggunakan millisecond
    position: Math.round(
      media.currentTime * 1000
    ),

    duration: Number.isFinite(
      media.duration
    )
      ? Math.round(
          media.duration * 1000
        )
      : 0,

    paused: media.paused
  };

  // ======================================
  // LOG SAAT STATUS BERUBAH
  // ======================================

  if (
    title !== lastTitle ||
    artist !== lastArtist ||
    media.paused !== lastPaused
  ) {
    console.log(
      "[YTM ESP32] NOW PLAYING:",
      data
    );

    lastTitle = title;
    lastArtist = artist;
    lastPaused = media.paused;
  }

  // ======================================
  // SEND TO BACKGROUND
  // ======================================

  try {
    chrome.runtime.sendMessage({
      type: "NOW_PLAYING",
      data: data
    });

  } catch (error) {
    console.error(
      "[YTM ESP32] Send failed:",
      error
    );
  }
}

// ========================================
// START REALTIME SYNC
// ========================================

// 500 ms = 2x update / detik
setInterval(
  updateNowPlaying,
  500
);

console.log(
  "[YTM ESP32] Realtime sync started"
);