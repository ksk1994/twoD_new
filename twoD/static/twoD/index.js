document.addEventListener('DOMContentLoaded', function() {
  let vals = Array.from(document.querySelectorAll('.vals'));
  vals.forEach(val => {
    limitColor(val.dataset.valid, val.dataset.limit, parseInt(val.innerHTML))
  })
})


function showNewNoti(str, ok, id) {

  if (document.getElementById(`noti_${id}`)) {
      document.getElementById(`noti_${id}`).remove();
  }
  var div = document.createElement("div");
  div.id = `noti_${id}`
  if (ok) {
      div.className = 'toast align-items-center text-bg-success border-0'
  } else {
      div.className = 'toast align-items-center text-bg-danger border-0'
  }

  div.role = 'alert';
  div.ariaLive = 'assertive';
  div.ariaAtomic = 'true';
  div.innerHTML = `
  <div class="d-flex">
      <div class="toast-body" id="new_noti_body">
        ${str}
      </div>
      <button type="button" id="close_${id}" class="btn-close btn-close-white me-2 m-auto toastClose" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
  `
  document.getElementById('noti_con').append(div);
  const toastLiveExample = document.getElementById(`noti_${id}`)
  const toast = new bootstrap.Toast(toastLiveExample)
  toast.show()
  setInterval(function() {
      if (document.getElementById(`noti_${id}`)) {
      document.getElementById(`noti_${id}`).remove();
      }
  }, 8000);
}

function limitColor(id, limit, value) {
  const element = document.getElementById(`val_${id}`);
  
  if (limit !== 'None') {
    if (limit <= value) {
      element.className = 'col py-1 text-end vals rounded text-bg-danger mb-1';
    } else if (limit * 3 / 4 < value) {
      element.className = 'col py-1 text-end vals rounded text-bg-warning mb-1';
    } else {
      element.className = 'col py-1 text-end vals rounded mb-1';
    }
  } else {
    element.className = 'col py-1 text-end vals rounded mb-1';
  }
}

function showAddLimit() {
  clearmdl()
  document.getElementById('mdl_title').innerHTML = 'ဘရိတ် ထည့်မယ်';
  let body = document.getElementById('mdl_body');
  body.innerHTML = `
  <div class="input-group mb-3">
    <select class="form-select" id="numSelect" onChange='getLimit(event)'>
      <option selected>Choose Number</option>
      <option value='allNums'>All Number</option>
    </select>
  </div>
  <div class="input-group mb-3">
  <input type="number" placeholder='Limit' id='limit' class="form-control" aria-label="Limit">
  
  </div>
  `
  const numList = getNumList();
  const numSelect = document.getElementById('numSelect');
  numList.forEach(num => {
    const option = new Option(num['num'], num['id']);
    option.id = num['num'];
    numSelect.add(option);
  });
  let mdlFoot = document.getElementById('mdl_footer');
  let addValueBtn = document.createElement('button');
  addValueBtn.className = 'btn btn-primary';
  addValueBtn.innerHTML = '<i class="bi bi-plus-lg me-1"></i>Add Limit';
  addValueBtn.id = 'mdlBtn'
  mdlFoot.append(addValueBtn);
  document.getElementById('logModalBtn').click();
  document.getElementById('mdlBtn').setAttribute('onclick', `addLimit(event)`);
  document.getElementById('logModalBtn').click();
}

function getLimit(event) {
  const id = event.currentTarget.value;
  if (id !== 'allNums') {
    const limit = document.getElementById(`val_${id}`).dataset.limit;
    const limitValue = limit !== 'None' ? parseInt(limit) : 0;
    document.getElementById('limit').value = limitValue;
  }
}


