/**
 * Query hp-stats-api for holoports that are on-line within last 1 day
 *
 * @returns {list} list of holoports
 */

async function getData() {
  const availableHoloportsResponse = await fetch('https://network-statistics.holo.host/hosts/list-available?days=1');
  let availableHoloportsDetails = await availableHoloportsResponse.json()
  return availableHoloportsDetails;
}

/**
 * Append DOM element of type type with text at the end of selector
 *
 * @param {DOM} selector
 * @param {sting} text
 * @param {string} type of DOM element
 * @returns {DOM} newly inserted DOM element
 */
function addText(selector, text, type = "div") {
  let span = document.createElement(type);
  span.innerHTML = text;
  selector.appendChild(span);
  return span;
}

/**
 * Based on the holo network that holoport is on format holoport's URL
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

// TODO: this should return a promise so that allSettled can actually can in batches

/**
 *
 *
 * @param {*} resultWindow DOM element fot appending results
 * @param {Array} hps Array of holoports to query
 * @returns null
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

  addText(resultWindow, `${allHoloports} HoloPorts reported online within last 60 minutes`);
  addText(resultWindow, "&#128640;");

  let i = 1;
  const chunk = 100; // Number of Holoports contacted async simultaneously

  while (data.length > 0) {
    addText(resultWindow, `Checking ${Math.min(i*chunk, allHoloports)} of ${allHoloports}`);
    report = await queryHoloports(data.splice(-chunk, chunk), report);
    i++;
  }

  // Print final report
  addText(resultWindow, `Successfully connected to ${report.httpSuccess} holoports`);
  addText(resultWindow, `Failed to connect to ${report.httpError} holoports`);
  console.log(report)
}

document.querySelector("#test-button").onclick=async () => {
  await startTest();
}
