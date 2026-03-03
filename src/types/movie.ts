export type Movie = {
  Title: string;
  Year: string;
  Poster: string;
  Actors: string;
  Plot: string;
  imdbRating: string;
  Genre?: string;
  Director?: string;
  Runtime?: string;
  imdbID?: string;
};

export type Review = {
  title: string;
  content: string;
  rating: string;
  author: string;
};
