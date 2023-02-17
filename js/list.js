async function getData() {
  const availableHoloportsResponse = await fetch('https://network-statistics.holo.host/hosts/list-available?hours=168'); // 7 days
  let availableHoloportsDetails = await availableHoloportsResponse.json()
  return availableHoloportsDetails;
}

function show_modal(arr) {
  document.querySelector('#modal-inner').innerHTML = arr;
  document.querySelector('#modal').style.display = 'block';
  document.querySelector('#modal').style.top = window.scrollY + 20 + 'px';
}

function hide_modal() {
  document.querySelector('#modal').style.display = 'none';
}

function timeSince(date) {
  const seconds = Math.floor(new Date() / 1000) - date / 1000;
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

function printRow(hp, i) {
  hp.debug = hp.lastZerotierOnline;
  hp.lastZerotierOnline = timeSince(hp.lastZerotierOnline) + ` ago`;
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

  let errorRow
  if (hp.errors.length === 0) {
    errorRow = '<td class="success">no</td>'
  } else {
    errorRow = '<td class="warning"><span onClick="alert(data['+i+'].errors)">YES</span></td>'
  }

  return `
    <tr>
      <td title="${hp.holoportId}">${hp.holoportId}</td>
      <td>${hp.zerotierIp}</td>
      <td>${hp.lastZerotierOnline}</td>
      <td>${hp.sshStatus}</td>
      <td>${hp.holoNetwork}</td>
      <td>${hp.channel}</td>
      <td title="${hp.holoportModel}">${hp.holoportModel}</td>
      <td class="too-long"><div onClick="alert('${hp.channelVersion}')">${hp.channelVersion.substring(0,7)}</div></td>
      <td class="too-long"><div onClick="alert('${hp.hposVersion}')">${hp.hposVersion.substring(0,7)}</div></td>
      ${errorRow}
    </tr>
  `;
}

function buildTable(hps) {
  let innerHtml = `
    <thead>
      <tr>
          <th>HoloPort Id</th>
          <th>Zerotier IP</th>
          <th>Last seen on ZT</th>
          <th>SSH enabled</th>
          <th>Holo Network</th>
          <th>Channel</th>
          <th>Model</th>
          <th>Channel Version</th>
          <th>HPOS Version</th>
          <th>Errors</th>
      </tr>
    </thead>
  <tbody>`;

  for (let i = 0; i < data.length; i++) {
    innerHtml += printRow(data[i], i);
  }

  innerHtml += `</tbody>`;

  document.querySelector('#demo').innerHTML = innerHtml;
}

getData()
  .then(data => {
    // makes data available to js outside of this code block
    window.data = data;
    buildTable(data);

    const filtersConfig = {
        base_path: '/holoports/tablefilter/',
        col_3: 'select',
        col_4: 'select',
        col_5: 'select',
        col_6: 'select',
        col_7: 'select',
        col_8: 'select',
        col_9: 'select',
        alternate_rows: true,
        rows_counter: true,
        mark_active_columns: true,
        col_types: [
            'string', 'string', 'string', 'bool',
            'string', 'string', 'string',
            'string', 'string', 'string'
        ],
        col_widths: [
            '450px', '130px', '100px', '100px',
            '100px', '100px', '100px',
            '120px', '100px', '70px'
        ],
        extensions:[{ name: 'sort' }]
    };

    const tf = new TableFilter('demo', filtersConfig);
    tf.init();
    document.querySelector('#loading').remove();
  });
