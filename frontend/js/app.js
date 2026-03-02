// GLOBALS
window.API_URL = "http://localhost:5000/api";
const phpFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

window.formatCurrency = function (value) {
  return phpFormatter.format(Number(value || 0));
};

window.formatSignedCurrency = function (value) {
  const amount = Number(value || 0);
  const abs = window.formatCurrency(Math.abs(amount));
  if (amount > 0) return `+${abs}`;
  if (amount < 0) return `-${abs}`;
  return abs;
};

const token = localStorage.getItem("token");
if (!token) window.location.href = "index.html";

window.authHeaders = function (extra = {}) {
  return { ...extra, Authorization: `Bearer ${localStorage.getItem("token")}` };
};

// Logout
document.querySelector(".menu-item.logout").addEventListener("click", () => {
  if (!confirm("Logout?")) return;
  localStorage.removeItem("token");
  localStorage.removeItem("userName");
  window.location.href = "index.html";
});

// Navigation
const menuItems = document.querySelectorAll(".menu-item[data-page]");
const pages = document.querySelectorAll(".page");

menuItems.forEach((item) => {
  item.addEventListener("click", () => {
    const pageName = item.getAttribute("data-page");

    menuItems.forEach((mi) => mi.classList.remove("active"));
    pages.forEach((p) => p.classList.remove("active"));

    item.classList.add("active");
    document.getElementById(`${pageName}-page`).classList.add("active");

    loadPageData(pageName);
  });
});

function loadPageData(pageName) {
  if (pageName === "dashboard") window.loadDashboard();
  if (pageName === "transactions") window.loadAllTransactions();
  if (pageName === "manage-budget") window.loadManageBudgetPage();
  if (pageName === "add-category") window.loadCategoriesPage();
}

// Modals
const modals = {
  addExpense: document.getElementById("addExpenseModal"),
  inputIncome: document.getElementById("inputIncomeModal"),
  editBudget: document.getElementById("editBudgetModal"),
  addSavings: document.getElementById("addSavingsModal")
};

window.openModal = function (name) { modals[name].classList.add("active"); };
window.closeModal = function (name) { modals[name].classList.remove("active"); };

document.querySelectorAll(".close, .close-modal").forEach((btn) => {
  btn.addEventListener("click", function () {
    this.closest(".modal").classList.remove("active");
  });
});

Object.values(modals).forEach((modal) => {
  modal.addEventListener("click", function (e) {
    if (e.target === this) this.classList.remove("active");
  });
});

// Buttons
document.getElementById("addExpenseBtn").addEventListener("click", async () => {
  await loadCategoriesIntoSelect();
  openModal("addExpense");
});
document.getElementById("inputIncomeBtn").addEventListener("click", () => openModal("inputIncome"));
document.getElementById("addSavingsBtn").addEventListener("click", () => openModal("addSavings"));

// Default dates
const today = new Date().toISOString().split("T")[0];
document.getElementById("expenseDate").value = today;
document.getElementById("incomeDate").value = today;
document.getElementById("savingsDate").value = today;

async function loadCategoriesIntoSelect() {
  const res = await fetch(`${API_URL}/categories`, { headers: authHeaders() });
  const categories = await res.json();

  const select = document.getElementById("expenseCategory");
  select.innerHTML = `<option value="">Select Category</option>`;

  categories.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c.name;
    opt.textContent = `${c.icon} ${c.name}`;
    select.appendChild(opt);
  });
}

// Add Expense
document.getElementById("addExpenseForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    category: document.getElementById("expenseCategory").value,
    amount: Number(document.getElementById("expenseAmount").value),
    type: "expense",
    description: document.getElementById("expenseDescription").value,
    date: document.getElementById("expenseDate").value
  };

  const res = await fetch(`${API_URL}/transactions`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(data)
  });

  const out = await res.json();
  if (!res.ok) return alert(out.message || "Failed to add expense");

  closeModal("addExpense");
  e.target.reset();
  document.getElementById("expenseDate").value = today;
  window.loadDashboard();
});

// Add Income
document.getElementById("inputIncomeForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    category: document.getElementById("incomeSource").value,
    amount: Number(document.getElementById("incomeAmount").value),
    type: "income",
    description: "Monthly income",
    date: document.getElementById("incomeDate").value
  };

  const res = await fetch(`${API_URL}/transactions`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(data)
  });

  const out = await res.json();
  if (!res.ok) return alert(out.message || "Failed to add income");

  closeModal("inputIncome");
  e.target.reset();
  document.getElementById("incomeDate").value = today;
  window.loadDashboard();
});

