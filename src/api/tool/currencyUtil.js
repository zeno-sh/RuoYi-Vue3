// currencyUtils.js
export function formatCurrency(amount, currency = 'RUB') {
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: currency }).format(amount);
}

export function convertCurrency(amount, currency) {
  let locale;
  switch (currency) {
    case 'CNY':
      locale = 'zh-CN';
      break;
    case 'USD':
      locale = 'en-US';
      break;
    default:
      locale = 'ru-RU';
      break;
  }
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  }).format(amount * getExchangeRate(currency));
}

function getExchangeRate(currency) {
  const rates = {
    'CNY': 0.078,
    'USD': 0.011
  };
  return rates[currency] || 0;
}
