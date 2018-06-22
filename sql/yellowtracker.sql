/*
DROP TABLE IF EXISTS mining_map_guild;
DROP TABLE IF EXISTS mining_map;
DROP TABLE IF EXISTS mvp_guild;
DROP TABLE IF EXISTS mvp_alias;
DROP TABLE IF EXISTS mvp;
DROP TABLE IF EXISTS guild;
DROP SEQUENCE IF EXISTS mvp_seq;
DROP SEQUENCE IF EXISTS mining_map_seq;
*/

CREATE SEQUENCE mvp_seq;

CREATE TABLE guild (
  id bigint NOT NULL,
  user_input_channel text,
  voice_channel text,
  mvp_list_channel text,
  mvp_alive_expiration_time_mins int,
  mvp_list_refresh_rate_secs int,
  max_selection_time_secs int,
  CONSTRAINT guild_pk PRIMARY KEY (id)
);

CREATE TABLE mvp (
  id int NOT NULL DEFAULT nextval('mvp_seq'),
  name text NOT NULL,
  map text NOT NULL,
  t1 int NOT NULL,
  t2 int NOT NULL,
  CONSTRAINT mvp_pk PRIMARY KEY (id)
);

CREATE TABLE mvp_alias (
  id_mvp int NOT NULL,
  alias text NOT NULL,
  CONSTRAINT mvp_alias_pk PRIMARY KEY (id_mvp,alias)
);

CREATE TABLE mvp_guild (
  id_mvp int NOT NULL,
  id_guild bigint NOT NULL,
  death_time timestamp NOT NULL,
  CONSTRAINT mvp_guild_pk PRIMARY KEY (id_mvp,id_guild)
);

