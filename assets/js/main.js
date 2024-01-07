import {
  FORKIFY_API_KEY,
  FORKIFY_API_URL,
  RECIPE_ITEMS_PER_PAGE,
  LOCAL_STORAGE_KEY,
  POPUP_HIDE_SECONDS,
} from './config';

import fracty from 'fracty';

// Elements
const recipeContainer = document.querySelector('.detail-box');
const recipeInfo = document.querySelector('.recipe-info');

const commonPreviewContainer = document.querySelectorAll('.recipe-list');

const recipePreviewContainer = document.querySelector('.recipe-preview-list');
const recipePreviewItem = document.querySelector('.recipe-preview-item');
const recipePreviewInfo = document.querySelector('.preview-info');

const savedRecipesContainer = document.querySelector('.saved-recipes-list');
const savedRecipesInfo = document.querySelector('.saved-recipes-info');

const paginationContainer = document.querySelector('.pagination-box');
const paginationBtnPrev = document.querySelector('.btn-pg-prev');
const paginationBtnNext = document.querySelector('.btn-pg-next');

const openPopupBtn = document.querySelector('.btn-open-popup');
const closePopupBtn = document.querySelector('.btn-close-popup');
const openPopupBtnItem = document.querySelector('#app-header-list .open-popup-item');
const popupInfo = document.querySelector('#popup .popup-info');
const addRecipeForm = document.getElementById('add-recipe');
const addRecipeSubmitBtn = document.querySelector('#popup .btn-submit-recipe');

const themeMenu = document.querySelector('.theme-item');

const typeheadContainer = document.querySelector('.typehead-list');

const searchForm = document.getElementById('search-form');
const recipeSearchInput = document.getElementById('search-keyword');
recipeSearchInput.value = '';

// Global variables
const recipes = [];
let totalRecipes;
const savedRecipes = [];
let recipeId = null;
let servingsCounter;
const allowedSearchKeywords = [
  'vegan',
  'buttermilk',
  'butter',
  'curd',
  'milk',
  'soup',
  'noodles',
  'dosa',
  'bread',
  'chana',
  'dal',
  'wheat',
  'rice',
  'burger',
  'eggs',
  'carrot',
  'broccoli',
  'asparagus',
  'cauliflower',
  'corn',
  'cucumber',
  'green pepper',
  'lettuce',
  'mushrooms',
  'onion',
  'potato',
  'pumpkin',
  'red pepper',
  'tomato',
  'beetroot',
  'brussel sprouts',
  'peas',
  'zucchini',
  'radish',
  'sweet potato',
  'artichoke',
  'leek',
  'cabbage',
  'celery',
  'chili',
  'garlic',
  'basil',
  'coriander',
  'parsley',
  'dill',
  'rosemary',
  'oregano',
  'cinnamon',
  'saffron',
  'green bean',
  'bean',
  'chickpea',
  'lentil',
  'apple',
  'apricot',
  'avocado',
  'banana',
  'blackberry',
  'blackcurrant',
  'blueberry',
  'boysenberry',
  'cherry',
  'coconut',
  'fig',
  'grape',
  'grapefruit',
  'kiwifruit',
  'lemon',
  'lime',
  'lychee',
  'mandarin',
  'mango',
  'melon',
  'nectarine',
  'orange',
  'papaya',
  'passion fruit',
  'peach',
  'pear',
  'pineapple',
  'plum',
  'pomegranate',
  'quince',
  'raspberry',
  'strawberry',
  'watermelon',
  'salad',
  'pizza',
  'pasta',
  'popcorn',
  'lobster',
  'steak',
  'bbq',
  'pudding',
  'hamburger',
  'pie',
  'cake',
  'sausage',
  'tacos',
  'kebab',
  'poutine',
  'seafood',
  'chips',
  'fries',
  'masala',
  'paella',
  'som tam',
  'chicken',
  'toast',
  'marzipan',
  'tofu',
  'ketchup',
  'hummus',
  'maple syrup',
  'parma ham',
  'fajitas',
  'champ',
  'lasagna',
  'poke',
  'chocolate',
  'croissant',
  'arepas',
  'bunny chow',
  'pierogi',
  'donuts',
  'rendang',
  'sushi',
  'ice cream',
  'duck',
  'curry',
  'beef',
  'goat',
  'lamb',
  'turkey',
  'pork',
  'fish',
  'crab',
  'bacon',
  'ham',
  'pepperoni',
  'salami',
  'ribs',
];