function addLimit(event) {
  const id = event.currentTarget.id;
  let num = document.getElementById('numSelect');
  let limit = parseInt(document.getElementById('limit').value);
  console.log(num.selectedIndex, limit);
  const headers = {
    'X-CSRFToken': getCookie('csrftoken'),
  };
  if (num.selectedIndex !== 0 && limit >= 0) {
    btnLoading(id);
    fetch('/setLimit', {
      method: 'PUT',
      headers: headers,
      body: JSON.stringify({
          num: num.value,
          limit: limit,
      })
    })
    .then(response => response.json())
    .then((data) => {
      btnLoadingHide(id);
      const updateLimitAndNotify = (val) => {
        limitColor(val['id'], val['limit'], val['amount']);
        const valElement = document.getElementById(`val_${val['id']}`);
        valElement.dataset.limit = val['limit'];

        const limitElement = document.getElementById(`limit_${val['id']}`);
        if (val['limit'] !== 'None') {
          limitElement.innerHTML = val['limit'];
        } else {
          limitElement.innerHTML = '-';
        }
      };

      if (data.vals.length > 1) {
        data.vals.forEach(val => {
          updateLimitAndNotify(val);
        });
        showNewNoti('ဂဏန်းတွေအကုန် ဘရိတ်ပြောင်းပြီးပါပြီ', true, 'success');
      } else if (data.vals.length === 1) {
        const val = data.vals[0];
        updateLimitAndNotify(val);
        if (val['limit'] === 'None') {
          showNewNoti(`<span class='bg-primary rounded'>${val['num']['num']}</span> အတွက် ဘရိတ်မထားတော့ပါ`, true, val['id']);
        } else {
          showNewNoti(`<span class='bg-primary rounded'>${val['num']['num']}</span> အတွက်ဘရိတ် ${val['limit']} ဖြစ်သွားပြီ`, true, val['id']);
        }
      }

      document.getElementById('mdl_close').click();
    })

  } else {
    mdlAlert('ရေးတာမှားနေတယ်', false);
  }
}


function showAddValue() {
    clearmdl()
    document.getElementById('mdl_title').innerHTML = 'အရောင်း';
    let body = document.getElementById('mdl_body');
    body.innerHTML = `
    <div class="input-group mb-3">
      <div class="input-group-text">
        <input id='r' class="form-check-input mt-0" type="checkbox" value="" aria-label="Checkbox for following text input"><label class="form-check-label" for="r">
        R
    </label>
      </div>
      <select class="form-select" id="numSelect"  onChange='checkRable(event)'>
        <option selected>ဂဏန်းရွေး</option>
      </select>
    </div>
    
    <div class="input-group mb-3">
      <select class="form-select bg-dark-subtle" id="commSelect" disabled>
        <option value='' selected>ကော်သမားရွေ</option>
      </select>
    </div>
    <div class="input-group mb-3">
    <input type="number" placeholder='Amount' id='value' class="form-control" aria-label="Amount">
    </div>`

    let numList = getNumList()
    let numSelect = document.getElementById('numSelect');
    numList.forEach(num => {
      let option = new Option(num['num'], num['id']);
      option.id = num['num']
      numSelect.appendChild(option);
    })

    let commList = getComms()
    if (commList.length !== 0) {
      let commSelect = document.getElementById('commSelect');
      commSelect.disabled = false;
      commSelect.classList.remove('bg-dark-subtle');
      commList.forEach(comm => {
        let option = new Option(comm['name'], comm['id']);
        commSelect.appendChild(option);
      })
      
    }

    let mdlFoot = document.getElementById('mdl_footer');
    let addValueBtn = document.createElement('button');
    addValueBtn.className = 'btn btn-primary';
    addValueBtn.innerHTML = '<i class="bi bi-plus-lg me-1"></i>Add';
    addValueBtn.id = 'mdlBtn'
    mdlFoot.appendChild(addValueBtn);
    document.getElementById('logModalBtn').click();
    document.getElementById('mdlBtn').setAttribute('onclick', `add(event)`);

    document.getElementById('logModalBtn').click();
}


function checkRable(event) {
  // Get the select element
const selectElement = event.target;

// Get the selected option
const selectedIndex = selectElement.selectedIndex;
const selectedOption = selectElement.options[selectedIndex];

// Get the inner HTML of the selected option
const selectedText = selectedOption.innerHTML;

const parts = selectedText.split('');
let r = document.getElementById('r');
if (parts[0] === parts[1]) {

  r.checked = false;
  r.disabled = true;
} else {
  r.disabled = false;
}
}