INSERT INTO mvp(name,map,t1,t2)VALUES('Amon Ra','moc_pryd06',60,70);
INSERT INTO mvp(name,map,t1,t2)VALUES('Atroce','ra_fild02',180,190);
INSERT INTO mvp(name,map,t1,t2)VALUES('Atroce','ra_fild03',300,310);
INSERT INTO mvp(name,map,t1,t2)VALUES('Atroce','ra_fild04',180,190);
INSERT INTO mvp(name,map,t1,t2)VALUES('Atroce','ve_fild01',360,370);
INSERT INTO mvp(name,map,t1,t2)VALUES('Atroce','ve_fild02',240,250);
INSERT INTO mvp(name,map,t1,t2)VALUES('Baphomet','prt_maze03',120,130);
INSERT INTO mvp(name,map,t1,t2)VALUES('Beelzebub','abbey03',720,730);
INSERT INTO mvp(name,map,t1,t2)VALUES('Bio3 MVP','lhz_dun03',100,130);
INSERT INTO mvp(name,map,t1,t2)VALUES('Bio4 MVP','lhz_dun04',100,130);
INSERT INTO mvp(name,map,t1,t2)VALUES('Boitata','bra_dun02',120,130);
INSERT INTO mvp(name,map,t1,t2)VALUES('Dark Lord','gl_chyard',60,70);
INSERT INTO mvp_alias(id_mvp,alias)VALUES(currval('mvp_seq'),'DL');
INSERT INTO mvp(name,map,t1,t2)VALUES('Detardeurus','abyss_03',180,190);
INSERT INTO mvp_alias(id_mvp,alias)VALUES(currval('mvp_seq'),'Detale');
INSERT INTO mvp(name,map,t1,t2)VALUES('Doppelganger','gef_dun02',120,130);
INSERT INTO mvp(name,map,t1,t2)VALUES('Dracula','gef_dun01',60,70);
INSERT INTO mvp(name,map,t1,t2)VALUES('Drake','treasure02',120,130);
INSERT INTO mvp(name,map,t1,t2)VALUES('Eddga','pay_fild11',120,130);
INSERT INTO mvp(name,map,t1,t2)VALUES('Egnigem Cenia','lhz_dun02',120,130);
INSERT INTO mvp_alias(id_mvp,alias)VALUES(currval('mvp_seq'),'GEC');
INSERT INTO mvp(name,map,t1,t2)VALUES('Evil Snake Lord','gon_dun03',94,104);
INSERT INTO mvp_alias(id_mvp,alias)VALUES(currval('mvp_seq'),'ESL');
INSERT INTO mvp(name,map,t1,t2)VALUES('Fallen Bishop','abbey02',120,130);
INSERT INTO mvp_alias(id_mvp,alias)VALUES(currval('mvp_seq'),'FBH');
INSERT INTO mvp(name,map,t1,t2)VALUES('Garm','xmas_fild01',120,130);
INSERT INTO mvp_alias(id_mvp,alias)VALUES(currval('mvp_seq'),'Hatii');
INSERT INTO mvp(name,map,t1,t2)VALUES('Gloom Under Night','ra_san05',300,310);
INSERT INTO mvp(name,map,t1,t2)VALUES('Golden Thief Bug','prt_sewb4',60,70);
INSERT INTO mvp_alias(id_mvp,alias)VALUES(currval('mvp_seq'),'GTB');
INSERT INTO mvp(name,map,t1,t2)VALUES('Gopinich','mosk_dun03',120,130);
INSERT INTO mvp(name,map,t1,t2)VALUES('Hardrock Mammoth','man_fild03',240,241);
INSERT INTO mvp_alias(id_mvp,alias)VALUES(currval('mvp_seq'),'Mammoth');
INSERT INTO mvp(name,map,t1,t2)VALUES('Ifrit','thor_v03',660,670);
INSERT INTO mvp(name,map,t1,t2)VALUES('Kiel D-01','kh_dun02',120,180);
INSERT INTO mvp(name,map,t1,t2)VALUES('Kraken','iz_dun05',120,130);
INSERT INTO mvp(name,map,t1,t2)VALUES('Ktullanux','ice_dun03',120,120);
INSERT INTO mvp(name,map,t1,t2)VALUES('Lady Tanee','ayo_dun02',420,430);
INSERT INTO mvp_alias(id_mvp,alias)VALUES(currval('mvp_seq'),'LT');
INSERT INTO mvp_alias(id_mvp,alias)VALUES(currval('mvp_seq'),'Tanee');
INSERT INTO mvp(name,map,t1,t2)VALUES('Leak','dew_dun01',120,130);
INSERT INTO mvp(name,map,t1,t2)VALUES('Lord of the Dead','niflheim',133,133);
INSERT INTO mvp_alias(id_mvp,alias)VALUES(currval('mvp_seq'),'LOD');
INSERT INTO mvp(name,map,t1,t2)VALUES('Nightmare Amon Ra','moc_prydn2',60,70);
INSERT INTO mvp(name,map,t1,t2)VALUES('Maya','anthell02',120,130);
INSERT INTO mvp(name,map,t1,t2)VALUES('Mistress','mjolnir_04',120,130);
INSERT INTO mvp(name,map,t1,t2)VALUES('Moonlight Flower','pay_dun04',60,70);
INSERT INTO mvp_alias(id_mvp,alias)VALUES(currval('mvp_seq'),'MF');
INSERT INTO mvp(name,map,t1,t2)VALUES('Orc Hero','gef_fild14',60,70);
INSERT INTO mvp_alias(id_mvp,alias)VALUES(currval('mvp_seq'),'OH');
INSERT INTO mvp(name,map,t1,t2)VALUES('Orc Lord','gef_fild10',120,130);
INSERT INTO mvp_alias(id_mvp,alias)VALUES(currval('mvp_seq'),'OL');
INSERT INTO mvp(name,map,t1,t2)VALUES('Osiris','moc_pryd04',60,180);
INSERT INTO mvp(name,map,t1,t2)VALUES('Pharaoh','in_sphinx5',60,70);
INSERT INTO mvp(name,map,t1,t2)VALUES('Phreeoni','moc_fild17',120,130);
INSERT INTO mvp(name,map,t1,t2)VALUES('Queen Scaraba','dic_dun02',120,121);
INSERT INTO mvp_alias(id_mvp,alias)VALUES(currval('mvp_seq'),'QS');
INSERT INTO mvp(name,map,t1,t2)VALUES('RSX-0806','ein_dun02',125,135);
INSERT INTO mvp(name,map,t1,t2)VALUES('Samurai Specter','ama_dun03',91,101);
INSERT INTO mvp_alias(id_mvp,alias)VALUES(currval('mvp_seq'),'Incantation Samurai');
INSERT INTO mvp(name,map,t1,t2)VALUES('Stormy Knight','xmas_dun02',60,70);
INSERT INTO mvp_alias(id_mvp,alias)VALUES(currval('mvp_seq'),'SK');
INSERT INTO mvp(name,map,t1,t2)VALUES('Tao Gunka','beach_dun',300,310);
INSERT INTO mvp(name,map,t1,t2)VALUES('Tao Gunka','beach_dun2',300,310);
INSERT INTO mvp(name,map,t1,t2)VALUES('Tao Gunka','beach_dun3',300,310);
INSERT INTO mvp(name,map,t1,t2)VALUES('Tendrilion','spl_fild03',60,60);
INSERT INTO mvp(name,map,t1,t2)VALUES('Thanatos','thana_boss',120,120);
INSERT INTO mvp(name,map,t1,t2)VALUES('Turtle General','tur_dun04',60,70);
INSERT INTO mvp_alias(id_mvp,alias)VALUES(currval('mvp_seq'),'TG');
INSERT INTO mvp(name,map,t1,t2)VALUES('Valkyrie Randgris','odin_tem03',480,840);
INSERT INTO mvp_alias(id_mvp,alias)VALUES(currval('mvp_seq'),'VR');
INSERT INTO mvp(name,map,t1,t2)VALUES('White Lady','lou_dun03',116,126);
INSERT INTO mvp_alias(id_mvp,alias)VALUES(currval('mvp_seq'),'Bacsojin');
INSERT INTO mvp(name,map,t1,t2)VALUES('Wounded Morroc','moc_fild22',720,900);
INSERT INTO mvp_alias(id_mvp,alias)VALUES(currval('mvp_seq'),'WM');
INSERT INTO mvp(name,map,t1,t2)VALUES('Vesper','jupe_core',120,130);
INSERT INTO mvp(name,map,t1,t2)VALUES('Gold Queen Scaraba','dic_dun03',120,120);
INSERT INTO mvp_alias(id_mvp,alias)VALUES(currval('mvp_seq'),'GQS');
INSERT INTO mvp(name,map,t1,t2)VALUES('Kublin Vanilla','arug_dun01',240,360);
INSERT INTO mvp(name,map,t1,t2)VALUES('Kublin Unres','schg_dun01',240,360);
INSERT INTO mvp(name,map,t1,t2)VALUES('Orc Hero','gef_fild02',1440,1450);
INSERT INTO mvp_alias(id_mvp,alias)VALUES(currval('mvp_seq'),'OH');



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



