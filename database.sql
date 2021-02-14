CREATE DATABASE chores;

CREATE TABLE users(
    id  text,
    name text,
    email text,
    hash text,
    salt text,
    token text[]
);