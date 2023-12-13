import { FORKIFY_API_KEY, FORKIFY_API_URL } from './config';

//////////////// POPUP //////////////

const togglePopup = () => {
  popup.classList.toggle('hidden-popup');
  backdrop.classList.toggle('hidden-popup');
};

document
  .querySelector('.btn-open-popup')
  .addEventListener('click', function (e) {
    e.preventDefault();

    const popup = document.getElementById('popup');
    const backdrop = document.getElementById('backdrop');

    togglePopup();
  });

document
  .querySelector('.btn-close-popup')
  .addEventListener('click', function () {
    togglePopup();
  });
