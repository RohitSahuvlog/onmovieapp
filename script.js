const API_KEY = 'api_key=1cf50e6248dc270629e802686245c2c8';
const BASE_URL = 'https://api.themoviedb.org/3';
const API_URL = `${BASE_URL}/discover/movie?sort_by=popularity.desc&${API_KEY}`;
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const searchURL = `${BASE_URL}/search/movie?${API_KEY}`;

const genres = [{ "id": 28, "name": "Action" }, { "id": 12, "name": "Adventure" }, { "id": 16, "name": "Animation" }, { "id": 35, "name": "Comedy" }, { "id": 14, "name": "Fantasy" }, { "id": 27, "name": "Horror" }, { "id": 10402, "name": "Music" }, { "id": 10749, "name": "Romance" }, { "id": 878, "name": "Science Fiction" }, { "id": 10770, "name": "TV Movie" }]

const main = document.getElementById('main');
const form = document.getElementById('form');
const search = document.getElementById('search');
const tagsEl = document.getElementById('tags');

const prev = document.getElementById('prev')
const next = document.getElementById('next')
const current = document.getElementById('current')
let currentPage = 1;
let totalPages = 100;

let selectedGenre = [];
function renderGenres() {
  tagsEl.innerHTML = genres.map(genre => {
    let isSelected = selectedGenre.includes(genre.id) ? 'highlight' : '';
    return `<div class="tag ${isSelected}" id="${genre.id}">${genre.name}</div>`;
  }).join('');

  genres.forEach(genre => {
    document.getElementById(genre.id).addEventListener('click', () => toggleGenre(genre.id));
  });

  renderClearBtn();
}

function toggleGenre(id) {
  if (selectedGenre.includes(id)) {
    selectedGenre = selectedGenre.filter(genreId => genreId !== id);
  } else {
    selectedGenre.push(id);
  }
  fetchMovies(`${API_URL}&with_genres=${encodeURIComponent(selectedGenre.join(','))}`);
  renderGenres();
}

function renderClearBtn() {
  let clearBtn = document.getElementById('clear');
  if (!clearBtn) {
    clearBtn = document.createElement('div');
    clearBtn.id = 'clear';
    tagsEl.appendChild(clearBtn);
  }
  clearBtn.className = 'tag highlight';
  clearBtn.innerText = 'Clear x';
  clearBtn.onclick = () => {
    selectedGenre = [];
    fetchMovies(API_URL);
    renderGenres();
  };
}

function fetchMovies(url) {
  fetch(url).then(res => res.json()).then(data => {
    if (data.results.length) {
      renderMovies(data.results);
      currentPage = data.page;
      totalPages = data.total_pages;
      updateNavigation();
    } else {
      main.innerHTML = `<h1 class="no-results">No Results Found</h1>`;
    }
  });
}

function renderMovies(data) {
  main.innerHTML = data.map(movie => movieTemplate(movie)).join('');
  function movieTemplate({ title, poster_path, vote_average, overview, id }) {
    return `<div class="movie">
              <img src="${poster_path ? IMG_URL + poster_path : "http://via.placeholder.com/1080x1580"}" alt="${title}">
              <div class="movie-info">
                <h3>${title}</h3>
                <span class="${getRatingClass(vote_average)}">${vote_average}</span>
              </div>
              <div class="overview">
                <h3>Overview</h3>
                ${overview}
                <br/>
                <button class="know-more" id="${id}">Know More</button>
              </div>
            </div>`;
  }
}

function getRatingClass(vote) {
  if (vote >= 8) return 'green';
  if (vote >= 5) return 'orange';
  return 'red';
}

function updateNavigation() {
  current.innerText = currentPage;
  prev.className = currentPage <= 1 ? 'disabled' : '';
  next.className = currentPage >= totalPages ? 'disabled' : '';
}

form.addEventListener('submit', e => {
  e.preventDefault();
  let searchTerm = search.value;
  if (searchTerm) {
    fetchMovies(`${searchURL}&query=${encodeURIComponent(searchTerm)}`);
  } else {
    fetchMovies(API_URL);
  }
  selectedGenre = [];
  renderGenres();
});

prev.addEventListener('click', () => {
  if (currentPage > 1) changePage(currentPage - 1);
});

next.addEventListener('click', () => {
  if (currentPage < totalPages) changePage(currentPage + 1);
});

function changePage(page) {
  let url = lastUrl.split('?')[0];
  let query = `page=${page}`;
  fetchMovies(`${url}?${query}`);
}

renderGenres();
fetchMovies(API_URL);
