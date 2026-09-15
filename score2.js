(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.Score2 = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  // Hageman et al., Eur Heart J. 2022;43(3):241–243.
  // Published four-decimal SCORE2 coefficients and very-high-risk calibration.
  const SCORE2_MODEL = {
    male: {
      coefficients: [0.3742, 0.6012, 0.2777, 0.1458, -0.2698, -0.0755, -0.0255, -0.0281, 0.0426],
      baselineSurvival: 0.9605,
      scale1: 0.5836,
      scale2: 0.8294
    },
    female: {
      coefficients: [0.4648, 0.7744, 0.3131, 0.1002, -0.2606, -0.1088, -0.0277, -0.0226, 0.0613],
      baselineSurvival: 0.9776,
      scale1: 0.9412,
      scale2: 0.8329
    }
  };

  // SCORE2-OP Working Group, Eur Heart J. 2021;42(25):2455–2467.
  // Predictor order matches SCORE2, with age centred at 73, SBP at 150,
  // total cholesterol at 6 and HDL cholesterol at 1.4 mmol/L.
  const SCORE2_OP_MODEL = {
    male: {
      coefficients: [0.0634, 0.3524, 0.0094, 0.0850, -0.3564, -0.0247, -0.0005, 0.0073, 0.0091],
      baselineSurvival: 0.7576,
      meanAdjustment: 0.0929,
      scale1: 0.0500,
      scale2: 0.7000
    },
    female: {
      coefficients: [0.0789, 0.4921, 0.0102, 0.0605, -0.3040, -0.0255, -0.0004, -0.0009, 0.0154],
      baselineSurvival: 0.8082,
      meanAdjustment: 0.2290,
      scale1: 0.3800,
      scale2: 0.6900
    }
  };

  function validate(input) {
    if (!SCORE2_MODEL[input.sex]) throw new Error("Укажите пол пациента.");
    if (!Number.isInteger(input.age) || input.age < 40 || input.age > 89) {
      throw new Error("SCORE2 и SCORE2-OP применяются в возрасте от 40 до 89 лет.");
    }
    if (!Number.isFinite(input.sbp) || input.sbp < 100 || input.sbp > 200) {
      throw new Error("Введите систолическое давление от 100 до 200 мм рт. ст.");
    }
    if (!Number.isFinite(input.totalCholesterol) || input.totalCholesterol < 3 || input.totalCholesterol > 8) {
      throw new Error("Введите общий холестерин от 3 до 8 ммоль/л.");
    }
    if (!Number.isFinite(input.hdl) || input.hdl < 0.5 || input.hdl > 2.5) {
      throw new Error("Введите холестерин ЛПВП от 0,5 до 2,5 ммоль/л.");
    }
    if (input.hdl >= input.totalCholesterol) {
      throw new Error("ЛПВП должен быть ниже общего холестерина.");
    }
    if (input.smoking !== 0 && input.smoking !== 1) throw new Error("Укажите статус курения.");
  }

  function calculate(input) {
    validate(input);
    const isOlderPerson = input.age >= 70;
    const model = (isOlderPerson ? SCORE2_OP_MODEL : SCORE2_MODEL)[input.sex];
    const ageCenter = isOlderPerson ? input.age - 73 : (input.age - 60) / 5;
    const sbpCenter = isOlderPerson ? input.sbp - 150 : (input.sbp - 120) / 20;
    const totalCholCenter = input.totalCholesterol - 6;
    const hdlCenter = (input.hdl - (isOlderPerson ? 1.4 : 1.3)) / (isOlderPerson ? 1 : 0.5);
    const x = [ageCenter, input.smoking, sbpCenter, totalCholCenter, hdlCenter,
      ageCenter * input.smoking, ageCenter * sbpCenter, ageCenter * totalCholCenter, ageCenter * hdlCenter];
    const linearPredictor = x.reduce((sum, value, i) => sum + value * model.coefficients[i], 0)
      - (model.meanAdjustment || 0);
    const uncalibratedRisk = 1 - Math.pow(model.baselineSurvival, Math.exp(linearPredictor));
    const calibratedRisk = 1 - Math.exp(-Math.exp(
      model.scale1 + model.scale2 * Math.log(-Math.log(1 - uncalibratedRisk))
    ));
    return { risk: calibratedRisk * 100, model: isOlderPerson ? "SCORE2-OP" : "SCORE2" };
  }

  function category(age, risk) {
    const high = age < 50 ? 2.5 : age < 70 ? 5 : 7.5;
    const veryHigh = age < 50 ? 7.5 : age < 70 ? 10 : 15;
    if (risk < high) return { key: "low", label: "Низкий–умеренный риск" };
    if (risk < veryHigh) return { key: "high", label: "Высокий риск" };
    return { key: "very-high", label: "Очень высокий риск" };
  }

  return { calculate, category };
});
