(function () {
  "use strict";

  const form = document.querySelector("#score-form");
  const error = document.querySelector("#error");
  const result = document.querySelector("#result");
  const hdlInput = document.querySelector("#hdl");
  const hdlUnknown = document.querySelector("#hdl-unknown");
  const parseDecimal = (value) => Number(String(value).trim().replace(",", "."));

  hdlUnknown.addEventListener("change", function () {
    hdlInput.disabled = hdlUnknown.checked;
    hdlInput.required = !hdlUnknown.checked;
    if (hdlUnknown.checked) hdlInput.value = "";
    else hdlInput.value = "1,3";
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    error.hidden = true;
    result.hidden = true;

    if (!document.querySelector("#eligible").checked) {
      error.textContent = "Подтвердите, что SCORE2 подходит для данного пациента.";
      error.hidden = false;
      return;
    }

    const input = {
      sex: new FormData(form).get("sex"),
      age: Number(document.querySelector("#age").value),
      sbp: Number(document.querySelector("#sbp").value),
      totalCholesterol: parseDecimal(document.querySelector("#total-chol").value),
      hdl: hdlUnknown.checked ? null : parseDecimal(hdlInput.value),
      smoking: Number(new FormData(form).get("smoking"))
    };

    try {
      const calculation = Score2.calculate(input);
      const risk = calculation.risk;
      const category = Score2.category(input.age, risk, calculation.model);
      const rounded = risk.toLocaleString("ru-RU", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
      document.querySelector("#risk-value").textContent = rounded + "%";
      document.querySelector("#model-label").textContent = calculation.model + " · риск в ближайшие 10 лет";
      const badge = document.querySelector("#risk-badge");
      badge.textContent = category.label;
      badge.className = "badge " + category.key;
      document.querySelector("#meter-fill").className = category.key;
      document.querySelector("#meter-fill").style.width = Math.min(risk / 20 * 100, 100) + "%";
      const isLegacy = calculation.model === "SCORE";
      document.querySelector("#interpretation").textContent = isLegacy
        ? "Это означает примерно " + rounded + "% вероятности смерти от сердечно-сосудистого заболевания в течение 10 лет. Нефатальные события старый SCORE не учитывает."
        : "Это означает примерно " + rounded + "% вероятности инфаркта, инсульта или смерти от сердечно-сосудистого заболевания в течение 10 лет.";
      document.querySelector("#result-note").textContent = isLegacy
        ? "Использована устаревшая модель SCORE для стран высокого риска, поскольку ЛПВП не указан. Результат нельзя напрямую сравнивать со SCORE2."
        : "Результат служит для оценки риска в первичной профилактике и не является диагнозом или назначением лечения.";
      result.hidden = false;
      result.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } catch (exception) {
      error.textContent = exception.message;
      error.hidden = false;
    }
  });
})();
