const form = document.getElementById('valentine-form');
const nameInput = document.getElementById('name-input');
const nameOutput = document.getElementById('valentine-name');

const encodeName = (name) => btoa(unescape(encodeURIComponent(name)));
const decodeName = (name) => decodeURIComponent(escape(atob(name)));

const showName = (name) => {
  nameOutput.textContent = name;
};

const removeSpaces = (value) => value.replace(/\s+/g, '');

const params = new URLSearchParams(window.location.search);
const encodedName = params.get('nombre');

if (encodedName) {
  try {
    const decodedName = removeSpaces(decodeName(encodedName));
    nameInput.value = decodedName;
    showName(decodedName);
  } catch (error) {
    params.delete('nombre');
    window.history.replaceState(null, '', `${window.location.pathname}${params.toString() ? `?${params}` : ''}`);
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const name = removeSpaces(nameInput.value);
  nameInput.value = name;

  if (!name) {
    return;
  }

  params.set('nombre', encodeName(name));
  window.history.pushState(null, '', `${window.location.pathname}?${params}`);
  showName(name);
});

nameInput.addEventListener('input', () => {
  nameInput.value = removeSpaces(nameInput.value);
});

nameInput.addEventListener('keydown', (event) => {
  if (event.key === ' ') {
    event.preventDefault();
  }
});
