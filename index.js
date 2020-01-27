"use strict";

// key for national parks api
const apiKey = "zkgnJv4cp7fPbbb2Kjiic4Ecnah5If4DNW0S6bnJ";
// key for reverse geocoding api
const LOCATIONIQ_API_TOKEN = "eb0db858a2c570";

function displayResults(responseJson, maxResults, addresses) {

  
  // if there are previous results, remove them
  console.log("from displayResults 1", responseJson);
  $("#results-list").empty();
  console.log("addresses from displayResults() :", addresses);
  let address;
  for (let i = 0; i < responseJson.total && i < maxResults; i++) {
    if (addresses[i] === null) {
      address = '';
    } else {
      address = addresses[i].display_name;
    }
    $("#results-list").append(
      `<li><h3>${responseJson.data[i].fullName}</h3>
      <p>${responseJson.data[i].description}</p>
      <a href='${responseJson.data[i].url}'>${responseJson.data[i].url}
      </a>
      <p><span class"bold">Address:</span> ${address}</p>
      </li>`
    );
  }
  //display the results section
  $("#results").removeClass("hidden");
}

async function getAddresses(responseJson, maxResults) {
  let data = responseJson.data;
  const regLat = /(?<=lat:)(.+?)(?=,)/g;
  const regLong = /(?<=long:)(.*)/g;

  const delay = function(millis) {
    return new Promise((resolve, reject) => {
      window.setTimeout(() => {
        resolve(true);
      }, millis);
    });
  };

  async function getAddress(lat, long) {
    try {
      const retValue = await fetch(
        `https://us1.locationiq.com/v1/reverse.php?key=${LOCATIONIQ_API_TOKEN}&lat=${lat}&lon=${long}&format=json`
      ).then(response => {
        if (response.ok || response.status == 429) {
          // console.log('response.status from getaddresses() 1 ', response.status)
          return response.json();
        } else {
          return null;
        }
      });
      return retValue; //promisified
    } catch (e) {
      return null; //promisified
    }
  }

  // let promises = [];
  let addresses = {};

  for (let i = 0; i < responseJson.total && i < maxResults; i++) {
    if (data[i].latLong == "") {
      // promises.push(Promise.resolve(null));
      addresses[i] = null;

      continue;
    }
    // if latlong exists

    const lat = data[i].latLong.match(regLat)[0];
    const long = data[i].latLong.match(regLong)[0];
    $("#js-error-message").text(
      `Fetching...${((i / maxResults) * 100).toFixed(2)}`
    );
    console.log(`delay ${new Date().toLocaleTimeString()}`);
    await delay(333);
    await getAddress(lat, long).then(result => {
      console.log("addresses[i]", addresses[i]);
      addresses[i] = result;
      if (addresses[i] === null) {
        addresses[i].display_name = '';
      }
    });


  }

  // await Promise.all(promises)
  console.log(`Got addresses:`, addresses);
  return addresses;

  //     console.log('addresses from getAddresses() 4',addresses)
  //   return addresses;
}

function getNationalParks(states, maxResults = 10) {
  states = states.replace(/\s/g, "");
  const url = `https://developer.nps.gov/api/v1/parks?stateCode=${states}&api_key=${apiKey}`;
  // console.log(url);
  fetch(url)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => {
      console.log("responseJson", responseJson);
      console.log(`Got parks, getAddresses`);
      const addresses = getAddresses(responseJson, maxResults).then(
        addresses => {
          console.log("addresses from getNationalParks()", addresses);
          displayResults(responseJson, maxResults, addresses);
        }
      );
      //   console.log('addresses from getNationalParks()',addresses)
      //   displayResults(responseJson, maxResults, addresses);
    })
    .catch(err => {
      $("#js-error-message").text(`Something went wrong: ${err.message}`);
    });
}

function watchForm() {
  $("form").submit(event => {
    event.preventDefault();
    const states = $("#js-states").val();
    console.log(states);
    const maxResults = $("#js-max-results").val();
    console.log(maxResults);
    getNationalParks(states, maxResults);
  });
}

$(watchForm);
