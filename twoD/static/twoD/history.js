document.addEventListener('DOMContentLoaded', function() {
    loadComm();
    loadTotal();
    loadTotaltransfer();
    let jp = loadProfit();
})

function loadProfit() {
    let getComm = parseInt(document.getElementById('totalGet').innerHTML);
    let getTran = parseInt(document.getElementById('totalTran').innerHTML);
    let profit = getComm + getTran;
    let tr = document.createElement('tr');
    tr.innerHTML = `
    <th scope='row'>#</th>
    <td>${getComm}</td>
    <td>${getTran}</td>
    <td id='tlProfit'>${profit}</td>
    `
    document.getElementById('profitBody').append(tr);
    if (profit < 0) {
        document.getElementById('tlProfit').className = 'text-bg-danger';
    } else {
        document.getElementById('tlProfit').className = 'text-bg-success';

    }
}

function loadTotal() {
    let total = 0;
    Array.from(document.querySelectorAll('.amounts')).forEach(amount => {
        total += parseInt(amount.innerHTML);
    })
    document.getElementById('total').innerHTML = total;
}

function loadTotaltransfer() {
    let transfer = getTransfers();
    document.getElementById('totalTransfer').innerHTML = transfer.total;
    let tr = document.createElement('tr');
    console.log(transfer.tranComm)
    let totalTran = transfer.pay + transfer.tranComm - transfer.total;
    tr.innerHTML = `
    <td>${transfer.total}</td>
    <td>${transfer.jp}</td>
    <td>${transfer.tranComm.toFixed(0)}</td>
    <td>${transfer.pay.toFixed(0)}</td>
    <td id='totalTran'>${totalTran}</td>`;
    document.getElementById('transferBody').append(tr);
    if (totalTran < 0) {
        document.getElementById('totalTran').className = 'text-bg-danger';
    } else {
        document.getElementById('totalTran').className = 'text-bg-success';

    }

}

function clearmdl() {
    document.getElementById('mdl_body').innerHTML = '';
    if (document.getElementById('mdlBtn')) {
      document.getElementById('mdlBtn').remove();
    }
  }
  

function showSession() {
    clearmdl();
    document.getElementById('mdl_title').innerHTML = 'History Logs';
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
        li.innerHTML = `<a href="/history/${ses['id']}">${ses['session']['date']} (${ses['session']['ampm']})</a>`;
        document.getElementById('historyList').append(li)
      })
  
    })
  }

function loadComm() {
    let comms = getComms();
    console.log(comms)
    let tBody = document.getElementById('commTBody');
    let totalPO = 0;
    let totalcommFee = 0;
    let total = 0
    let totalget = 0
    comms.forEach(comm => {
        let tr = document.createElement('tr');
        let commfee = comm.amount * comm.rate;
        let get = comm.amount - comm.payout - commfee;
        tr.id = comm.id;
        total += comm.amount;
        totalPO += comm.payout;
        totalcommFee += commfee;
        totalget += get
        tr.innerHTML = `<th scope="row">${comm.name}</th>
        <td>${comm.amount}</td>
        <td>${commfee.toFixed(0)}</td>
        <td class='payOut'>${comm.payout}</td>
        <td>${get.toFixed(0)}</td>`
        tBody.append(tr);
    })
    document.getElementById('totalAmount').innerHTML = total;
    document.getElementById('totalCommFee').innerHTML = totalcommFee.toFixed(0);
    document.getElementById('totalPO').innerHTML = totalPO;
    document.getElementById('totalGet').innerHTML = totalget.toFixed(0);
    if (totalget < 0) {
        document.getElementById('totalGet').parentElement.className = 'text-bg-danger'
    } else {
        document.getElementById('totalGet').parentElement.className = 'text-bg-success'
    }
    const jpId = getJp();
    console.log(jpId)
    
}

function getComms() {
    let commArray = Array.from(document.querySelectorAll('.commsAmount'));
    let commList = []
    const jpId = getJp();
    commArray.forEach(comm => {
        let id = comm.dataset.id;
        let index = commList.findIndex(com => com.id === id);
        let payout = 0;
        if (jpId !== NaN) {
            if (jpId === comm.dataset.num) {
                payout = parseInt(comm.innerHTML) * 80
            }
        }
        if (index !== -1) {
            commList[index].amount += parseInt(comm.innerHTML);
        } else {

            commList.push({
                id: comm.dataset.id,
                name: comm.dataset.name,
                amount: parseInt(comm.innerHTML),
                rate: parseFloat(comm.dataset.rate),
                payout: payout
            })
        }
    })
    return commList
}

function getJp() {
    if (document.getElementById('jpNum')) {
        document.getElementById('profitTable').style.display = 'block';
        return document.getElementById('jpNum').dataset.id;
    } else {
        document.getElementById('profitTable').style.display = 'none';
        return NaN
    }
}


function getTransfers() {
    let tran = 0;
    let tranPay = 0;
    let jp = 0;
    const jpId = getJp();
    let tranArray = Array.from(document.querySelectorAll('.transfers'));
    tranArray.forEach(transfer => {
        if (jpId !== NaN) {
            if (jpId === transfer.dataset.num) {
                tranPay = parseInt(transfer.innerHTML) * 80;
                jp = parseInt(transfer.innerHTML);
            }
        }
        tran += parseInt(transfer.innerHTML)
    })
    return {
        total: tran,
        jp: jp,
        pay: tranPay,
        tranComm: tran * parseFloat(document.getElementById('hiddenComm_Owner').dataset.rate),
    }
}