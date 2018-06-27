/* url is used in whole app, put in an object in global scope. We are avoiding
 * a lot of stray global variables and grouping similar variables
 */
const state = {
  baseURL: 'http://api.arbetsformedlingen.se/af/v0/',
  page: 1,
  selectedCounty: 1
}

/* Gather all the elements that you want to manipulate in an object. The variable 'listOfAds' could
 * could reference anything in global scope. By putting it inside of an object we are declaring 
 * that it is a special element in the HTML
 */
const UIElements = {
  listOfAds: document.querySelector('#listOfAds'),
  selectCounty: document.querySelector('#selectCounty'),
  showMore: document.querySelector('#showMore')
}

/**
 * We need to change the search depending on if want to load the initial
 * ads and then also if we need to do a search. We also may want to load
 * more results which is why we have 'page' parameter. This is set to 1 by default
 * if we were to forget to supply a page number
 */
async function searchByCriteria(searchCriteria, page = 1) {
  /**
   * Using return on the whole fetch means that we can use 'then'
   * on the whole function later when we want to get the data
   */
  const response = await fetch(`${state.baseURL}${searchCriteria}&sida=${page}`)
  const convertedResponse = await response.json();
  return convertedResponse.matchningslista.matchningdata;
}

function appendAdsToHTML(listOfAds){
  // listOfAds === matchningdata
  for(let ad of listOfAds){
    /**
     * Instead of creating the html inside of the loop, create a function
     * that creates only the card and save it to a new variable
     */
    let newAdElement = createAd(ad);
    /**
     * Insert at the bottom of the list, helps us to append more elements
     * when we fetch more pages
     */
    UIElements.listOfAds.insertAdjacentHTML('beforeend', newAdElement);
  }
}

/**
 * createAd will only return a string containing the HTML that 
 * we want to append to the DOM.
 */
function createAd(ad) {
  return `
    <article class="card" id="${ad.annonsid}">
      <p><strong>${ad.annonsrubrik}</strong></p>
      <p><em>${ad.kommunnamn}</em></p>
    </article>
  `;
}

async function fetchAndCreateAds(){
  /**
   * Because we used 'return' inside of 'searchByCriteria' we can use 'then'
   * on the whole function. The function will return already converted JavaScript array
   */
  const response = await searchByCriteria('platsannonser/matchning?lanid=1&yrkesomradeid=3&antalrader=30')
  appendAdsToHTML(response);
}

/**
 * Create a function that will create all the event listeners. This is so we can
 * decide wgen we want to add the eventlisteners and prevents polluting the global scope
 */
function bindEventListeners(){
  // UIElements.selectCounty is at the top of global scope
  UIElements.selectCounty.addEventListener('change', async function () {
    // Save the value so it can be used in other functions
    state.selectedCounty = UIElements.selectCounty.value;
    const response = await searchByCriteria(`platsannonser/matchning?lanid=${state.selectedCounty}`)
    appendAdsToHTML(response);
  });

  UIElements.showMore.addEventListener('click', async function(){
    // Increase the page number 'globally' so we can know which page we are on
    state.page++;
    // Use the page number as second argument to the function, default is 1.
    const response = await searchByCriteria(`platsannonser/matchning?lanid=${state.selectedCounty}`, state.page)
    appendAdsToHTML(response);
  })
}

// Add all event listeners that we are using
bindEventListeners();
// And fetch the initial ads
fetchAndCreateAds();