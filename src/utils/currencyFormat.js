
export function formatCurrency(amount) {
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(amount);
}

export function convertCurrency(amount, currency) {
  let locale;
  switch (currency) {
    case 'CNY':
      locale = 'zh-CN'; // 对于人民币，使用中国的语言环境
      break;
    case 'USD':
      locale = 'en-US'; // 对于美元，使用美国的语言环境
      break;
    default:
      locale = 'ru-RU'; // 默认使用俄罗斯的语言环境
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