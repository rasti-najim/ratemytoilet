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