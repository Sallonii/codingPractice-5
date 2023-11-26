const express = require("express");
const app = express();

const path = require("path");
const { open } = require("sqlite");

const sqlite3 = require("sqlite3");
app.use(express.json());

let db = null;

const dbPath = path.join(__dirname, "moviesData.db");

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//API 1: Returns a list of all movie names in the movie table
app.get("/movies/", async (request, response) => {
  const getMovieQuery = `
    SELECT movie_name FROM 
    movie
    ORDER BY movie_id;`;
  const movieList = await db.all(getMovieQuery);
  response.send(
    movieList.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

//API 2: Creates a new movie in the movie table
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieQuery = `
    INSERT INTO 
    movie (director_id, movie_name, lead_actor)
    VALUES (${directorId}, '${movieName}', '${leadActor}');`;
  await db.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

//API 3: Returns a movie based on the movie ID
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieFromIdQuery = `
    SELECT * FROM
    movie
    WHERE movie_id = ${movieId};`;
  console.log(typeof movieId);
  const singleMovieDetails = await db.all(getMovieFromIdQuery);
  response.send(singleMovieDetails);
});

//API 4: Updates the details of a movie in the movie table based on the movie ID
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const updatedMovieDetails = request.body;
  const { directorId, movieName, leadActor } = updatedMovieDetails;
  const updateMovieQuery = `
    UPDATE movie SET 
    director_id=${directorId},
    movie_name='${movieName}',
    lead_actor='${leadActor}'
    WHERE movie_id = ${movieId};
    `;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//API 5: Deletes a movie from the movie table based on the movie ID
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE FROM movie
    WHERE movie_id = ${movieId};`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//API 6: Returns a list of all directors in the director table
app.get("/directors/", async (request, response) => {
  const getAllDirectorsQuery = `
    SELECT director_id, director_name FROM 
    director;
  `;
  const getDirectorsDetail = await db.all(getAllDirectorsQuery);

  response.send(
    getDirectorsDetail.map((eachDirector) => ({
      directorId: eachDirector.director_id,
      directorName: eachDirector.director_name,
    }))
  );
});

//API 7: Returns a list of all movie names directed by a specific director
app.get("/directors/:directorId/movies", async (request, response) => {
  const { directorId } = request.params;
  const getMoviesOfDirectorQuery = `
    SELECT movie_name
    FROM movie
    WHERE 
    director_id = ${directorId};`;
  const directorMovieNameList = await db.all(getMoviesOfDirectorQuery);
  response.send(
    directorMovieNameList.map((eachDirectorMovie) => ({
      movieName: eachDirectorMovie.movie_name,
    }))
  );
});

module.exports = app;
