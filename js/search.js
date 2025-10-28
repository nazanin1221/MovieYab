// DOM Elements
const searchInput = document.getElementById('searchInput');
const moviesGrid = document.getElementById('moviesGrid');
const resultsCount = document.getElementById('resultsCount');
const showFavoritesBtn = document.getElementById('showFavorites');
const movieModal = document.getElementById('movieModal');
const modalContent = document.getElementById('modalContent');
const closeMovieModal = document.getElementById('closeMovieModal');
const modalContentContainer = document.querySelector('.modalContent');

// State
let currentMovies = [];
let showOnlyFavorites = false;
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  await loadMovies();
  renderMovies(currentMovies);
  setupEventListeners();
});

// Load movies from JSON file
async function loadMovies() {
  try {
    const response = await fetch('./js/movies.json');
    const moviesData = await response.json();
    currentMovies = moviesData;
  } catch (error) {
    console.error('Error loading movies:', error);
    currentMovies = [];
  }
}

// Event Listeners
function setupEventListeners() {
  searchInput.addEventListener('input', handleSearch);
  showFavoritesBtn.addEventListener('click', toggleFavoritesView);
  closeMovieModal.addEventListener('click', closeMovieDetails);
  
  // Close modal when clicking outside
  movieModal.addEventListener('click', (e) => {
    if (e.target === movieModal) {
      closeMovieDetails();
    }
  });
}

// Search functionality
function handleSearch() {
  const searchTerm = searchInput.value.toLowerCase().trim();
  
  if (searchTerm === '') {
    renderMovies(currentMovies);
  } else {
    const filteredMovies = currentMovies.filter(movie => 
      movie.title.toLowerCase().includes(searchTerm)
    );
    
    if (showOnlyFavorites) {
      const filteredFavorites = filteredMovies.filter(movie => 
        favorites.includes(movie.id)
      );
      renderMovies(filteredFavorites);
    } else {
      renderMovies(filteredMovies);
    }
  }
}

// Toggle favorites view
function toggleFavoritesView() {
  showOnlyFavorites = !showOnlyFavorites;
  
  if (showOnlyFavorites) {
    const favoriteMovies = currentMovies.filter(movie => 
      favorites.includes(movie.id)
    );
    renderMovies(favoriteMovies);
    showFavoritesBtn.innerHTML = '<i class="bx bx-heart mr-2"></i> Show All';
  } else {
    renderMovies(currentMovies);
    showFavoritesBtn.innerHTML = '<i class="bx bx-heart mr-2"></i> Show Favorites';
  }
}

// Toggle favorite status
function toggleFavorite(movieId) {
  if (favorites.includes(movieId)) {
    favorites = favorites.filter(id => id !== movieId);
  } else {
    favorites.push(movieId);
  }
  
  localStorage.setItem('favorites', JSON.stringify(favorites));
  
  // Update UI
  const favoriteBtn = document.querySelector(`[data-movie-id="${movieId}"] .favorite-btn`);
  if (favoriteBtn) {
    if (favorites.includes(movieId)) {
      favoriteBtn.classList.add('active');
      favoriteBtn.innerHTML = '<i class="bx bxs-heart"></i>';
    } else {
      favoriteBtn.classList.remove('active');
      favoriteBtn.innerHTML = '<i class="bx bx-heart"></i>';
    }
  }
  
  // If we're in favorites view, update the grid
  if (showOnlyFavorites) {
    const favoriteMovies = currentMovies.filter(movie => 
      favorites.includes(movie.id)
    );
    renderMovies(favoriteMovies);
  }
}

// Render movies to the grid
function renderMovies(moviesToRender) {
  if (moviesToRender.length === 0) {
    moviesGrid.innerHTML = `
      <div class="col-span-full text-center py-10">
        <i class='bx bx-movie-play text-6xl text-gray-500 mb-4'></i>
        <p class="text-gray-400 text-xl">No movies found</p>
      </div>
    `;
    resultsCount.textContent = `No results found`;
    return;
  }
  
  moviesGrid.innerHTML = moviesToRender.map(movie => `
    <div class="movie-card bg-[#151C2F] rounded-xl overflow-hidden shadow-md" data-movie-id="${movie.id}">
      <div class="relative">
        <img 
          src="${movie.poster}" 
          alt="${movie.title}" 
          class="w-full h-64 object-cover cursor-pointer"
          onclick="openMovieDetails(${movie.id})"
        >
        <button 
          class="favorite-btn absolute top-2 right-2 bg-black/50 rounded-full p-2 text-white ${favorites.includes(movie.id) ? 'active' : ''}"
          onclick="toggleFavorite(${movie.id})"
        >
          <i class='bx ${favorites.includes(movie.id) ? 'bxs-heart' : 'bx-heart'}'></i>
        </button>
        <div class="absolute bottom-2 left-2 bg-yellow-500 text-black font-bold py-1 px-2 rounded-md flex items-center">
          <i class='bx bxs-star mr-1'></i> ${movie.rating}
        </div>
      </div>
      <div class="p-4">
        <h3 class="font-bold text-lg mb-1 cursor-pointer" onclick="openMovieDetails(${movie.id})">${movie.title}</h3>
        <p class="text-gray-400 text-sm mb-2">${movie.year}</p>
        <p class="text-gray-300 text-sm line-clamp-2">${movie.plot}</p>
      </div>
    </div>
  `).join('');
  
  resultsCount.textContent = `Showing ${moviesToRender.length} movie${moviesToRender.length !== 1 ? 's' : ''}`;
}

