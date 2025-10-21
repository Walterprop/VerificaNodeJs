const axios = require('axios');

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
            throw new Error(`Errore ricerca: ${error.message}`);
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
            throw new Error(`Errore ricerca film: ${error.message}`);
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
            throw new Error(`Errore ricerca serie TV: ${error.message}`);
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
            throw new Error(`Errore dettagli film: ${error.message}`);
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
            throw new Error(`Errore dettagli serie TV: ${error.message}`);
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
            throw new Error(`Errore film popolari: ${error.message}`);
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
            throw new Error(`Errore serie TV popolari: ${error.message}`);
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
            throw new Error(`Errore contenuti trending: ${error.message}`);
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
            throw new Error(`Errore generi film: ${error.message}`);
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
            throw new Error(`Errore generi serie TV: ${error.message}`);
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