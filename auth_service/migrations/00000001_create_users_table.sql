CREATE TYPE user_status AS ENUM ('active', 'inactive', 'banned');
CREATE TYPE user_role AS ENUM ('admin', 'supervisor', 'common');

CREATE TABLE users (
    id UUID PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    status user_status NOT NULL
);