function add(event) {
    const id = event.currentTarget.id;
    const selected = document.getElementById('numSelect');
    const value = parseInt(document.getElementById(`value`).value);
    const nums = [selected.value]
    if (selected.selectedIndex !== 0 && document.getElementById('r').checked) {
      const selectedIndex = selected.selectedIndex;
      const selectedOption = selected.options[selectedIndex];
      const rNum = convertString(selectedOption.innerHTML);
      const rId = document.getElementById(rNum).value;
      nums.push(rId);
    }
    const comm = document.getElementById('commSelect').value;
    if (selected.selectedIndex !== 0 && nums.length > 0 && value > 0) {
      const jsonData = {
        nums: nums,
        value: value,
        comm: comm
      };
      console.log(jsonData)
      fetchValue(jsonData);
    } else {
      mdlAlert('Invalid Input!', false)
    }
}


function convertString(input) {
  const reversed = input.split('').reverse().join('');
  return reversed;
}


async function fetchValue(jsonData) {

  const headers = {
      'X-CSRFToken': getCookie('csrftoken'),
  };
  const ids = jsonData['nums'];
  btnLoading('mdlBtn');
  try {
    const response = await fetch('/add_value', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(jsonData)
    });
    if (!response.ok) {
      throw new Error('Error occurred while fetching data.');
    }

    const data = await response.json();
    console.log(data)
    if (data.msg === 'error') {
        showNewNoti('Error တက်သွားလို့ Refresh လုပ်ပါ!', false, 'error1')
    }

    for (const error of data.errors) {
      showNewNoti(error['error'], false, error['id']);  
    } 
    for (const item of data.vals) {

        const val = item.val;
        const log = item.log;

        //for (let i = 0; i < data.errors.length; i++) {
          //  let error = data.errors[i];
            //document.getElementById(`limit_${error['num']['id']}`).value = error['limit'];
          // document.getElementById(`limit_${error['num']['id']}`).innerHTML = error['limit'];
            //if (parseInt(document.getElementById('defaultLimit').value) != error['limit']) {
            //    document.getElementById(`limit_${error['num']['id']}`).hidden = false;
            //}
            //document.getElementById(`value_${error['num']['id']}`).value = '';
            //showNewNoti(`<b class='bg-info rounded p-1'>${error['num']['num']}</b> limit <b class='bg-warning rounded p-1'>${error['limit']}</b> ဘရိတ် ကျော်နေပြီ.`, false, `error_${error['num']['id']}`)
        //}
        
        document.getElementById(`val_${val['id']}`).innerHTML = val['amount'];
        let newLog = document.createElement('input');
        newLog.className = 'logs';
        newLog.id = `hiddenLog_${log['id']}`;
        newLog.dataset.id = log['id'];
        newLog.dataset.num = log['num']['num'];
        newLog.dataset.time = log['time'];
        newLog.dataset.amount = log['amount'];
        newLog.dataset.comm = '';
        if (log['comm']['name']) {
          newLog.dataset.comm = log['comm']['name'];
          newLog.dataset.commrate = log['comm']['com_rate'];
        }
        newLog.dataset.id = log['id'];
        document.getElementById('hiddenLog').append(newLog);
        limitColor(val['id'], val['limit'], val['amount'])
        showNewNoti(`<span class='bg-primary rounded'>${val['num']['num']}</span> အတွက် ${jsonData['value']} ကျပ် လက်ခံပါတယ်!`, true, log['id']);  
        btnLoadingHide('mdlBtn')
        
    }
  } catch (error) {
    console.error(error);
  }
}


function addValue(){
  let id = document.getElementById('numSelect').value
  let value = parseInt(document.getElementById('value').value)
  if (id != '' && value > 0) {
    const headers = {
      'X-CSRFToken': getCookie('csrftoken'),
    };
    fetch('/add_value', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          id: id,
          value: value
        })
    })
    .then(response => response.json())
    .then((data) => {
      console.log(data)
      let val = data.val;
      document.getElementById(`val_${val['id']}`).innerHTML = val['amount'];

      let log = data.log;
      let newLog = document.createElement('input');
      newLog.className = 'logs';
      newLog.dataset.id = log['id'];
      newLog.dataset.num = log['num']['num'];
      newLog.dataset.time = log['time'];
      newLog.dataset.amount = log['amount'];
      newLog.dataset.comm = '';
      if (log['comm']['name']) {
        newLog.dataset.comm = log['comm']['name'];
      }
      newLog.dataset.id = log['id'];
      document.getElementById('hiddenLog').append(newLog);
    })
  } else {
    mdlAlert('ရေးတာမှားနေတယ်', false)
  }
  
}
 
