CREATE SEQUENCE mining_map_seq;

CREATE TABLE mining_map (
  id int NOT NULL DEFAULT nextval('mining_map_seq'),
  map text NOT NULL,
  CONSTRAINT mining_map_pk PRIMARY KEY (id)
);

CREATE TABLE mining_map_guild (
  id_mining_map int NOT NULL,
  id_guild bigint NOT NULL,
  track_time timestamp NOT NULL,
  CONSTRAINT mining_map_guild_pk PRIMARY KEY (id_mining_map,id_guild)
);

INSERT INTO mining_map(map)VALUES('Coal Mine');
INSERT INTO mining_map(map)VALUES('Payon');
INSERT INTO mining_map(map)VALUES('Einbech');
INSERT INTO mining_map(map)VALUES('Geffen');
INSERT INTO mining_map(map)VALUES('Thor');
INSERT INTO mining_map(map)VALUES('Magma');
INSERT INTO mining_map(map)VALUES('Ice Dungeon');
INSERT INTO mining_map(map)VALUES('Izlude');
INSERT INTO mining_map(map)VALUES('Louyang');
INSERT INTO mining_map(map)VALUES('Comodo Norte');
INSERT INTO mining_map(map)VALUES('Comodo Leste');
INSERT INTO mining_map(map)VALUES('Comodo Oeste');
INSERT INTO mining_map(map)VALUES('Umbala');
INSERT INTO mining_map(map)VALUES('Abelha');
