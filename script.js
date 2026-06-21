/* =========================
   JB DIGITAL SERVICES
   SCRIPT FINAL PRO FACTURATION
========================= */

let items = [];
let invoiceId = localStorage.getItem("invoiceId") || 1;
let currency = "$";
let selectedInvoice = null;

// INIT
document.addEventListener("DOMContentLoaded", () => {
    updateHeader();
    loadDashboard();
});

// =========================
// HEADER SAFE (INDEX + DASHBOARD)
// =========================
function updateHeader(){

    let invoiceEl = document.getElementById("invoiceId");
    let dateEl = document.getElementById("date");

    if(invoiceEl){
        invoiceEl.innerText =
        "INV-" + String(invoiceId).padStart(4,"0");
    }

    if(dateEl){
        dateEl.innerText =
        new Date().toLocaleDateString();
    }
}

// =========================
// DEVISE
// =========================
function updateCurrency(){
    currency = document.getElementById("currency").value;
    render();
}

// =========================
// AJOUT ARTICLE
// =========================
function addItem(){

    let qty = Number(document.getElementById("qty").value);
    let desc = document.getElementById("desc").value.trim();
    let price = Number(document.getElementById("price").value);

    if(!qty || !desc || !price){
        alert("Remplis tous les champs");
        return;
    }

    items.push({qty, desc, price});

    document.getElementById("qty").value = "";
    document.getElementById("desc").value = "";
    document.getElementById("price").value = "";

    render();
}

// =========================
// AFFICHAGE FACTURE
// =========================
function render(){

   list = document.getElementById("list");
    if(!list) return;

    list.innerHTML = "";

    let total = 0;

    if(items.length === 0){
        list.innerHTML =
        `<tr><td colspan="5">Aucun service ajouté</td></tr>`;
    }

    items.forEach((i,index)=>{
        let t = i.qty * i.price;
        total += t;

        list.innerHTML += `
        <tr>
            <td>${i.qty}</td>
            <td>${i.desc}</td>
            <td>${i.price} ${currency}</td>
            <td>${t} ${currency}</td>
            <td><button onclick="deleteItem(${index})">🗑️</button></td>
        </tr>`;
    });

    
    let discount =
   Number(document.getElementById("discount")?.
    value|| 0) ;

    let reduction = total * (discount / 100);

    let totalPayer = total- reduction;
    document.getElementById("subtotal").innerText=
    total. toFixed(2)+""+ currency;
    document.getElementById("total").innerText= totalPayer.toFixed(2) +""+currency

}

// =========================
// SUPPRESSION ITEM
// =========================
function deleteItem(i){
    items.splice(i,1);
    render();
}

// =========================
// SAUVEGARDE FACTURE
// =========================
function saveInvoice(){

    if(items.length === 0){
        alert("Ajoute au moins un service");
        return;
    }

    let invoices =
    JSON.parse(localStorage.getItem("invoices")) || [];

    let total = items.reduce((s,i)=>s+(i.qty*i.price),0);

    let invoice = {
        id:"INV-"+Date.now(),
        client:document.getElementById("client").value,
        phone:document.getElementById("phone").value,
        address:document.getElementById("address").value,
        date:new Date().toLocaleDateString(),
        timestamp:Date.now(),
        currency,
        total,
        items:[...items]
    };

    invoices.unshift(invoice);

    localStorage.setItem("invoices", JSON.stringify(invoices));

    invoiceId++;
    localStorage.setItem("invoiceId", invoiceId);

    resetInvoice();
    updateHeader();

    loadDashboard();
}

// =========================
// RESET FACTURE
// =========================
function resetInvoice(){
    items = [];
    render();
}

// =========================
// NAVIGATION
// =========================
function goDashboard(){
    window.location.href = "dashboard.html";
}

function goInvoice(){
    window.location.href = "index.html";
}

