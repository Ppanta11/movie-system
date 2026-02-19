import mongoose from "mongoose";
import Movie from "./models/Movie.js";
import "dotenv/config";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("DB Connected");
    } catch (error) {
        console.error("DB Connection Error", error);
        process.exit(1);
    }
};

const checkData = async () => {
    await connectDB();
    const movie = await Movie.findOne();
    if (movie) {
        console.log("Movie Title:", movie.title);
        console.log("Genres:", JSON.stringify(movie.genres, null, 2));
        console.log("Casts Sample:", JSON.stringify(movie.casts.slice(0, 2), null, 2));
    } else {
        console.log("No movies found");
    }
    await mongoose.connection.close();
};

checkData();
