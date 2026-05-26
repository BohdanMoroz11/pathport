CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE review_status AS ENUM ('draft', 'needs_review', 'reviewed', 'outdated');
CREATE TYPE route_type AS ENUM (
  'work',
  'study',
  'family',
  'freelance',
  'digital_nomad',
  'business',
  'humanitarian',
  'long_stay',
  'other'
);
CREATE TYPE source_type AS ENUM ('official', 'legal', 'community', 'ai_assisted', 'other');

CREATE TABLE citizenships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code varchar(3) NOT NULL UNIQUE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE destination_countries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code varchar(2) NOT NULL UNIQUE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  destination_country_id uuid NOT NULL REFERENCES destination_countries(id),
  type route_type NOT NULL,
  title text NOT NULL,
  summary text NOT NULL,
  review_status review_status NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE route_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id uuid NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  type source_type NOT NULL,
  label text NOT NULL,
  url text NOT NULL,
  last_reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX routes_destination_country_id_idx ON routes(destination_country_id);
CREATE INDEX route_sources_route_id_idx ON route_sources(route_id);