/////////////// GENERAL ////////////////
const AJAX = async (url, data = undefined) => {
  try {
    const res = await fetch(
      url,
      data
        ? {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          }
        : {}
    );

    if (!res.ok) throw new Error(`Something went wrong! Invalid request (${res.status}).`);

    const jsonRes = await res.json();
    if (jsonRes.status !== 'success') throw new Error(`An error occurred! ${jsonRes.message}`);

    return jsonRes;
  } catch (error) {
    throw error;
  }
};

/**
 *
 * @param {HTML element} element Element in which you want to show the message
 * @param {String} msg Message to display
 * @param {String} color Message color
 */
const showInfo = (element, msg, className = 'info') => {
  element.classList.remove('hidden-info');
  element.textContent = msg;
  element.className = `${element.classList[0]} ${className}`;
};

/////////////// THEME ////////////////
const persistTheme = () => {
  const themeClass = localStorage.getItem('theme');
  if (themeClass) document.body.className = themeClass;
};

themeMenu.addEventListener('click', function (e) {
  e.preventDefault();
  if (e.target === this) return;

  const themeClass = e.target.classList[1];
  document.body.className = themeClass;

  // store theme class in local strorage
  localStorage.setItem('theme', themeClass);
});

/////////////// TYPEHEAD ////////////////

const renderTypehead = keywords => {
  let html = '';
  keywords.forEach(keyword => (html += `<li class="typehead-item">${keyword}</li>`));

  typeheadIndex = -1;
  typeheadContainer.textContent = '';
  typeheadContainer.style.height = 'fit-content';
  typeheadContainer.insertAdjacentHTML('afterbegin', html);
};

const hideTypehead = () => (typeheadContainer.style.height = 0);

const handleTypeheadScroll = currentItem => {
  if (
    currentItem.offsetTop < typeheadContainer.scrollTop || // scroll up
    currentItem.offsetTop + currentItem.offsetHeight > typeheadContainer.clientHeight // scroll down
  ) {
    currentItem.scrollIntoView({ behavior: 'smooth' });
  }
};

const highlightTypehead = index => {
  const typeheadItems = typeheadContainer.querySelectorAll('.typehead-item');
  const typeheadItem = typeheadItems[index];

  // display keyword in input box
  recipeSearchInput.value = typeheadItem.innerHTML;

  // highlight
  typeheadItems.forEach(item => item.classList.remove('hover'));
  typeheadItem.classList.add('hover');

  // scroll to highlighted item
  handleTypeheadScroll(typeheadItem);
};

// EVENTS

// search input on-keyup
let typeheadIndex = -1;
let keywordsLen = 0;
recipeSearchInput.addEventListener('keyup', function (e) {
  const key = e.key;
  const input = recipeSearchInput.value.toLowerCase().trim();

  // If input is empty or key is enter or escape, hide typehead
  if (!input || key === 'Enter' || key === 'Escape') {
    hideTypehead();
    return;
  }

  const lastIndex = keywordsLen - 1;
  switch (key) {
    case 'ArrowDown':
      typeheadIndex = typeheadIndex === lastIndex ? 0 : ++typeheadIndex;
      highlightTypehead(typeheadIndex);
      break;
    case 'ArrowUp':
      typeheadIndex = typeheadIndex < 1 ? lastIndex : --typeheadIndex;
      highlightTypehead(typeheadIndex);
      break;
    default:
      // search keyword in the array
      const keywords = allowedSearchKeywords.filter(keyword => keyword.startsWith(input)).sort();
      keywordsLen = keywords.length;

      // if keyword not found, hide typehead
      if (!keywordsLen) {
        hideTypehead();
        return;
      }

      renderTypehead(keywords);
  }
});

// when search input loses focus, hide typehead
recipeSearchInput.addEventListener('blur', hideTypehead);

// when click on typehead item, start search
typeheadContainer.addEventListener('click', function (e) {
  if (e.target === this) return;

  hideTypehead();
  const keyword = e.target.innerHTML;
  if (!keyword) return;

  recipeSearchInput.value = keyword;
  searchRecipe(keyword);
});

/////////////// SEARCH RECIPE ////////////////

// getRecipe('5ed6604591c37cdc054bcd09');

/**
 * Generate HTML for recipe preview list item used to generate recipe item for Preview and Saved Recipe view
 * @param {Object} recipe Recipe object
 * @param {String} className class name for generated list item, defaults to 'recipe-preview-item' which is class name for preview list item
 * @returns HTML string
 */
