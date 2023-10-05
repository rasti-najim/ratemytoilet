--First upload of the data

CREATE TABLE bathroom_reviews (
    timestamp timestamp with time zone NOT NULL,
    username text NOT NULL,
    building_name text NOT NULL,
    floor_number integer,
    gender text NOT NULL,
    cleanliness integer CHECK (cleanliness >= 1 AND cleanliness <= 5),
    poopability integer CHECK (poopability >= 1 AND poopability <= 5),
    cryability integer CHECK (cryability >= 1 AND cryability <= 5),
    peacefulness integer CHECK (peacefulness >= 1 AND peacefulness <= 5),
    overall_rating integer CHECK (overall_rating >= 1 AND overall_rating <= 5),
    additional_comments text
);



--code to divide the data into 3 tables:

-- UserTable
CREATE TABLE userTable (
    username text PRIMARY KEY,
    grade integer NOT NULL CHECK (grade >= 1 AND grade <= 4)
);

-- Bathroom
CREATE TABLE bathroom (
    bathroom_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    building_name text NOT NULL,
    floor_number integer,
    gender text NOT NULL
);

-- Reviews
CREATE TABLE reviews (
    review_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    username text REFERENCES userTable(username),
    bathroom_id uuid REFERENCES bathroom(bathroom_id),
    cleanliness integer CHECK (cleanliness >= 1 AND cleanliness <= 5),
    poopability integer CHECK (poopability >= 1 AND poopability <= 5),
    overall_rating integer CHECK(overall_rating >= 1 AND overall_rating <= 5),
    peacefulness integer CHECK (peacefulness >= 1 AND peacefulness <= 5),
    additional_comments text
);

-- Populate UserTable
INSERT INTO userTable(username, grade)
SELECT username, MAX(floor(random() * 4 + 1)::integer)
FROM bathroom_reviews
GROUP BY username;

-- Populate Bathroom
INSERT INTO bathroom(building_name, floor_number, gender)
SELECT DISTINCT building_name, floor_number, gender
FROM bathroom_reviews;

-- Populate Reviews
INSERT INTO reviews(username, bathroom_id, cleanliness, poopability, overall_rating, peacefulness, additional_comments)
SELECT br.username, b.bathroom_id, br.cleanliness, br.poopability, br.peacefulness, br.overall_rating, br.additional_comments
FROM bathroom_reviews br
JOIN bathroom b ON br.building_name = b.building_name AND br.floor_number = b.floor_number AND br.gender = b.gender;

-- Drop the original table (optional)
DROP TABLE bathroom_reviews;
