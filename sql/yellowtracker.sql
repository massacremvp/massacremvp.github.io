/*
drop table mvp_guild;
drop table mvp_alias;
drop table mvp;
drop sequence mvp_seq;
drop table guild;
*/

create table guild (
  id bigint not null,
  user_input_channel text,
  voice_channel text,
  mvp_list_channel text,
  mvp_alive_expiration_time_mins int,
  mvp_list_refresh_rate_secs int,
  max_selection_time_secs int,
  CONSTRAINT guild_pk PRIMARY KEY (id)
);

create sequence mvp_seq;
create table mvp (
  id int not null default nextval('mvp_seq'),
  name text not null,
  map text not null,
  t1 int not null,
  t2 int not null,
  CONSTRAINT mvp_pk PRIMARY KEY (id)
);

create table mvp_alias (
  id_mvp int not null,
  alias text not null,
  CONSTRAINT mvp_alias_pk PRIMARY KEY (id_mvp,alias)
);

create table mvp_guild (
  id_mvp int not null,
  --id_guild int not null,
  id_guild bigint not null,
  death_time timestamp not null,
  CONSTRAINT mvp_guild_pk PRIMARY KEY (id_mvp,id_guild)
);

insert into mvp(name,map,t1,t2)values('Amon Ra','moc_pryd06',60,70);
insert into mvp(name,map,t1,t2)values('Atroce','ra_fild02',180,190);
insert into mvp(name,map,t1,t2)values('Atroce','ra_fild03',300,310);
insert into mvp(name,map,t1,t2)values('Atroce','ra_fild04',180,190);
insert into mvp(name,map,t1,t2)values('Atroce','ve_fild01',360,370);
insert into mvp(name,map,t1,t2)values('Atroce','ve_fild02',240,250);
insert into mvp(name,map,t1,t2)values('Baphomet','prt_maze03',120,130);
insert into mvp(name,map,t1,t2)values('Beelzebub','abbey03',720,730);
insert into mvp(name,map,t1,t2)values('Bio3 MVP','lhz_dun03',100,130);
insert into mvp(name,map,t1,t2)values('Bio4 MVP','lhz_dun04',100,130);
insert into mvp(name,map,t1,t2)values('Boitata','bra_dun02',120,130);
insert into mvp(name,map,t1,t2)values('Dark Lord','gl_chyard',60,70);
insert into mvp_alias(id_mvp,alias)values(currval('mvp_seq'),'DL');
insert into mvp(name,map,t1,t2)values('Detardeurus','abyss_03',180,190);
insert into mvp_alias(id_mvp,alias)values(currval('mvp_seq'),'Detale');
insert into mvp(name,map,t1,t2)values('Doppelganger','gef_dun02',120,130);
insert into mvp(name,map,t1,t2)values('Dracula','gef_dun01',60,70);
insert into mvp(name,map,t1,t2)values('Drake','treasure02',120,130);
insert into mvp(name,map,t1,t2)values('Eddga','pay_fild11',120,130);
insert into mvp(name,map,t1,t2)values('Egnigem Cenia','lhz_dun02',120,130);
insert into mvp_alias(id_mvp,alias)values(currval('mvp_seq'),'GEC');
insert into mvp(name,map,t1,t2)values('Evil Snake Lord','gon_dun03',94,104);
insert into mvp_alias(id_mvp,alias)values(currval('mvp_seq'),'ESL');
insert into mvp(name,map,t1,t2)values('Fallen Bishop','abbey02',120,130);
insert into mvp_alias(id_mvp,alias)values(currval('mvp_seq'),'FBH');
insert into mvp(name,map,t1,t2)values('Garm','xmas_fild01',120,130);
insert into mvp_alias(id_mvp,alias)values(currval('mvp_seq'),'Hatii');
insert into mvp(name,map,t1,t2)values('Gloom Under Night','ra_san05',300,310);
insert into mvp(name,map,t1,t2)values('Golden Thief Bug','prt_sewb4',60,70);
insert into mvp_alias(id_mvp,alias)values(currval('mvp_seq'),'GTB');
insert into mvp(name,map,t1,t2)values('Gopinich','mosk_dun03',120,130);
insert into mvp(name,map,t1,t2)values('Hardrock Mamooth','man_fild03',240,241);
insert into mvp_alias(id_mvp,alias)values(currval('mvp_seq'),'Mamooth');
insert into mvp(name,map,t1,t2)values('Ifrit','thor_v03',660,670);
insert into mvp(name,map,t1,t2)values('Kiel D-01','kh_dun02',120,180);
insert into mvp(name,map,t1,t2)values('Kraken','iz_dun05',120,130);
insert into mvp(name,map,t1,t2)values('Ktullanux','ice_dun03',120,120);
insert into mvp(name,map,t1,t2)values('Lady Tanee','ayo_dun02',420,430);
insert into mvp_alias(id_mvp,alias)values(currval('mvp_seq'),'LT');
insert into mvp_alias(id_mvp,alias)values(currval('mvp_seq'),'Tanee');
insert into mvp(name,map,t1,t2)values('Leak','dew_dun01',120,130);
insert into mvp(name,map,t1,t2)values('Lord of the Dead','niflheim',133,133);
insert into mvp_alias(id_mvp,alias)values(currval('mvp_seq'),'LOD');
insert into mvp(name,map,t1,t2)values('Nightmare Amon Ra','moc_prydn2',60,70);
insert into mvp(name,map,t1,t2)values('Maya','anthell02',120,130);
insert into mvp(name,map,t1,t2)values('Mistress','mjolnir_04',120,130);
insert into mvp(name,map,t1,t2)values('Moonlight Flower','pay_dun04',60,70);
insert into mvp_alias(id_mvp,alias)values(currval('mvp_seq'),'MF');
insert into mvp(name,map,t1,t2)values('Orc Hero','gef_fild14',60,70);
insert into mvp_alias(id_mvp,alias)values(currval('mvp_seq'),'OH');
insert into mvp(name,map,t1,t2)values('Orc Lord','gef_fild10',120,130);
insert into mvp_alias(id_mvp,alias)values(currval('mvp_seq'),'OL');
insert into mvp(name,map,t1,t2)values('Osiris','moc_pryd04',60,180);
insert into mvp(name,map,t1,t2)values('Pharaoh','in_sphinx5',60,70);
insert into mvp(name,map,t1,t2)values('Phreeoni','moc_fild17',120,130);
insert into mvp(name,map,t1,t2)values('Queen Scaraba','dic_dun02',120,121);
insert into mvp_alias(id_mvp,alias)values(currval('mvp_seq'),'QS');
insert into mvp(name,map,t1,t2)values('RSX-0806','ein_dun02',125,135);
insert into mvp(name,map,t1,t2)values('Samurai Specter','ama_dun03',91,101);
insert into mvp_alias(id_mvp,alias)values(currval('mvp_seq'),'Incantation Samurai');
insert into mvp(name,map,t1,t2)values('Stormy Knight','xmas_dun02',60,70);
insert into mvp_alias(id_mvp,alias)values(currval('mvp_seq'),'SK');
insert into mvp(name,map,t1,t2)values('Tao Gunka','beach_dun',300,310);
insert into mvp(name,map,t1,t2)values('Tao Gunka','beach_dun2',300,310);
insert into mvp(name,map,t1,t2)values('Tao Gunka','beach_dun3',300,310);
insert into mvp(name,map,t1,t2)values('Tendrilion','spl_fild03',60,60);
insert into mvp(name,map,t1,t2)values('Thanatos','thana_boss',120,120);
insert into mvp(name,map,t1,t2)values('Turtle General','tur_dun04',60,70);
insert into mvp_alias(id_mvp,alias)values(currval('mvp_seq'),'TG');
insert into mvp(name,map,t1,t2)values('Valkyrie Randgris','odin_tem03',480,840);
insert into mvp_alias(id_mvp,alias)values(currval('mvp_seq'),'VR');
insert into mvp(name,map,t1,t2)values('White Lady','lou_dun03',116,126);
insert into mvp_alias(id_mvp,alias)values(currval('mvp_seq'),'Bacsojin');
insert into mvp(name,map,t1,t2)values('Wounded Morroc','moc_fild22',720,900);
insert into mvp_alias(id_mvp,alias)values(currval('mvp_seq'),'WM');