function getNumList() {
  const nums = Array.from(document.querySelectorAll('.nums'));
  const numList = nums.map(num => ({
    id: num.dataset.valid,
    numid: num.dataset.numid,
    num: num.innerHTML
  }));
  return numList
}

function getCookie(name) {
  let cookieValue = null;

  if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i].trim();

          // Does this cookie string begin with the name we want?
          if (cookie.substring(0, name.length + 1) === (name + '=')) {
              cookieValue = decodeURIComponent(cookie.substring(name.length + 1));

              break;
          }
      }
  }

  return cookieValue;
}


function showCreateNewComm() {
    clearmdl();
    document.getElementById('mdl_title').innerHTML = 'Create New Commission';
    let body = document.getElementById('mdl_body');
    body.innerHTML = `
    <div class="input-group flex-nowrap mb-2">
      <span class="input-group-text" id="addon-wrapping">နာမည်</span>
      <input type="text" id='commName' class="form-control" placeholder="နာမည်" aria-label="Name" aria-describedby="addon-wrapping">
    </div>
    <div class="input-group flex-nowrap">
      <span class="input-group-text" id="addon-wrapping1">ကော်နှုန်း</span>
      <input type="number" class="form-control" id='commRate' value='14' placeholder="ကျပ်" aria-label="ကျပ်" aria-describedby="addon-wrapping1">
    </div>
    `
    let mdlFoot = document.getElementById('mdl_footer');
    let createBtn = document.createElement('button');
    createBtn.className = 'btn btn-primary';
    createBtn.innerHTML = 'Create';
    createBtn.id = 'mdlBtn'
    mdlFoot.append(createBtn);
    document.getElementById('logModalBtn').click();
    document.getElementById('mdlBtn').setAttribute('onclick', `createNewComm()`);
}

function createNewComm() {
  let name = document.getElementById('commName').value;
  let rate = parseFloat(document.getElementById('commRate').value);
  if (name !== '' && rate > 0) {
      const headers = {
        'X-CSRFToken': getCookie('csrftoken'),
      };
    
      btnLoading('mdlBtn');
      
      fetch('/create_comm', {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({
            name: name,
            rate: rate / 100,
          })
      })
      .then(response => response.json())
      .then((data) => {
        
        btnLoadingHide('mdlBtn')
        let input = document.createElement('input');
        input.className = 'comms';
        input.id = `hiddenComm_${data.com['id']}`
        input.dataset.id = data.com['id'];
        input.dataset.name = data.com['name'];
        input.dataset.rate = data.com['com_rate'];
        document.getElementById('hiddenComm').append(input);
        showNewNoti(`ကော်သမားအသစ် <b>${data.com['name']}</b> လျှောက်ပြီးပါပီ!`, true, data.com['id']);
        document.getElementById('mdl_close').click();
      })
      .catch(error => {
        console.error('Error:', error);
        mdlAlert('An error occurred during the request!', false, 'error');
      });
  } else {
      mdlAlert('ရေးတာမှားနေတယ်', false)
  }
}


function mdlAlert(msg, ok) {
  let mdlA = document.getElementById('mdlAlert');
  if (ok) {
    mdlA.className = 'text-center text-success';
  } else {
    mdlA.className = 'text-center text-danger';
  }
  mdlA.innerHTML = msg;
}


function clearmdl() {
  document.getElementById('mdl_body').innerHTML = '';
  document.getElementById('mdlAlert').innerHTML = '';
  if (document.getElementById('mdlBtn')) {
    document.getElementById('mdlBtn').remove();
  }
}


function showLogs() {
  clearmdl();
  document.getElementById('mdl_title').innerHTML = 'ဒီနေ့မှတ်တမ်း';
  let body = document.getElementById('mdl_body');
  body.innerHTML = `<ul class="list-group" id='logsArea'></ul>`

  let logArea = document.getElementById('logsArea');
  let logArray = Array.from(document.querySelectorAll('.logs'));
  logArray.reverse();
  logArray.forEach(log => {
    let comm = 'ကိုယ်တိုင်'
    if (log.dataset.comm != '') {
      comm = log.dataset.comm
    }
    let li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-start remove'
    li.id = `log_${log.dataset.id}`
    li.style.animationPlayState = 'paused'
    li.innerHTML =  `
      <div class="ms-2 me-auto">
        <div class="fw-bold"><span class="me-2 bg-primary rounded p-1 mb-1 text-light">${log.dataset.num}</span><b>+${log.dataset.amount}</b></div>
        ${log.dataset.time}<small class='ms-2'>(${comm})</small>
      </div>
      <div class="btn-group" role="group" id='btngrp_${log.dataset.id}' aria-label="Basic example">
      <button type='button' data-id='${log.dataset.id}' class="btn btn-outline-danger" id='no_${log.dataset.id}' onclick='deleteLog(${log.dataset.id})'><i class="bi bi-trash"></i></button>
      </div>
      
    `
    logArea.append(li)
    
  })
  document.getElementById('logModalBtn').click(); 
}


