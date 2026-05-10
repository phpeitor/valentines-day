const backgroundButtons = document.querySelectorAll('.background-option');
const savedBackground = localStorage.getItem('valentine-background') || 'hearts';

const setActiveButton = (background) => {
  backgroundButtons.forEach((button) => {
    const isActive = button.dataset.background === background;

    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
};

setActiveButton(window.setValentineBackground(savedBackground));

backgroundButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const background = button.dataset.background;

    setActiveButton(window.setValentineBackground(background));
  });
});
