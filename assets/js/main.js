import {
  FORKIFY_API_KEY,
  FORKIFY_API_URL,
  ERROR_COLOR,
  INFO_COLOR,
  RECIPE_ITEMS_PER_PAGE,
} from './config';

// Elements
const recipeContainer = document.querySelector('.detail-box');
const recipeInfo = document.querySelector('.recipe-info');
const recipePreviewContainer = document.querySelector('.recipe-preview-list');
const recipePreviewItem = document.querySelector('.recipe-preview-item');
const recipePreviewInfo = document.querySelector('.preview-info');
const recipeSearchInput = document.getElementById('search-keyword');
const paginationContainer = document.querySelector('.pagination-box');
const paginationBtnPrev = document.querySelector('.btn-pg-prev');
const paginationBtnNext = document.querySelector('.btn-pg-next');
recipeSearchInput.value = '';

// Global variables
const recipes = [];
let totalRecipes;

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
  recipePreviewContainer.textContent = '';
  recipePreviewContainer.insertAdjacentHTML('afterbegin', html);
};

/**
 * Get list of recipe from the API for the searched keyword
 * @param {string} keyword User searched recipe
 */
const searchRecipe = async keyword => {
  try {
    // Initaially hide pagination buttons
    paginationBtnPrev.classList.add('hidden');
    paginationBtnNext.classList.add('hidden');

    const res = await fetch(`${FORKIFY_API_URL}?search=${keyword}`);
    const data = await res.json();
    totalRecipes = data.results;

    if (!totalRecipes) {
      showInfo(
        recipePreviewInfo,
        'No recipes found. Please try again!',
        ERROR_COLOR
      );

      return;
    }

    recipeSearchInput.value = '';
    paginationContainer.classList.remove('hidden');

    // Push recipes to state
    recipes.length = 0;
    recipes.push(...data.data.recipes);

    // Pagination
    if (totalRecipes > RECIPE_ITEMS_PER_PAGE) {
      renderRecipeList(recipes.slice(0, RECIPE_ITEMS_PER_PAGE));
      paginationBtnNext.classList.remove('hidden');
      paginationBtnNext.dataset.index = RECIPE_ITEMS_PER_PAGE;
    } else {
      renderRecipeList(recipes);
      paginationBtnNext.classList.add('hidden');
    }
  } catch (error) {
    console.log(error);
    showInfo(
      recipePreviewInfo,
      'Something went wrong! Please check your internet connection and try again.',
      ERROR_COLOR
    );
  }
};

// Events

// Search
document.getElementById('search-form').addEventListener('submit', function (e) {
  e.preventDefault();

  const data = new FormData(this);
  const keyword = data.get('search-keyword').trim();

  if (keyword === '') return;

  recipePreviewContainer.textContent = '';
  showInfo(recipePreviewInfo, 'Searching...');

  searchRecipe(keyword);
});

// Pagination
paginationContainer.addEventListener('click', function (e) {
  e.preventDefault();

  // Guard clause
  if (e.target === this) return;

  /**
   * Show specified pagination button
   * @param {Element} btn Pagination button to show
   */
  const showPaginationBtn = btn => {
    if (btn.classList.contains('hidden')) btn.classList.remove('hidden');
  };

  let startIndex;
  let endIndex;

  // Previous btn
  if (e.target === paginationBtnPrev) {
    // Get the endIndex from button data-index
    endIndex = +paginationBtnPrev.dataset.index;

    // Calculate startIndex
    startIndex = endIndex - RECIPE_ITEMS_PER_PAGE;

    // If startIndex is <= 0, then it's a first page, hide previous btn
    if (startIndex <= 0) {
      paginationBtnPrev.classList.add('hidden');
    }

    // Show next button
    showPaginationBtn(paginationBtnNext);
  }

  // Next btn
  if (e.target === paginationBtnNext) {
    // Get start index from button data-index
    startIndex = +paginationBtnNext.dataset.index;

    // Calculate end index
    endIndex = startIndex + RECIPE_ITEMS_PER_PAGE;

    // If endIndex is greater than totalRecipes then it's a last page so hide next btn
    if (endIndex >= totalRecipes) {
      endIndex = totalRecipes;
      paginationBtnNext.classList.add('hidden');
    }

    // Show previous button
    showPaginationBtn(paginationBtnPrev);
  }

  // Add index to data attribute of buttons
  paginationBtnPrev.dataset.index = startIndex;
  paginationBtnNext.dataset.index = endIndex;

  // Render recipes
  renderRecipeList(recipes.slice(startIndex, endIndex));
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
      <a href="${source_url}" target="_blank" class="btn-direction">Direction &rightarrow;</a>
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
        `Oops! Something went wrong while fetching the recipe. Please try again later.`,
        ERROR_COLOR
      );
      return;
    }

    // Render recipe
    renderRecipe(data.data.recipe);

    // Push recipe id to URL
    // pushToUrl(data.data.recipe.id)
  } catch (error) {
    showInfo(
      recipeInfo,
      'Something went wrong! Please check your internet connection.',
      ERROR_COLOR
    );
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

/**
 * Get recipe id from URL and fetch Recipe
 */
const loadRecipeForUrlId = () => {
  const hash = window.location.hash;
  if (!hash) return;

  const id = hash.slice(1);
  getRecipe(id);
};

///////////////////// INIT ////////////////////////////
const init = () => {
  loadRecipeForUrlId();
};

init();