// =========================
// DASHBOARD + STATS
// =========================
function loadDashboard(){

    let invoices =
    JSON.parse(localStorage.getItem("invoices")) || [];

    let table = document.getElementById("salesTable");
    if(!table) return;

    table.innerHTML = "";

    let totalGlobal = 0;
    let todayTotal = 0;
    let monthTotal = 0;

    let todayDate = new Date().toLocaleDateString();
    let currentMonth = new Date().getMonth();

    invoices.forEach(inv=>{

        let d = new Date(inv.timestamp);

        totalGlobal += inv.total;

        if(d.toLocaleDateString() === todayDate){
            todayTotal += inv.total;
        }

        if(d.getMonth() === currentMonth){
            monthTotal += inv.total;
        }

        table.innerHTML += `
        <tr>
            <td>${inv.id}</td>
            <td>${inv.client}</td>
            <td>${inv.phone}</td>
            <td>${inv.date}</td>
            <td>${inv.total} ${inv.currency}</td>
            <td>
                <button onclick="viewInvoice('${inv.id}')">👁️</button>
            </td>
        </tr>`;
    });

    let g = document.getElementById("globalSales");
    let t = document.getElementById("todaySales");
    let m = document.getElementById("monthSales");
    let c = document.getElementById("invoiceCount");

    if(g) g.innerText = totalGlobal + " " + currency;
    if(t) t.innerText = todayTotal + " " + currency;
    if(m) m.innerText = monthTotal + " " + currency;
    if(c) c.innerText = invoices.length;
}

// =========================
// DUPLICATA (VIEW FACTURE)
// =========================
function viewInvoice(id){

    let invoices =
    JSON.parse(localStorage.getItem("invoices")) || [];

    selectedInvoice =
    invoices.find(i=>i.id === id);

    if(!selectedInvoice) return;

    let html = `
    <h2>FACTURE ${selectedInvoice.id}</h2>
    <p><b>Client:</b> ${selectedInvoice.client}</p>
    <p><b>Téléphone:</b> ${selectedInvoice.phone}</p>
    <hr>
    <table style="width:100%;border-collapse:collapse;">
    <tr>
    <th>Desc</th><th>Qté</th><th>Prix</th>
    </tr>`;

    selectedInvoice.items.forEach(i=>{
        html += `
        <tr>
            <td>${i.desc}</td>
            <td>${i.qty}</td>
            <td>${i.price}</td>
        </tr>`;
    });

    html += `
     </table>

    <hr>
    <p><strong> Total :</strong>
    ${selectedInvoice.total}
    ${selectedInvoice.currency} </p>`;

    document.getElementById("invoiceDetails").innerHTML = html;
    document.getElementById("invoiceModal").style.display = "block";
}

// =========================
// FERMER MODAL
// =========================
function closeModal(){
    document.getElementById("invoiceModal").style.display = "none";
}

// =========================
// IMPRIMER DUPLICATA
// =========================

/* PRINT PRO */
function printInvoice(){
const facture = document.getElementById("facture");
const win = window.open("", "_blank");

win.document.write(`
<html>
<head>
<title>Print</title>
<link rel="stylesheet" href="style.css">
</head>
<body>${facture.innerHTML}</body>
</html>
`);

win.document.close();

setTimeout(()=>{
win.print();
win.close();
},500);
}


// =========================
// PDF PRO
// =========================




// =========================
// EXPORT EXCEL (CSV)
// =========================
function exportExcel(){

    let invoices =
    JSON.parse(localStorage.getItem("invoices")) || [];

    if(invoices.length === 0){
        alert("Aucune facture à exporter");
        return;
    }

    let csv = "ID,Client,Telephone,Date,Total,Currency\n";

    invoices.forEach(inv=>{
        csv += `${inv.id},${inv.client},${inv.phone},${inv.date},${inv.total},${inv.currency}\n`;
    });

    let blob = new Blob([csv], {type:"text/csv"});
    let url = URL.createObjectURL(blob);

    let a = document.createElement("a");
    a.href = url;
    a.download = "factures_JB.csv";
    a.click();

    URL.revokeObjectURL(url);
}

// =========================
// PDF PRO (FACTURE STYLE IMAGE)
// =========================