function deleteLog(id) {
  const no = document.getElementById(`no_${id}`);
  const yes = document.createElement('button');
  const btnGroup = document.getElementById(`btngrp_${id}`);
  yes.type = 'button';
  yes.id = `yes_${id}`;
  yes.className = 'btn btn-outline-success';
  yes.setAttribute('onclick', `confirmDelete(${id})`);
  yes.innerHTML = `<i class="bi bi-check-lg"></i>`;
  btnGroup.append(yes);
  no.innerHTML = `<i class="bi bi-x-lg"></i>`;
  no.removeAttribute('onclick');
  no.setAttribute('onclick', `cancleDelete(${id})`);
  yes.style.display = 'block';
  yes.disabled = false;
}

function cancleDelete(id) {
  document.getElementById(`yes_${id}`).remove();
  document.getElementById(`no_${id}`).innerHTML = `<i class="bi bi-trash"></i>`;
  document.getElementById(`no_${id}`).removeAttribute('onclick');
  document.getElementById(`no_${id}`).setAttribute('onclick', `deleteLog(${id})`);
}

function confirmDelete(id) {
  btnLoading(`yes_${id}`);
  const headers = {
      'X-CSRFToken': getCookie('csrftoken'),
  };
  fetch('/deleteLog', {
      method: 'DELETE',
      headers: headers,
      body: JSON.stringify({
          id: id,
      })
  })
  .then(response => response.json())
  .then((data) => {
      if (data.msg === 'error') {
          showNewNoti('Error တက်သွားလို့ Refresh လုပ်ပြီး နောက်တခေါက်ထပ် လုပ်ကြည့်ပါ!', false, 'error')
      }

      if(data.val) {
          document.getElementById(`val_${data.val['id']}`).innerHTML = data.val['amount'];
          const logElement = document.getElementById(`log_${id}`);
          logElement.style.animationPlayState = 'running';
          logElement.addEventListener('animationend', function() {
            logElement.remove();
            document.getElementById(`hiddenLog_${id}`).remove();
          })
          showNewNoti('ဖျက်ပြီးပါပီ!', true, data.val['id']);
      }
  })
}


function getComms() {
  const commsList = Array.from(document.querySelectorAll('.comms')).map(comm => ({
    id: comm.dataset.id,
    name: comm.dataset.name,
    rate: parseFloat(comm.dataset.rate),
  }));
  return commsList;
}


