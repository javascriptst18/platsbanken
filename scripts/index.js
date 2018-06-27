// url is used in whole app, put in an object in global scope
const state = {
  baseURL: 'http://api.arbetsformedlingen.se/af/v0/',
  page: 1,
  selectedCounty: 1
}

// Gather all the elements that you want to manipulate in an object
const UIElements = {
  listOfAds: document.querySelector('#listOfAds'),
  selectCounty: document.querySelector('#selectCounty'),
  showMore: document.querySelector('#showMore')
}

/**
 * We need to change the search depending on if want to load the initial
 * ads and then also if we need to do a search. We also may want to load
 * more results which is why we have 'page' parameter. 
 */
async function searchByCriteria(searchCriteria, page = 1) {
  const responseObject = await fetch(`${state.baseURL}${searchCriteria}&sida=${page}`);
  const convertedResponse = await responseObject.json();
  const matchningsdata = convertedResponse.matchningslista.matchningdata;
  return matchningsdata;
}

function appendAdsToHTML(listOfAds){
  for(let ad of listOfAds){
    let newAdElement = createAd(ad);
    UIElements.listOfAds.insertAdjacentHTML('beforeend', newAdElement);
  }
}

function createAd(ad) {
  return `
    <article class="card" id="${ad.annonsid}">
      <p><strong>${ad.annonsrubrik}</strong></p>
      <p><em>${ad.kommunnamn}</em></p>
    </article>
  `;
}

async function fetchAndCreateAds(){
  const response = await searchByCriteria('platsannonser/matchning?lanid=1&yrkesomradeid=3&antalrader=30');
  appendAdsToHTML(response);
}

function bindEventListeners(){
  UIElements.selectCounty.addEventListener('change', async function (event) {
    state.selectedCounty = event.target.value;
    const response = await searchByCriteria(`platsannonser/matchning?lanid=${state.selectedCounty}`);
    appendAdsToHTML(response);
  });

  UIElements.showMore.addEventListener('click', async function(){
    state.page++;
    const response = await searchByCriteria(`platsannonser/matchning?lanid=${state.selectedCounty}`, state.page);
    appendAdsToHTML(response);
  })
}

bindEventListeners();
fetchAndCreateAds();