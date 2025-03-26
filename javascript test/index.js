// API Key for OMDB (Note: In production, this should be secured)
const API_KEY = '4a3b711b';
const BASE_URL = 'https://www.omdbapi.com/';

// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const yearFilter = document.getElementById('yearFilter');
const typeFilter = document.getElementById('typeFilter');
const resultsContainer = document.getElementById('resultsContainer');
const mainResult = document.getElementById('mainResult');
const recommendations = document.getElementById('recommendations');
const loading = document.getElementById('loading');

// Sample movie database for TF-IDF (in a real app, this would be much larger)
let movieDatabase = [];

// Initialize the year filter dropdown
function initYearFilter() {
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= 1900; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearFilter.appendChild(option);
    }
}

// Fetch movie data from OMDB API
async function fetchMovieData(title, year = '', type = '') {
    try {
        loading.style.display = 'block';
        resultsContainer.style.display = 'none';
        
        let url = `${BASE_URL}?apikey=${API_KEY}&t=${encodeURIComponent(title)}`;
        if (year) url += `&y=${year}`;
        if (type) url += `&type=${type}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.Response === 'False') {
            throw new Error(data.Error || 'Movie not found');
        }
        
        return data;
    } catch (error) {
        console.error('Error fetching movie data:', error);
        showError(error.message);
        return null;
    } finally {
        loading.style.display = 'none';
        resultsContainer.style.display = 'block';
    }
}

// Search for movies
async function search() {
    const query = searchInput.value.trim();
    if (!query) {
        showError('Please enter a movie title');
        return;
    }
    
    const year = yearFilter.value;
    const type = typeFilter.value;
    
    const movieData = await fetchMovieData(query, year, type);
    if (movieData) {
        displayMovieDetails(movieData);
        // For demo purposes, we'll simulate recommendations
        // In a real app, you'd have a proper movie database and TF-IDF implementation
        simulateRecommendations(movieData);
    }
}

// Display movie details
function displayMovieDetails(movie) {
    mainResult.style.display = 'block';
    
    // Add to our "database" for TF-IDF (in a real app, this would be pre-populated)
    if (!movieDatabase.some(m => m.imdbID === movie.imdbID)) {
        movieDatabase.push(movie);
    }
    
    // Create HTML for movie details
    let html = `
        <div class="movie-header">
            <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Poster'}" 
                 alt="${movie.Title}" class="movie-poster">
            <div class="movie-info">
                <h1 class="movie-title">${movie.Title} (${movie.Year})</h1>
                <div class="movie-meta">
                    <span><i class="fas fa-star"></i> ${movie.imdbRating}/10</span>
                    <span><i class="fas fa-clock"></i> ${movie.Runtime}</span>
                    <span><i class="fas fa-film"></i> ${movie.Genre}</span>
                    <span><i class="fas fa-globe"></i> ${movie.Country}</span>
                </div>
                <div class="movie-plot">
                    <h3>Plot</h3>
                    <p>${movie.Plot}</p>
                </div>
                <div class="movie-details">
                    <div class="detail-item">
                        <h4>Director</h4>
                        <p>${movie.Director}</p>
                    </div>
                    <div class="detail-item">
                        <h4>Writers</h4>
                        <p>${movie.Writer}</p>
                    </div>
                    <div class="detail-item">
                        <h4>Actors</h4>
                        <p>${movie.Actors}</p>
                    </div>
                    <div class="detail-item">
                        <h4>Awards</h4>
                        <p>${movie.Awards !== 'N/A' ? movie.Awards : 'None'}</p>
                    </div>
                    <div class="detail-item">
                        <h4>Language</h4>
                        <p>${movie.Language}</p>
                    </div>
                    <div class="detail-item">
                        <h4>Box Office</h4>
                        <p>${movie.BoxOffice !== 'N/A' ? movie.BoxOffice : 'Not available'}</p>
                    </div>
                </div>
                <div class="movie-actions">
                    <button class="btn btn-primary" onclick="watchTrailer('${movie.Title} ${movie.Year}')">
                        <i class="fas fa-play"></i> Watch Trailer
                    </button>
                    <button class="btn btn-secondary" onclick="showDownloadOptions('${movie.imdbID}')">
                        <i class="fas fa-download"></i> Download Options
                    </button>
                    <a href="https://www.imdb.com/title/${movie.imdbID}" target="_blank" class="btn btn-danger">
                        <i class="fab fa-imdb"></i> View on IMDB
                    </a>
                </div>
            </div>
        </div>
    `;
    
    // Add trailer container (will be filled when user clicks watch trailer)
    html += `<div id="trailerContainer" class="trailer-container" style="display: none;"></div>`;
    
    mainResult.innerHTML = html;
}

// Simulate recommendations (in a real app, you'd implement proper TF-IDF)
function simulateRecommendations(mainMovie) {
    recommendations.innerHTML = '';
    
    if (movieDatabase.length < 5) {
        // If our "database" is too small, show some generic recommendations
        const genericMovies = [
            { Title: 'The Shawshank Redemption', Year: '1994', Poster: 'https://m.media-amazon.com/images/M/MV5BMDFkYTc0MGEtZmNhMC00ZDIzLWFmNTEtODM1ZmRlYWMwMWFmXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg', imdbID: 'tt0111161', Genre: 'Drama', similarity: 'High' },
            { Title: 'The Godfather', Year: '1972', Poster: 'https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg', imdbID: 'tt0068646', Genre: mainMovie.Genre.split(', ')[0], similarity: 'Medium' },
            { Title: 'Pulp Fiction', Year: '1994', Poster: 'https://m.media-amazon.com/images/M/MV5BNGNhMDIzZTUtNTBlZi00MTRlLWFjM2ItYzViMjE3YzI5MjljXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg', imdbID: 'tt0110912', Genre: 'Crime, Drama', similarity: 'Medium' },
            { Title: 'The Dark Knight', Year: '2008', Poster: 'https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SX300.jpg', imdbID: 'tt0468569', Genre: 'Action, Crime, Drama', similarity: 'Low' },
            { Title: 'Inception', Year: '2010', Poster: 'https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg', imdbID: 'tt1375666', Genre: 'Action, Adventure, Sci-Fi', similarity: 'Low' }
        ];
        
        genericMovies.forEach(movie => {
            if (movie.imdbID !== mainMovie.imdbID) {
                addRecommendationCard(movie);
            }
        });
    } else {
        // Sort movies by similarity to the main movie (simple genre matching for demo)
        const sortedMovies = [...movieDatabase]
            .filter(m => m.imdbID !== mainMovie.imdbID)
            .sort((a, b) => {
                const aScore = calculateSimilarityScore(a, mainMovie);
                const bScore = calculateSimilarityScore(b, mainMovie);
                return bScore - aScore;
            })
            .slice(0, 6); // Show top 6 recommendations
        
        sortedMovies.forEach(movie => {
            addRecommendationCard(movie, calculateSimilarityScore(movie, mainMovie));
        });
    }
}

// Simple similarity calculation (in a real app, you'd use TF-IDF)
function calculateSimilarityScore(movieA, movieB) {
    let score = 0;
    
    // Genre matching
    const genresA = movieA.Genre.split(', ');
    const genresB = movieB.Genre.split(', ');
    const commonGenres = genresA.filter(genre => genresB.includes(genre));
    score += commonGenres.length * 10;
    
    // Same director
    if (movieA.Director === movieB.Director) score += 15;
    
    // Same actors (simplified check)
    const actorsA = movieA.Actors.split(', ').slice(0, 2);
    const actorsB = movieB.Actors.split(', ').slice(0, 2);
    const commonActors = actorsA.filter(actor => actorsB.includes(actor));
    score += commonActors.length * 5;
    
    // Similar year (±5 years)
    const yearA = parseInt(movieA.Year);
    const yearB = parseInt(movieB.Year);
    if (Math.abs(yearA - yearB) <= 5) score += 5;
    
    return score;
}

// Add recommendation card to the UI
function addRecommendationCard(movie, similarityScore) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.onclick = () => fetchMovieData(movie.Title).then(data => {
        if (data) {
            displayMovieDetails(data);
            simulateRecommendations(data);
        }
    });
    
    let similarityText = '';
    if (similarityScore) {
        let similarityLevel = '';
        if (similarityScore > 20) similarityLevel = 'High';
        else if (similarityScore > 10) similarityLevel = 'Medium';
        else similarityLevel = 'Low';
        
        similarityText = `<div class="similarity-badge">Similarity: ${similarityLevel}</div>`;
    }
    
    card.innerHTML = `
        <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Poster'}" 
             alt="${movie.Title}">
        <div class="movie-card-content">
            <h3 class="movie-card-title">${movie.Title}</h3>
            <p class="movie-card-year">${movie.Year} • ${movie.Genre.split(', ')[0]}</p>
            ${similarityText}
        </div>
    `;
    
    recommendations.appendChild(card);
}

// Watch trailer functionality (using YouTube API)
function watchTrailer(query) {
    const trailerContainer = document.getElementById('trailerContainer');
    
    if (trailerContainer.style.display === 'block') {
        trailerContainer.style.display = 'none';
        trailerContainer.innerHTML = '';
        return;
    }
    
    trailerContainer.style.display = 'block';
    trailerContainer.innerHTML = '<div class="loading"><div class="spinner"></div><p>Searching for trailer...</p></div>';
    
    // In a real app, you'd use the YouTube API with your own API key
    // For demo purposes, we'll simulate finding a trailer
    setTimeout(() => {
        // This is a simulation - in reality you'd make an API call to YouTube
        const youtubeEmbedCode = `<iframe width="100%" height="100%" src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
        trailerContainer.innerHTML = youtubeEmbedCode;
    }, 1500);
}

// Show download options (simulated)
function showDownloadOptions(imdbID) {
    alert(`Download options for movie ID: ${imdbID}\n\nIn a real application, this would connect to your download service or show available quality options.`);
}

// Show error message
function showError(message) {
    mainResult.style.display = 'block';
    mainResult.innerHTML = `
        <div class="error-message">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>${message}</h3>
            <p>Please try another search term.</p>
        </div>
    `;
    recommendations.innerHTML = '';
}

// Event Listeners
searchBtn.addEventListener('click', search);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') search();
});

// Initialize the app
function init() {
    initYearFilter();
    // You might want to preload some movies for the database
    const initialMovies = [
        'The Shawshank Redemption',
        'The Godfather',
        'The Dark Knight',
        'Pulp Fiction',
        'Fight Club'
    ];
    
    // In a real app, you'd have a proper database
    // For demo, we'll just set up the UI
}

// Start the app
init();