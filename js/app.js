
// Standalone In-Memory/LocalStorage Database Engine (No Node/Localhost needed)
const DB_KEY = 'BLUE_PARROT_ERP_STATE';
function getDefaultDB() {
  const today = new Date().toISOString().split('T')[0];
  return {
    transactions: [
      { id: 1, date: today, location_id: 'granville', location_name: 'Granville Island', type: 'income', category: 'Daily Register Sales', description: 'Granville Island Saturday Counter Sales', subtotal: 2850.00, gst: 142.50, pst: 0.00, total: 2992.50 },
      { id: 2, date: today, location_id: 'hillcrest', location_name: 'Hillcrest Centre', type: 'income', category: 'Daily Register Sales', description: 'Hillcrest Centre Saturday Counter Sales', subtotal: 1940.00, gst: 97.00, pst: 0.00, total: 2037.00 },
      { id: 3, date: today, location_id: 'granville', location_name: 'Granville Island', type: 'expense', category: 'Dairy & Fresh Supplies', description: 'Avalon Fresh Milk Restock 4L jugs', subtotal: 240.00, gst: 0.00, pst: 0.00, total: 240.00 },
      { id: 4, date: today, location_id: 'hillcrest', location_name: 'Hillcrest Centre', type: 'expense', category: 'Bakery / Pastries', description: 'Morning Pastries & Croissants delivery', subtotal: 185.00, gst: 9.25, pst: 0.00, total: 194.25 },
      { id: 5, date: today, location_id: 'granville', location_name: 'Granville Island', type: 'expense', category: 'Store Maintenance', description: 'Espresso Machine gasket repair', subtotal: 120.00, gst: 6.00, pst: 8.40, total: 134.40 }
    ],
    employees: [
      { id: 1, name: 'Maya Lin', role: 'Head Roaster & Lead', primary_location: 'granville', hourly_rate: 22.50, sin: '743-123-890', vacation_pay_pct: 4.0 },
      { id: 2, name: 'Liam Campbell', role: 'Barista', primary_location: 'hillcrest', hourly_rate: 18.00, sin: '812-445-671', vacation_pay_pct: 4.0 },
      { id: 3, name: 'Sofia Chen', role: 'Barista / Cashier', primary_location: 'granville', hourly_rate: 17.50, sin: '901-234-567', vacation_pay_pct: 4.0 }
    ],
    inventory: [
      { id: 1, sku: 'COF-COL-GRN', name: 'Colombia Supremo (Green Beans)', category: 'Coffee Beans (Green)', unit: 'kg', supplier_name: 'Pacific Coast Coffee Traders', min_stock_level: 30, stock_granville: 45, stock_hillcrest: 15 },
      { id: 2, sku: 'COF-ETH-GRN', name: 'Ethiopia Yirgacheffe (Green Beans)', category: 'Coffee Beans (Green)', unit: 'kg', supplier_name: 'Pacific Coast Coffee Traders', min_stock_level: 20, stock_granville: 25, stock_hillcrest: 10 },
      { id: 3, sku: 'COF-PARROT-RST', name: 'Granville House Blend (12oz Bag)', category: 'Roasted Coffee', unit: 'bags', supplier_name: 'In-House Roastery', min_stock_level: 15, stock_granville: 34, stock_hillcrest: 22 },
      { id: 4, sku: 'DAIRY-WHOLE-4L', name: 'Avalon Organic Whole Milk 4L', category: 'Dairy & Milks', unit: 'litres', supplier_name: 'Avalon Dairy & Island Farms', min_stock_level: 20, stock_granville: 18, stock_hillcrest: 14 },
      { id: 5, sku: 'DAIRY-OAT-1L', name: 'Oatly Barista Edition 1L', category: 'Dairy & Milks', unit: 'cases', supplier_name: 'Avalon Dairy & Island Farms', min_stock_level: 8, stock_granville: 12, stock_hillcrest: 8 },
      { id: 6, sku: 'CUP-12OZ-COM', name: '12oz Compostable Hot Cups', category: 'Cups & Packaging', unit: 'units', supplier_name: 'EcoPack Vancouver', min_stock_level: 10, stock_granville: 20, stock_hillcrest: 15 }
    ],
    suppliers: [
      { id: 1, name: 'Pacific Coast Coffee Traders', category: 'Green Coffee Beans', contact_person: 'Dave Miller', phone: '(604) 879-1122', email: 'orders@pacificcoffeetraders.ca', payment_terms: 'Net 15' },
      { id: 2, name: 'Avalon Dairy & Island Farms', category: 'Dairy / Oat Milk', contact_person: 'Sarah Jenkins', phone: '(604) 434-2441', email: 'dairy@avalondairy.com', payment_terms: 'Weekly Delivery' },
      { id: 3, name: 'Bakers Market Fresh Co.', category: 'Bakery', contact_person: 'Marco Rossi', phone: '(604) 253-9090', email: 'orders@bakersmarket.ca', payment_terms: 'COD' },
      { id: 4, name: 'EcoPack Vancouver', category: 'Cups & Packaging', contact_person: 'Kenji Sato', phone: '(604) 321-7788', email: 'support@ecopackvan.com', payment_terms: 'Net 30' }
    ],
    receipts: [],
    payruns: []
  };
}

