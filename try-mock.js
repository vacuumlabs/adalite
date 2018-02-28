require("isomorphic-fetch");
var fetchMock = require("fetch-mock");

function setupMockBlockChainExplorer() {
  fetchMock.mock("https://cardanoexplorer.com/api/addresses/summary/DdzFFzCqrhsmagp4fDZpcY9UaBJk4Z8GaDfxqMCSwxPs3PnVoXmJWUZcgAxw3diCHVYauontEfk7YGeAu2LvAwq3aG2XQ8Mtsz7Vc8LA", {
    "status" : 200,
    "body" : "override"
  });
}

async function makeRequest(url, method = "get", body = null, headers = null) {
  const res = await fetch(url, {
    method: method,
    headers: headers,
    body: body,
  });

  return res.json()
};

//setupMockBlockChainExplorer();

var req = makeRequest("https://cardanoexplorer.com/api/addresses/summary/DdzFFzCqrhsmagp4fDZpcY9UaBJk4Z8GaDfxqMCSwxPs3PnVoXmJWUZcgAxw3diCHVYauontEfk7YGeAu2LvAwq3aG2XQ8Mtsz7Vc8LA");

// I would expect it to print "override" but it prints the http response from the real request instead
req.then(console.log)