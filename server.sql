--DROP TABLE IF EXISTS wishes;
CREATE TABLE IF NOT EXISTS wishes (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    url varchar(1000) NOT NULL,
    img varchar(1000),
    title varchar(1000) NOT NULL,
    website varchar(30) NOT NULL
); 

--DROP TABLE IF EXISTS settings;
CREATE TABLE IF NOT EXISTS settings (
    name varchar(30) NOT NULL PRIMARY KEY,
    value varchar(30) NOT NULL
);

--DROP TABLE IF EXISTS users;
CREATE TABLE IF NOT EXISTS users (
    id int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name varchar(100) NOT NULL UNIQUE,
    passwd varchar(100) NOT NULL
);
--DROP TABLE IF EXISTS wishes_user;
CREATE TABLE IF NOT EXISTS wishes_user (
    wish_id INT NOT NULL REFERENCES wishes(id),
    user_id INT NOT NULL REFERENCES users(id)
);