// Open movie details modal
function openMovieDetails(movieId) {
  const movie = currentMovies.find(m => m.id === movieId);
  if (!movie) return;
  
  // Generate genre tags if available
  const genreTags = movie.genre ? 
    movie.genre.split(', ').map(g => `<span class="genre-tag">${g}</span>`).join('') : '';
  
  modalContent.innerHTML = `
    <div class="flex flex-col md:flex-row gap-6">
      <div class="md:w-2/5">
        <img src="${movie.poster}" alt="${movie.title}" class="w-full rounded-lg shadow-lg mb-4">
        <div class="rating-badge inline-block">
          <i class='bx bxs-star'></i>
          <span>${movie.rating}/10</span>
        </div>
      </div>
      <div class="md:w-3/5">
        <h2 class="text-3xl font-bold mb-2">${movie.title} (${movie.year})</h2>
        
        ${movie.genre ? `
          <div class="mb-4">
            ${genreTags}
          </div>
        ` : ''}
        
        <div class="plot-box">
          <h3 class="text-lg font-semibold mb-2 text-blue-300">Plot Summary</h3>
          <p class="text-gray-200">${movie.plot}</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-3">
            ${movie.director ? `
              <div class="info-item">
                <span class="info-label">Director:</span>
                <span class="info-value">${movie.director}</span>
              </div>
            ` : ''}
            
            ${movie.writer ? `
              <div class="info-item">
                <span class="info-label">Writer:</span>
                <span class="info-value">${movie.writer}</span>
              </div>
            ` : ''}
            
            ${movie.actors ? `
              <div class="info-item">
                <span class="info-label">Cast:</span>
                <span class="info-value">${movie.actors}</span>
              </div>
            ` : ''}
          </div>
          
          <div class="space-y-3">
            ${movie.language ? `
              <div class="info-item">
                <span class="info-label">Language:</span>
                <span class="info-value">${movie.language}</span>
              </div>
            ` : ''}
            
            ${movie.runtime ? `
              <div class="info-item">
                <span class="info-label">Runtime:</span>
                <span class="info-value">${movie.runtime}</span>
              </div>
            ` : ''}
            
            ${movie.awards && movie.awards !== "Nothing" ? `
              <div class="info-item">
                <span class="info-label">Awards:</span>
                <span class="info-value">${movie.awards}</span>
              </div>
            ` : ''}
            
            ${movie.released ? `
              <div class="info-item">
                <span class="info-label">Released:</span>
                <span class="info-value">${movie.released}</span>
              </div>
            ` : ''}
          </div>
        </div>
        
        <div class="mt-6 flex space-x-4">
          <button 
            class="favorite-btn flex items-center ${favorites.includes(movie.id) ? 'text-red-500' : 'text-gray-400'} bg-[#0B1020] hover:bg-[#1a233d] py-2 px-4 rounded-lg transition-colors"
            onclick="toggleFavorite(${movie.id}); updateModalFavorite(${movie.id})"
          >
            <i class='bx ${favorites.includes(movie.id) ? 'bxs-heart' : 'bx-heart'} mr-2'></i>
            ${favorites.includes(movie.id) ? 'Remove from Favorites' : 'Add to Favorites'}
          </button>
        </div>
      </div>
    </div>
  `;
  
  movieModal.classList.remove('hidden');
  setTimeout(() => modalContentContainer.classList.add('show'), 10);
}

// Update favorite button in modal
function updateModalFavorite(movieId) {
  const favoriteBtn = modalContent.querySelector('.favorite-btn');
  if (favorites.includes(movieId)) {
    favoriteBtn.classList.add('text-red-500');
    favoriteBtn.classList.remove('text-gray-400');
    favoriteBtn.innerHTML = `<i class='bx bxs-heart mr-2'></i> Remove from Favorites`;
  } else {
    favoriteBtn.classList.remove('text-red-500');
    favoriteBtn.classList.add('text-gray-400');
    favoriteBtn.innerHTML = `<i class='bx bx-heart mr-2'></i> Add to Favorites`;
  }
}

// Close movie details modal
function closeMovieDetails() {
  modalContentContainer.classList.remove('show');
  modalContentContainer.classList.add('hide');
  setTimeout(() => {
    movieModal.classList.add('hidden');
    modalContentContainer.classList.remove('hide');
  }, 200);
}
// -------------------- Navbar Buttons --------------------

// دکمه برگشت -> انتقال به movies.html
document.getElementById("backBtn").addEventListener("click", () => {
  window.location.href = "movies.html";
});

// دکمه خروج
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("user"); // فقط اطلاعات کاربر حذف می‌شه
  alert("You have been logged out!");
  window.location.href = "index.html"; // بازگشت به صفحه اصلی
});



// Make functions globally available for onclick handlers
window.toggleFavorite = toggleFavorite;
window.openMovieDetails = openMovieDetails;
window.updateModalFavorite = updateModalFavorite;