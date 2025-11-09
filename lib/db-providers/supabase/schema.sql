create table users
(
  id text primary key,
  email text unique,
  name text,
  username text unique,
  "createdAt" timestamptz default now() not null,
  firstName text,
  lastName text,
  companyName text,
);

