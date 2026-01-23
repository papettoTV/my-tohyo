--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9 (Debian 16.9-1.pgdg120+1)
-- Dumped by pg_dump version 16.9 (Debian 16.9-1.pgdg120+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.vote_record DROP CONSTRAINT IF EXISTS vote_record_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.vote_record DROP CONSTRAINT IF EXISTS vote_record_election_type_id_fkey;
ALTER TABLE IF EXISTS ONLY public.vote_record DROP CONSTRAINT IF EXISTS vote_record_candidate_id_fkey;
ALTER TABLE IF EXISTS ONLY public.achievement DROP CONSTRAINT IF EXISTS achievement_candidate_id_fkey;
ALTER TABLE IF EXISTS ONLY public.candidate DROP CONSTRAINT IF EXISTS "FK_9af14779dfff6cd4874a63ac631";
ALTER TABLE IF EXISTS ONLY public.manifesto DROP CONSTRAINT IF EXISTS "FK_5a38bfb0a2e3f21852aa813de96";
ALTER TABLE IF EXISTS ONLY public.social_account DROP CONSTRAINT IF EXISTS "FK_365d4084b1feb693468d6248411";
ALTER TABLE IF EXISTS ONLY public.vote_record DROP CONSTRAINT IF EXISTS vote_record_pkey;
ALTER TABLE IF EXISTS ONLY public.social_account DROP CONSTRAINT IF EXISTS social_account_pkey;
ALTER TABLE IF EXISTS ONLY public.party DROP CONSTRAINT IF EXISTS party_pkey;
ALTER TABLE IF EXISTS ONLY public.election_type DROP CONSTRAINT IF EXISTS election_type_pkey;
ALTER TABLE IF EXISTS ONLY public.candidate DROP CONSTRAINT IF EXISTS candidate_pkey;
ALTER TABLE IF EXISTS ONLY public.achievement DROP CONSTRAINT IF EXISTS achievement_candidate_id_election_name_key;
ALTER TABLE IF EXISTS ONLY public."user" DROP CONSTRAINT IF EXISTS "UQ_e12875dfb3b1d92d7d7c5377e22";
ALTER TABLE IF EXISTS ONLY public.manifesto DROP CONSTRAINT IF EXISTS "UQ_738e781930700b224d2f0bbcf02";
ALTER TABLE IF EXISTS ONLY public.social_account DROP CONSTRAINT IF EXISTS "UQ_6f40b705b9b58282a75e6a103b5";
ALTER TABLE IF EXISTS ONLY public.manifesto DROP CONSTRAINT IF EXISTS "PK_b44830bbec008d32c38428de4ed";
ALTER TABLE IF EXISTS ONLY public."user" DROP CONSTRAINT IF EXISTS "PK_758b8ce7c18b9d347461b30228d";
ALTER TABLE IF EXISTS ONLY public.achievement DROP CONSTRAINT IF EXISTS "PK_5cbaff867128cd6996d6aee95b1";
ALTER TABLE IF EXISTS public.vote_record ALTER COLUMN vote_id DROP DEFAULT;
ALTER TABLE IF EXISTS public."user" ALTER COLUMN user_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.social_account ALTER COLUMN social_account_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.party ALTER COLUMN party_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.manifesto ALTER COLUMN manifesto_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.election_type ALTER COLUMN election_type_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.candidate ALTER COLUMN candidate_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.achievement ALTER COLUMN achievement_id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.vote_record_vote_id_seq;
DROP TABLE IF EXISTS public.vote_record;
DROP SEQUENCE IF EXISTS public.user_user_id_seq;
DROP TABLE IF EXISTS public."user";
DROP SEQUENCE IF EXISTS public.social_account_social_account_id_seq;
DROP TABLE IF EXISTS public.social_account;
DROP SEQUENCE IF EXISTS public.party_party_id_seq;
DROP TABLE IF EXISTS public.party;
DROP SEQUENCE IF EXISTS public.manifesto_manifesto_id_seq;
DROP TABLE IF EXISTS public.manifesto;
DROP SEQUENCE IF EXISTS public.election_type_election_type_id_seq;
DROP TABLE IF EXISTS public.election_type;
DROP SEQUENCE IF EXISTS public.candidate_candidate_id_seq;
DROP TABLE IF EXISTS public.candidate;
DROP SEQUENCE IF EXISTS public.achievement_achievement_id_seq;
DROP TABLE IF EXISTS public.achievement;
DROP SCHEMA IF EXISTS public;
--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: achievement; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.achievement (
    achievement_id integer NOT NULL,
    election_name character varying(150) NOT NULL,
    candidate_name character varying(100) NOT NULL,
    content text NOT NULL,
    content_format character varying(20) DEFAULT 'markdown'::character varying NOT NULL,
    candidate_id integer NOT NULL
);


--
-- Name: achievement_achievement_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.achievement_achievement_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: achievement_achievement_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.achievement_achievement_id_seq OWNED BY public.achievement.achievement_id;


--
-- Name: candidate; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.candidate (
    candidate_id integer NOT NULL,
    name character varying(100) NOT NULL,
    party_id integer,
    manifesto_url character varying(255),
    achievements text
);


--
-- Name: candidate_candidate_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.candidate_candidate_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: candidate_candidate_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.candidate_candidate_id_seq OWNED BY public.candidate.candidate_id;


--
-- Name: election_type; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.election_type (
    election_type_id integer NOT NULL,
    name character varying(100) NOT NULL
);


--
-- Name: election_type_election_type_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.election_type_election_type_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: election_type_election_type_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.election_type_election_type_id_seq OWNED BY public.election_type.election_type_id;


--
-- Name: manifesto; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.manifesto (
    manifesto_id integer NOT NULL,
    election_name character varying(150) NOT NULL,
    candidate_name character varying(100) NOT NULL,
    content text NOT NULL,
    content_format character varying(20) DEFAULT 'markdown'::character varying NOT NULL,
    candidate_id integer NOT NULL,
    status character varying(20)
);


--
-- Name: manifesto_manifesto_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.manifesto_manifesto_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: manifesto_manifesto_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.manifesto_manifesto_id_seq OWNED BY public.manifesto.manifesto_id;


--
-- Name: party; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.party (
    party_id integer NOT NULL,
    name character varying(100) NOT NULL
);


--
-- Name: party_party_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.party_party_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: party_party_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.party_party_id_seq OWNED BY public.party.party_id;


--
-- Name: social_account; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.social_account (
    social_account_id integer NOT NULL,
    user_id integer NOT NULL,
    provider character varying NOT NULL,
    account_identifier character varying NOT NULL
);


--
-- Name: social_account_social_account_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.social_account_social_account_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: social_account_social_account_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.social_account_social_account_id_seq OWNED BY public.social_account.social_account_id;


--
-- Name: user; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."user" (
    user_id integer NOT NULL,
    name character varying,
    email character varying NOT NULL,
    region character varying NOT NULL
);


--
-- Name: user_user_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_user_id_seq OWNED BY public."user".user_id;


--
-- Name: vote_record; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vote_record (
    vote_id integer NOT NULL,
    user_id integer NOT NULL,
    candidate_id integer,
    vote_date date NOT NULL,
    photo_url character varying(255),
    candidate_name character varying(100),
    social_post_url character varying(255),
    election_name character varying(150),
    election_type_id integer,
    party_name character varying(100),
    notes text
);


--
-- Name: vote_record_vote_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.vote_record_vote_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: vote_record_vote_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.vote_record_vote_id_seq OWNED BY public.vote_record.vote_id;


--
-- Name: achievement achievement_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.achievement ALTER COLUMN achievement_id SET DEFAULT nextval('public.achievement_achievement_id_seq'::regclass);


--
-- Name: candidate candidate_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.candidate ALTER COLUMN candidate_id SET DEFAULT nextval('public.candidate_candidate_id_seq'::regclass);


--
-- Name: election_type election_type_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.election_type ALTER COLUMN election_type_id SET DEFAULT nextval('public.election_type_election_type_id_seq'::regclass);


--
-- Name: manifesto manifesto_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.manifesto ALTER COLUMN manifesto_id SET DEFAULT nextval('public.manifesto_manifesto_id_seq'::regclass);


--
-- Name: party party_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.party ALTER COLUMN party_id SET DEFAULT nextval('public.party_party_id_seq'::regclass);


--
-- Name: social_account social_account_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.social_account ALTER COLUMN social_account_id SET DEFAULT nextval('public.social_account_social_account_id_seq'::regclass);


--
-- Name: user user_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user" ALTER COLUMN user_id SET DEFAULT nextval('public.user_user_id_seq'::regclass);


--
-- Name: vote_record vote_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vote_record ALTER COLUMN vote_id SET DEFAULT nextval('public.vote_record_vote_id_seq'::regclass);


--
-- Name: achievement PK_5cbaff867128cd6996d6aee95b1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.achievement
    ADD CONSTRAINT "PK_5cbaff867128cd6996d6aee95b1" PRIMARY KEY (achievement_id);


--
-- Name: user PK_758b8ce7c18b9d347461b30228d; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "PK_758b8ce7c18b9d347461b30228d" PRIMARY KEY (user_id);


--
-- Name: manifesto PK_b44830bbec008d32c38428de4ed; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.manifesto
    ADD CONSTRAINT "PK_b44830bbec008d32c38428de4ed" PRIMARY KEY (manifesto_id);


--
-- Name: social_account UQ_6f40b705b9b58282a75e6a103b5; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.social_account
    ADD CONSTRAINT "UQ_6f40b705b9b58282a75e6a103b5" UNIQUE (provider, account_identifier);


--
-- Name: manifesto UQ_738e781930700b224d2f0bbcf02; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.manifesto
    ADD CONSTRAINT "UQ_738e781930700b224d2f0bbcf02" UNIQUE (candidate_id, election_name);


--
-- Name: user UQ_e12875dfb3b1d92d7d7c5377e22; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE (email);


--
-- Name: achievement achievement_candidate_id_election_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.achievement
    ADD CONSTRAINT achievement_candidate_id_election_name_key UNIQUE (candidate_id, election_name);


--
-- Name: candidate candidate_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.candidate
    ADD CONSTRAINT candidate_pkey PRIMARY KEY (candidate_id);


--
-- Name: election_type election_type_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.election_type
    ADD CONSTRAINT election_type_pkey PRIMARY KEY (election_type_id);


--
-- Name: party party_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.party
    ADD CONSTRAINT party_pkey PRIMARY KEY (party_id);


--
-- Name: social_account social_account_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.social_account
    ADD CONSTRAINT social_account_pkey PRIMARY KEY (social_account_id);


--
-- Name: vote_record vote_record_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vote_record
    ADD CONSTRAINT vote_record_pkey PRIMARY KEY (vote_id);


--
-- Name: social_account FK_365d4084b1feb693468d6248411; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.social_account
    ADD CONSTRAINT "FK_365d4084b1feb693468d6248411" FOREIGN KEY (user_id) REFERENCES public."user"(user_id);


--
-- Name: manifesto FK_5a38bfb0a2e3f21852aa813de96; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.manifesto
    ADD CONSTRAINT "FK_5a38bfb0a2e3f21852aa813de96" FOREIGN KEY (candidate_id) REFERENCES public.candidate(candidate_id) ON DELETE CASCADE;


--
-- Name: candidate FK_9af14779dfff6cd4874a63ac631; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.candidate
    ADD CONSTRAINT "FK_9af14779dfff6cd4874a63ac631" FOREIGN KEY (party_id) REFERENCES public.party(party_id) ON DELETE SET NULL;


--
-- Name: achievement achievement_candidate_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.achievement
    ADD CONSTRAINT achievement_candidate_id_fkey FOREIGN KEY (candidate_id) REFERENCES public.candidate(candidate_id) ON DELETE CASCADE;


--
-- Name: vote_record vote_record_candidate_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vote_record
    ADD CONSTRAINT vote_record_candidate_id_fkey FOREIGN KEY (candidate_id) REFERENCES public.candidate(candidate_id) ON DELETE CASCADE;


--
-- Name: vote_record vote_record_election_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vote_record
    ADD CONSTRAINT vote_record_election_type_id_fkey FOREIGN KEY (election_type_id) REFERENCES public.election_type(election_type_id) ON DELETE RESTRICT;


--
-- Name: vote_record vote_record_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vote_record
    ADD CONSTRAINT vote_record_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(user_id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

