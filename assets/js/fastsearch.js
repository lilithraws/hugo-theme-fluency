var fuse; // holds our search engine
var fuseIndex;
var searchVisible = false; 
var firstRun = true; // allow us to delay loading json data unless search activated
var list = document.getElementById('searchResults'); // targets the <ul>
var first = list.firstChild; // first child of search list
var last = list.lastChild; // last child of search list
var maininput = document.getElementById('searchInput'); // input box for search
var resultsAvailable = false; // Did we get any search results?


// ==========================================
// execute search as each character is typed
//
document.getElementById("searchInput").onkeyup = function(e) { 
  executeSearch(this.value);
}

document.querySelector("body").onclick = function(e) {
    if (e.target.tagName !== 'INPUT') {
        hideSearch()
    }
}

document.querySelector("#searchInput").onfocus = function(e) { 
    doSearch(e)
}
  
function doSearch(e) {
    e.stopPropagation();
    if (firstRun) {
        loadSearch() // loads our json data and builds fuse.js search index
        firstRun = false // let's never do this again
    }
    // Toggle visibility of search box
    if (!searchVisible) {
        showSearch() // search visible
    }
    else {
        hideSearch()
    }
}

function hideSearch() {
    document.getElementById("searchResults").style.visibility = "hidden" // hide search box
    document.activeElement.blur() // remove focus from search box 
    searchVisible = false
}

function showSearch() {
    document.getElementById("searchResults").style.visibility = "visible" // show search box
    document.getElementById("searchInput").focus() // put focus in input box so you can just start typing
    searchVisible = true
}

// ==========================================
// fetch some json without jquery
//
function fetchJSONFile(path, callback) {
  var httpRequest = new XMLHttpRequest();
  httpRequest.onreadystatechange = function() {
    if (httpRequest.readyState === 4) {
      if (httpRequest.status === 200) {
        var data = JSON.parse(httpRequest.responseText);
          if (callback) callback(data);
      }
    }
  };
  httpRequest.open('GET', path);
  httpRequest.send(); 
}


// ==========================================
// load our search index, only executed once
// on first call of search box (CMD-/)
//
function loadSearch() { 
  console.log('loadSearch()')
  fetchJSONFile('/index.json', function(data){

    var options = { // fuse.js options; check fuse.js website for details
      shouldSort: true,
      location: 0,
      distance: 100,
      threshold: 0.4,
      minMatchCharLength: 1,
      keys: [
        'title'
      ]
    };
    // Create the Fuse index
    fuseIndex = Fuse.createIndex(options.keys, data)
    fuse = new Fuse(data, options, fuseIndex); // build the index from the json file
  });
}


// ==========================================
// using the index we loaded on CMD-/, run 
// a search query (for "term") every time a letter is typed
// in the search box
//
function executeSearch(term) {
  let results = fuse.search(term); // the actual query being run using fuse.js
  let searchitems = ''; // our results bucket

  if (results.length === 0) { // no results based on what was typed into the input box
    resultsAvailable = false;
    searchitems = '';
  } else { // build our html
    // console.log(results)
    permalinks = [];
    numLimit = 10;
    for (let item in results) { // only show first 5 results
        if (item > numLimit) {
            break;
        }
        if (permalinks.includes(results[item].item.permalink)) {
            continue;
        }
    //   console.log('item: %d, title: %s', item, results[item].item.title)
      searchitems = searchitems + '<li><a href="' + results[item].item.permalink + '" tabindex="0">' + '<span class="title">' + results[item].item.title + '</span></a></li>';
      permalinks.push(results[item].item.permalink);
    }
    resultsAvailable = true;
  }

  document.getElementById("searchResults").innerHTML = searchitems;
  if (results.length > 0) {
    first = list.firstChild.firstElementChild; // first result container — used for checking against keyboard up/down location
    last = list.lastChild.firstElementChild; // last result container — used for checking against keyboard up/down location
  }
}