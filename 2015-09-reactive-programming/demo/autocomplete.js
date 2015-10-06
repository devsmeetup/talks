// Element
let search_element = document.querySelector('#search');
let results_element = document.querySelector('#results');

// Create `keyup` observable
let keyup_stream = Rx.Observable.fromEvent(search_element, 'keyup');

keyup_stream
  .map(() => search_element.value)
  .filter(text => text.length > 2) // Only care if text is longer than 2 symbols
  .debounce(300) // Wait!
  .distinctUntilChanged()
  .do(() => search_element.classList.add('spinner')) // Side effect
  .flatMapLatest(query => $.ajax({
      url: 'http://en.wikipedia.org/w/api.php',
      dataType: 'jsonp',
      data: {
        action: 'opensearch',
        format: 'json',
        search: encodeURI(query.replace(' ', '_'))
      }
  }).promise())
  .map(parseWikipediaData)
  .do(() => search_element.classList.remove('spinner')) // Side effect
  .map(results => results.reduce((html, result) => `${html}<li><a href="${result.link}">${result.name}</a></li>`, ''))
  .subscribe(resultsHTML => results_element.innerHTML = resultsHTML,
    err => console.error(err));


function parseWikipediaData ( data ) {
    let size = data[1].length,
        list = [];
    for(var i = 0; i < size; i++) {
      list.push({
        name: data[1][i],
        description: data[2][i],
        link: data[3][i]
      })
    }
    return list;
}