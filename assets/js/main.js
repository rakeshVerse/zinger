import {
  FORKIFY_API_KEY,
  FORKIFY_API_URL,
  ERROR_COLOR,
  INFO_COLOR,
} from './config';

const recipeContainer = document.querySelector('.detail-box');
const recipeInfo = document.querySelector('.recipe-info');
const recipePreviewContainer = document.querySelector('.recipe-preview-list');
const recipePreviewItem = document.querySelector('.recipe-preview-item');
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

/**
 *
 * @param {HTML element} element Element in which you want to show the message
 * @param {String} msg Message to display
 * @param {String} color Message color
 */
const showInfo = (element, msg, color = '') => {
  const textColor = color ? color : INFO_COLOR;
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
        ERROR_COLOR
      );
      return;
    }

    recipeSearchInput.value = '';

    const { recipes } = data.data;

    renderRecipeList(recipes);
  } catch (error) {
    showInfo(recipePreviewInfo, error, ERROR_COLOR);
  }
};

// Event
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
 * Render recipe in the recipe details view
 * @param {Object} recipe Recipe object
 */
const renderRecipe = recipe => {
  /**
   * Generate List for ingredients
   * @param {Array} ingredients Array of ingredients
   */
  const generateIngredientList = ingredients =>
    ingredients
      .map(ing => {
        const { quantity, unit, description } = ing;
        return `<li class="recipe-ingredient">${
          quantity ? quantity : ''
        } ${unit} ${description}</li>`;
      })
      .join('');

  const {
    publisher,
    ingredients,
    source_url,
    image_url,
    title,
    servings,
    cooking_time,
    // id,
  } = recipe;

  const html = `
  <div class="recipe-img-box">
    <img
      src="${image_url}"
      alt=""
      class="recipe-img"
    />
    <h1 class="recipe-title">${title}</h1>
  </div>

  <div class="recipe-text">
    <div class="recipe-actions">
      <p class="recipe-duration"><span>${cooking_time}</span> minutes</p>
      <div class="recipe-servings-box">
        <p class="recipe-servings"><span>${servings}</span> servings</p>
        <a href="#" class="add-serving">+</a>
        <a href="#" class="reduce-serving">-</a>
      </div>

      <a href="#" class="add-bookmark">Bookmark</a>
    </div>

    <div class="ingredients">
      <h2 class="ingredients-title">Recipe Ingredients</h2>
      <ul class="recipe-ingredient-list">${generateIngredientList(
        ingredients
      )}</ul>
    </div>

    <div class="cook">
      <h2 class="cook-title">How to cook it</h2>
      <p class="cook-text">
        This recipe was carefully designed and tested by
        <span> ${publisher}</span>. Please check out directions at
        their website.
      </p>
      <a href="${source_url}" class="btn-direction">Direction &rightarrow;</a>
    </div>
  </div>`;

  recipeInfo.classList.add('hidden-info');
  recipeContainer.insertAdjacentHTML('afterbegin', html);
};

/**
 * Get recipe for given id from Forkify API
 * @param {string} id Recipe Id
 */
const getRecipe = async id => {
  try {
    const res = await fetch(`${FORKIFY_API_URL}/${id}`);
    const data = await res.json();

    if (data.status !== 'success') {
      showInfo(
        recipeInfo,
        'Something went wrong. Please refresh the page and try again!',
        ERROR_COLOR
      );
      return;
    }

    // Render recipe
    renderRecipe(data.data.recipe);

    // Push recipe id to URL
    // pushToUrl(data.data.recipe.id)
  } catch (error) {
    showInfo(recipeInfo, error, ERROR_COLOR);
  }
};

// Event
recipePreviewContainer.addEventListener('click', function (e) {
  e.preventDefault();

  const previewItem = e.target.closest('.recipe-preview-item');
  if (!previewItem) return;

  const recipeId = previewItem.dataset.id;

  recipeContainer.textContent = '';
  showInfo(recipeInfo, 'Loading...');

  history.pushState({}, '', `#${recipeId}`);
  getRecipe(recipeId);
});
