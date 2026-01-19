module.exports = {
  capitalize: (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },
  reverse: (str) => {
    return str.split('').reverse().join('');
  },
  countVowels: (str) => {
    const vowels = str.match(/[aeiouAEIOU]/g);
    return vowels ? vowels.length : 0;
  }
};