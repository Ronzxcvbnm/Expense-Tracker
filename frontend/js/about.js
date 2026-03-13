(function () {
  const form = document.getElementById("suggestionForm");
  if (!form) return;

  const msgEl = document.getElementById("suggestionMsg");

  function showMessage(message, isError = false) {
    if (!msgEl) return;
    msgEl.textContent = message || "";
    msgEl.classList.toggle("error", Boolean(isError));
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    showMessage("");

    const messageEl = document.getElementById("suggestionMessage");
    const typeEl = document.getElementById("suggestionType");
    const nameEl = document.getElementById("suggestionName");
    const emailEl = document.getElementById("suggestionEmail");

    const message = (messageEl?.value || "").trim();
    if (!message) return showMessage("Please write a suggestion before submitting.", true);

    const payload = {
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      type: (typeEl?.value || "suggestion").trim(),
      name: (nameEl?.value || "").trim(),
      email: (emailEl?.value || "").trim(),
      message,
      createdAt: new Date().toISOString()
    };

    try {
      const key = "expense_tracker_suggestions";
      const existing = JSON.parse(localStorage.getItem(key) || "[]");
      existing.unshift(payload);
      localStorage.setItem(key, JSON.stringify(existing.slice(0, 50)));
      form.reset();
      showMessage("Thanks! Your suggestion was saved on this device.");
    } catch {
      showMessage("Unable to save your suggestion on this device.", true);
    }
  });
})();
