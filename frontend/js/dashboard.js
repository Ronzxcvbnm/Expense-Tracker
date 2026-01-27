window.loadDashboard = async function () {
  await loadSummary();
  await loadRecentTransactions();
  await loadBudgets();
  await window.loadCharts();
};

async function loadSummary() {
  const res = await fetch(`${API_URL}/transactions/summary`, { headers: authHeaders() });
  const data = await res.json();

  document.getElementById("totalBalance").textContent = `$${Number(data.balance || 0).toFixed(2)}`;
  document.getElementById("totalIncome").textContent = `$${Number(data.income || 0).toFixed(2)}`;
  document.getElementById("totalExpenses").textContent = `$${Number(data.expenses || 0).toFixed(2)}`;
}

async function loadRecentTransactions() {
  const res = await fetch(`${API_URL}/transactions`, { headers: authHeaders() });
  const txs = await res.json();

  const tbody = document.querySelector("#recentTransactionsTable tbody");
  tbody.innerHTML = "";

  txs.slice(0, 5).forEach((t) => {
    const row = document.createElement("tr");
    const date = new Date(t.date).toLocaleDateString();
    const amount = t.type === "income" ? `+$${t.amount.toFixed(2)}` : `-$${t.amount.toFixed(2)}`;

    row.innerHTML = `
      <td>${date}</td>
      <td>${t.category}</td>
      <td class="${t.type === "income" ? "amount-positive" : "amount-negative"}">${amount}</td>
      <td><span class="badge ${t.type}">${t.type}</span></td>
    `;
    tbody.appendChild(row);
  });
}

window.loadAllTransactions = async function () {
  const res = await fetch(`${API_URL}/transactions`, { headers: authHeaders() });
  const txs = await res.json();

  const tbody = document.querySelector("#allTransactionsTable tbody");
  tbody.innerHTML = "";

  txs.forEach((t) => {
    const row = document.createElement("tr");
    const date = new Date(t.date).toLocaleDateString();
    const amount = t.type === "income" ? `+$${t.amount.toFixed(2)}` : `-$${t.amount.toFixed(2)}`;

    row.innerHTML = `
      <td>${date}</td>
      <td>${t.category}</td>
      <td>${t.description || "-"}</td>
      <td class="${t.type === "income" ? "amount-positive" : "amount-negative"}">${amount}</td>
      <td><span class="badge ${t.type}">${t.type}</span></td>
      <td>
        <button class="action-btn" onclick="deleteTransaction('${t._id}')">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    `;
    tbody.appendChild(row);
  });
};

async function loadBudgets() {
  const res = await fetch(`${API_URL}/budgets`, { headers: authHeaders() });
  const budgets = await res.json();

  const txRes = await fetch(`${API_URL}/transactions`, { headers: authHeaders() });
  const txs = await txRes.json();

  const budgetsWithSpent = budgets.map((b) => {
    const spent = txs
      .filter((t) => t.type === "expense" && t.category === b.category)
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
    return { ...b, spent };
  });

  renderBudgets(budgetsWithSpent, "budgetCards");
}

window.loadManageBudgetPage = async function () {
  const res = await fetch(`${API_URL}/budgets`, { headers: authHeaders() });
  const budgets = await res.json();

  const txRes = await fetch(`${API_URL}/transactions`, { headers: authHeaders() });
  const txs = await txRes.json();

  const budgetsWithSpent = budgets.map((b) => {
    const spent = txs
      .filter((t) => t.type === "expense" && t.category === b.category)
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
    return { ...b, spent };
  });

  renderBudgets(budgetsWithSpent, "manageBudgetCards");
};

window.loadCategoriesPage = async function () {
  const res = await fetch(`${API_URL}/categories`, { headers: authHeaders() });
  const categories = await res.json();

  const grid = document.getElementById("categoriesGrid");
  grid.innerHTML = "";

  categories.forEach((cat) => {
    const div = document.createElement("div");
    div.className = "category-item";
    div.style.borderLeftColor = cat.color;

    div.innerHTML = `
      <div class="category-info">
        <span class="category-icon">${cat.icon}</span>
        <div>
          <div class="category-name">${cat.name}</div>
          <div class="category-color">${cat.color}</div>
        </div>
      </div>
      <button class="delete-category-btn" onclick="deleteCategory('${cat._id}')">
        <i class="fas fa-trash"></i>
      </button>
    `;
    grid.appendChild(div);
  });
};

function renderBudgets(budgets, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  budgets.forEach((b) => {
    const allocated = Number(b.allocated || 0);
    const spent = Number(b.spent || 0);
    const remaining = allocated - spent;
    const percent = allocated > 0 ? (spent / allocated) * 100 : 0;

    const card = document.createElement("div");
    card.className = "card budget-card";

    card.innerHTML = `
      <div class="budget-card-header">
        <h4>${b.category}</h4>
        <button class="edit-budget-btn" onclick="editBudget('${b._id}', '${b.category}', ${allocated})">
          <i class="fas fa-pencil"></i>
        </button>
      </div>

      <div class="budget-info">
        <div class="budget-row"><span>Allocated:</span><span>$${allocated.toFixed(2)}</span></div>
        <div class="budget-row"><span>Spent:</span><span class="amount-spent">$${spent.toFixed(2)}</span></div>
        <div class="budget-row"><span>Remaining:</span><span class="amount-remaining">$${remaining.toFixed(2)}</span></div>
      </div>

      <div class="progress-bar">
        <div class="progress-fill blue" style="width:${Math.min(percent, 100)}%"></div>
      </div>

      <p class="progress-text">${percent.toFixed(0)}% used</p>
    `;
    container.appendChild(card);
  });
}

window.editBudget = function (id, category, allocated) {
  document.getElementById("editBudgetId").value = id;
  document.getElementById("editBudgetCategory").textContent = category;
  document.getElementById("editBudgetAmount").value = allocated;
  openModal("editBudget");
};
