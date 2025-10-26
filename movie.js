
const searchBox = document.getElementById("movie-search-box");
const searchList = document.getElementById("search-list");
const resultGrid = document.getElementById("result-grid");

let movies = [];

// helper: escape to avoid XSS
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, s => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": "&#39;"  })[s]);
}

// debounce
function debounce(fn, delay = 250) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}

// fetch movies.json
async function loadMovies() {
  try {
    const res = await fetch("./movies.json"); 
    if (!res.ok) throw new Error("Failed to load JSON");
    movies = await res.json();
    console.log("✅ Movies Loaded:", movies.length); 
  } catch (err) {
    console.error('❌ Error loading movies.json:', err);
  }
}

// Run only when page is ready
window.addEventListener("DOMContentLoaded", async () => {
  await loadMovies(); 
});

loadMovies();

// render search suggestions
function renderSearchList(list) {
  if (!list || list.length === 0) {
    searchList.innerHTML = "";
    searchList.classList.add("hide-search-list");
    return;
  }

  searchList.classList.remove("hide-search-list");
  searchList.innerHTML = list.map(m => `
    <div class="search-list-item" data-id="${m.id}">
      <div class="search-item-thumbnail">
        <img src="${escapeHtml(m.poster)}" alt="${escapeHtml(m.title)} poster">
      </div>
      <div class="search-item-info">
        <h3>${escapeHtml(m.title)}</h3>
        <p>${escapeHtml(String(m.year))}</p>
      </div>
    </div>
  `).join('');

  // attach click listeners
  document.querySelectorAll(".search-list-item").forEach(item => {
    item.addEventListener("click", () => {
      const id = item.dataset.id;
      const movie = movies.find(x => String(x.id) === String(id));
      if (movie) {
        displayMovie(movie);
        searchList.innerHTML = "";
        searchList.classList.add("hide-search-list");
        searchBox.value = ""; // optionally clear search
      }
    });
  });
}

// display single movie in result-grid
function displayMovie(m) {
  // Use classes from your HTML/CSS
  resultGrid.innerHTML = `
    <div class="movie-poster">
      <img src="${escapeHtml(m.poster)}" alt="${escapeHtml(m.title)}">
    </div>
    <div class="movie-info">
      <h3 class="movie-title">${escapeHtml(m.title)}</h3>
      <ul class="movie-misc-info">
        <li class="year">Year: ${escapeHtml(String(m.year))}</li>
        <li class="retad">Ratings: ${escapeHtml(String(m.rating))}</li>
        <li class="released">Released: ${escapeHtml(m.released || 'N/A')}</li>
      </ul>
      <p class="genre"><b>Genre:</b> ${escapeHtml(m.genre || '—')}</p>
      <p class="writer"><b>Writer:</b> ${escapeHtml(m.writer || '—')}</p>
      <p class="actors"><b>Actors:</b> ${escapeHtml(m.actors || '—')}</p>
      <p class="plot"><b>Plot:</b> ${escapeHtml(m.plot || '—')}</p>
      <p class="language"><b>Language:</b> ${escapeHtml(m.language || '—')}</p>
      <p class="awards"><b><i class="fas fa-award"></i></b> ${escapeHtml(m.awards || 'Nothing')}</p>
    </div>
  `;
}

// search logic (title / plot / year)
const onSearch = debounce((e) => {
  const q = (e.target.value || "").trim().toLowerCase();
  if (!q) {
    renderSearchList([]);
    return;
  }
  const filtered = movies.filter(m =>
    (m.title && m.title.toLowerCase().includes(q)) ||
    (m.plot && m.plot.toLowerCase().includes(q)) ||
    (String(m.year).includes(q))
  ).slice(0, 10); // max 10 suggestions
  renderSearchList(filtered);
}, 200);

searchBox.addEventListener("input", onSearch);

// close suggestions if click outside
document.addEventListener("click", (e) => {
  if (!searchList.contains(e.target) && e.target !== searchBox) {
    searchList.innerHTML = "";
    searchList.classList.add("hide-search-list");
  }
});

// Optional: show a default movie on load (first item)
window.addEventListener("load", async () => {
  if (movies.length === 0) {
    // maybe fetch completed after load => wait a bit
    await new Promise(resolve => setTimeout(resolve, 100));
  }
});
