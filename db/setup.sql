DROP DATABASE IF EXISTS WeatherConditions;
CREATE DATABASE WeatherConditions;
USE WeatherConditions;

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE searches (
    search_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    search_query VARCHAR(45) NOT NULL,
    timestamp DATETIME NOT NULL,
    FOREIGN KEY fk1(user_id) REFERENCES users(user_id)
);