async function downloadPDF() {

    document. querySelectorAll(".pdf-hide").forEach(el=> {
        el.style.display = "none";
    });
    const facture = document.getElementById("facture");

   
        

    const canvas = await html2canvas(facture, {
        scale: 2,
    
        backgroundColor: "#ffffff"
    });
    document. querySelectorAll(".pdf-hide").forEach(el=> {
        el.style.display = "";
    });

    const imgData = canvas.toDataURL("image/png");

    const { jsPDF } = window.jspdf.jsPDF;
    const pdf = new window.jspdf.jsPDF("p", "mm", "a4");

    let imgWidth = 190;
    let pageHeight =277;
    let imgHeight =(canvas.height * imgWidth) / canvas.width;
let heightLeft = imgHeight
let position = 10
scale: 2
    pdf.addImage(imgData, "PNG", 10,position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    while (heightLeft > 0){
    position= heightLeft-imgHeight + 10;
    pdf.addPage();
pdf.addImage(imgData, "PNG", 10,
    position, imgWidth, imgHeight);
heightLeft -=pageHeight;}
    pdf.save("facture.pdf");
    

}
window.resetAllSales = function(){
        const confirmReset = confirm ("Voulez-vous vraiment supprimer toutes les ventes JB")
   
   if (! confirmReset) return;
localStorage.removeItem ("invoices"); 
localStorage.removeItem ("sales");
localStorage.removeItem ("invoiceId");
alert("Toutes les ventes ont été supprimée JB");
loadDashboard();

}
function printSelectedInvoice() {

    const facture = document.getElementById("invoiceDetails");

    const win = window.open("", "_blank");

    win.document.write(`
    <html>
    <head>
        <title>Duplicata Facture</title>

        <style>
            body {
                font-family: Popins, sans-serif;
                background: #eef2f7;
                padding: 20px;
            }

            .invoice-box {
                max-width: 850px;
                margin: auto;
                background: white;
                padding: 25px;
                border-radius: 12px;
                box-shadow: 0 8px 25px rgba(0,0,0,0.15);
            }

            .header {
                text-align: center;
                border-bottom: 3px solid #2c3e50;
                padding-bottom: 10px;
                margin-bottom: 20px;
            }

            .header h2 {
                margin: 0;
                color: #2c3e50;
            }

            .info {
                font-size: 14px;
                margin-bottom: 15px;
            }

            table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 15px;
            }

            th {
                background: #2c3e50;
                color: white;
                padding: 10px;
                text-align: left;
            }

            td {
                padding: 10px;
                border-bottom: 1px solid #ddd;
            }

            tr:nth-child(even) {
                background: #f7f7f7;
            }

            .total {
                text-align: right;
                margin-top: 20px;
                font-size: 18px;
                font-weight: bold;
                color: #27ae60;
            }

            .footer {
                margin-top: 30px;
                text-align: center;
                font-size: 12px;
                color: #777;
                border-top: 1px solid #ddd;
                padding-top: 10px;
            }

            .btn-print {
                text-align: center;
                margin-top: 20px;
            }

            .btn-print button {
                background: #2c3e50;
                color: white;
                padding: 10px 20px;
                border: none;
                border-radius: 6px;
                cursor: pointer;
            }

            .btn-print button:hover {
                background: #0f1f2e;
            }
        </style>
    </head>

    <body>

        <div class="invoice-box">

            <div class="header">
                <h2>FACTURE DE SERVICE</h2>
                <p>JB DIGITAL SERVICES</p>
                <img src="logo.png" width="80"</p>
            </div>

            <div class="info">
                ${facture.innerHTML}
            </div>

            <div class="footer">
                Merci pour votre confiance 🙏
            </div>

            <div class="btn-print">
                <button onclick="window.print()">Imprimer</button>
            </div>

        </div>

    </body>
    </html>
    `);

    win.document.close();
    win.focus();
}

function filterClient() {

    let input = document.getElementById("searchClient");
    if (!input) return;

    let filter = input.value.toLowerCase();
    let table = document.getElementById("salesTable");

    if (!table) return;

    let rows = table.getElementsByTagName("tr");

    for (let i = 0; i < rows.length; i++) {

        let Text = rows[i].textContent.toLowerCase();

        if (Text.indexOf(filter)>-1) {
   rows[i].style.display = "";
        }else {rows[i].style.display = "none";
        }
    }
}

