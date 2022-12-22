/**
 * Query hp-stats-api for holoports that are on-line within last 1 day
 *
 * @returns {Array<Holoport>} list of holoports
 */
async function getData() {
  const availableHoloportsResponse = await fetch('https://network-statistics.holo.host/hosts/list-available?days=1');
  let availableHoloportsDetails = await availableHoloportsResponse.json()

  // API returns entries from last 24h, while we want only last 60 min
  const cutoffTimestamp = parseInt(Date.now()/1000) - 3600;
  return availableHoloportsDetails.filter(el => el.timestamp >= cutoffTimestamp);
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
 * Connect with holoports over HTTP protocol. Report success / failure.
 *
 * @param {Array<Holoport>} hps Array of holoports to query
 * @param {Object} report Object containing success / failure statistics
 * @returns {Object} report
 */
async function queryHoloports(hps, report) {
  // convert array to promise
  hps = hps.map(hp => fetch(`https://${formatUrl(hp)}`)); // TODO: adjust timeout
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

  let i = 0;
  const chunk = 100; // Number of Holoports contacted async simultaneously

  while (data.length > 0) {
    addText(resultWindow, `Checking ${i*chunk}..${Math.min((i+1)*chunk, allHoloports)} of ${allHoloports}`);
    report = await queryHoloports(data.splice(-chunk, chunk), report);
    i++;
  }

  // Print final report
  addText(resultWindow, "&#128640;");
  addText(resultWindow, `Successfully connected to ${report.httpSuccess} holoports`);
  addText(resultWindow, `Failed to connect to ${report.httpError} holoports`);
  console.log(report)
}

document.querySelector("#test-button").onclick=async () => {
  await startTest();
}
