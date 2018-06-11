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
INSERT INTO mvp(name,map,t1,t2)VALUES('Hardrock Mamooth','man_fild03',240,241);
INSERT INTO mvp_alias(id_mvp,alias)VALUES(currval('mvp_seq'),'Mamooth');
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
