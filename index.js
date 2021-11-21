const express = require("express");
const mediasoup = require("mediasoup");
const cors = require("cors");
const config = require("./config");

const app = express();
app.use(cors({origin: true})); // Allowing Cross-Origin Requests

app.get("/router", async (req, res) => {
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

app.get("/createTransport", async (req, res) => {
  try {
    let { participantId, direction } = req.body;

    let transport = await createWebRtcTransport({ participantId, direction });
    roomState.transports[transport.id] = transport;

    let { id, iceParameters, iceCandidates, dtlsParameters } = transport;
    res.send({
      transportOptions: { id, iceParameters, iceCandidates, dtlsParameters }
    });
  } catch (e) {
    res.send({error: e});
  }
});

async function createWebRtcTransport({ participantId, direction }) {
  const {
    listenIps,
    initialAvailableOutgoingBitrate
  } = config.mediasoup.webRtcTransport;

  const transport = await router.createWebRtcTransport({
    listenIps: listenIps,
    enableUdp: true,
    enableTcp: true,
    preferUdp: true,
    initialAvailableOutgoingBitrate: initialAvailableOutgoingBitrate,
    appData: { participantId, clientDirection: direction }
  });

  return transport;
}

app.listen(5000,'127.0.0.1', () => {
  console.log(`Example app listening`)
})
