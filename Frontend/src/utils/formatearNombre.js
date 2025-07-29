export default function formatearNombre(nombre) {
  return nombre
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (letra) => letra.toUpperCase());
}