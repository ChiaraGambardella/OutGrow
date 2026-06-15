DROP TABLE IF EXISTS utente cascade;
DROP TABLE IF EXISTS consenso cascade;
DROP TABLE IF EXISTS preferenza cascade;
DROP TABLE IF EXISTS sfida cascade;
DROP TABLE IF EXISTS badge cascade;
DROP TABLE IF EXISTS badge_ottenuto cascade;
DROP TABLE IF EXISTS sfida_completata cascade;
DROP INDEX IF EXISTS unq_sfida_completata;
DROP TABLE IF EXISTS media cascade;
DROP TABLE IF EXISTS commento cascade;
DROP TABLE IF EXISTS like_sfida_completata cascade;
DROP TABLE IF EXISTS like_commento cascade;
DROP TABLE IF EXISTS segnalazione cascade;
DROP TABLE IF EXISTS notifica cascade;

create table utente(
	id serial PRIMARY KEY,
	nome varchar(30) not null,
	cognome varchar(30) not null,
	email varchar(100) not null unique,
	password text not null,
	username varchar(20) not null,
	data_di_nascita date not null,
	foto text null,
	copertina text null,
	admin boolean not null default false,

	check (data_di_nascita <= current_date - interval '16 years'),
	check (username ~ '^[A-Za-z0-9._]{1,20}$')
);
create unique index utente_username_lower_unique
on utente (lower(username));

create table consenso(
	utente integer references utente(id) on update cascade on delete cascade,
	tipo varchar(15) check (tipo in ('Fotocamera', 'Galleria', 'GNSS')),
	fornito boolean not null,
	PRIMARY KEY(utente, tipo)
);

create table preferenza(
	utente integer references utente(id) on update cascade on delete cascade,
	argomento varchar(10) check (argomento in ('Sfide', 'Progressi', 'Social')),
	attivo boolean not null,
	PRIMARY KEY(utente, argomento)
);

create table badge(
	id serial PRIMARY KEY,
	titolo varchar(30) not null,
	immagine text not null
);

create table badge_ottenuto(
	utente integer references utente(id) on update cascade on delete cascade,
	badge integer references badge(id) on update cascade on delete cascade,
	ottenimento timestamptz not null default now(),
	PRIMARY KEY(utente, badge, ottenimento)
);

create table sfida(
	id serial PRIMARY KEY,
	titolo varchar(30) not null,
	descrizione text not null,
	immagine text not null,
	badge integer not null references badge(id) on update cascade on delete cascade
);

create table sfida_completata(
	id serial PRIMARY KEY,
	utente integer not null references utente(id) on update cascade on delete cascade,
	sfida integer not null references sfida(id) on update cascade on delete cascade,
	descrizione text null,
	latitudine decimal(9,6) null,
	longitudine decimal(9,6) null,
	luogo varchar(50) null,
	difficolta_attesa varchar(10) null,
	difficolta_percepita varchar(10) null,
	pubblicazione timestamptz not null default now(),
	anno_settimana integer not null,
	numero_settimana integer not null,
check (
        (latitudine is null and longitudine is null and luogo is null)
        or
        (latitudine is not null and longitudine is not null and luogo is not null)
    )
);

create unique index unq_sfida_completata
on sfida_completata(
	utente,
	sfida,
	anno_settimana,
	numero_settimana
--	(extract(isoyear from pubblicazione)),
--	(extract(week from pubblicazione))
);

create table media(
	id serial PRIMARY KEY,
	sfida_completata integer not null references sfida_completata(id) on update cascade on delete cascade,
	tipo varchar(10) not null check (tipo in ('Immagine', 'Video')),
	url text not null
);

create table commento(
	id serial PRIMARY KEY,
	utente integer not null references utente(id) on update cascade on delete cascade, 
	sfida_completata integer null references sfida_completata(id) on update cascade on delete cascade,
	commento_padre integer null references commento(id) on update cascade on delete cascade,
	testo text not null,
	check ((sfida_completata is not null) <> (commento_padre is not null))
);

create table like_sfida_completata(
	utente integer references utente(id) on update cascade on delete cascade,
	sfida_completata integer references sfida_completata(id) on update cascade on delete cascade,
	rilascio timestamptz not null default now(),
	PRIMARY KEY(utente, sfida_completata)
);

create table like_commento(
	utente integer references utente(id) on update cascade on delete cascade,
	commento integer references commento(id) on update cascade on delete cascade,
	rilascio timestamptz not null default now(),
	PRIMARY KEY(utente, commento)
);

create table segnalazione(
	id serial PRIMARY KEY,
	utente integer not null references utente(id) on update cascade on delete cascade,
	sfida_completata integer null references sfida_completata(id) on update cascade on delete cascade,
	commento integer null references commento(id) on update cascade on delete cascade,
	categoria varchar(15) not null check (categoria in ('Spam', 'Inappropriato', 'Off topic', 'Altro')),
	descrizione varchar(200) null,
	generazione timestamptz not null default now(),
	risolta boolean not null default false,
	check ((sfida_completata is not null) <> (commento is not null)),
	check (
        (categoria = 'Altro' and descrizione is not null) 
        or
        (categoria <> 'Altro')
    )
);

create table notifica(
	id serial PRIMARY KEY,
	utente integer not null references utente(id) on update cascade on delete cascade,
	titolo varchar(30) not null,
	contenuto text not null,
	letta boolean not null default false,
	ricezione timestamptz not null default now()
);