const generateRecipePreviewItem = (recipe, className) => {
  const { id, image_url, title, publisher, key } = recipe;

  return `<li class="recipe-item hightlight-hover ${className}" data-id="${id}">
              <a href="#" class="recipe-preview-link">
                <img
                  class="preview-img"
                  src="${image_url}"
                  alt=""
                />
                <div class="preview-text">
                  <p class="preview-title">${title}</p>
                  <p class="preview-publisher">
                  <span>${publisher}</span>
                  ${key ? '<span class="preview-user opacity-6">👤</span>' : ''}
                  </p>
                </div>
              </a>
            </li>`;
};

/**
 * Render the recipes in the list
 * @param {Array} recipes Array contains recipes
 */
const renderRecipeList = (
  recipes,
  infoContainer = recipePreviewInfo,
  listContainer = recipePreviewContainer,
  className = 'recipe-preview-item'
) => {
  let html = '';
  recipes.forEach(recipe => (html += generateRecipePreviewItem(recipe, className)));

  infoContainer.classList.add('hidden-info');
  listContainer.textContent = '';
  listContainer.insertAdjacentHTML('afterbegin', html);

  // Highlight recipe item
  // 1. Saved recipes view: When page loads with recipeId
  // 2. Recipe preview view: When user searches or click on pagination button
  if (recipeId) highlightItem(recipeId);
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

    recipePreviewContainer.textContent = '';
    showInfo(recipePreviewInfo, 'Searching...');

    const jsonData = await AJAX(`${FORKIFY_API_URL}?search=${keyword}&key=${FORKIFY_API_KEY}`);
    totalRecipes = jsonData.results;

    if (!totalRecipes) throw new Error('No recipes found. Please try again!');

    recipeSearchInput.value = '';
    paginationContainer.classList.remove('hidden');

    // Push recipes to state
    recipes.length = 0;
    recipes.push(...jsonData.data.recipes);

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
    console.dir(error);
    showInfo(recipePreviewInfo, error.message, 'danger');
  }
};

// Events

// Search
searchForm.addEventListener('submit', function (e) {
  e.preventDefault();

  const data = new FormData(this);
  const keyword = data.get('search-keyword').trim();

  if (keyword === '') return;

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
const highlightItem = recipeId => {
  document.querySelectorAll('.recipe-item').forEach(item => {
    const classList = item.classList;

    item.dataset.id === recipeId ? classList.add('highlight') : classList.remove('highlight');
  });
};

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
        return `
        <li class="recipe-ingredient">
          <span class="opacity-6">👉🏿</span>

          <div>
            <span class="ing-quantity">${quantity ? fracty(quantity) : ''}</span>
            ${unit} ${description}
          </div>
        </li>`;
      })
      .join('');

  const { publisher, ingredients, source_url, image_url, title, servings, cooking_time, key, id } = recipe;

  // Add servings to app state
  servingsCounter = servings;

  const html = `
  <div class="recipe-img-box">
    <img src="${image_url}" alt="" class="recipe-img"/>
    <h1 class="recipe-title">${title}</h1>
  </div>

  <div class="recipe-text">
    <div class="recipe-header recipe-sub-section">
      <div class="recipe-actions">
        <p class="recipe-duration"><span class="action-logo">🕒</span> <span class="action-value">${cooking_time}</span> minutes</p>
        <div class="recipe-servings-box">
          <p class="recipe-servings"><span class="action-logo opacity-6">👥</span> <span class="action-value">${servings}</span> servings</p>
          <div class = "update-ing-btns">
            <a href="#" class="increase-servings">➕</a>
            <a href="#" class="decrease-servings">➖</a>
          </div>
        </div>
      </div>

      <div class="recipe-actions">
        ${key ? '<span class="recipe-user opacity-6">👤</span>' : ''}
        <a href="#" class="save-recipe opacity-6">${isSavedRecipe(id) ? '❤️' : '🤍'}</a>
      </div>
    </div>

    <div class="ingredients recipe-sub-section">
      <h2 class="ingredients-title recipe-sub-head">Recipe Ingredients</h2>
      <ul class="recipe-ingredient-list">${generateIngredientList(ingredients)}</ul>
    </div>

    <div class="cook">
      <h2 class="cook-title recipe-sub-head">How to cook it</h2>
      <p class="cook-text">
        This recipe was carefully designed and tested by
        <span> ${publisher}</span>. Please check out directions at
        their website.
      </p>
      <a href="${source_url}" target="_blank" class="btn-link light-bg">Direction &rightarrow;</a>
    </div>
  </div>`;

  recipeInfo.classList.add('hidden-info');
  recipeContainer.insertAdjacentHTML('afterbegin', html);

  // Bind Save-recipe event
  document.querySelector('.save-recipe').addEventListener('click', e => saveRecipeHandler(e, recipe));

  // Bind update servings event
  document.querySelector('.update-ing-btns').addEventListener('click', e => scaleIngredientsCB(e, recipe));
};