function showCloseEntry() {
  clearmdl();
  checkTotal();
  document.getElementById('mdl_title').innerHTML = 'စရင်းပိတ်မှာသေချာလား?';
  
  let mdlFoot = document.getElementById('mdl_footer');
  let createBtn = document.createElement('button');
  createBtn.className = 'btn btn-primary';
  createBtn.innerHTML = 'သေချာတယ်';
  createBtn.id = 'mdlBtn'
  let mdlBody = document.getElementById('mdl_body');
  let logArray = Array.from(document.querySelectorAll('.logs'));
  let noComm = 0
  let commArray = []
  logArray.forEach(log => {
    if (log.dataset.comm === '') {
      noComm += parseInt(log.dataset.amount);
    } else {
      let index = commArray.findIndex(comm => comm.name === log.dataset.comm);
      if (index !== -1) {
        commArray[index].amount += parseInt(log.dataset.amount);
      } else {
        commArray.push({
          name: log.dataset.comm,
          amount: parseInt(log.dataset.amount),
          rate: parseFloat(log.dataset.commrate),
        })
      }
    }
    
  })

  let table = document.createElement('table');
  table.className = 'table';
  table.innerHTML = `
  <thead>
    <tr>
      <th scope="col" class='px-0'>နာမည်</th>
      <th scope="col" class='px-0'>Amount</th>
      <th scope="col" class='px-0'> ကော်ကြေး</th>
    </tr>
  </thead>
  <tbody id='commTBody'>
  </tbody>
  <tfoot>
    <tr>
    <th scope='row' class='px-0'>စုစုပေါင်း</th>
    <td><b id='totalAmount' class='px-0'></b></td>
    <td><b id='totalCommFee' class='px-0'></b></td>
    </tr>
    </tfoot>
    `
  mdlBody.append(table);
  let totalAmount = 0;
  let totalCommFee = 0;
  if (noComm !== 0) {
    let tr = document.createElement('tr');
    tr.innerHTML = `
    <th scope='row' class='px-0'>ကိုယ်တိုင်</th>
    <td class='px-0'>${noComm}</td>
    <td class='px-0'>0</td>`;
    document.getElementById('commTBody').append(tr);
    totalAmount += noComm;
  }
  commArray.forEach(comm => {
    let commFee = comm.amount * comm.rate;
    let tr = document.createElement('tr');
    tr.innerHTML = `
    <th scope='row' class='px-0'>${comm.name}</th>
    <td class='px-0'>${comm.amount}</td>
    <td class='px-0'>${commFee.toFixed(0)}</td>
    `
    document.getElementById('commTBody').append(tr);
    totalAmount += comm.amount;
    totalCommFee += commFee;
  })
  document.getElementById('totalAmount').innerHTML = totalAmount;
  document.getElementById('totalCommFee').innerHTML = totalCommFee.toFixed(0);

  mdlFoot.append(createBtn);
  document.getElementById('logModalBtn').click();
  document.getElementById('mdlBtn').setAttribute('onclick', `closeEntry()`);
}


function closeEntry() {
  document.getElementById('mdl_close').click();
  showLoading(`စာရင်းများအားလုံးကိုsave နေပါတယ်။
  ခနစောင့်ပေးပါ။Do not refresh the page!`);
  fetch('/closeEntry')
  .then(response => response.json())
  .then((data) => {
    hideLoading()
    console.log(data);
    let vals = Array.from(document.querySelectorAll('.vals'));
    vals.forEach(val => {
      val.innerHTML = 0
      val.dataset.limit = 'None';
      val.className = 'col py-1 text-end vals rounded mb-1';
    })
    let limits = Array.from(document.querySelectorAll('.limits'));
    limits.forEach(limit => {
      limit.innerHTML = '-';
    })
    let logs = Array.from(document.querySelectorAll('.logs'));
    logs.forEach(log => {
      log.remove();
    })
    showNewNoti('စာရင်းပိတ်ပြီးပါပီ!', true, 0);
    document.getElementById('mdl_close').click();
  })
}


function showSession() {
  clearmdl();
  document.getElementById('mdl_title').innerHTML = 'အရင် စာရင်း';
  
  let body = document.getElementById('mdl_body');
  body.innerHTML = `
  <p class="placeholder-glow">
  <span class="placeholder col-12"></span>
</p>
<p class="placeholder-glow">
  <span class="placeholder col-12"></span>
</p>
<p class="placeholder-glow">
  <span class="placeholder col-12"></span>
</p>
<p class="placeholder-glow">
  <span class="placeholder col-12"></span>
</p>
<p class="placeholder-glow">
  <span class="placeholder col-12"></span>
</p>
  `
  document.getElementById('logModalBtn').click();
  
  fetch('/getSession')
  .then(response => response.json())
  .then((data) => {
    body.innerHTML = `<ul class="list-group list-group-flush" id='historyList'></ul>`
    console.log(data)
    data.sess.forEach(ses => {
      let li = document.createElement('li');
      li.className = 'list-group-item';
      li.innerHTML = `<a href="/history/${ses['id']}">${ses['session']['date']} (${ses['session']['ampm']})</a>`
      document.getElementById('historyList').append(li)
    })

  })
}


