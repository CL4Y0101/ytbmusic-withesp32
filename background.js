const ESP32_URL =
  "http://192.168.1.79/nowplaying";

console.log(
  "[YTM ESP32] background ACTIVE"
);

chrome.runtime.onMessage.addListener(
  (message) => {

    if (
      message.type !== "NOW_PLAYING"
    ) {
      return;
    }

    console.log(
      "[YTM ESP32] Received:",
      message.data
    );

    fetch(
      ESP32_URL,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json"
        },

        body: JSON.stringify(
          message.data
        )
      }
    )

    .then(async response => {

      const text =
        await response.text();

      console.log(
        "[YTM ESP32] ESP32 response:",
        response.status,
        text
      );

    })

    .catch(error => {

      console.error(
        "[YTM ESP32] ESP32 ERROR:",
        error
      );

    });
  }
);