let spendingChart = null;
let trendsChart = null;

window.loadCharts = async function () {
  await loadSpendingChart();
  await loadTrendsChart();
};

async function loadSpendingChart() {
  const res = await fetch(`${API_URL}/transactions/spending-by-category`, { headers: authHeaders() });
  const data = await res.json();

  const labels = data.map((x) => x._id);
  const values = data.map((x) => x.total);

  const ctx = document.getElementById("spendingChart").getContext("2d");
  if (spendingChart) spendingChart.destroy();

  spendingChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels,
      datasets: [{ data: values }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });
}

async function loadTrendsChart() {
  const res = await fetch(`${API_URL}/transactions/monthly-trends`, { headers: authHeaders() });
  const data = await res.json();

  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const incomeData = new Array(12).fill(0);
  const expenseData = new Array(12).fill(0);

  data.forEach((item) => {
    const idx = item._id.month - 1;
    if (item._id.type === "income") incomeData[idx] = item.total;
    else expenseData[idx] = item.total;
  });

  const ctx = document.getElementById("trendsChart").getContext("2d");
  if (trendsChart) trendsChart.destroy();

  trendsChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: months,
      datasets: [
        { label: "Income", data: incomeData, fill: true, tension: 0.3 },
        { label: "Expense", data: expenseData, fill: true, tension: 0.3 }
      ]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });
}
