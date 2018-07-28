# Yellow Tracker

Yellow Tracker é um bot de discord para marcar MVPs.

Instruções para uso:

1. Adicione o bot ao seu servidor através do link: https://discordapp.com/api/oauth2/authorize?client_id=417462153528737792&permissions=36777024&scope=bot

2. Informe um canal do servidor a ser usado exclusivamente para a marcação de MVPs. Isso é feito através do comando **!setmvpchannel**. Nesse canal o bot mantém uma lista atualizada dos MVPs marcados e o tempo restante de respawn.

3. Use o comando **!track** para marcar os MVPs derrotados. OBS.: Ele só pode ser usado dentro do canal de MVP.

4. O bot pode ser configurado também para falar o nome do MVP em um canal de voz toda vez que um MVP marcado atingir o delay mínimo. Utilize o comando **!setvoicechannel** para definir em qual canal de voz o bot vai entrar para anunciar. Feito isso, toda vez que um MVP atingir o respawn mínimo, o bot entrará nesse canal e pronunciará o nome do MVP. OBS.: caso não queira mais que o bot entre no canal de voz, utilize o comando **!unsetvoicechannel**.

5. Além de MVPs, o bot também pode ser utilizado para marcar zonas de mineração, onde uma zona representa um ou mais mapas de mineração com características em comum (por exemplo, a zona de mineração "Ice Dungeon" corresponde aos mapas "ice_dun01", "ice_dun02" e "ice_dun03"). Da mesma forma que a marcação de MVPs, é preciso configurar um canal que será usado exclusivamente para marcar as zonas de mineração. Utilize o comando **!setminingchannel**. Nesse canal será mantida a lista das áreas de mineração marcadas.

Lista de comandos:

Comando | Descrição
------- | ---------
**!setmvpchannel NAME** | Habilita o canal **NAME** como canal de MVP. 
**!setminingchannel NAME** | Habilita o canal **NAME** como canal de mineração. 
**!setvoicechannel NAME** | Habilita o canal **NAME** como canal de voz. 
**!unsetmvpchannel** | Desabilita o canal de MVP.
**!unsetminingchannel** | Desabilita o canal de mineração.
**!unsetvoicechannel** | Desabilita o canal de voz.
**!settings** | Mostra as configurações do bot no servidor.
**!track NAME TIME** ou **!t NAME TIME** | Informa que o MVP **NAME** morreu há **TIME** minutos atrás. O argumento **TIME** é opcional. Não informá-lo significa que o MVP morreu agora. No canal de mineração, esse comando informa que a zona de mineração **NAME** foi visitada há **TIME** minutos atrás.

Lista de MVPs:

Nome | Alias | Mapa | Tempo de Respawn
---- | ----- | --- | -------
Amon Ra | - | moc_pryd06 | 45~75 mins |
Atroce | - | ve_fild02 | 225~255 mins |
Atroce | - | ve_fild01 | 345~375 mins |
Atroce | - | ra_fild04 | 165~195 mins |
Atroce | - | ra_fild02 | 165~195 mins |
Atroce | - | ra_fild03 | 285~315 mins |
Baphomet | - | prt_maze03 | 105~135 mins |
Beelzebub | - | abbey03 | 705~735 mins |
Bio3 MVP | - | lhz_dun03 | 100~130 mins |
Bio4 MVP | - | lhz_dun04 | 100~130 mins |
Boitata | - | bra_dun02 | 105~135 mins |
Dark Lord | DL | gl_chyard | 45~75 mins |
Detardeurus | Detale | abyss_03 | 165~195 mins |
Doppelganger | - | gef_dun02 | 105~135 mins |
Dracula | - | gef_dun01 | 45~75 mins |
Drake | - | treasure02 | 105~135 mins |
Eddga | - | pay_fild11 | 105~135 mins |
Egnigem Cenia | GEC | lhz_dun02 | 105~135 mins |
Evil Snake Lord | ESL | gon_dun03 | 79~109 mins |
Fallen Bishop | FBH | abbey02 | 105~135 mins |
Garm | Hatii | xmas_fild01 | 105~135 mins |
Gloom Under Night | - | ra_san05 | 285~315 mins |
Gold Queen Scaraba | GQS | dic_dun03 | 120~120 mins |
Golden Thief Bug | GTB | prt_sewb4 | 45~75 mins |
Gopinich | - | mosk_dun03 | 105~135 mins |
Hardrock Mammoth | Mammoth | man_fild03 | 240~241 mins |
Ifrit | - | thor_v03 | 645~675 mins |
Kiel D-01 | - | kh_dun02 | 120~180 mins |
Kraken | - | iz_dun05 | 105~135 mins |
Ktullanux | - | ice_dun03 | 120~120 mins |
Kublin Unres | - | schg_dun01 | 240~360 mins |
Kublin Vanilla | - | arug_dun01 | 240~360 mins |
Lady Tanee | LT; Tanee | ayo_dun02 | 405~435 mins |
Leak | - | dew_dun01 | 105~135 mins |
Lord of the Dead | LOD | niflheim | 133~133 mins |
Maya | - | anthell02 | 105~135 mins |
Mistress | - | mjolnir_04 | 105~135 mins |
Moonlight Flower | MF | pay_dun04 | 45~75 mins |
Nightmare Amon Ra | - | moc_prydn2 | 45~75 mins |
Orc Hero | OH | gef_fild02 | 1440~1450 mins |
Orc Hero | OH | gef_fild14 | 45~75 mins |
Orc Lord | OL | gef_fild10 | 105~135 mins |
Osiris | - | moc_pryd04 | 60~180 mins |
Pharaoh | - | in_sphinx5 | 45~75 mins |
Phreeoni | - | moc_fild17 | 105~135 mins |
Queen Scaraba | QS | dic_dun02 | 120~121 mins |
RSX-0806 | - | ein_dun02 | 110~140 mins |
Samurai Specter | Incantation Samurai | ama_dun03 | 76~106 mins |
Stormy Knight | SK | xmas_dun02 | 45~75 mins |
Tao Gunka | - | beach_dun3 | 285~315 mins |
Tao Gunka | - | beach_dun2 | 285~315 mins |
Tao Gunka | - | beach_dun | 285~315 mins |
Tendrilion | - | spl_fild03 | 60~60 mins |
Thanatos | - | thana_boss | 120~120 mins |
Turtle General | TG | tur_dun04 | 45~75 mins |
Valkyrie Randgris | VR | odin_tem03 | 480~840 mins |
Vesper | - | jupe_core | 105~135 mins |
White Lady | Bacsojin | lou_dun03 | 101~131 mins |
Wounded Morroc | WM | moc_fild22 | 720~900 mins |
[SPECIAL] Maya P. | MP Unres | gld_dun03 | 20~30 mins |

Zonas de mineração:

Nome|
----|
Abelha|
Coal Mine|
Comodo Leste|
Comodo Norte|
Comodo Oeste|
Einbech|
Geffen|
Ice Dungeon|
Izlude|
Louyang|
Magma|
Payon|
Thor|
Umbala|