function checkTotal() {
  clearmdl();
  document.getElementById('mdl_title').innerHTML = 'Totals';
  let body = document.getElementById('mdl_body');
  body.innerHTML = `
  <table class="table">
  <thead>
    <tr>
      <th scope="col" class='px-0'>ဂဏန်း</th>
      <th scope="col" class='px-0'>Amount</th>
      <th scope="col" class='px-0'>ဘရိတ်</th>
      <th scope="col" class='px-0'>ဒိုင်ပြောင်းငွေ</th>
    </tr>
  </thead>
  <tbody id='totalTBody'>
  </tbody>
  <tfoot>
    <tr>
    <th scope='row' class='px-0'>စုစုပေါင်း</th>
    <td><b id='total' class='px-0'></b></td>
    <td><b id='limits' class='px-0'></b></td>
    <td><b id='transfers' class='px-0'></b></td>
    </tr>
    <tr>
    <th scope='row' class='px-0'>စုစုပေါင်း ကျန်ငွေ</th>
    <td><b id='totalRem' class='px-0'></b></td>
    </tr>
  </tfoot>
</table>
  `
  const totalTBody = document.getElementById('totalTBody');
  let totals = Array.from(document.querySelectorAll('.vals'));
  let t = 0
  let transfers = 0
  let limits = 0
  const trElements = [];
  totals.forEach(total => {
    const amount = parseInt(total.innerHTML)
    if (amount !== 0) {
      const limit = total.dataset.limit !== 'None' ? parseInt(total.dataset.limit) : 0;
      const transfer = limit !== 0 && amount > limit  ? amount - limit : 0;
      
      let tr = document.createElement('tr');
      tr.innerHTML = `
        <th scope="row" class='px-0'>${total.dataset.num}</th>
        <td class='px-0'>${amount}</td>
        <td class='px-0'>${limit}</td>
        <td class='px-0'>${transfer}</td>
      `
      trElements.push(tr);
      t += amount;
      limits += limit;
      transfers += transfer;
    }
    
  })
  totalTBody.append(...trElements);
  document.getElementById('total').innerHTML = t;
  document.getElementById('limits').innerHTML = limits;
  document.getElementById('transfers').innerHTML = transfers;
  document.getElementById('totalRem').innerHTML = t - transfers;
  document.getElementById('logModalBtn').click();
}


function showAddJp() {
  clearmdl();
  document.getElementById('mdl_title').innerHTML = 'ပေါက်သီးထည့်';
  let body = document.getElementById('mdl_body');
  document.getElementById('logModalBtn').click();
  body.innerHTML = `
  <p class="placeholder-glow">
  <span class="placeholder col-12"></span>
</p>
<p class="placeholder-glow">
  <span class="placeholder col-12"></span>
</p>
  `
  
  fetch('/getArcs')
  .then(response => response.json())
  .then((data) => {
    body.innerHTML = `
  <div class="input-group mb-3">
  <label class="input-group-text" for="arcSelect">
  ရွေးရန်
  </label>
  <select class="form-select" id="arcSelect">
    <option value='' selected>အချိန်ရွေး...</option>
    
  </select>
</div>
<div class="input-group mb-3">
  <label class="input-group-text" for="numSelect">Numbers</label>
  <select class="form-select" id="numSelect">
    <option value='' selected>ဂဏန်းရွေး...</option>
    
  </select>
</div>
  `
    data.arcs.forEach((arc) => {
      let option = document.createElement('option');
      option.value = arc['id'];
      option.innerHTML = `${arc['session__date']} (${arc['session__ampm']})`;
      document.getElementById('arcSelect').append(option)
    })

    let nums = getNumList();
    nums.forEach(num => {
      let option = document.createElement('option');
      option.value = num['numid'];
      option.innerHTML = `${num['num']}`;
      document.getElementById('numSelect').append(option)
    })
    let mdlFoot = document.getElementById('mdl_footer');
    let createBtn = document.createElement('button');
    createBtn.className = 'btn btn-primary';
    createBtn.innerHTML = 'Add';
    createBtn.id = 'mdlBtn'
    mdlFoot.append(createBtn);
    document.getElementById('mdlBtn').setAttribute('onclick', `addJp()`);
  })
}

