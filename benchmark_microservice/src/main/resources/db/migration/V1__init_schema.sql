-- Native enums type of PostgresSQL
CREATE TYPE ssd_type AS ENUM ('SATA', 'M2 SATA', 'M2 NVMe');
CREATE TYPE psu_ranking AS ENUM ('white', 'bronze', 'silver', 'gold', 'platinum', 'titanium');
CREATE TYPE performance AS ENUM ('low', 'medium', 'high', 'ultra');

CREATE TABLE cpus(
    id          UUID PRIMARY KEY,
    brand       VARCHAR(255) NOT NULL,
    gen         VARCHAR(255) NOT NULL,
    family      VARCHAR(255) NOT NULL,
    series      VARCHAR(255) NOT NULL,
    cores       INTEGER NOT NULL,
    threads     INTEGER NOT NULL,
    base_clock  REAL NOT NULL,
    max_clock   REAL NOT NULL,
    cache       INTEGER NOT NULL,
    socket      VARCHAR(255) NOT NULL,
    graphics    BOOLEAN NOT NULL,
    oc          BOOLEAN NOT NULL,
    recommended_power INTEGER NOT NULL,
    release_date      TIMESTAMP NOT NULL,
    avg_price   REAL NOT NULL,
    img         BYTEA,
    created_at  TIMESTAMP NOT NULL,
    updated_at  TIMESTAMP
);

CREATE TABLE gpus(
    id          UUID PRIMARY KEY,
    brand       VARCHAR(255) NOT NULL,
    family      VARCHAR(255) NOT NULL,
    series      VARCHAR(255) NOT NULL,
    memory_amount INTEGER NOT NULL,
    memory_gen  VARCHAR(255) NOT NULL,
    cores       INTEGER NOT NULL,
    pci_express INTEGER NOT NULL,
    recommended_power INTEGER NOT NULL,
    release_date TIMESTAMP NOT NULL,
    avg_price   REAL NOT NULL,
    img         BYTEA,
    created_at  TIMESTAMP NOT NULL,
    updated_at  TIMESTAMP
);

CREATE TABLE ram_memories(
    id          UUID PRIMARY KEY,
    brand       VARCHAR(255) NOT NULL,
    memory_amount INTEGER NOT NULL,
    frequency_mhz   INTEGER NOT NULL,
    series        VARCHAR(255) NOT NULL,
    ddr           VARCHAR(255) NOT NULL,
    avg_price    REAL NOT NULL,
    img          BYTEA,
    created_at  TIMESTAMP NOT NULL,
    updated_at  TIMESTAMP
);

CREATE TABLE games(
    id      UUID PRIMARY KEY,
    name    VARCHAR(255) NOT NULL,
    img     BYTEA,
    necessary_disk  INTEGER,
    avg_fps INTEGER,
    created_at  TIMESTAMP NOT NULL,
    updated_at  TIMESTAMP
);

CREATE TABLE mother_boards(
    id          UUID PRIMARY KEY,
    brand       VARCHAR(255) NOT NULL,
    series      VARCHAR(255) NOT NULL,
    socket      VARCHAR(255) NOT NULL,
    ddr           VARCHAR(255) NOT NULL,
    memory_slots INTEGER NOT NULL,
    max_ram     INTEGER NOT NULL,
    max_ram_memory_frequency_mhz REAL NOT NULL,
    pci_express INTEGER NOT NULL,
    m2_slots    INTEGER NOT NULL,
    vrm         INTEGER NOT NULL,
    avg_price   REAL NOT NULL,
    score       INTEGER,
    img         BYTEA,
    created_at  TIMESTAMP NOT NULL,
    updated_at  TIMESTAMP
);

CREATE TABLE power_sources(
    id          UUID PRIMARY KEY,
    brand       VARCHAR(255) NOT NULL,
    series      VARCHAR(255) NOT NULL,
    power_amount INTEGER NOT NULL,
    ranking      psu_ranking NOT NULL,
    eighty_plus_cert BOOLEAN NOT NULL,
    avg_price   REAL NOT NULL,
    score       INTEGER,
    img         BYTEA,
    created_at  TIMESTAMP NOT NULL,
    updated_at  TIMESTAMP
);

CREATE TABLE benchmarks(
    id       UUID PRIMARY KEY,
    title    VARCHAR(255) NOT NULL,
    resolution  INTEGER NOT NULL,
    graphics_quality performance NOT NULL,
    cpu_id UUID NOT NULL,
    gpu_id UUID NOT NULL,
    ram_id UUID NOT NULL,
    avg_fps INTEGER NOT NULL,
    max_fps INTEGER NOT NULL,
    min_fps INTEGER NOT NULL,
    game_id UUID NOT NULL,
    user_id UUID NOT NULL,
    score INTEGER,
    created_at  TIMESTAMP NOT NULL,
    updated_at  TIMESTAMP,

    CONSTRAINT fk_cpu FOREIGN KEY (cpu_id)
    REFERENCES cpus(id),

    CONSTRAINT fk_gpu FOREIGN KEY (gpu_id)
    REFERENCES gpus(id),

    CONSTRAINT fk_ram FOREIGN KEY (ram_id)
    REFERENCES ram_memories(id),

    CONSTRAINT fk_game FOREIGN KEY (game_id)
    REFERENCES games(id)
);

CREATE TABLE ssds (
    id          UUID PRIMARY KEY,
    brand       VARCHAR(255) NOT NULL,
    series      VARCHAR(255) NOT NULL,
    amount      INTEGER NOT NULL,
    type        ssd_type NOT NULL,
    reading     INTEGER NOT NULL,
    writing     INTEGER NOT NULL,
    avg_price   REAL NOT NULL,
    score       INTEGER,
    img         BYTEA,
    created_at  TIMESTAMP NOT NULL,
    updated_at  TIMESTAMP
);