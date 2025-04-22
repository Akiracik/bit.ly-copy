const { nanoid } = require('nanoid');
const config = require('../config/config');

/**
 * Belirtilen uzunlukta benzersiz bir kısa kod üretir
 * @param {number} length - Kısa kodun uzunluğu
 * @returns {string} - Üretilen benzersiz kısa kod
 */
const generateCode = (length = config.codeLength) => {
  return nanoid(length);
};

/**
 * Özel karakterleri kullanarak bir kısa kod üretir
 * @param {number} length - Kısa kodun uzunluğu
 * @param {string} characters - Kullanılacak karakterler
 * @returns {string} - Özel karakterlerle üretilen kısa kod
 */
const generateCustomCode = (length = config.codeLength, characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789') => {
  let result = '';
  const charactersLength = characters.length;
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  
  return result;
};

/**
 * Okunabilir bir kısa kod üretir (sesli harfler ve karıştırılabilir karakterler olmadan)
 * @param {number} length - Kısa kodun uzunluğu
 * @returns {string} - Okunabilir kısa kod
 */
const generateReadableCode = (length = config.codeLength) => {
  // Karıştırılabilir karakterleri çıkar (0, O, 1, I, l gibi)
  const characters = '23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';
  return generateCustomCode(length, characters);
};

/**
 * Sayısal bir kısa kod üretir
 * @param {number} length - Kısa kodun uzunluğu
 * @returns {string} - Sayısal kısa kod
 */
const generateNumericCode = (length = config.codeLength) => {
  const characters = '0123456789';
  return generateCustomCode(length, characters);
};

module.exports = {
  generateCode,
  generateCustomCode,
  generateReadableCode,
  generateNumericCode
};