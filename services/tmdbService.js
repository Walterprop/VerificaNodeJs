const axios = require('axios');
const AppError = require('../errors/AppError');
const NotFoundError = require('../errors/NotFoundError');

class TMDbService {
    constructor() {
        this.apiKey = process.env.TMDB_API_KEY;
        this.accessToken = process.env.TMDB_ACCESS_TOKEN;
        this.baseURL = process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3';

        this.api = axios.create({
            baseURL: this.baseURL,
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json;charset=utf-8'
            }
        });
    }

    async searchMulti(query, page = 1) {
        try {
            const response = await this.api.get('/search/multi', {
                params: {
                    query,
                    page,
                    language: 'it-IT'
                }
            });
            return response.data;
        } catch (error) {
            if (error.response && error.response.status === 404) {
                throw new NotFoundError('Contenuto non trovato');
            }
            throw new AppError(`Errore ricerca: ${error.message}`, error.response?.status || 500);
        }
    }

    async searchMovies(query, page = 1) {
        try {
            const response = await this.api.get('/search/movie', {
                params: {
                    query,
                    page,
                    language: 'it-IT'
                }
            });
            return response.data;
        } catch (error) {
            if (error.response && error.response.status === 404) {
                throw new NotFoundError('Film non trovato');
            }
            throw new AppError(`Errore ricerca film: ${error.message}`, error.response?.status || 500);
        }
    }

    async searchTVShows(query, page = 1) {
        try {
            const response = await this.api.get('/search/tv', {
                params: {
                    query,
                    page,
                    language: 'it-IT'
                }
            });
            return response.data;
        } catch (error) {
            if (error.response && error.response.status === 404) {
                throw new NotFoundError('Serie TV non trovata');
            }
            throw new AppError(`Errore ricerca serie TV: ${error.message}`, error.response?.status || 500);
        }
    }

    async getMovieDetails(movieId) {
        try {
            const response = await this.api.get(`/movie/${movieId}`, {
                params: {
                    language: 'it-IT',
                    append_to_response: 'credits,videos,images'
                }
            });
            return response.data;
        } catch (error) {
            if (error.response && error.response.status === 404) {
                throw new NotFoundError('Film non trovato');
            }
            throw new AppError(`Errore dettagli film: ${error.message}`, error.response?.status || 500);
        }
    }
    async getTVShowDetails(tvId) {
        try {
            const response = await this.api.get(`/tv/${tvId}`, {
                params: {
                    language: 'it-IT',
                    append_to_response: 'credits,videos,images'
                }
            });
            return response.data;
        } catch (error) {
            if (error.response && error.response.status === 404) {
                throw new NotFoundError('Serie TV non trovata');
            }
            throw new AppError(`Errore dettagli serie TV: ${error.message}`, error.response?.status || 500);
        }
    }

    async getPopularMovies(page = 1) {
        try {
            const response = await this.api.get('/movie/popular', {
                params: {
                    page,
                    language: 'it-IT'
                }
            });
            return response.data;
        } catch (error) {
            throw new AppError(`Errore film popolari: ${error.message}`, error.response?.status || 500);
        }
    }

    async getPopularTVShows(page = 1) {
        try {
            const response = await this.api.get('/tv/popular', {
                params: {
                    page,
                    language: 'it-IT'
                }
            });
            return response.data;
        } catch (error) {
            throw new AppError(`Errore serie TV popolari: ${error.message}`, error.response?.status || 500);
        }
    }

    async getTrending(mediaType = 'all', timeWindow = 'day') {
        try {
            const response = await this.api.get(`/trending/${mediaType}/${timeWindow}`, {
                params: {
                    language: 'it-IT'
                }
            });
            return response.data;
        } catch (error) {
            throw new AppError(`Errore contenuti trending: ${error.message}`, error.response?.status || 500);
        }
    }

    async getMovieGenres() {
        try {
            const response = await this.api.get('/genre/movie/list', {
                params: {
                    language: 'it-IT'
                }
            });
            return response.data.genres;
        } catch (error) {
            throw new AppError(`Errore generi film: ${error.message}`, error.response?.status || 500);
        }
    }

    async getTVGenres() {
        try {
            const response = await this.api.get('/genre/tv/list', {
                params: {
                    language: 'it-IT'
                }
            });
            return response.data.genres;
        } catch (error) {
            throw new AppError(`Errore generi serie TV: ${error.message}`, error.response?.status || 500);
        }
    }

    getImageURL(path, size = 'w500') {
        if (!path) return null;
        return `https://image.tmdb.org/t/p/${size}${path}`;
    }

    getFullImageURL(path) {
        return this.getImageURL(path, 'original');
    }
}

module.exports = new TMDbService();