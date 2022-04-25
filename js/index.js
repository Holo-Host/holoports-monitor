async function getData() {
  const availableHoloportsResponse = await fetch('https://network-statistics.holo.host/hosts/list-available?days=7');
  let availableHoloportsDetails = await availableHoloportsResponse.json()
  return availableHoloportsDetails;
}

function timeSince(date) {
  const seconds = Math.floor(new Date() / 1000) - date;
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
    return Math.floor(interval) + " min";
  }
  return Math.floor(seconds) + " sec";
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
  hp.timestamp = timeSince(hp.timestamp) + ` ago`;
  hp.totalSourceChains = getSourceChains(hp.hostingInfo);

  let successCheck;
  if (hp.sshStatus) {
    successCheck = `<div class="success">&#x2714</div>`;
  } else {
    successCheck = `<div class="warning">&#9888</div>`;
  }

  for (const key in hp) {
    hp[key] = (hp[key]===null)?"-":hp[key];
  }

  return `
    <tr>
      <td class="too-long" title="${hp.holoportId}">${hp.holoportId}</td>
      <td>${hp.ztIp}</td>
      <td>${hp.timestamp}</td>
      <td>${hp.holoNetwork}</td>
      <td>${hp.channel}</td>
      <td title="${hp.holoportModel}">${hp.holoportModel}</td>
      <td class="too-long" title="${hp.channelVersion}">${hp.channelVersion}</td>
      <td class="too-long" title="${hp.hposVersion}">${hp.hposVersion}</td>
    </tr>
  `;
}

function buildTable(hps) {
  let innerHtml = `
    <thead>
      <tr>
          <th>HoloPort Id</th>
          <th>Zerotier IP</th>
          <th>Timestamp</th>
          <th>Holo Network</th>
          <th>Channel</th>
          <th>Model</th>
          <th>Channel Version</th>
          <th>HPOS Version</th>   
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
        col_7: 'select',
        alternate_rows: true,
        rows_counter: true,
        mark_active_columns: true,
        col_types: [
            'string', 'string', 'string',
            'string', 'string', 'string',
            'string', 'string', 'string'
        ],
        col_widths: [
            '450px', '130px', '100px',
            '100px', '100px', '100px',
            '120px', '100px', '120px'
        ],
        extensions:[{ name: 'sort' }]
    };

    const tf = new TableFilter('demo', filtersConfig);
    tf.init();
  });
