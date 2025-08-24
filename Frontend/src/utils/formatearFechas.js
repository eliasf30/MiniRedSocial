export const ajustarFechaSinZona = (fechaISO) => {
  const [fechaPart] = fechaISO.split("T"); 
  const [year, month, day] = fechaPart.split("-").map(Number);
  return new Date(year, month - 1, day); 
};