/**
 * Get recipe for given id from Forkify API
 * @param {string} id Recipe Id
 */
const getRecipe = async id => {
  try {
    const jsonData = await AJAX(`${FORKIFY_API_URL}/${id}?key=${FORKIFY_API_KEY}`);

    const recipeObj = jsonData.data.recipe;

    // Render recipe
    renderRecipe(recipeObj);

    // Save recipe to app state
    // recipe = recipeObj;
  } catch (error) {
    console.dir(error);
    showInfo(recipeInfo, error.message, 'danger');
  }
};

// Recipe preview view & Saved recipe view: Recipe item click event
commonPreviewContainer.forEach(list =>
  list.addEventListener('click', function (e) {
    e.preventDefault();

    const previewItem =
      e.target.closest('.recipe-preview-item') || e.target.closest('.saved-recipe-preview-item');

    if (!previewItem) return;

    const id = previewItem.dataset.id;

    recipeContainer.textContent = '';
    showInfo(recipeInfo, 'Loading...');

    // Store recipe id to app state
    recipeId = id;

    // Highlight current item
    highlightItem(id);

    // Add recipe id to URL
    history.pushState({}, '', `#${id}`);

    // Fetch recipe
    getRecipe(id);
  })
);

/**
 * Get recipe id from URL and fetch Recipe
 */
const loadRecipeForUrlId = () => {
  const hash = window.location.hash;
  if (!hash) return;

  const id = hash.slice(1);

  // Store recipe id to app state
  recipeId = id;

  // Fetch & render recipe
  getRecipe(id);
};

//////////////////////// SERVINGS ////////////////////////

const updateServingsView = (newServings, scaledIngredients) => {
  document.querySelector('.recipe-servings .action-value').textContent = newServings;
  const ingListContainer = document.querySelector('.recipe-ingredient-list');

  const ingQuantityContainers = ingListContainer.getElementsByClassName('ing-quantity');

  scaledIngredients.forEach(
    (quantity, i) => (ingQuantityContainers[i].textContent = quantity ? fracty(quantity) : '')
  );
};

const scaleIngredients = (originalServings, newServings, ingredients) => {
  const scaleFactor = newServings / originalServings;

  return ingredients.map(ing => scaleFactor * ing.quantity);
};

const scaleIngredientsCB = (e, recipe) => {
  e.preventDefault();

  if (e.target.classList.contains('update-ing-btns')) return;

  let newServings;
  const { servings, ingredients } = recipe;

  if (e.target.classList.contains('increase-servings')) newServings = ++servingsCounter;
  if (e.target.classList.contains('decrease-servings'))
    newServings = servingsCounter === 1 ? servingsCounter : --servingsCounter; // ensures that newServings is atleast 1

  const scaledIngredients = scaleIngredients(servings, newServings, ingredients);

  updateServingsView(newServings, scaledIngredients);
};

//////////////////////// SAVE RECIPE ////////////////////////

const isSavedRecipe = recipeId => {
  return !savedRecipes.every(recipe => recipe.id !== recipeId);
};

const updateLocalStorage = () => localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(savedRecipes));

const saveRecipe = (btn, recipe) => {
  // Add recipe to savedRecipes
  savedRecipes.push(recipe);

  // Save recipe to localStorage
  updateLocalStorage();

  // Change save button to 'Unsave'
  if (btn) btn.textContent = '❤️';

  // Saved Recipe View:

  // Hide info
  savedRecipesInfo.classList.add('hidden-info');

  // Render recipe item
  savedRecipesContainer.insertAdjacentHTML(
    'beforeend',
    generateRecipePreviewItem(recipe, 'saved-recipe-preview-item')
  );

  // Highlight recipt item
  highlightItem(recipe.id);
};

const unsaveRecipe = (btn, recipeId) => {
  // Get recipe index using recipeId
  const recipeIndex = savedRecipes.findIndex(recipe => recipe.id === recipeId);

  // Remove recipe from savedRecipes
  if (recipeIndex !== -1) savedRecipes.splice(recipeIndex, 1);

  // If no saved recipe, empty localStorage. Else, update localStorage
  if (!savedRecipes.length) {
    savedRecipesInfo.classList.remove('hidden-info');
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  } else {
    updateLocalStorage();
  }

  // Change 'Unsave' button to 'Save'
  btn.textContent = '🤍';

  // Remove recipe form Saved recipe view using recipeId
  const recipeItem = savedRecipesContainer.querySelector(`[data-id="${recipeId}"]`);

  if (recipeItem) recipeItem.remove();
};

