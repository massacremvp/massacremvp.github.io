create sequence mining_map_seq;
create table mining_map (
  id int not null default nextval('mining_map_seq'),
  map text not null,
  CONSTRAINT mining_map_pk PRIMARY KEY (id)
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

create table mining_map_guild (
  id_mining_map int not null,
  id_guild bigint not null,
  track_time timestamp not null,
  CONSTRAINT mining_map_guild_pk PRIMARY KEY (id_mining_map,id_guild)
);
