(function () {
  "use strict";

  const form = document.querySelector("#score-form");
  const error = document.querySelector("#error");
  const result = document.querySelector("#result");
  const parseDecimal = (value) => Number(String(value).trim().replace(",", "."));

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
      hdl: parseDecimal(document.querySelector("#hdl").value),
      smoking: Number(new FormData(form).get("smoking"))
    };

    try {
      const calculation = Score2.calculate(input);
      const risk = calculation.risk;
      const category = Score2.category(input.age, risk);
      const rounded = risk.toLocaleString("ru-RU", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
      document.querySelector("#risk-value").textContent = rounded + "%";
      document.querySelector("#model-label").textContent = calculation.model + " · риск в ближайшие 10 лет";
      const badge = document.querySelector("#risk-badge");
      badge.textContent = category.label;
      badge.className = "badge " + category.key;
      document.querySelector("#meter-fill").className = category.key;
      document.querySelector("#meter-fill").style.width = Math.min(risk / 20 * 100, 100) + "%";
      document.querySelector("#interpretation").textContent =
        "Это означает примерно " + rounded + "% вероятности инфаркта, инсульта или смерти от сердечно-сосудистого заболевания в течение 10 лет.";
      result.hidden = false;
      result.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } catch (exception) {
      error.textContent = exception.message;
      error.hidden = false;
    }
  });
})();
