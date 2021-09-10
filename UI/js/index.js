function getData() {
  return [
    {
      name:"5j60okm4zt9elo8gu5u4qgh2bv3gusdo7uo48nwdb2d18wk59h",
      IP:"172.26.29.50",
      timestamp:1631089852191,
      sshSuccess:true,
      holoNetwork:"flexNet",
      channel:"923",
      holoportModel:"holoport-plus",
      hostingInfo:"{\"totalSourceChains\":0,\"currentTotalStorage\":0,\"usage\":{\"cpu\":0}}",
      error:null,
      alphaTest: "yes"
    },
    {
      name:"abba",
      IP:"172.26.1.2",
      timestamp:1631089852191,
      sshSuccess:true,
      holoNetwork:"flexNet",
      channel:"878",
      holoportModel:"holoport",
      hostingInfo:"{\"totalSourceChains\":0,\"currentTotalStorage\":0,\"usage\":{\"cpu\":0}}",
      error:null,
      alphaTest: "yes",
      assigned: "Robbie"
    },
    {
      name:"led-zeppelin",
      IP:"172.26.1.3",
      timestamp:1631089852191,
      sshSuccess:false,
      holoNetwork:null,
      channel:null,
      holoportModel:null,
      hostingInfo:null,
      error:"ssh: connect to host 172.26.205.227 port 22: Connection timed out"
    },
  ];
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
    <td class="too-long" title="${hp.name}">${hp.name}</td>
    <td>${hp.IP}</td>
    <td>${hp.timestamp}</td>
    <td title="${hp.error}">${successCheck}</td>
    <td>${hp.holoNetwork}</td>
    <td>${hp.channel}</td>
    <td title="${hp.holoportModel}">${hp.holoportModel}</td>
    <td title="${hp.totalSourceChains}">${hp.totalSourceChains}</td>
    <td>${(hp.alphaTest===undefined)?"":hp.alphaTest}</td>
    <td>${(hp.assigned===undefined)?"":hp.assigned}</td>
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
          <th>Alpha tests</th>
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

let hps = getData();

buildTable(hps);

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
        '120px', '120px', '100px',
        '100px', '100px', '100px',
        '120px', '100px', '100px',
        '120px'
    ],
    extensions:[{ name: 'sort' }]
};

const tf = new TableFilter('demo', filtersConfig);
tf.init();