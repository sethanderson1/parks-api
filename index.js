'use strict';

// put your own value below!
const apiKey = 'zkgnJv4cp7fPbbb2Kjiic4Ecnah5If4DNW0S6bnJ'; 
const searchURL = 'https://developer.nps.gov/api/v1/parks?parkCode=acad';


// function formatQueryParams(params) {
//   const queryItems = Object.keys(params)
//     .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
//   return queryItems.join('&');
// }

function displayResults(responseJson,maxResults) {
  // if there are previous results, remove them
  console.log(responseJson);
  $('#results-list').empty();
  // iterate through the items array
  for (let i = 0; i < responseJson.total && i < maxResults; i++){
    // for each video object in the items 
    //array, add a list item to the results 
    //list with the video title, description,
    //and thumbnail
    $('#results-list').append(
      `<li><h3>${responseJson.data[i].fullName}</h3>
      <p>${responseJson.data[i].description}</p>
      <a href='${responseJson.data[i].url}'>${responseJson.data[i].url}
      </a>
      </li>`
    )};
  //display the results section  
  $('#results').removeClass('hidden');
};

function getNationalParks(states, maxResults=10) {
//   const params = {
//     key: apiKey,
//     q: query,
//     part: 'snippet',
//     maxResults,
//     type: 'video'
//   };
//   const queryString = formatQueryParams(params)
//   const url = searchURL + '?' + queryString;
states = states.replace(/\s/g, '');
const url = `https://developer.nps.gov/api/v1/parks?stateCode=${states}&api_key=${apiKey}`;
// const url = `https://developer.nps.gov/api/v1/parks?stateCode=az,ca&api_key=${apiKey}`;
  console.log(url);

  fetch(url)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => {
        console.log(responseJson);
        console.log(responseJson.data[10].fullName)
            displayResults(responseJson,maxResults);
        })
    .catch(err => {
      $('#js-error-message').text(`Something went wrong: ${err.message}`);
    });


}

function watchForm() {
  $('form').submit(event => {
    event.preventDefault();
    const states = $('#js-states').val();
    console.log(states)
    const maxResults = $('#js-max-results').val();
    console.log(maxResults)
    getNationalParks(states, maxResults);
  });
}

$(watchForm);