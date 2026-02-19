import axios from "axios";
import Show from "../models/Show.js";
import Movie from "../models/Movie.js";

// API to get now playing movies from TMDB API
export const getNowPlayingMovies = async (req, res) => {
  try {
    const { data } = await axios.get(
      "https://api.themoviedb.org/3/movie/now_playing",
      {
        headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` },
      },
    );

    const movies = data.results;
    res.json({ success: true, movies });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to add new show to DB
export const addShow = async (req, res) => {
  try {
    const { movieId, showsInput, showPrice } = req.body;

    let movie = await Movie.findById(movieId);

    if (!movie) {
      // Fetch movie details and credits from TMDB API
      const [movieDetailsResponse, movieCreditsResponse] = await Promise.all([
        axios.get(`https://api.themoviedb.org/3/movie/${movieId}`, {
          headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` },
        }),
        axios.get(`https://api.themoviedb.org/3/movie/${movieId}/credits`, {
          headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` },
        }),
      ]);

      const movieApiData = movieDetailsResponse.data;
      const movieCreditsData = movieCreditsResponse.data;

      const movieDetails = {
        _id: movieId,
        title: movieApiData.title,
        overview: movieApiData.overview,
        poster_path: movieApiData.poster_path,
        backdrop_path: movieApiData.backdrop_path,
        release_date: movieApiData.release_date,
        original_language: movieApiData.original_language,
        tagline: movieApiData.tagline || " ",
        genres: movieApiData.genres,
        casts: movieCreditsData.cast,
        vote_average: movieApiData.vote_average,
        runtime: movieApiData.runtime,
      };

      // Add movie to DB
      movie = await Movie.create(movieDetails);
    }

    const showsToCreate = [];
    showsInput.forEach((show) => {
      const showDate = show.date;
      show.time.forEach((time) => {
        const dateTimeString = `${showDate}T${time}`;
        showsToCreate.push({
          movie: movieId,
          showDateTime: new Date(dateTimeString),
          showPrice,
          occupiedSeats: {},
        });
      });
    });

    if (showsToCreate.length > 0) {
      await Show.insertMany(showsToCreate);
    }

    res.json({ success: true, message: "Show Added Successfully" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get all shows from database
export const getShows = async (req, res) => {
  try {
    const shows = await Show.find({ showDateTime: { $gte: new Date() } })
      .populate("movie")
      .sort({ showDateTime: 1 });

    // Filter unique movies
    const uniqueMovies = new Map();
    shows.forEach((s) => {
      if (!uniqueMovies.has(s.movie._id.toString())) {
        uniqueMovies.set(s.movie._id.toString(), s.movie);
      }
    });

    res.json({ success: true, shows: Array.from(uniqueMovies.values()) });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// API to get a single show's details
export const getShow = async (req, res) => {
  try {
    const { movieId } = req.params;

    // Get all upcoming shows for the movie
    const shows = await Show.find({
      movie: movieId,
      showDateTime: { $gte: new Date() },
    });

    const movie = await Movie.findById(movieId);
    const dateTime = {};

    shows.forEach((show) => {
      const date = show.showDateTime.toISOString().split("T")[0];
      if (!dateTime[date]) {
        dateTime[date] = [];
      }
      dateTime[date].push({
        time: show.showDateTime.toISOString().split("T")[1].slice(0, 5),
        showId: show._id,
      });
    });

    res.json({ success: true, movie, dateTime });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

export const getRecommendedMovies = async (req, res) => {
  try {
    const { movieId } = req.params;

    const targetMovie = await Movie.findById(movieId);
    if (!targetMovie) {
      return res.json({ success: false, message: "Movie not found" });
    }

    const allMovies = await Movie.find({ _id: { $ne: movieId } });

    const targetGenres = new Set(targetMovie.genres.map((g) => g.id));
    const targetCast = new Set(targetMovie.casts.map((c) => c.id));

    const recommendations = allMovies.map((movie) => {
      let score = 0;

      movie.genres.forEach((g) => {
        if (targetGenres.has(g.id)) {
          score += 2;
        }
      });


      movie.casts.forEach((c) => {
        if (targetCast.has(c.id)) {
          score += 1;
        }
      });

      return { movie, score };
    });

    const topRecommendations = recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((item) => item.movie);

    if (topRecommendations.length < 4) {
      const remainingSlots = 4 - topRecommendations.length;
      const existingIds = new Set([
        movieId,
        ...topRecommendations.map((m) => m._id.toString()),
      ]);

      const fallbackMovies = await Movie.find({
        _id: { $nin: Array.from(existingIds) },
      })
        .sort({ release_date: -1 })
        .limit(remainingSlots);

      topRecommendations.push(...fallbackMovies);
    }

    res.json({ success: true, movies: topRecommendations });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};
