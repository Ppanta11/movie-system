import mongoose from "mongoose";

const movieSchema = new mongoose.Schema(
  {
    _id: { type: String, require: true },
    title: { type: String, require: true },
    overview: { type: String, require: true },
    poster_path: { type: String, require: true },
    backdrop_path: { type: String, require: true },
    release_date: { type: String, require: true },
    original_language: { type: String },
    tagline: { type: String },
    genres: { type: Array, require: true },
    casts: { type: Array, require: true },
    vote_average: { type: Number, require: true },
    runtime: { type: Number, require: true },
  },
  { timestamps: true },
);

const Movie = mongoose.model("Movie", movieSchema);

export default Movie;
