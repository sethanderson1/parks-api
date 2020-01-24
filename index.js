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
    // style="font-weight:bold"; 
  }
  //display the results section
  $("#results").removeClass("hidden");
}

async function getAddresses(responseJson, maxResults) {
  let data = responseJson.data;
  // let lat = "";
  // let long = "";
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

  let promises = [];
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

    /*     
         promises.push(
             
         )
         */
  }

  // await Promise.all(promises)
  console.log(`Got addresses:`, addresses);
  return addresses;

  //     console.log('addresses from getAddresses() 4',addresses)
  //   return addresses;
}

function getNationalParks(states, maxResults = 3) {
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

// "use strict";

// // key for national parks api
// const apiKey = "zkgnJv4cp7fPbbb2Kjiic4Ecnah5If4DNW0S6bnJ";
// // key for reverse geocoding api
// const LOCATIONIQ_API_TOKEN = "eb0db858a2c570";

// function displayResults(responseJson, maxResults, addresses) {
//   // if there are previous results, remove them
//   console.log("from displayResults 1", responseJson);
//   $("#results-list").empty();
//  console.log('addresses from displayResults() :', addresses)
//   for (let i = 0; i < responseJson.total && i < maxResults; i++) {
//     $("#results-list").append(
//       `<li><h3>${responseJson.data[i].fullName}</h3>
//       <p>${responseJson.data[i].description}</p>
//       <a href='${responseJson.data[i].url}'>${responseJson.data[i].url}
//       </a>
//       <p>${addresses[i]}</p>
//       </li>`
//     );
//   }
//   //display the results section
//   $("#results").removeClass("hidden");
// }

// function getAddresses(responseJson,maxResults) {
//   const addresses = [];
//   let data = responseJson.data;
//   let lat = "";
//   let long = "";
//   const regLat = /(?<=lat:)(.+?)(?=,)/g;
//   const regLong = /(?<=long:)(.*)/g;
//   for (let i = 0; i < responseJson.total && i < maxResults; i++) {
//     // if latlong exists
//     if (data[i].latLong !== "") {
//       lat = data[i].latLong.match(regLat)[0];
//       long = data[i].latLong.match(regLong)[0];
//       fetch(
//         `https://us1.locationiq.com/v1/reverse.php?key=${LOCATIONIQ_API_TOKEN}&lat=${lat}&lon=${long}&format=json`
//       )
//         .then(response => {
//           if (response.ok || response.status == 429) {
//             // console.log('response.status from getaddresses() 1 ', response.status)
//             return response.json();
//           }
//           // console.log('response.statusText from getaddresses 2', response.statusText)
//           throw new Error(response.statusText);
//         })
//         .then(responseJson1 => {
//           console.log("responseJson1 from getAddresses() ", responseJson1);
//           // console.log("responseJson1.display_name from getAddresses() ", responseJson1.display_name);
//           console.log('responseJson1.error from getAddresses()', responseJson1.error)
//           if (responseJson1.error === 'Rate Limited Second') {
//             addresses.push('Rate Limited Second error');
//           } else {
//             console.log("responseJson1.display_name from getAddresses() ", responseJson1.display_name);
//             addresses.push(responseJson1.display_name);
//           }
//           console.log("addresses from getAddresses() 3",addresses);
//         })
//         .catch(err => {
//           $("#js-error-message").text(`Something went wrong: ${err.message}`);
//         });
//     } else {
//       addresses.push("address not available");
//     }
//   }
//     console.log('addresses from getAddresses() 4',addresses)
//   return addresses;
// }

// function getNationalParks(states, maxResults = 10) {
//   states = states.replace(/\s/g, "");
//   const url = `https://developer.nps.gov/api/v1/parks?stateCode=${states}&api_key=${apiKey}`;
//   // console.log(url);
//   fetch(url)
//     .then(response => {
//       if (response.ok) {
//         return response.json();
//       }
//       throw new Error(response.statusText);
//     })
//     .then(responseJson => {
//       console.log('responseJson',responseJson);
//       const addresses = getAddresses(responseJson,maxResults);
//       console.log('addresses from getNationalParks()',addresses)
//       displayResults(responseJson, maxResults, addresses);
//     })
//     .catch(err => {
//       $("#js-error-message").text(`Something went wrong: ${err.message}`);
//     });
// }

// function watchForm() {
//   $("form").submit(event => {
//     event.preventDefault();
//     const states = $("#js-states").val();
//     console.log(states);
//     const maxResults = $("#js-max-results").val();
//     console.log(maxResults);
//     getNationalParks(states, maxResults);
//   });
// }

// $(watchForm);

// "use strict";

// // put your own value below!
// const apiKey = "zkgnJv4cp7fPbbb2Kjiic4Ecnah5If4DNW0S6bnJ";
// const searchURL = "https://developer.nps.gov/api/v1/parks?parkCode=acad";
// // const GOOGLE_MAPS_API_KEY = 'AIzaSyC6ff4JH4LeSMguWfrjJwluI05Aii0uc9M';
// // const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=35.22729389,-118.5615781&key=AIzaSyC6ff4JH4LeSMguWfrjJwluI05Aii0uc9M`;
// const LOCATIONIQ_API_TOKEN = "eb0db858a2c570";

// function displayResults(responseJson, maxResults, addresses) {
//   // if there are previous results, remove them
//   console.log("from displayResults 1", responseJson);
//   $("#results-list").empty();

//   let data = responseJson.data;
//   // let lat = '';
//   // let long = '';

//   let regLat = /(?<=lat:)(.+?)(?=,)/g;
//   let regLong = /(?<=long:)(.*)/g;
//   // let address = '';
//   for (let i = 0; i < responseJson.total && i < maxResults; i++) {
//     if (data[i].latLong !== "") {
//       // console.log(regLat,regLong)
//       // console.log(data[i].latLong.match(regLat),data[i].latLong.match(regLong))
//       // lat = data[i].latLong.match(regLat)[0];
//       // long = data[i].latLong.match(regLong)[0];
//       // address = getAddress(lat,long);
//       // console.log('from displayResults 2', address)
//       // console.log('from displayResults 3', responseJson)
//     }
//     $("#results-list").append(
//       `<li><h3>${responseJson.data[i].fullName}</h3>
//       <p>${responseJson.data[i].description}</p>
//       <a href='${responseJson.data[i].url}'>${responseJson.data[i].url}
//       </a>
//       </li>`
//     );
//     // <p>addy ${address}</p>
//   }
//   //display the results section
//   $("#results").removeClass("hidden");
// }

// function getAddresses(responseJson,maxResults) {
//   const addresses = [];

//   let data = responseJson.data;
//   let lat = "";
//   let long = "";

//   const regLat = /(?<=lat:)(.+?)(?=,)/g;
//   const regLong = /(?<=long:)(.*)/g;
//   // let address = '';
//   for (let i = 0; i < responseJson.total && i < maxResults; i++) {
//     if (data[i].latLong !== "") {
//       // console.log(regLat,regLong)
//       // console.log(data[i].latLong.match(regLat),data[i].latLong.match(regLong))
//       lat = data[i].latLong.match(regLat)[0];
//       long = data[i].latLong.match(regLong)[0];
//       // address = getAddress(lat,long);
//       // console.log('from displayResults 2', address)
//       // console.log('from displayResults 3', responseJson)
//       fetch(
//         `https://us1.locationiq.com/v1/reverse.php?key=${LOCATIONIQ_API_TOKEN}&lat=${lat}&lon=${long}&format=json`
//       )
//         .then(response => {
//           if (response.ok || response.status == 429) {
//             console.log('getaddresses -1 ', response.status)
//             return response.json();
//           }
//           console.log('from getaddresses 0', response.statusText)
//           throw new Error(response.statusText);
//         })
//         .then(responseJson1 => {
//           console.log("from getAddresses 1", responseJson1);
//           console.log("from getAddresses 2", responseJson1.display_name);
//           console.log('responseJson1.error', responseJson1.error)
//           if (responseJson1.error === 'Rate Limited Second') {
//             addresses.push('Rate Limited Second error');

//           } else {
//             addresses.push(responseJson1.display_name);

//           }
//           console.log("addresses from getAddresses 3",addresses);
//         })
//         .catch(err => {
//           $("#js-error-message").text(`Something went wrong: ${err.message}`);
//         });
//     } else {
//       addresses.push("address not available");
//     }
//   }

//     console.log('addresses from getAddresses 4',addresses)
//   return addresses;
// }

// function getNationalParks(states, maxResults = 10) {
//   states = states.replace(/\s/g, "");
//   const url = `https://developer.nps.gov/api/v1/parks?stateCode=${states}&api_key=${apiKey}`;
//   console.log(url);

//   fetch(url)
//     .then(response => {
//       if (response.ok) {
//         return response.json();
//       }
//       throw new Error(response.statusText);
//     })
//     .then(responseJson => {
//       console.log(responseJson);
//       // console.log(responseJson.data[10].fullName);
//       const addresses = getAddresses(responseJson,maxResults);
//       console.log('addresses from getNationalParks',addresses)
//       displayResults(responseJson, maxResults, addresses);
//     })
//     .catch(err => {
//       $("#js-error-message").text(`Something went wrong: ${err.message}`);
//     });
// }

// function watchForm() {
//   $("form").submit(event => {
//     event.preventDefault();
//     const states = $("#js-states").val();
//     console.log(states);
//     const maxResults = $("#js-max-results").val();
//     console.log(maxResults);
//     getNationalParks(states, maxResults);
//   });
// }

// $(watchForm);

// 'use strict';

// // put your own value below!
// const apiKey = 'zkgnJv4cp7fPbbb2Kjiic4Ecnah5If4DNW0S6bnJ';
// const searchURL = 'https://developer.nps.gov/api/v1/parks?parkCode=acad';
// // const GOOGLE_MAPS_API_KEY = 'AIzaSyC6ff4JH4LeSMguWfrjJwluI05Aii0uc9M';
// // const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=35.22729389,-118.5615781&key=AIzaSyC6ff4JH4LeSMguWfrjJwluI05Aii0uc9M`;
// const LOCATIONIQ_API_TOKEN = '3d3d899d423cfe';

// function displayResults(responseJson,maxResults) {
//   // if there are previous results, remove them
//   console.log('from displayResults 1',responseJson);
//   $('#results-list').empty();

//   let data = responseJson.data;
//   let lat = '';
//   let long = '';

//   let regLat = /(?<=lat:)(.+?)(?=,)/g;
//   let regLong = /(?<=long:)(.*)/g;
//   let address = '';
//   for (let i = 0; i < responseJson.total && i < maxResults; i++) {
//     if (data[i].latLong !== '') {
//       // console.log(regLat,regLong)
//       // console.log(data[i].latLong.match(regLat),data[i].latLong.match(regLong))
//       lat = data[i].latLong.match(regLat)[0];
//       long = data[i].latLong.match(regLong)[0];
//       address = getAddress(lat,long);
//       console.log('from displayResults 2', address)
//       console.log('from displayResults 3', responseJson)
//     }
//     $('#results-list').append(
//       `<li><h3>${responseJson.data[i].fullName}</h3>
//       <p>${responseJson.data[i].description}</p>
//       <a href='${responseJson.data[i].url}'>${responseJson.data[i].url}
//       </a>
//       <p>addy ${address}</p>
//       </li>`
//     )
//   };
//   //display the results section
//   $('#results').removeClass('hidden');
// };

// function getAddress(lat,long) {
//   // const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${long}&key=${GOOGLE_MAPS_API_KEY}`;
//   const url = `https://us1.locationiq.com/v1/reverse.php?key=${LOCATIONIQ_API_TOKEN}&lat=${lat}&lon=${long}&format=json`;
//   let address = '';
//   fetch(url)
//   .then(response => {
//     if (response.ok) {
//       return response.json();
//     }
//     throw new Error(response.statusText);
//   })
//   .then(responseJson => {
//       console.log('from getAddress 1',responseJson);
//       console.log('from getAddress 2',responseJson.display_name)
//           $('#results-list').append(
//             `<p>${responseJson.display_name}</p>`
//             // <p>${address}</p>
//           )
//         address = responseJson.display_name
//         console.log('address from getAddress 3', address)

//         return address
//         })
//   .catch(err => {
//     $('#js-error-message').text(`Something went wrong: ${err.message}`);
//   });

//   console.log('address from getAddress 4', address)
//   return address;

// }

// function getNationalParks(states, maxResults=10) {
// //   const params = {
// //     key: apiKey,
// //     q: query,
// //     part: 'snippet',
// //     maxResults,
// //     type: 'video'
// //   };
// //   const queryString = formatQueryParams(params)
// //   const url = searchURL + '?' + queryString;
// states = states.replace(/\s/g, '');
// const url = `https://developer.nps.gov/api/v1/parks?stateCode=${states}&api_key=${apiKey}`;
//   console.log(url);

//   fetch(url)
//     .then(response => {
//       if (response.ok) {
//         return response.json();
//       }
//       throw new Error(response.statusText);
//     })
//     .then(responseJson => {
//         console.log(responseJson);
//         console.log(responseJson.data[10].fullName)
//             displayResults(responseJson,maxResults);
//         })
//     .catch(err => {
//       $('#js-error-message').text(`Something went wrong: ${err.message}`);
//     });

// }

// function watchForm() {
//   $('form').submit(event => {
//     event.preventDefault();
//     const states = $('#js-states').val();
//     console.log(states)
//     const maxResults = $('#js-max-results').val();
//     console.log(maxResults)
//     getNationalParks(states, maxResults);
//   });
// }

// $(watchForm);
