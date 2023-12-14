import { FORKIFY_API_KEY, FORKIFY_API_URL } from './config';

const recipePreviewContainer = document.querySelector('.recipe-preview-list');
const recipePreviewInfo = document.querySelector('.preview-info');

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
      console.log('No recipes found for the search keyword');
    }

    const { recipes } = data.data;

    renderRecipeList(recipes);
  } catch (error) {
    console.log(error);
  }
};

document.getElementById('search-form').addEventListener('submit', function (e) {
  e.preventDefault();

  const data = new FormData(this);
  const keyword = data.get('search-keyword').trim();

  if (keyword === '') return;

  recipePreviewInfo.textContent = 'Searching...';
  searchRecipe(keyword);
});

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
