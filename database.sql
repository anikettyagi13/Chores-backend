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
  time int,
  applied int,
  resume boolean,
  questions text[],
  tag1 text,
  tag2 text,
  tag3 text,
  tag4 text,
  tag5 text
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
  bio text,
  website text,
  jobs_completed int,
  resume text
);

CREATE TABLE comments(
  post_id text,
  comment_id text,
  user_id text,
  username text,
  profile_pic text,
  comment text,
  likes int,
  time bigint
);

CREATE TABLE apply(
  id text,
  applied text,
  post_id text,
  user_id text,
  status text,
  time bigint,
  answers text[],
  resume text
);

CREATE TABLE notification(
  user_id text,
  post_id text,
  type text,
  time bigint,
  post_pic text,
  data text,
  element text
);

-- UPDATE posts SET likes=likes+1 
-- WHERE post_id=$1

-- ALTER TABLE users
-- DROP COLUMN usename;

-- ALTER TABLE userInfo
-- Add COLUMN bio text;

-- ALTER TABLE users
-- ADD COLUMN usename text;