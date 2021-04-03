CREATE DATABASE chores;

CREATE TABLE users(
    id  text,
    name text,
    email text,
    hash text,
    salt text,
    token text[]
);

CREATE TABLE posts(
  post_id text,
  user_id text,
  info text,
  username text,
  url text,
  state text,
  address text,
  pincode text,
  price_tag text,
  likes int,
  comments int,
  profile_pic text,
  created text,
  time int
);

CREATE TABLE postLikes(
  id text,
  username text,
  profile_pic text,
  post_id text,
  user_id text
);

CREATE TABLE commentLikes(
  id text
);

CREATE TABLE userInfo(
  user_id text,
  username text,
  profile_pic text,
  name text,
  ratings int,
  pincodes text[],
  jobs_created int,
  jobs_completed int
);

CREATE TABLE comments(
  post_id text,
  comment_id text,
  user_id text,
  username text,
  profile_pic text,
  comment text,
  likes int,
  created text,
  time int
);

ALTER TABLE users
DROP COLUMN usename;

ALTER TABLE users
ADD COLUMN usename text;