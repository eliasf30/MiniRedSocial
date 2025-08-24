import { Dropdown } from "bootstrap";

export function cerrarDropdownsAbiertos() {
  document.querySelectorAll(".dropdown-menu.show").forEach((menu) => {
    const btn = menu.parentElement.querySelector("[data-bs-toggle='dropdown']");
    if (btn) {
      const instancia = Dropdown.getInstance(btn);
      instancia?.hide();
    }
  });
}