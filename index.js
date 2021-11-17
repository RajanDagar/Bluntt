const express = require("express");
const mediasoup = require("mediasoup");
const cors = require("cors");
const config = require("./config");
const port = 3000;

const app = express();
app.use(cors({origin: true})); // Allowing Cross-Origin Requests

app.get("/Router", async (req, res) => {
  try {
    const worker = await mediasoup.createWorker({
      logLevel: config.mediasoup.worker.logLevel,
      logTags: config.mediasoup.worker.logTags,
      rtcMinPort: config.mediasoup.worker.rtcMinPort,
      rtcMaxPort: config.mediasoup.worker.rtcMaxPort,
    });

    worker.on("died", () => {
      console.error("mediasoup worker died (this should never happen)");
      process.exit(1);
    });

    const mediaCodecs = config.mediasoup.router.mediaCodecs;
    const router = await worker.createRouter({mediaCodecs});

    res.send({routerRtpCapabilities: router.rtpCapabilities});
  } catch (e) {
    res.send({error: e});
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
