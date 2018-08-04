/*
DROP TABLE IF EXISTS mining_guild;
DROP TABLE IF EXISTS mining;
DROP TABLE IF EXISTS mvp_guild;
DROP TABLE IF EXISTS mvp_alias;
DROP TABLE IF EXISTS mvp;
DROP TABLE IF EXISTS guild;
DROP SEQUENCE IF EXISTS mvp_seq;
DROP SEQUENCE IF EXISTS mining_seq;
*/

CREATE SEQUENCE mvp_seq;

CREATE TABLE guild
(
  id bigint NOT NULL,
  id_mvp_channel bigint,
  id_mining_channel bigint,
  id_voice_channel bigint,
  CONSTRAINT guild_pk PRIMARY KEY (id)
);

CREATE TABLE mvp (
  id integer NOT NULL DEFAULT nextval('mvp_seq'::regclass),
  name text NOT NULL,
  map text NOT NULL,
  t1 integer NOT NULL,
  t2 integer NOT NULL,
  CONSTRAINT mvp_pk PRIMARY KEY (id)
);

CREATE TABLE mvp_alias (
  id_mvp integer NOT NULL,
  alias text NOT NULL,
  CONSTRAINT mvp_alias_pk PRIMARY KEY (id_mvp, alias)
);

CREATE TABLE mvp_guild (
  id_mvp integer NOT NULL,
  id_guild bigint NOT NULL,
  death_time timestamp without time zone NOT NULL,
  CONSTRAINT mvp_guild_pk PRIMARY KEY (id_mvp, id_guild)
);

INSERT INTO mvp(name,map,t1,t2)VALUES('Amon Ra','moc_pryd06',60,70);
INSERT INTO mvp(name,map,t1,t2)VALUES('Atroce','ra_fild02',240,250);
INSERT INTO mvp(name,map,t1,t2)VALUES('Atroce','ra_fild03',180,190);
INSERT INTO mvp(name,map,t1,t2)VALUES('Atroce','ra_fild04',300,310);
INSERT INTO mvp(name,map,t1,t2)VALUES('Atroce','ve_fild01',180,190);
INSERT INTO mvp(name,map,t1,t2)VALUES('Atroce','ve_fild02',360,370);
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
INSERT INTO mvp(name,map,t1,t2)VALUES('[SPECIAL] Maya P.','gld_dun03',20,30);
INSERT INTO mvp_alias(id_mvp,alias)VALUES(currval('mvp_seq'),'MP Unres');



CREATE SEQUENCE mining_seq;

CREATE TABLE mining
(
  id integer NOT NULL DEFAULT nextval('mining_seq'::regclass),
  name text NOT NULL,
  CONSTRAINT mining_pk PRIMARY KEY (id)
);

CREATE TABLE mining_guild
(
  id_mining integer NOT NULL,
  id_guild bigint NOT NULL,
  track_time timestamp without time zone NOT NULL,
  CONSTRAINT mining_guild_pk PRIMARY KEY (id_mining, id_guild)
);

INSERT INTO mining(name)VALUES('Coal Mine');
INSERT INTO mining(name)VALUES('Payon');
INSERT INTO mining(name)VALUES('Einbech');
INSERT INTO mining(name)VALUES('Geffen');
INSERT INTO mining(name)VALUES('Thor');
INSERT INTO mining(name)VALUES('Magma');
INSERT INTO mining(name)VALUES('Ice Dungeon');
INSERT INTO mining(name)VALUES('Izlude');
INSERT INTO mining(name)VALUES('Louyang');
INSERT INTO mining(name)VALUES('Comodo North');
INSERT INTO mining(name)VALUES('Comodo East');
INSERT INTO mining(name)VALUES('Comodo West');
INSERT INTO mining(name)VALUES('Umbala');
INSERT INTO mining(name)VALUES('Mistress');