function addJp() {
  let num = document.getElementById('numSelect');
  let arc = document.getElementById('arcSelect');
  if (num.selectedIndex !== 0 || arc.selectedIndex !== 0) {
    const headers = {
      'X-CSRFToken': getCookie('csrftoken'),
    };
    btnLoading('mdlBtn');
  
    fetch('/addJp', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
            jp: num.value,
            arc: arc.value,
        })
    })
    .then(response => response.json())
    .then((data) => {
      btnLoadingHide('mdlBtn')
      console.log(data)
      const selectedIndex = num.selectedIndex;
      const selectedOption = num.options[selectedIndex];
      console.log(selectedOption.innerHTML)
      const d = `${data.arc['session']['date']} (${data.arc['session']['ampm']})`
      showNewNoti(`ပေါက်ဂဏန်း <b>${selectedOption.innerHTML}</b> ကို ${d} နေ့ အတွက်ထည့်မှတ်လိုက်ပါပြီ`, true, data.arc['id']);
      document.getElementById('mdl_close').click();
    })
  } else {
    mdlAlert('ရွေးတာမှားနေတယ်', false)
  }
}


function showSetting() {
  clearmdl();
  document.getElementById('mdl_title').innerHTML = 'ကော်ကြေးချိန်';
  let body = document.getElementById('mdl_body');
  body.innerHTML = `
  <div class="input-group mb-3">
  <label class="input-group-text" for="commSelect">ရွေးရန်</label>
  <select class="form-select" id="commSelect"   onChange='getCommRate(event)'>
    <option value='' selected>Choose...</option>
    <option value='Owner'>ကိုယ်တိုင်</option>
  </select>
  </div>
  <div class="input-group flex-nowrap">
    <span class="input-group-text" id="addon-wrapping">ကော်နှုန်း</span>
    <input type="number" id='commRate' class="form-control" placeholder="ကျပ်" aria-label="ကျပ်" aria-describedby="addon-wrapping">
  </div>`

  let comms = getComms();
  comms.forEach(com => {
    let option = document.createElement('option');
    option.value = com['id'];
    option.innerHTML = com['name'];
    document.getElementById('commSelect').append(option)
  })
  let mdlFoot = document.getElementById('mdl_footer');
    let createBtn = document.createElement('button');
    createBtn.className = 'btn btn-primary';
    createBtn.innerHTML = 'Save Change';
    createBtn.id = 'mdlBtn'
    mdlFoot.append(createBtn);
    document.getElementById('logModalBtn').click();
    document.getElementById('mdlBtn').setAttribute('onclick', `changeComm()`);
}


function changeComm() {
  let comm = document.getElementById('commSelect').value;
  let rate = parseInt(document.getElementById('commRate').value);
  if (comm != '' && rate > 0) {
    const headers = {
      'X-CSRFToken': getCookie('csrftoken'),
    };
    btnLoading('mdlBtn');
    fetch('/changeComm', {
      method: 'PUT',
      headers: headers,
      body: JSON.stringify({
        id: comm,
        rate: rate
      })
    })
    .then(response => response.json())
    .then((data) => {
      btnLoadingHide('mdlBtn')
      console.log(data)
      if (data.comm['email'] != '') {
        document.getElementById(`hiddenComm_Owner`).dataset.rate = data.comm['com_rate'];
      } else {
        document.getElementById(`hiddenComm_${data.comm['id']}`).dataset.rate = data.comm['com_rate'];
      }
      showNewNoti(`<b>${data.comm['name']}</b> အတွက် ကော်နှုန်းကို <b>${rate}</b> ကျပ်အဖြစ်ပြောင်းမှတ်ထားပါပီ`, true, data.comm['id']);
      document.getElementById('mdl_close').click();
    })
  }
}


function showLoading(str) {
  document.getElementById('loadingDiv').style.display = 'block';
  document.getElementById('loadingTxt').innerHTML = str;
}

function hideLoading() {
  document.getElementById('loadingDiv').style.display = 'none';
  document.getElementById('loadingTxt').innerHTML = '';
}

function btnLoading(id) {
  const ele = document.getElementById(id);
  ele.disabled = true;
  let div = document.createElement('div');
  div.className = 'ps-1';
  div.id = 'btnLoading';
  div.innerHTML = `
    <div class="spinner-border text-warning" role="status" style='width: 1rem; height: 1rem;'>
    <span class="visually-hidden">Loading...</span>
    </div>`;
  ele.append(div);
}

function btnLoadingHide(id) {
  const ele = document.getElementById(id);
  ele.disabled = false;
  document.getElementById('btnLoading').remove();
}


function getCommRate(event) {
  let comm = event.currentTarget.value;
  console.log(comm)
  document.getElementById('commRate').value = parseInt(parseFloat(document.getElementById(`hiddenComm_${comm}`).dataset.rate) * 100);
}