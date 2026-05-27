export function formatNumber(num) {
  return Math.floor(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
