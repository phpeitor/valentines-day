# Valentine's Day

Pagina web interactiva para crear una dedicatoria de San Valentin con fondo animado, nombre personalizado y selector de efectos visuales.

## Caracteristicas

- Fondo animado con `css-doodle`.
- Selector de 3 efectos de fondo: `Hearts`, `Sparkles` y `Bubbles`.
- Campo para ingresar un nombre y mostrarlo debajo de `My Valentine`.
- El nombre se guarda en la URL codificado en Base64 con el parametro `nombre`.
- Ejemplo: `?nombre=QWxlamFuZHJv` corresponde a `btoa('Alejandro')`.
- Si se abre la pagina con el parametro `nombre`, se decodifica y se muestra automaticamente.
- Validacion para permitir solo un nombre sin espacios en blanco.
- Efecto visual animado sobre el nombre mostrado.
- Preferencia del fondo guardada en `localStorage`.
- Estilos y scripts separados de la vista HTML.

## Estructura

```text
.
├── index.html
├── README.md
├── DEVELOPMENT.md
├── css/
│   └── style.css
└── js/
    ├── script.js
    ├── doodle.js
    ├── valentine-form.js
    └── background-options.js
```

## Instalacion

No requiere instalacion de dependencias. Es un proyecto estatico con HTML, CSS y JavaScript.

1. Clonar el repositorio:

```bash
git clone https://github.com/phpeitor/valentines-day.git
cd valentines-day
```

2. Abrir `index.html` en el navegador.

Tambien puede servirse desde Apache, Nginx o cualquier servidor estatico. En un entorno local con Apache, colocar la carpeta dentro del directorio publico y abrir la ruta correspondiente en el navegador.

## Uso

1. Abrir la pagina.
2. Escribir un nombre sin espacios en el campo de texto.
3. Presionar `Enviar`.
4. El nombre aparecera debajo de `My Valentine`.
5. La URL se actualizara con el nombre codificado, por ejemplo:

```text
index.html?nombre=QWxlamFuZHJv
```

6. Usar los botones inferiores para cambiar el fondo animado.

## Archivos principales

- `index.html`: estructura principal de la pagina.
- `css/style.css`: estilos visuales, layout, animaciones y widget de opciones.
- `js/script.js`: libreria local de `css-doodle`.
- `js/doodle.js`: definicion de los efectos de fondo y seleccion activa.
- `js/valentine-form.js`: validacion del formulario, codificacion/decodificacion Base64 y actualizacion de URL.
- `js/background-options.js`: comportamiento de los botones para cambiar el fondo.
- `DEVELOPMENT.md`: reglas de desarrollo del proyecto.

## Verificacion rapida

Si tienes Node.js instalado, puedes validar la sintaxis de los scripts propios con:

```bash
node --check js/doodle.js
node --check js/valentine-form.js
node --check js/background-options.js
```
