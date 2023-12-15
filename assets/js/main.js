import { FORKIFY_API_KEY, FORKIFY_API_URL } from './config';

const recipePreviewContainer = document.querySelector('.recipe-preview-list');
const recipePreviewInfo = document.querySelector('.preview-info');
const recipeSearchInput = document.getElementById('search-keyword');
recipeSearchInput.value = '';

//////////////// POPUP //////////////

const togglePopup = () => {
  const popup = document.getElementById('popup');
  const backdrop = document.getElementById('backdrop');
  popup.classList.toggle('hidden-popup');
  backdrop.classList.toggle('hidden-popup');
};

document
  .querySelector('.btn-open-popup')
  .addEventListener('click', function (e) {
    e.preventDefault();
    togglePopup();
  });

document
  .querySelector('.btn-close-popup')
  .addEventListener('click', function () {
    togglePopup();
  });

/////////////// SEARCH RECIPE ////////////////

// getRecipe('5ed6604591c37cdc054bcd09');

const showInfo = (element, msg, color = '') => {
  const textColor = color ? color : '#60b5ff';
  if (element.classList.contains('hidden-info'))
    element.classList.toggle('hidden-info');

  element.style.color = color;
  element.textContent = msg;
};

/**
 * Render the recipes in the list
 * @param {Array} recipes Array contains recipes
 */
const renderRecipeList = recipes => {
  let html = '';
  recipes.forEach(recipe => {
    const { id, image_url, title, publisher } = recipe;

    html += `<li class="recipe-item recipe-preview-item" data-id="${id}">
              <a href="#" class="recipe-preview-link">
                <img
                  class="preview-img"
                  src="${image_url}"
                  alt=""
                />
                <div class="preview-text">
                  <p class="preview-title">${title}</p>
                  <p class="preview-publisher">${publisher}</p>
                </div>
              </a>
            </li>`;
  });

  recipePreviewInfo.classList.add('hidden-info');
  recipePreviewContainer.insertAdjacentHTML('afterbegin', html);
};

/**
 * Get list of recipe from the API for the searched keyword
 * @param {string} keyword User searched recipe
 */
const searchRecipe = async keyword => {
  try {
    const res = await fetch(`${FORKIFY_API_URL}?search=${keyword}`);
    const data = await res.json();

    if (!data.results) {
      showInfo(
        recipePreviewInfo,
        'No recipes found. Please try again!',
        '#ff6946'
      );
      return;
    }

    recipeSearchInput.value = '';

    const { recipes } = data.data;

    renderRecipeList(recipes);
  } catch (error) {
    showInfo(recipePreviewInfo, error, '#ff6946');
  }
};

document.getElementById('search-form').addEventListener('submit', function (e) {
  e.preventDefault();

  const data = new FormData(this);
  const keyword = data.get('search-keyword').trim();

  if (keyword === '') return;

  recipePreviewContainer.textContent = '';
  showInfo(recipePreviewInfo, 'Searching...');

  searchRecipe(keyword);
});

//////////////////////// RECIPE ////////////////////////
/**
 * Get recipe for given id from Forkify API
 * @param {string} id Recipe Id
 */
const getRecipe = async id => {
  try {
    const res = await fetch(`${FORKIFY_API_URL}/${id}`);

    const data = await res.json();
    console.log(data);
  } catch (error) {
    console.log(error);
  }
};
