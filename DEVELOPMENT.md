# Reglas de desarrollo

- Mantener separadas las responsabilidades: HTML/PHP para estructura, CSS para estilos y JavaScript para comportamiento.
- No mezclar estilos ni scripts dentro de vistas `.html` o `.php`; usar archivos externos enlazados desde la vista.
- Evitar estilos inline, bloques `<style>` y bloques `<script>` en vistas, salvo que exista una razon tecnica documentada.
- Usar nombres de clases descriptivos y reutilizables.
- Mantener los cambios pequenos y enfocados en una sola responsabilidad.
- Revisar que la pagina cargue correctamente en escritorio y movil despues de modificar estilos o scripts.