UPDATE mvp SET t1=45,t2=75 WHERE name='Dracula' AND map='gef_dun01';
UPDATE mvp SET t1=45,t2=75 WHERE name='Orc Hero' AND map='gef_fild14';
UPDATE mvp SET t1=45,t2=75 WHERE name='Turtle General' AND map='tur_dun04';
UPDATE mvp SET t1=45,t2=75 WHERE name='Stormy Knight' AND map='xmas_dun02';
UPDATE mvp SET t1=45,t2=75 WHERE name='Amon Ra' AND map='moc_pryd06';
UPDATE mvp SET t1=45,t2=75 WHERE name='Pharaoh' AND map='in_sphinx5';
UPDATE mvp SET t1=45,t2=75 WHERE name='Moonlight Flower' AND map='pay_dun04';
UPDATE mvp SET t1=45,t2=75 WHERE name='Golden Thief Bug' AND map='prt_sewb4';
UPDATE mvp SET t1=45,t2=75 WHERE name='Dark Lord' AND map='gl_chyard';
UPDATE mvp SET t1=45,t2=75 WHERE name='Nightmare Amon Ra' AND map='moc_prydn2';
UPDATE mvp SET t1=76,t2=106 WHERE name='Samurai Specter' AND map='ama_dun03';
UPDATE mvp SET t1=79,t2=109 WHERE name='Evil Snake Lord' AND map='gon_dun03';
UPDATE mvp SET t1=101,t2=131 WHERE name='White Lady' AND map='lou_dun03';
UPDATE mvp SET t1=105,t2=135 WHERE name='Vesper' AND map='jupe_core';
UPDATE mvp SET t1=105,t2=135 WHERE name='Baphomet' AND map='prt_maze03';
UPDATE mvp SET t1=105,t2=135 WHERE name='Boitata' AND map='bra_dun02';
UPDATE mvp SET t1=105,t2=135 WHERE name='Doppelganger' AND map='gef_dun02';
UPDATE mvp SET t1=105,t2=135 WHERE name='Drake' AND map='treasure02';
UPDATE mvp SET t1=105,t2=135 WHERE name='Eddga' AND map='pay_fild11';
UPDATE mvp SET t1=105,t2=135 WHERE name='Egnigem Cenia' AND map='lhz_dun02';
UPDATE mvp SET t1=105,t2=135 WHERE name='Fallen Bishop' AND map='abbey02';
UPDATE mvp SET t1=105,t2=135 WHERE name='Garm' AND map='xmas_fild01';
UPDATE mvp SET t1=105,t2=135 WHERE name='Gopinich' AND map='mosk_dun03';
UPDATE mvp SET t1=105,t2=135 WHERE name='Kraken' AND map='iz_dun05';
UPDATE mvp SET t1=105,t2=135 WHERE name='Leak' AND map='dew_dun01';
UPDATE mvp SET t1=105,t2=135 WHERE name='Maya' AND map='anthell02';
UPDATE mvp SET t1=105,t2=135 WHERE name='Mistress' AND map='mjolnir_04';
UPDATE mvp SET t1=105,t2=135 WHERE name='Orc Lord' AND map='gef_fild10';
UPDATE mvp SET t1=105,t2=135 WHERE name='Phreeoni' AND map='moc_fild17';
UPDATE mvp SET t1=110,t2=140 WHERE name='RSX-0806' AND map='ein_dun02';
UPDATE mvp SET t1=165,t2=195 WHERE name='Detardeurus' AND map='abyss_03';
UPDATE mvp SET t1=165,t2=195 WHERE name='Atroce' AND map='ra_fild04';
UPDATE mvp SET t1=165,t2=195 WHERE name='Atroce' AND map='ra_fild02';
UPDATE mvp SET t1=225,t2=255 WHERE name='Atroce' AND map='ve_fild02';
UPDATE mvp SET t1=285,t2=315 WHERE name='Gloom Under Night' AND map='ra_san05';
UPDATE mvp SET t1=285,t2=315 WHERE name='Atroce' AND map='ra_fild03';
UPDATE mvp SET t1=285,t2=315 WHERE name='Tao Gunka' AND map='beach_dun';
UPDATE mvp SET t1=285,t2=315 WHERE name='Tao Gunka' AND map='beach_dun2';
UPDATE mvp SET t1=285,t2=315 WHERE name='Tao Gunka' AND map='beach_dun3';
UPDATE mvp SET t1=345,t2=375 WHERE name='Atroce' AND map='ve_fild01';
UPDATE mvp SET t1=405,t2=435 WHERE name='Lady Tanee' AND map='ayo_dun02';
UPDATE mvp SET t1=645,t2=675 WHERE name='Ifrit' AND map='thor_v03';
UPDATE mvp SET t1=705,t2=735 WHERE name='Beelzebub' AND map='abbey03';