let db = JSON.parse(localStorage.getItem(DB_KEY) || 'null');
if (!db) { db = getDefaultDB(); localStorage.setItem(DB_KEY, JSON.stringify(db)); }
function syncDB() { localStorage.setItem(DB_KEY, JSON.stringify(db)); }

window.fetch = async function(url, opts = {}) {
  const urlStr = String(url);
  const qIdx = urlStr.indexOf('?');
  const path = qIdx !== -1 ? urlStr.substring(0, qIdx) : urlStr;
  const searchStr = qIdx !== -1 ? urlStr.substring(qIdx + 1) : '';
  const params = new URLSearchParams(searchStr);
  const method = (opts.method || 'GET').toUpperCase();

  if (path.includes('/api/dashboard/stats')) {
    const loc = params.get('location');
    const txs = db.transactions.filter(t => !loc || loc === 'all' || t.location_id === loc);
    let inc = 0, exp = 0, gstCol = 0, gstPaid = 0, pst = 0;
    txs.forEach(t => {
      if (t.type === 'income') { inc += t.subtotal; gstCol += t.gst; }
      else { exp += t.subtotal; gstPaid += t.gst; pst += t.pst; }
    });
    return new Response(JSON.stringify({
      totalIncome: inc, totalExpense: exp, netProfit: inc - exp,
      netGstRemittance: gstCol - gstPaid, totalPstPaid: pst,
      lowStockCount: db.inventory.filter(i => i.stock_granville <= i.min_stock_level || i.stock_hillcrest <= i.min_stock_level).length,
      activeEmployees: db.employees.length
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  if (path.includes('/api/transactions') && method === 'GET') {
    const loc = params.get('location');
    const filtered = db.transactions.filter(t => !loc || loc === 'all' || t.location_id === loc);
    return new Response(JSON.stringify(filtered), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }
  if (path.includes('/api/transactions') && method === 'POST') {
    const body = JSON.parse(opts.body);
    body.id = Date.now();
    body.location_name = body.location_id === 'granville' ? 'Granville Island' : 'Hillcrest Centre';
    body.total = body.subtotal + body.gst + body.pst;
    db.transactions.push(body);
    syncDB();
    return new Response(JSON.stringify({ success: true, id: body.id }), { status: 200 });
  }

  if (path.includes('/api/accounting/reports')) {
    const loc = params.get('location');
    const txs = db.transactions.filter(t => !loc || loc === 'all' || t.location_id === loc);
    let incMap = {}, expMap = {}, totInc = 0, totExp = 0, gstCol = 0, gstPaid = 0, pst = 0;
    txs.forEach(t => {
      if (t.type === 'income') {
        incMap[t.category] = (incMap[t.category] || 0) + t.subtotal;
        totInc += t.subtotal; gstCol += t.gst;
      } else {
        expMap[t.category] = (expMap[t.category] || 0) + t.subtotal;
        totExp += t.subtotal; gstPaid += t.gst; pst += t.pst;
      }
    });
    const incomeItems = Object.keys(incMap).map(k => ({ category: k, total: incMap[k] }));
    const expenseItems = Object.keys(expMap).map(k => ({ category: k, total: expMap[k] }));
    return new Response(JSON.stringify({
      incomeItems, expenseItems,
      summary: { totalRevenue: totInc, totalExpenses: totExp, netIncome: totInc - totExp, gstCollected: gstCol, gstPaidITCs: gstPaid, netGstOwed: gstCol - gstPaid, pstPaid: pst }
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  if (path.includes('/api/receipts') && method === 'GET') {
    return new Response(JSON.stringify(db.receipts), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }
  if (path.includes('/api/receipts/') && method === 'GET') {
    const id = path.split('/').pop();
    const r = db.receipts.find(x => x.id == id);
    return new Response(JSON.stringify(r || {}), { status: 200 });
  }
  if (path.includes('/api/receipts') && method === 'POST') {
    const body = JSON.parse(opts.body);
    const rcpt = { id: Date.now(), ...body, image_data: body.imageData };
    db.receipts.push(rcpt);
    db.transactions.push({
      id: Date.now() + 1, date: body.extracted_date, location_id: body.location_id,
      location_name: body.location_id === 'granville' ? 'Granville Island' : 'Hillcrest Centre',
      type: 'expense', category: 'Supplies', description: 'Receipt: ' + body.vendor,
      subtotal: body.subtotal, gst: body.gst, pst: body.pst, total: body.total
    });
    syncDB();
    return new Response(JSON.stringify({ success: true, receiptId: rcpt.id }), { status: 200 });
  }

  if (path.includes('/api/employees') && method === 'GET') {
    return new Response(JSON.stringify(db.employees), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }
  if (path.includes('/api/employees') && method === 'POST') {
    const body = JSON.parse(opts.body);
    body.id = Date.now();
    db.employees.push(body);
    syncDB();
    return new Response(JSON.stringify({ success: true, id: body.id }), { status: 200 });
  }

  if (path.includes('/api/payroll/calculate-preview')) {
    const { employeeId, regularHours, overtimeHours = 0 } = JSON.parse(opts.body);
    const emp = db.employees.find(e => e.id == employeeId);
    const rate = emp.hourly_rate;
    const base = regularHours * rate + overtimeHours * rate * 1.5;
    const vac = Math.round(base * 0.04 * 100) / 100;
    const gross = base + vac;
    const cpp = Math.round(Math.max(0, gross - (3500/26)) * 0.0595 * 100) / 100;
    const ei = Math.round(gross * 0.0164 * 100) / 100;
    const ann = gross * 26;
    const fed = Math.round(Math.max(0, (ann * 0.15) - (16129 * 0.15)) / 26 * 100) / 100;
    const bc = Math.round(Math.max(0, (ann * 0.0506) - (12852 * 0.0506)) / 26 * 100) / 100;
    const totDed = cpp + ei + fed + bc;
    return new Response(JSON.stringify({
      employee: emp,
      calculation: {
        grossWages: base, vacationPay: vac, grossPay: gross,
        cppDeduction: cpp, eiDeduction: ei, federalTax: fed, bcProvincialTax: bc,
        totalDeductions: totDed, netPay: gross - totDed, employerCpp: cpp, employerEi: Math.round(ei * 1.4 * 100) / 100
      }
    }), { status: 200 });
  }

  if (path.includes('/api/payroll/run')) {
    const { employeeId, locationId, payDate, regularHours, overtimeHours = 0 } = JSON.parse(opts.body);
    const emp = db.employees.find(e => e.id == employeeId);
    const base = regularHours * emp.hourly_rate + overtimeHours * emp.hourly_rate * 1.5;
    const vac = Math.round(base * 0.04 * 100) / 100;
    const gross = base + vac;
    const cpp = Math.round(Math.max(0, gross - (3500/26)) * 0.0595 * 100) / 100;
    const ei = Math.round(gross * 0.0164 * 100) / 100;
    const ann = gross * 26;
    const fed = Math.round(Math.max(0, (ann * 0.15) - (16129 * 0.15)) / 26 * 100) / 100;
    const bc = Math.round(Math.max(0, (ann * 0.0506) - (12852 * 0.0506)) / 26 * 100) / 100;
    const calc = { grossWages: base, vacationPay: vac, grossPay: gross, cppDeduction: cpp, eiDeduction: ei, federalTax: fed, bcProvincialTax: bc, netPay: gross - (cpp+ei+fed+bc), employerCpp: cpp, employerEi: Math.round(ei*1.4*100)/100 };
    db.payruns.push({ id: Date.now(), employee_id: emp.id, location_id: locationId, pay_date: payDate, gross_pay: gross, cpp_deduction: cpp, ei_deduction: ei, federal_tax: fed, bc_provincial_tax: bc, employer_cpp: cpp, employer_ei: Math.round(ei*1.4*100)/100 });
    db.transactions.push({ id: Date.now() + 2, date: payDate, location_id: locationId, location_name: locationId === 'granville' ? 'Granville Island' : 'Hillcrest Centre', type: 'expense', category: 'Payroll Wages & Benefits', description: 'Payroll: ' + emp.name, subtotal: gross + cpp + Math.round(ei*1.4*100)/100, gst: 0, pst: 0, total: gross + cpp + Math.round(ei*1.4*100)/100 });
    syncDB();
    return new Response(JSON.stringify({ success: true, calc }), { status: 200 });
  }

  if (path.includes('/api/payroll/t4-slips')) {
    const slips = [];
    db.employees.forEach(emp => {
      const runs = db.payruns.filter(p => p.employee_id == emp.id);
      if (runs.length > 0) {
        let b14=0, b16=0, b18=0, b22=0;
        runs.forEach(r => { b14 += r.gross_pay; b16 += r.cpp_deduction; b18 += r.ei_deduction; b22 += (r.federal_tax + r.bc_provincial_tax); });
        slips.push({
          taxYear: 2026,
          employer: { name: 'Blue Parrot Coffee Ltd.', businessNumber: '847291048 RP 0001' },
          employee: emp,
          boxes: { box14: b14, box16: b16, box18: b18, box22: b22, box24: b14, box26: b14 }
        });
      }
    });
    return new Response(JSON.stringify(slips), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  if (path.includes('/api/payroll/cra-remittance')) {
    let cpp = 0, ei = 0, tax = 0;
    db.payruns.forEach(r => { cpp += (r.cpp_deduction + r.employer_cpp); ei += (r.ei_deduction + r.employer_ei); tax += (r.federal_tax + r.bc_provincial_tax); });
    return new Response(JSON.stringify({
      year: 2026, month: 'Current Period', employerName: 'Blue Parrot Coffee Ltd.',
      craBusinessNumber: '847291048 RP 0001', totalCpp: cpp, totalEi: ei, incomeTax: tax, totalRemittance: cpp + ei + tax
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  if (path.includes('/api/inventory/transfer')) {
    const { item_id, from_location, to_location, quantity } = JSON.parse(opts.body);
    const item = db.inventory.find(i => i.id == item_id);
    const qty = parseFloat(quantity);
    if (item && from_location !== to_location && qty > 0) {
      if (from_location === 'granville') item.stock_granville = Math.max(0, item.stock_granville - qty);
      else item.stock_hillcrest = Math.max(0, item.stock_hillcrest - qty);
      if (to_location === 'granville') item.stock_granville += qty;
      else item.stock_hillcrest += qty;
      syncDB();
    }
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  }

  if (path.includes('/api/inventory')) {
    return new Response(JSON.stringify(db.inventory), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  if (path.includes('/api/suppliers')) {
    return new Response(JSON.stringify(db.suppliers), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  return new Response('{}', { status: 200 });
};

/**
 * Blue Parrot Coffee - Operations & ERP Frontend Controller
 */

let currentSelectedLocation = "all";
let cachedEmployees = [];
let cachedInventory = [];

document.addEventListener("DOMContentLoaded", () => {
  initLocationButtons();
  initNavTabs();
  initForms();
  initCameraInputs();

  // Load initial data
  refreshAllData();
});

// ==========================================
// NAVIGATION & TABS
// ==========================================
function initLocationButtons() {
  const buttons = document.querySelectorAll("#locationSelector .location-btn");
  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentSelectedLocation = btn.getAttribute("data-loc");
      refreshAllData();
    });
  });
}

function initNavTabs() {
  const tabs = document.querySelectorAll("nav.app-nav .nav-tab");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const tabId = tab.getAttribute("data-tab");
      switchTab(tabId);
    });
  });
}

function switchTab(tabId) {
  document.querySelectorAll("nav.app-nav .nav-tab").forEach(t => {
    t.classList.toggle("active", t.getAttribute("data-tab") === tabId);
  });
  document.querySelectorAll("section.tab-content").forEach(sec => {
    sec.style.display = (sec.id === tabId) ? "block" : "none";
  });

  if (tabId === "tab-accounting") loadAccountingReports();
  if (tabId === "tab-payroll") { loadPayrollModule(); loadT4Slips(); loadCraRemittance(); }
  if (tabId === "tab-inventory") loadInventory();
  if (tabId === "tab-suppliers") loadSuppliers();
  if (tabId === "tab-receipts") loadReceiptsArchive();
}

function refreshAllData() {
  loadDashboardStats();
  loadTransactions();
}

// ==========================================
// 1. DASHBOARD & TRANSACTIONS
// ==========================================
async function loadDashboardStats() {
  try {
    const res = await fetch(`/api/dashboard/stats?location=${currentSelectedLocation}`);
    const data = await res.json();

    document.getElementById("kpiRevenue").textContent = `$${data.totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    document.getElementById("kpiExpense").textContent = `$${data.totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    
    const kpiNet = document.getElementById("kpiNet");
    kpiNet.textContent = `$${data.netProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    kpiNet.style.color = data.netProfit >= 0 ? "var(--primary)" : "var(--danger)";

    document.getElementById("kpiGst").textContent = `$${data.netGstRemittance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
  } catch (err) {
    console.error("Failed to load dashboard stats:", err);
  }
}

async function loadTransactions() {
  try {
    const res = await fetch(`/api/transactions?location=${currentSelectedLocation}`);
    const list = await res.json();
    const tbody = document.getElementById("recentTransactionsTable");
    tbody.innerHTML = "";

    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: #999; padding: 2rem;">No entries found for this location.</td></tr>`;
      return;
    }

    list.forEach(tx => {
      const tr = document.createElement("tr");
      const locBadgeClass = tx.location_id === "granville" ? "badge-granville" : "badge-hillcrest";
      const typeBadgeClass = tx.type === "income" ? "badge-income" : "badge-expense";

      tr.innerHTML = `
        <td><strong>${tx.date}</strong></td>
        <td><span class="badge ${locBadgeClass}">${tx.location_name}</span></td>
        <td><span class="badge ${typeBadgeClass}">${tx.type.toUpperCase()}</span></td>
        <td>${tx.category}</td>
        <td>${tx.description || "-"}</td>
        <td>$${tx.subtotal.toFixed(2)}</td>
        <td>$${tx.gst.toFixed(2)}</td>
        <td>$${tx.pst.toFixed(2)}</td>
        <td><strong>$${tx.total.toFixed(2)}</strong></td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("Failed to load transactions:", err);
  }
}

// ==========================================
// 2. RECEIPT CAMERA & OCR CAPTURE
// ==========================================
function initCameraInputs() {
  const cameraInput = document.getElementById("cameraInput");
  const fileInput = document.getElementById("fileInput");

  cameraInput.addEventListener("change", (e) => {
    if (e.target.files && e.target.files[0]) processReceiptFile(e.target.files[0]);
  });
  fileInput.addEventListener("change", (e) => {
    if (e.target.files && e.target.files[0]) processReceiptFile(e.target.files[0]);
  });
}

function resetReceiptForm() {
  document.getElementById("saveReceiptForm").reset();
  document.getElementById("receiptFormContainer").style.display = "none";
  window._currentReceiptBase64 = null;
}

async function loadReceiptsArchive() {
  try {
    const res = await fetch(`/api/receipts?location=${currentSelectedLocation}`);
    const receipts = await res.json();
    const tbody = document.getElementById("receiptsTableBody");
    tbody.innerHTML = "";

    receipts.forEach(r => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>#${r.id}</td>
        <td><span class="badge ${r.location_id === 'granville' ? 'badge-granville' : 'badge-hillcrest'}">${r.location_id}</span></td>
        <td>${r.extracted_date}</td>
        <td><strong>${r.vendor}</strong></td>
        <td>${r.notes || "-"}</td>
        <td><strong>$${r.total.toFixed(2)}</strong></td>
        <td>
          <button class="btn btn-secondary" style="padding: 4px 8px; font-size: 0.75rem;" onclick="viewReceiptImage(${r.id})">?? View Photo</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("Failed loading receipts:", err);
  }
}

async function viewReceiptImage(id) {
  try {
    const res = await fetch(`/api/receipts/${id}`);
    const receipt = await res.json();
    if (receipt.image_data) {
      document.getElementById("receiptModalTitle").textContent = `${receipt.vendor} - ${receipt.extracted_date} ($${receipt.total.toFixed(2)})`;
      document.getElementById("receiptFullImage").src = receipt.image_data;
      document.getElementById("receiptImageModal").classList.add("active");
    } else {
      alert("No image data attached to this receipt.");
    }
  } catch (err) {
    alert("Could not load receipt image.");
  }
}

// ==========================================
// 3. ACCOUNTING & P&L
// ==========================================
async function loadAccountingReports() {
  const year = document.getElementById("acctReportYear").value;
  try {
    const res = await fetch(`/api/accounting/reports?location=${currentSelectedLocation}&year=${year}`);
    const data = await res.json();

    const incBody = document.querySelector("#plIncomeTable tbody");
    incBody.innerHTML = "";
    data.incomeItems.forEach(i => {
      incBody.innerHTML += `<tr><td>${i.category}</td><td style="text-align: right; font-weight: 700; color: #065f46;">$${i.total.toFixed(2)}</td></tr>`;
    });
    incBody.innerHTML += `<tr style="border-top: 2px solid #000; font-weight: 800;"><td>Total Revenue</td><td style="text-align: right;">$${data.summary.totalRevenue.toFixed(2)}</td></tr>`;

    const expBody = document.querySelector("#plExpenseTable tbody");
    expBody.innerHTML = "";
    data.expenseItems.forEach(e => {
      expBody.innerHTML += `<tr><td>${e.category}</td><td style="text-align: right; font-weight: 700; color: #991b1b;">$${e.total.toFixed(2)}</td></tr>`;
    });
    expBody.innerHTML += `<tr style="border-top: 2px solid #000; font-weight: 800;"><td>Total Operating Expenses</td><td style="text-align: right;">$${data.summary.totalExpenses.toFixed(2)}</td></tr>`;

    document.getElementById("taxGstCollected").textContent = `$${data.summary.gstCollected.toFixed(2)}`;
    document.getElementById("taxGstPaid").textContent = `$${data.summary.gstPaidITCs.toFixed(2)}`;
    document.getElementById("taxNetGst").textContent = `$${data.summary.netGstOwed.toFixed(2)}`;
    document.getElementById("taxPstPaid").textContent = `$${data.summary.pstPaid.toFixed(2)}`;
  } catch (err) {
    console.error("Failed loading P&L reports:", err);
  }
}

// ==========================================
// 4. CANADIAN PAYROLL & T4s
// ==========================================
async function loadPayrollModule() {
  try {
    const res = await fetch("/api/employees");
    cachedEmployees = await res.json();
    const select = document.getElementById("payEmployeeSelect");
    select.innerHTML = "";

    cachedEmployees.forEach(emp => {
      const opt = document.createElement("option");
      opt.value = emp.id;
      opt.textContent = `${emp.name} (${emp.role} - $${emp.hourly_rate.toFixed(2)}/hr)`;
      select.appendChild(opt);
    });

    // Set default dates
    const today = new Date();
    const end = today.toISOString().split("T")[0];
    const prevTwoWeeks = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);
    const start = prevTwoWeeks.toISOString().split("T")[0];

    document.getElementById("payPeriodStart").value = start;
    document.getElementById("payPeriodEnd").value = end;
    document.getElementById("payDate").value = end;

    updatePayRatePreview();
  } catch (err) {
    console.error("Failed loading employees for payroll:", err);
  }
}

function updatePayRatePreview() {
  const empId = document.getElementById("payEmployeeSelect").value;
  const emp = cachedEmployees.find(e => e.id == empId);
  if (emp) {
    document.getElementById("payHourlyWage").value = `$${emp.hourly_rate.toFixed(2)} / hour`;
    document.getElementById("payLocationSelect").value = emp.primary_location;
    previewPayrollStub();
  }
}

async function previewPayrollStub() {
  const empId = document.getElementById("payEmployeeSelect").value;
  const regHours = document.getElementById("payRegHours").value || 0;
  const otHours = document.getElementById("payOtHours").value || 0;

  if (!empId) return;

  try {
    const res = await fetch("/api/payroll/calculate-preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employeeId: empId, regularHours: regHours, overtimeHours: otHours })
    });
    const { employee, calculation } = await res.json();

    const previewDiv = document.getElementById("livePaystubPreview");
    previewDiv.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #ccc; padding-bottom: 6px; margin-bottom: 8px;">
        <div>
          <strong>${employee.name}</strong>  ${employee.role}
          <div style="font-size: 0.75rem; color: #666;">SIN: ${employee.sin || "###-###-###"} | Province: British Columbia</div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 0.8rem; color: #666;">Net Take-Home Pay</div>
          <div style="font-size: 1.3rem; font-weight: 800; color: #10b981;">$${calculation.netPay.toFixed(2)}</div>
        </div>
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px; font-size: 0.82rem;">
        <div>Gross Wages: <strong>$${calculation.grossWages.toFixed(2)}</strong></div>
        <div>Vacation (4%): <strong>$${calculation.vacationPay.toFixed(2)}</strong></div>
        <div>Gross Pay: <strong>$${calculation.grossPay.toFixed(2)}</strong></div>
        <div>CPP (5.95%): <strong style="color: #b91c1c;">-$${calculation.cppDeduction.toFixed(2)}</strong></div>
        <div>EI (1.64%): <strong style="color: #b91c1c;">-$${calculation.eiDeduction.toFixed(2)}</strong></div>
        <div>Fed + BC Tax: <strong style="color: #b91c1c;">-$${(calculation.federalTax + calculation.bcProvincialTax).toFixed(2)}</strong></div>
        <div>Employer CPP/EI: <strong>+$${(calculation.employerCpp + calculation.employerEi).toFixed(2)}</strong></div>
      </div>
    `;
  } catch (err) {
    console.error("Preview calculation failed:", err);
  }
}

async function loadT4Slips() {
  const year = document.getElementById("t4YearSelect").value;
  try {
    const res = await fetch(`/api/payroll/t4-slips?year=${year}`);
    const slips = await res.json();
    const container = document.getElementById("t4SlipsContainer");
    container.innerHTML = "";

    if (slips.length === 0) {
      container.innerHTML = `<p style="color: #888; font-style: italic;">No pay runs recorded yet for calendar year ${year}. Once you record payroll, T4 slips will auto-generate here.</p>`;
      return;
    }

    slips.forEach(t4 => {
      const div = document.createElement("div");
      div.className = "t4-slip-container";
      div.innerHTML = `
        <div class="t4-header">
          <div>
            <div style="font-size: 1.1rem; font-weight: 800;">${t4.employer.name}</div>
            <div style="font-size: 0.75rem; color: #555;">CRA BN: ${t4.employer.businessNumber}  Vancouver, BC</div>
            <div style="margin-top: 6px;"><strong>Employee: ${t4.employee.name}</strong> (SIN: ${t4.employee.sin || '###-###-###'})</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 1.4rem; font-weight: 900;">T4 / ${t4.taxYear}</div>
            <div style="font-size: 0.7rem; color: #555;">Statement of Remuneration Paid</div>
          </div>
        </div>
        <div class="t4-grid">
          <div class="t4-box">
            <div class="t4-box-number">Box 14</div>
            <div class="t4-box-label">Employment Income</div>
            <div class="t4-box-value">$${t4.boxes.box14.toFixed(2)}</div>
          </div>
          <div class="t4-box">
            <div class="t4-box-number">Box 16</div>
            <div class="t4-box-label">Employee's CPP Contributions</div>
            <div class="t4-box-value">$${t4.boxes.box16.toFixed(2)}</div>
          </div>
          <div class="t4-box">
            <div class="t4-box-number">Box 18</div>
            <div class="t4-box-label">Employee's EI Premiums</div>
            <div class="t4-box-value">$${t4.boxes.box18.toFixed(2)}</div>
          </div>
          <div class="t4-box">
            <div class="t4-box-number">Box 22</div>
            <div class="t4-box-label">Income Tax Deducted (Fed + BC)</div>
            <div class="t4-box-value">$${t4.boxes.box22.toFixed(2)}</div>
          </div>
          <div class="t4-box">
            <div class="t4-box-number">Box 24</div>
            <div class="t4-box-label">EI Insurable Earnings</div>
            <div class="t4-box-value">$${t4.boxes.box24.toFixed(2)}</div>
          </div>
          <div class="t4-box">
            <div class="t4-box-number">Box 26</div>
            <div class="t4-box-label">CPP Pensionable Earnings</div>
            <div class="t4-box-value">$${t4.boxes.box26.toFixed(2)}</div>
          </div>
        </div>
        <div style="text-align: right; margin-top: 10px;">
          <button class="btn btn-secondary" style="font-size: 0.75rem;" onclick="window.print()">??? Print Employee T4</button>
        </div>
      `;
      container.appendChild(div);
    });
  } catch (err) {
    console.error("Failed loading T4 slips:", err);
  }
}

async function loadCraRemittance() {
  try {
    const res = await fetch("/api/payroll/cra-remittance");
    const data = await res.json();
    const div = document.getElementById("craRemittanceContent");
    div.innerHTML = `
      <div class="form-row">
        <div>
          <div style="font-size: 0.8rem; color: #666;">Total CPP (Employee + Employer):</div>
          <div style="font-size: 1.15rem; font-weight: 700;">$${data.totalCpp.toFixed(2)}</div>
        </div>
        <div>
          <div style="font-size: 0.8rem; color: #666;">Total EI (Employee + 1.4x Employer):</div>
          <div style="font-size: 1.15rem; font-weight: 700;">$${data.totalEi.toFixed(2)}</div>
        </div>
        <div>
          <div style="font-size: 0.8rem; color: #666;">Income Tax Deducted:</div>
          <div style="font-size: 1.15rem; font-weight: 700;">$${data.incomeTax.toFixed(2)}</div>
        </div>
        <div>
          <div style="font-size: 0.8rem; color: #666;">Total Amount to Remit to CRA:</div>
          <div style="font-size: 1.3rem; font-weight: 800; color: #1e3a8a;">$${data.totalRemittance.toFixed(2)}</div>
        </div>
      </div>
      <p style="font-size: 0.75rem; color: #888; margin-top: 8px;">
        Payable to: Receiver General for Canada (Business Number: ${data.craBusinessNumber}) by the 15th of the month via online banking.
      </p>
    `;
  } catch (err) {
    console.error("Failed loading CRA remittance:", err);
  }
}

// ==========================================
// 5. INVENTORY & STOCK
// ==========================================
async function loadInventory() {
  try {
    const res = await fetch("/api/inventory");
    cachedInventory = await res.json();
    const tbody = document.getElementById("inventoryTableBody");
    tbody.innerHTML = "";

    cachedInventory.forEach(item => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><code>${item.sku}</code></td>
        <td><strong>${item.name}</strong></td>
        <td>${item.category}</td>
        <td>${item.supplier_name || "-"}</td>
        <td><span style="font-weight: 700; color: #1e3a8a;">${item.stock_granville} ${item.unit}</span></td>
        <td><span style="font-weight: 700; color: #b45309;">${item.stock_hillcrest} ${item.unit}</span></td>
        <td>${item.min_stock_level} ${item.unit}</td>
        <td>${item.unit}</td>
      `;
      tbody.appendChild(tr);
    });

    // Populate transfer dropdown
    const transferSelect = document.getElementById("transferItemSelect");
    if (transferSelect) {
      transferSelect.innerHTML = "";
      cachedInventory.forEach(i => {
        transferSelect.innerHTML += `<option value="${i.id}">${i.name} (Granville: ${i.stock_granville}, Hillcrest: ${i.stock_hillcrest})</option>`;
      });
    }
  } catch (err) {
    console.error("Failed loading inventory:", err);
  }
}

// ==========================================
// 6. SUPPLIERS
// ==========================================
async function loadSuppliers() {
  try {
    const res = await fetch("/api/suppliers");
    const list = await res.json();
    const tbody = document.getElementById("suppliersTableBody");
    tbody.innerHTML = "";

    list.forEach(s => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong>${s.name}</strong></td>
        <td>${s.category}</td>
        <td>${s.contact_person || "-"}</td>
        <td>${s.phone || "-"}</td>
        <td>${s.email || "-"}</td>
        <td><span class="badge" style="background: #e2e8f0;">${s.payment_terms}</span></td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("Failed loading suppliers:", err);
  }
}

// ==========================================
// FORMS & MODALS SUBMISSION
// ==========================================
function initForms() {
  // Receipt Save Form
  document.getElementById("saveReceiptForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const body = {
      location_id: document.getElementById("rcptLocation").value,
      vendor: document.getElementById("rcptVendor").value,
      extracted_date: document.getElementById("rcptDate").value,
      subtotal: document.getElementById("rcptSubtotal").value,
      gst: document.getElementById("rcptGst").value,
      pst: document.getElementById("rcptPst").value,
      total: document.getElementById("rcptTotal").value,
      notes: document.getElementById("rcptNotes").value,
      imageData: window._currentReceiptBase64 || ""
    };

    const res = await fetch("/api/receipts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (res.ok) {
      alert("? Receipt saved and expense recorded in general ledger!");
      resetReceiptForm();
      loadReceiptsArchive();
      refreshAllData();
    }
  });

  // Daily Sales Form
  document.getElementById("salesForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const subtotal = parseFloat(document.getElementById("salesSubtotal").value) || 0;
    const gst = parseFloat(document.getElementById("salesGst").value) || 0;

    const body = {
      date: document.getElementById("salesDate").value,
      location_id: document.getElementById("salesLocation").value,
      type: "income",
      category: "Daily Register Sales",
      description: document.getElementById("salesDesc").value || "Daily POS Settlements",
      subtotal,
      gst,
      pst: 0,
      payment_method: "POS / Cards"
    };

    const res = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (res.ok) {
      alert("? Daily sales recorded!");
      closeModal("salesModal");
      refreshAllData();
    }
  });

  // Payroll Run Submission
  document.getElementById("payrollRunForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const body = {
      employeeId: document.getElementById("payEmployeeSelect").value,
      locationId: document.getElementById("payLocationSelect").value,
      payPeriodStart: document.getElementById("payPeriodStart").value,
      payPeriodEnd: document.getElementById("payPeriodEnd").value,
      payDate: document.getElementById("payDate").value,
      regularHours: document.getElementById("payRegHours").value,
      overtimeHours: document.getElementById("payOtHours").value
    };

    const res = await fetch("/api/payroll/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (res.ok) {
      const data = await res.json();
      alert(`? Payroll successfully recorded! Net Pay to Barista: $${data.calc.netPay.toFixed(2)}`);
      loadT4Slips();
      loadCraRemittance();
      refreshAllData();
    }
  });

  // Stock Transfer Form
  document.getElementById("transferForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const body = {
      item_id: document.getElementById("transferItemSelect").value,
      from_location: document.getElementById("transferFrom").value,
      to_location: document.getElementById("transferTo").value,
      quantity: document.getElementById("transferQty").value
    };

    const res = await fetch("/api/inventory/transfer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (res.ok) {
      alert("? Stock transferred between stores!");
      closeModal("transferModal");
      loadInventory();
    }
  });

  // Add Employee Form
  document.getElementById("addEmployeeForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const body = {
      name: document.getElementById("empName").value,
      role: document.getElementById("empRole").value,
      primary_location: document.getElementById("empLoc").value,
      hourly_rate: document.getElementById("empWage").value,
      sin: document.getElementById("empSin").value
    };

    const res = await fetch("/api/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (res.ok) {
      alert("? Employee profile saved!");
      closeModal("employeeModal");
      loadPayrollModule();
    }
  });
}

function openSalesModal() {
  document.getElementById("salesDate").value = new Date().toISOString().split("T")[0];
  document.getElementById("salesLocation").value = currentSelectedLocation === "hillcrest" ? "hillcrest" : "granville";
  document.getElementById("salesModal").classList.add("active");
}

function openTransferModal() {
  loadInventory();
  document.getElementById("transferModal").classList.add("active");
}

function openNewEmployeeModal() {
  document.getElementById("employeeModal").classList.add("active");
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove("active");
}

function calcSalesTotals() {
  const sub = parseFloat(document.getElementById("salesSubtotal").value) || 0;
  const gst = Math.round(sub * 0.05 * 100) / 100;
  document.getElementById("salesGst").value = gst.toFixed(2);
  document.getElementById("salesTotal").value = (sub + gst).toFixed(2);
}
