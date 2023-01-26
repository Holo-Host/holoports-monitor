/**
 * Query hp-stats-api for holoports that are on-line within last 60 min
 *
 * @returns {Array<Holoport>} list of holoports
 */
async function getData() {
  const availableHoloportsResponse = await fetch('https://network-statistics.holo.host/hosts/list-available?days=1');
  let availableHoloportsDetails = await availableHoloportsResponse.json()

  // const cutoffTimestamp = parseInt(Date.now()/1000) - 3600; // API returns entries from last 24h, while we want only last 60 min
  // Return only holoports without errors
  return availableHoloportsDetails.filter(el => el.errors.length === 0);
}

/**
 * Append DOM element of type type with text at the end of selector
 *
 * @param {Node} selector
 * @param {String} text
 * @param {String} type of DOM element
 * @returns {Node} newly inserted DOM element
 */
function addText(selector, text, type = "div") {
  let span = document.createElement(type);
  span.innerHTML = text;
  selector.appendChild(span);
  return span;
}

/**
 * Format holoport's URL based on network flavour
 *
 * @param {Obj} hp
 * @returns {string} holoport URL
 */
function formatUrl(hp) {
  if (hp.holoNetwork === "devNet") {
    return `${hp.holoportId}.holohost.dev`
  } else {
    return `${hp.holoportId}.holohost.net`
  }
}

/**
 *
 * @param {Object} hp
 * @returns {Promise} resolves on successful wss connection, rejects on error
 */
async function openWss(hp) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`wss://${formatUrl(hp)}/hosting/`, parseInt(Math.random()*100000));
    ws.onopen = function() {
      ws.close();
      resolve();
    };
    ws.onerror = function() {
      ws.close();
      reject();
    }
  });
}

/**
 * Connect to holoports over HTTP protocol. Report success / failure.
 *
 * @param {Array<Holoport>} hps Array of holoports to query
 * @param {Object} report Object containing success / failure statistics
 * @returns {Object} report
 */
async function httpToHoloports(hps, report) {
  // convert array to promise
  hps = hps.map(hp => fetch(`https://${formatUrl(hp)}`)); // TODO: adjust timeout?
  let result = await Promise.allSettled(hps);

  // Analyze result
  return {
    httpSuccess: report.httpSuccess + result.reduce((tot, el) => {
      if (el.status === "fulfilled" && el.value.ok) tot++;
      return tot;
    }, 0),
    wssSuccess: report.wssSuccess,
    httpError: report.httpError + result.reduce((tot, el) => {
      if (el.status === "rejected" || (el.status === "fulfilled" && !el.value.ok)) tot++;
      return tot;
    }, 0),
    wssError: report.wssError,
    httpFailures: [],
    wssFailures: []
  }
}

/**
 * Connect to holoports over wss protocol. Report success / failure.
 *
 * @param {Array<Holoport>} hps Array of holoports to query
 * @param {Object} report Object containing success / failure statistics
 * @returns {Object} report
 */
 async function wssToHoloports(hps, report) {
  // convert array to promise
  hps = hps.map(hp => openWss(hp));
  let result = await Promise.allSettled(hps);

  // Analyze result
  return {
    httpSuccess: report.httpSuccess,
    wssSuccess: report.wssSuccess + result.reduce((tot, el) => {
      if (el.status === "fulfilled") tot++;
      return tot;
    }, 0),
    httpError: report.httpError,
    wssError: report.wssError + result.reduce((tot, el) => {
      if (el.status === "rejected") tot++;
      return tot;
    }, 0),
    httpFailures: [],
    wssFailures: []
  }
}

/**
 * Execute test
 */
async function startTest() {
  let resultWindow = document.querySelector('#test-results');
  let report = {
    httpSuccess: 0,
    wssSuccess: 0,
    httpError: 0,
    wssError: 0,
    httpFailures: [],
    wssFailures: []
  };

  let data = await getData();
  let allHoloports = data.length;

  addText(resultWindow, `${allHoloports} HoloPorts reported to be online within last 60 minutes`);
  addText(resultWindow, "&#128640;");

  // Number of Holoports contacted async simultaneously
  // Here is the catch. We would love to send all the requests at the same time and just wait for the results.
  // BUT we cannot do that. For some reason wss connections, even though initiated asynchronously are, will complete
  // connection handshake on-at-the time. So if there's a long waiting line those at the end of line will timeout
  // before the connection is even attempted.
  // Seems that 10 is the right number for here for wss connections.
  const chunk = 10;
  let i = 0;

  while (data.length > 0) {
    addText(resultWindow, `Checking ${i*chunk}..${Math.min((i+1)*chunk, allHoloports)} of ${allHoloports}`);
    const hpsChunk = data.splice(-chunk, chunk);
    report = await httpToHoloports(hpsChunk, report);
    report = await wssToHoloports(hpsChunk, report);
    i++;
  }

  // Print final report
  addText(resultWindow, "&#128640;");
  addText(resultWindow, `Successfully connected via HTTP to ${report.httpSuccess} holoports`);
  addText(resultWindow, `Failed to connect via HTTP to ${report.httpError} holoports`);
  addText(resultWindow, `Successfully opened wss connection with ${report.wssSuccess} holoports`);
  addText(resultWindow, `Failed to open wss connection with ${report.wssError} holoports`);
  console.log(report)
}

document.querySelector("#test-button").onclick=async () => {
  await startTest();
}
