// Fecha de hoy en formato YYYY-MM-DD según la zona horaria local
export const todayLocal = () => {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
};

// Recibe '2026-10-13' o '2026-10-13 15:30:00' y devuelve '2026-10-13' (para <input type="date">)
export const toInputDate = (value) => (value ? String(value).slice(0, 10) : '');

// Muestra la fecha como DD/MM/AAAA
export const formatDate = (value) => {
  const date = toInputDate(value);
  if (!date) return '-';
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year}`;
};
