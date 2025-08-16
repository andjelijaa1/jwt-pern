CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE DATABASE jwtAuth

Create table users
user_id uuid primary key default uuid_generate_v4(),
user_name text not null,
user_email TEXt not null,
user_password text not null);

select * users;

insert into users (user_name,user_email,user_password) values ("Bob","bob@gmail.com','bob')