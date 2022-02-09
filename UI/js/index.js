async function getData() {
  const availableHoloportsResponse = await fetch('https://network-statistics.holo.host/hosts/list_available?days=7');
  let availableHoloportsDetails = await availableHoloportsResponse.json()
  
  const registeredHoloportsResponse = await fetch('https://network-statistics.holo.host/hosts/registered?days=7');
  let registeredHoloportsList = await registeredHoloportsResponse.json()
  
  const availableHoloportsList = availableHoloportsDetails.map(hp => hp._id)
  const missingHoloports = registeredHoloportsList.filter(hp => !availableHoloportsList.includes(hp))

  for (const holoport of missingHoloports) {
    const entry = {
      _id: holoport,
      IP: null,
      timestamp: 0,
      sshSuccess: false,
      holoNetwork: null,
      channel: null,
      hostingInfo: null,
      holoportModel: null,
      error: null,
    }

    availableHoloportsDetails.push(entry)
  }

  return availableHoloportsDetails;
}

function timeSince(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  let interval = seconds / 31536000;

  if (interval > 1) {
    return Math.floor(interval) + " years";
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + " months";
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + " days";
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + " hours";
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + " minutes";
  }
  return Math.floor(seconds) + " seconds";
}

function getSourceChains(hostingInfo) {
  let result = null;
  try {
    let obj = JSON.parse(hostingInfo);
    if ( obj && obj.totalSourceChains !== undefined ) {
      result = obj.totalSourceChains;
    }
  } catch (e) {
    console.log(e);
  }
  return result;
}

function printRow(hp) {
  let output = `<tr>`;
  hp.timestamp = timeSince(hp.timestamp) + ` ago`;
  hp.totalSourceChains = getSourceChains(hp.hostingInfo);

  let successCheck;
  if (hp.sshSuccess) {
    successCheck = `<div class="success">&#x2714</div>`;
  } else {
    successCheck = `<div class="warning">&#9888</div>`;
  }

  for (const key in hp) {
    hp[key] = (hp[key]===null)?"-":hp[key];
  }

  output += `
    <td class="too-long" title="${hp._id}">${hp._id}</td>
    <td>${hp.IP}</td>
    <td>${hp.timestamp}</td>
    <td title="${hp.error}">${successCheck}</td>
    <td>${hp.holoNetwork}</td>
    <td>${hp.channel}</td>
    <td title="${hp.holoportModel}">${hp.holoportModel}</td>
    <td title="${hp.totalSourceChains}">${hp.totalSourceChains}</td>
    <td>${(hp.alphaProgram===undefined)?"?":hp.alphaProgram}</td>
    <td>${(hp.assignedTo===undefined)?"?":hp.assignedTo}</td>
  `;
  output += `</tr>`;
  return output;
}

function buildTable(hps) {
  let innerHtml = `
    <thead>
      <tr>
          <th>Name</th>
          <th>Zerotier IP</th>
          <th>Timestamp</th>
          <th>Ssh Success</th>
          <th>Holo Network</th>
          <th>Channel</th>
          <th>Model</th>
          <th>Total Source Chains</th>
          <th>Alpha Program</th>
          <th>Assigned to</th>
      </tr>
    </thead>
  <tbody>`;

  for (const hp of hps) {
    innerHtml += printRow(hp);
  }

  innerHtml += `</tbody>`;

  document.querySelector('#demo').innerHTML = innerHtml;
}

getData()
  .then(data => {
    buildTable(data);

    const filtersConfig = {
        base_path: 'tablefilter/',
        col_3: 'select',
        col_4: 'select',
        col_5: 'select',
        col_6: 'select',
        col_8: 'select',
        col_9: 'select',
        alternate_rows: true,
        rows_counter: true,
        mark_active_columns: true,
        col_types: [
            'string', 'string', 'number',
            'string', 'string', 'string',
            'string', 'string', 'string'
        ],
        col_widths: [
            '500px', '120px', '100px',
            '100px', '100px', '100px',
            '120px', '100px', '100px',
            '120px'
        ],
        extensions:[{ name: 'sort' }]
    };

    const tf = new TableFilter('demo', filtersConfig);
    tf.init();
  });
