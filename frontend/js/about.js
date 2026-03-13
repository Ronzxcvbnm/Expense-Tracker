(function () {
  const form = document.getElementById("suggestionForm");
  if (!form) return;

  const msgEl = document.getElementById("suggestionMsg");
  const submitBtn = form.querySelector('button[type="submit"]');
  const submitBtnHtml = submitBtn ? submitBtn.innerHTML : "";

  function showMessage(message, isError = false) {
    if (!msgEl) return;
    msgEl.textContent = message || "";
    msgEl.classList.toggle("error", Boolean(isError));
  }

  async function saveFallback(payload) {
    try {
      const key = "expense_tracker_suggestions";
      const existing = JSON.parse(localStorage.getItem(key) || "[]");
      existing.unshift(payload);
      localStorage.setItem(key, JSON.stringify(existing.slice(0, 50)));
      return true;
    } catch {
      return false;
    }
  }

  form.addEventListener("submit", async (e) => {
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
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
      }

      const endpoint = `${window.API_URL || "http://localhost:5000/api"}/suggestions`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: window.authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          type: payload.type,
          name: payload.name,
          email: payload.email,
          message: payload.message
        })
      });

      let out = {};
      try {
        out = await res.json();
      } catch {
        out = {};
      }

      if (!res.ok) {
        const errMsg = out.message || "Unable to send your suggestion right now.";
        await saveFallback(payload);
        showMessage(errMsg, true);
        window.showToast?.(errMsg, "error");
        return;
      }

      form.reset();
      showMessage(out.message || "Suggestion sent. Thank you!");
      window.showToast?.("Suggestion sent", "success");
    } catch {
      await saveFallback(payload);
      showMessage("Unable to send your suggestion right now.", true);
      window.showToast?.("Unable to send your suggestion right now.", "error");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = submitBtnHtml;
      }
    }
  });
})();
