# Локальный калькулятор SCORE2 и SCORE2-OP

Автономный калькулятор для региона очень высокого сердечно-сосудистого риска (включая Россию):

- **SCORE2** для пациентов 40–69 лет;
- **SCORE2-OP** для пациентов 70–89 лет.
- прежний **SCORE** для пациентов 40–69 лет, если ЛПВП неизвестен.

Модель выбирается автоматически. SCORE оценивает только риск сердечно-сосудистой смерти и явно помечается как устаревшая методика; его результат нельзя напрямую сравнивать со SCORE2.

## Запуск

Откройте `index.html` в браузере. Интернет и установка зависимостей не требуются.

Для запуска через локальный сервер (если установлен Python):

```powershell
python -m http.server 8000 --directory score2-local
```

Затем откройте `http://localhost:8000`.

## Проверка

Если установлен Node.js:

```powershell
node score2-local/test.js
```

Контрольные значения: SCORE2 — мужчина 14,0%, женщина 13,7%; SCORE2-OP — мужчина 40,8%, женщина 46,2% для опубликованных примеров very high risk.

## Методика

- SCORE2 Working Group and ESC Cardiovascular Risk Collaboration. *SCORE2 risk prediction algorithms*. Eur Heart J. 2021;42:2439–2454.
- SCORE2-OP Working Group and ESC Cardiovascular Risk Collaboration. *SCORE2-OP risk prediction algorithms*. Eur Heart J. 2021;42:2455–2467.
- Conroy RM, et al. *Estimation of ten-year risk of fatal cardiovascular disease in Europe: the SCORE project*. Eur Heart J. 2003;24:987–1003.
- Hageman S, et al. *SCORE2 models allow consideration of sex-specific cardiovascular disease risks by region*. Eur Heart J. 2022;43:241–243.
- Visseren FLJ, et al. *2021 ESC Guidelines on cardiovascular disease prevention in clinical practice*. Eur Heart J. 2021;42:3227–3337.

Все вычисления выполняются в браузере. Данные пациента не сохраняются и не передаются.