// Add Savings (expense)
document.getElementById("addSavingsForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    category: "Savings",
    amount: Number(document.getElementById("savingsAmount").value),
    type: "expense",
    description: document.getElementById("savingsNote").value || "Savings",
    date: document.getElementById("savingsDate").value
  };

  const res = await fetch(`${API_URL}/transactions`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(data)
  });

  const out = await res.json();
  if (!res.ok) return alert(out.message || "Failed to add savings");

  closeModal("addSavings");
  e.target.reset();
  document.getElementById("savingsDate").value = today;
  window.loadDashboard();
});

// Edit Budget submit
document.getElementById("editBudgetForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("editBudgetId").value;
  const allocated = Number(document.getElementById("editBudgetAmount").value);

  const res = await fetch(`${API_URL}/budgets/${id}`, {
    method: "PUT",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ allocated })
  });

  const out = await res.json();
  if (!res.ok) return alert(out.message || "Failed to update budget");

  closeModal("editBudget");
  window.loadDashboard();
});

// Set Budget (create/update by category)
document.getElementById("setBudgetForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const category = document.getElementById("budgetCategory").value;
  const allocated = Number(document.getElementById("budgetAllocated").value);

  if (!category) return alert("Please select a category");
  if (!Number.isFinite(allocated) || allocated < 0) return alert("Please enter a valid budget amount");

  const res = await fetch(`${API_URL}/budgets`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ category, allocated })
  });

  const out = await res.json();
  if (!res.ok) return alert(out.message || "Failed to save budget");

  e.target.reset();
  if (typeof window.loadManageBudgetPage === "function") await window.loadManageBudgetPage();
  if (typeof window.loadDashboard === "function") await window.loadDashboard();
});

// Add Category
document.getElementById("addCategoryForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    name: document.getElementById("categoryName").value,
    color: document.getElementById("categoryColor").value,
    icon: document.getElementById("categoryIcon").value
  };

  const res = await fetch(`${API_URL}/categories`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(data)
  });

  const out = await res.json();
  if (!res.ok) return alert(out.message || "Failed to add category");

  e.target.reset();
  window.loadCategoriesPage();
});

// Delete helpers (global)
window.deleteCategory = async function (id) {
  if (!confirm("Delete category?")) return;

  const res = await fetch(`${API_URL}/categories/${id}`, {
    method: "DELETE",
    headers: authHeaders()
  });

  const out = await res.json();
  if (!res.ok) return alert(out.message || "Failed to delete category");

  window.loadCategoriesPage();
};

window.deleteTransaction = async function (id) {
  if (!confirm("Delete transaction?")) return;

  const res = await fetch(`${API_URL}/transactions/${id}`, {
    method: "DELETE",
    headers: authHeaders()
  });

  const out = await res.json();
  if (!res.ok) return alert(out.message || "Failed to delete transaction");

  window.loadAllTransactions();
  window.loadDashboard();
};

// Export CSV
document.getElementById("exportData").addEventListener("click", async () => {
  const res = await fetch(`${API_URL}/transactions`, { headers: authHeaders() });
  const txs = await res.json();

  const rows = [
    ["date", "type", "category", "amount", "description"],
    ...txs.map(t => [
      new Date(t.date).toISOString(),
      t.type,
      t.category,
      t.amount,
      (t.description || "").replaceAll(",", " ")
    ])
  ];

  const csv = rows.map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "expense-tracker-data.csv";
  a.click();

  URL.revokeObjectURL(url);
});

// Export PDF quick
document.getElementById("exportTransactionsBtn")?.addEventListener("click", () => window.print());

// Seed default categories per-user (NO budgets, NO money)
document.addEventListener("DOMContentLoaded", async () => {
  const catsRes = await fetch(`${API_URL}/categories`, { headers: authHeaders() });
  const cats = await catsRes.json();

  if (cats.length === 0) {
    const defaults = [
      { name: "Food", color: "#3B82F6", icon: "🍔" },
      { name: "Transportation", color: "#10B981", icon: "🚗" },
      { name: "Loan", color: "#EF4444", icon: "💰" },
      { name: "Savings", color: "#F59E0B", icon: "💎" }
    ];

    for (const c of defaults) {
      await fetch(`${API_URL}/categories`, {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(c)
      });
    }
  }

  window.loadDashboard();
});