const saveRecipeHandler = (e, recipe) => {
  e.preventDefault();

  const btn = e.target;
  const recipeId = recipe.id;

  // Check whether recipe is already saved,
  // If yes, Unsave. Else, Save
  if (savedRecipes.length && isSavedRecipe(recipeId)) {
    unsaveRecipe(btn, recipeId);
  } else {
    saveRecipe(btn, recipe);
  }
};

const loadSavedRecipes = () => {
  // Check if recipes exist in localStorage
  // const savedRecipes = localStorage.getItem(LOCAL_STORAGE_KEY)
  const localData = localStorage.getItem(LOCAL_STORAGE_KEY);

  if (!localData) return;

  savedRecipes.push(...JSON.parse(localData));

  // If yes then, render them in Saved recipes view
  renderRecipeList(savedRecipes, savedRecipesInfo, savedRecipesContainer, 'saved-recipe-preview-item');
};

///////////////////// ADD RECIPE POPUP ////////////////////////////

const clearFormInputs = form => form.querySelectorAll('input').forEach(inp => (inp.value = ''));

const togglePopup = () => {
  const popup = document.getElementById('popup');
  const backdrop = document.getElementById('backdrop');
  popup.classList.toggle('hidden-popup');
  backdrop.classList.toggle('hidden-popup');
};

openPopupBtnItem.addEventListener('click', function (e) {
  e.preventDefault();

  const btn = e.target.closest('.open-popup-item');
  if (!btn) return;

  // clearFormInputs(addRecipeForm);
  popupInfo.classList.add('hidden-info');
  addRecipeSubmitBtn.disabled = false;
  togglePopup();
});

closePopupBtn.addEventListener('click', function (e) {
  e.preventDefault();
  togglePopup();
});

const validateIngredients = ingredients => {
  const validIngredients = [];
  const length = ingredients.length;

  for (let i = 0; i < length; i++) {
    // Ingredient format: Quantity (can be empty), Unit (can be empty) , description (required)
    const details = ingredients[i][1];
    const ingParts = details.split(',');

    if (ingParts.length !== 3 || ingParts[2].trim() === '') {
      showInfo(popupInfo, 'Invalid ingredient format!', 'danger');
      return false;
    }

    validIngredients.push({
      quantity: ingParts[0] ? +ingParts[0] : null,
      unit: ingParts[1],
      description: ingParts[2],
    });
  }

  return validIngredients;
};

const uploadRecipe = async recipe => {
  try {
    const jsonData = await AJAX(`${FORKIFY_API_URL}?key=${FORKIFY_API_KEY}`, recipe);

    showInfo(popupInfo, 'Congrats! Your recipe is uploaded successfully!');

    // Hide form
    setTimeout(togglePopup, 1000 * POPUP_HIDE_SECONDS);

    const recipeObj = jsonData.data.recipe;
    const id = recipeObj.id;
    console.log(recipeObj);

    recipeContainer.textContent = '';
    showInfo(recipeInfo, 'Loading...');

    // Store recipe id to app state
    recipeId = id;

    // Bookmark recipe
    saveRecipe(undefined, recipeObj);

    // Render recipe in Recipe view
    renderRecipe(recipeObj);

    // Add recipe id to URL
    history.pushState({}, '', `#${id}`);
  } catch (error) {
    console.dir(error);
    showInfo(popupInfo, error.message, 'danger');
  }
};

// prevent submitting form when hit 'enter' on input
addRecipeForm.addEventListener('keydown', function (e) {
  if (e.key === 'Enter') e.preventDefault();
});

// form submit
addRecipeForm.addEventListener('submit', function (e) {
  e.preventDefault();

  showInfo(popupInfo, 'Processing...');
  this.disabled = true;

  const formDataArr = [...new FormData(addRecipeForm)];

  const ingredients = formDataArr.filter(inp => inp[0].startsWith('inp-ing') && inp[1].trim() !== '');

  if (!ingredients.length) {
    showInfo(popupInfo, 'You must provide at least one ingredient!', 'danger');
    return;
  }

  // Validate ingredient
  const validIngredients = validateIngredients(ingredients);
  if (!validIngredients) return;

  // Create recipe object
  const recipe = formDataArr.filter(inp => !inp[0].startsWith('inp-ing'));
  const recipeObj = Object.fromEntries(recipe);
  recipeObj.ingredients = validIngredients;

  // Pass data to api
  uploadRecipe(recipeObj);
});

///////////////////// INIT ////////////////////////////
const init = () => {
  persistTheme();
  loadRecipeForUrlId();
  loadSavedRecipes();
};

init();
