import {
  FORKIFY_API_KEY,
  FORKIFY_API_URL,
  ERROR_COLOR,
  INFO_COLOR,
  RECIPE_ITEMS_PER_PAGE,
  NETWORK_ERROR,
} from './config';

// Elements
const recipeContainer = document.querySelector('.detail-box');
const recipeInfo = document.querySelector('.recipe-info');

const commonPreviewContainer = document.querySelectorAll('.recipe-list');

const recipePreviewContainer = document.querySelector('.recipe-preview-list');
const recipePreviewItem = document.querySelector('.recipe-preview-item');
const recipePreviewInfo = document.querySelector('.preview-info');

const savedRecipesContainer = document.querySelector('.saved-recipes-list');
// const savedRecipesInfo = document.querySelector('.saved-recipes-info');

const paginationContainer = document.querySelector('.pagination-box');
const paginationBtnPrev = document.querySelector('.btn-pg-prev');
const paginationBtnNext = document.querySelector('.btn-pg-next');

const recipeSearchInput = document.getElementById('search-keyword');
recipeSearchInput.value = '';

// Global variables
const recipes = [];
const savedRecipes = [];
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
 * Generate HTML for recipe preview list item used to generate recipe item for Preview and Saved Recipe view
 * @param {Object} recipe Recipe object
 * @param {String} className class name for generated list item, defaults to 'recipe-preview-item' which is class name for preview list item
 * @returns HTML string
 */
const generateRecipePreviewItem = (
  recipe,
  className = 'recipe-preview-item'
) => {
  const { id, image_url, title, publisher } = recipe;

  return `<li class="recipe-item ${className}" data-id="${id}">
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
};

/**
 * Render the recipes in the list
 * @param {Array} recipes Array contains recipes
 */
const renderRecipeList = recipes => {
  let html = '';
  recipes.forEach(recipe => (html += generateRecipePreviewItem(recipe)));

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
    showInfo(recipePreviewInfo, NETWORK_ERROR, ERROR_COLOR);
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

      <a href="#" class="save-recipe">Save</a>
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

    const recipe = data.data.recipe;

    // Render recipe
    renderRecipe(recipe);

    // Bind save recipe event
    document
      .querySelector('.save-recipe')
      .addEventListener('click', e => saveRecipeHandler(e, recipe));
  } catch (error) {
    showInfo(recipeInfo, NETWORK_ERROR, ERROR_COLOR);
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

  // Highlight current item
  highlightItem(previewItem);
  // previewItem.style.backgroundColor = 'red';

  // Add recipeId to URL
  history.pushState({}, '', `#${recipeId}`);

  // Fetch recipe
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

//////////////////////// SAVE RECIPE ////////////////////////

const isSavedRecipe = recipeId => {
  console.log('Inside isSavedRecipe(): ');
  console.log(savedRecipes);

  return !savedRecipes.every(recipe => recipe.id !== recipeId);
};

const saveRecipe = (btn, recipe) => {
  console.log('Inside saveRecipe():');
  // Add recipe to savedRecipes
  savedRecipes.push(recipe);
  console.log(savedRecipes);

  // Save recipe to localStorage
  localStorage.setItem('savedRecipes', JSON.stringify(savedRecipes));

  // Change save button to 'Unsave'
  btn.textContent = 'Unsave';

  // Render recipe preview in Saved recipe view
  savedRecipesContainer.insertAdjacentHTML(
    'afterbegin',
    generateRecipePreviewItem(recipe, 'saved-recipe-preview-item')
  );
};

const unsaveRecipe = (btn, recipeId) => {
  console.log('Inside unsaveRecipe():');

  // Get recipe index using recipeId
  const recipeIndex = savedRecipes.findIndex(recipe => recipe.id === recipeId);

  // Remove recipe from savedRecipes
  if (recipeIndex !== -1) savedRecipes.splice(recipeIndex, 1);
  console.log('After removing recipe: ');
  console.log(savedRecipes);

  // Change 'Unsave' button to 'Save'
  btn.textContent = 'Save';

  // Remove recipe form Saved recipe view using recipeId
  const recipeItem = savedRecipesContainer.querySelector(
    `[data-id="${recipeId}"]`
  );
  console.log(recipeItem);

  if (recipeItem) recipeItem.remove();
};

const saveRecipeHandler = (e, recipe) => {
  e.preventDefault();

  console.log(recipe);
  const btn = e.target;
  const recipeId = recipe.id;

  // Check whether recipe is already saved,
  // If yes, Unsave. Else, Save
  if (savedRecipes.length && isSavedRecipe(recipeId)) {
    console.log('Recipe already saved: Unsave');
    unsaveRecipe(btn, recipeId);
  } else {
    console.log('Set is empty or recipe is not already saved: Save');
    saveRecipe(btn, recipe);
  }
};

///////////////////// INIT ////////////////////////////
const init = () => {
  loadRecipeForUrlId();
};

init();
