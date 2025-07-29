export const ajustarFechaSinZona = (fechaISO) => {
  const [fechaPart] = fechaISO.split("T"); // separa solo la parte fecha
  const [year, month, day] = fechaPart.split("-").map(Number);
  return new Date(year, month - 1, day); // mes 0-indexado
};