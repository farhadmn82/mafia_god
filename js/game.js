
/////////////////////
///OBJECTS Definition

// GameStatus
const GameState = {
    s0 : 0,
    s1 : 1,
    s2 : 2,
    s3 : 3,
    //should define
}

// Roles
const RoleGroup = {
	NONE: 0,
	MAFIA: 1,
	CITIZEN: 2,
}

const RoleEnum = {
    NoRole : 0,
    GodFather : 1,
    Mafia : 2,
    Citizen : 3,
    Doctor : 4,
    Inspector : 5,
    Snipper : 6,
    DieHard : 7,
    Guard : 8,
}

class Role{
    constructor(roleId, groupId, roleName, lives){
        this.roleId = roleId;
        this.groupId = groupId;
        this.roleName = roleName;
        this.lives = lives;
    }
    
    isCITIZEN(){
        return (this.groupId == 2);
    }

    isMAFIA(){
        return (this.groupId == 1);
    }
}

function Roles_Factory(){
    let game_roles = [
        new Role(RoleEnum.NoRole, RoleGroup['NONE'], 'NoRole', 1), 
        new Role(RoleEnum.GodFather, RoleGroup['MAFIA'], 'پدر خوانده', 1), 
        new Role(RoleEnum.Mafia, RoleGroup['MAFIA'], 'مافیا ساده', 1), 
        new Role(RoleEnum.Citizen, RoleGroup['CITIZEN'], 'شهروند ساده', 1), 
        new Role(RoleEnum.Doctor, RoleGroup['CITIZEN'], 'دکتر', 1), 
        new Role(RoleEnum.Inspector, RoleGroup['CITIZEN'], 'کارآگاه', 1), 
        new Role(RoleEnum.Snipper, RoleGroup['CITIZEN'], 'اسنایپر', 1), 
        new Role(RoleEnum.DieHard, RoleGroup['CITIZEN'], 'جان سخت', 2), 
        new Role(RoleEnum.Guard, RoleGroup['CITIZEN'], 'نگهبان', 1), 
    ];

    return game_roles;
}

// Action
const ActionType = {
    NoAction : 0,
    NightShoot : 1,
    DoctorSave : 2,
    InspectorInquiry : 3,
    DieHardInquiry : 4,
    SnipperShoot : 5,
}

class Action{
    constructor(numNight, type, rolePlayerIndex, targetPlayerIndex){
        this.numNight = numNight;
        this.type = type;
        this.rolePlayerIndex = rolePlayerIndex;
        this.targetPlayerIndex = targetPlayerIndex;
    }

    toString(){
        return this.numNight +',' + this.type +','+ this.rolePlayerIndex + ',' + this.targetPlayerIndex + ';'; 
    }

    fromString(value){

    }
}


// Player

const PlayerStatus = {
    InGame : 0,
    Voted : 1,
    NightShoot : 2,
    KickedOut : 3
}

class Player {
    constructor(id, name, roleId) {
        this.id = id // unusable
        this.name = name;
        this.roleId = roleId;
        this.status = PlayerStatus.InGame; 
        this.lives = GAME_ROLES[roleId].lives;
    }
    
    isInGame(){
        return this.status == PlayerStatus.InGame;
    }

    voted() {
      this.status = PlayerStatus.Voted;
    }
  
    nightShoot() {
        this.lives--;
        if (this.lives == 0)
            this.status = PlayerStatus.NightShoot;
        
        return (this.lives == 0);
    }
  
    kickOut() {
      this.status = PlayerStatus.KickedOut;
    }
  
    setRole(roleId){
      this.roleId = roleId;
    }

    toString(){
        //return this.id +',' + this.name +','+ this.roleId + ',' + this.status + ';'; 
        
    }

    fromString(value){

    }
}

function Players_Factory(){
    let players = [
        new Player(0, "GF", RoleEnum.GodFather), 
        new Player(1, "Insp", RoleEnum.Inspector), 
        new Player(2, "Cit", RoleEnum.Citizen),
        new Player(2, "cit2", RoleEnum.Citizen),
        new Player(2, "Doc", RoleEnum.Doctor),
        new Player(2, "die", RoleEnum.DieHard),
        new Player(3, "MAF", RoleEnum.Mafia) 
    ];

    return players;
}

/////////////////////////
/// Variables & Constants

/// Constants
let GAME_ROLES = Roles_Factory();
const DAY_NIGHT_NAME = ['معارفه', 'اول', 'دوم', 'سوم', 'چهارم', 'پنجم', 'ششم', 'هفتم', 'هشتم', 'نهم', 'دهم'];

/// Local Storage names
const LS_MG_ONBOARD = 'mg_onboard';
const LS_MG_PLAYERS = 'mg_players';
const LS_MG_NIGHT_ACTIONS = 'mg_night_actions';
const LS_MG_GAME_DATA = 'mg_game_data';

// Game Data
var selected_roles = [];
let players = [];//Players_Factory();
let nightActions = [];

var gameState = 'init';
var numDayNight = 0;
var doctorSelfSave = 0;
var godFatherNegativeInquiry = 0;
var dieHardInquiriesMade = 0;
var guardVoted = 0;

// Game options 
const DETAIL_REPORT = true;
const DOCTOR_SELF_SAVE_MAX = 1
const GODFATHER_NEGATIVE_INSPECTION_MAX = 1
const DIEHARD_INQUERY_MAX = 2
const GUARD_VOTED_MAX = 1;

// vars
var playerNames = [];

/// CONFIRM MODAL Definition
function MODAL_CONFIRM(message, ok_func, cancel_func = close_modal){
    $('#modalMessage').html(message);
    $('#modalBackground').show();  
    $('#modal').show();
    
    document.getElementById("modalButtonOK").onclick = function () {ok_func(); close_modal()};
    document.getElementById("modalButtonCancel").onclick = function () {cancel_func()};
}

function close_modal(){
    $('#modal').hide();
    $('#modalBackground').hide(); 
}


////////////////
// GAME Scenario

function show_page(page){
    gameState = page;
    $('divp').hide();

    $("#"+page).show();
}

function load_start(){
    //check saved game
    $('#btn_last_game').hide();

    if (typeof(Storage) !== "undefined") {
        if (localStorage.getItem(LS_MG_ONBOARD) == null)
            localStorage.setItem(LS_MG_ONBOARD, false);
        let game_continue = localStorage.getItem(LS_MG_ONBOARD);
        if(game_continue == 'true'){
            $('#btn_last_game').show();
        }
        else {
        }
    } else {
        alert("Sorry! No Web Storage support..");
    }

    show_page('start');
    hide_diehard_inquiry_report();
}

function reload_last_game_data(){
    let ls = localStorage.getItem(LS_MG_PLAYERS);
    if (ls == null){
        reload_default_values();
        return;
    }
    
    try{
        var pls = JSON.parse(localStorage.getItem(LS_MG_PLAYERS));
        players = [];
        pls.forEach(pl => {
            players.push(new Player(pl['id'], pl['name'], pl['roleId']));
        });
        
        var nas = JSON.parse(localStorage.getItem(LS_MG_NIGHT_ACTIONS));
        nightActions = [];
        nas.forEach(na => {
            nightActions.push(new Action(na['numNight'], na['type'], na['rolePlayerIndex'], na['targetPlayerIndex']));
        });
    
        var gameData = JSON.parse(localStorage.getItem(LS_MG_GAME_DATA));
        gameState = gameData['gameState']; 
        numDayNight  = gameData['numDayNight'];
        doctorSelfSave  = gameData['doctorSelfSave'];
        godFatherNegativeInquiry  = gameData['godFatherNegativeInquiry'];
        dieHardInquiriesMade  = gameData['dieHardInquiriesMade'];
        guardVoted  = gameData['guardVoted'];
    
        reload_last_report();
    }
    catch(error){
        reload_default_values();
    }
    
}

function reload_last_report(){
    nightActions.forEach(na => {
        if(na.numNight == numDayNight - 1 &&
            na.type == ActionType.DieHardInquiry){
                load_report();
            }
    });
}

function reload_default_values(){
    playerNames = [];
    selected_roles = [];
    
    gameState = 'start'; 
    numDayNight  = 0;
    doctorSelfSave  = 0;
    godFatherNegativeInquiry  = 0;
    dieHardInquiriesMade  = 0;
    guardVoted  = 0;

    let ls = localStorage.getItem(LS_MG_PLAYERS);
    if (ls == null){
        return;
    }
    
    var pls = JSON.parse(localStorage.getItem(LS_MG_PLAYERS));
    pls.forEach(pl => {
        playerNames.push(pl.name);
        selected_roles.push(pl.roleId);
    });
}

function save_game_data(){
    localStorage.setItem(LS_MG_ONBOARD, true);
    localStorage.setItem(LS_MG_PLAYERS, JSON.stringify(players));
    localStorage.setItem(LS_MG_NIGHT_ACTIONS, JSON.stringify(nightActions));
    save_game_variables_data();
}

function save_game_variables_data(){
    var gameData = {
        gameState : gameState, 
        numDayNight : numDayNight,
        doctorSelfSave : doctorSelfSave,
        godFatherNegativeInquiry : godFatherNegativeInquiry,
        dieHardInquiriesMade : dieHardInquiriesMade,
        guardVoted : guardVoted
    };
    localStorage.setItem(LS_MG_GAME_DATA, JSON.stringify(gameData));
}

function load_init(){
    reload_default_values();
    load_roles();
}

function reload_last_game(){
    reload_last_game_data();
    switch(gameState){
        case 'roles': load_roles(); break;
        case 'players': load_players(); break;
        case 'day': load_day(); break;
        case 'sleep': load_sleep(); break;
        case 'night': load_night(); break;
        case 'pre_assignment': load_pre_assignment(); break;
        case 'role_assign': load_role_assign(); break;
        case 'voting': load_day(); break;
        case 'report': load_report(); break;
        default: load_init();
    }
}

// roles PAGE
function load_roles(){
    $('#mafiaRolesList').html('');
    $('#citizenRolesList').html('');
    
    GAME_ROLES.forEach(role => {
        if (role.groupId == RoleGroup.MAFIA){
            $('#mafiaRolesList').append('<button class="btn btn_role w3-red" onclick="add_role('+ role.roleId +')">'+ role.roleName + '</button>');
        }
        if (role.groupId == RoleGroup.CITIZEN){
            $('#citizenRolesList').append('<button class="btn btn_role w3-blue" onclick="add_role('+ role.roleId +')">'+ role.roleName + '</button>');
        }
    });

    update_selected_role_list();
    
    show_page('roles');
}

function update_selected_role_list(){
    $('#selectedRolesList').html('');
    for (i=0; i < selected_roles.length; i++){
        var btndel = '<i class="fa fa-close w3-large w3-red w3-left btn_item_delete" onclick="remove_role(' + i + ')"></i>';
        $('#selectedRolesList').append('<div class="list_box_item">' + GAME_ROLES[selected_roles[i]].roleName + btndel + '</div>');
    };
}

function add_role(roleId){
    selected_roles.push(roleId);
    update_selected_role_list();
}

function remove_role(index){
    selected_roles.splice(index, 1);
    update_selected_role_list();
}

function clear_roles_list(){
    $('#selectedRolesList').html('');
    selected_roles = [];
}

// players PAGE
function load_players(){
    update_player_names_list();
    show_page('players');
}

function update_player_names_list(){
    $('#playersList').html('');
    for (i=0; i < playerNames.length; i++){
        var btndel = '<i class="fa fa-close w3-large w3-red w3-left btn_item_delete" onclick="remove_player_name(' + i + ')"></i>';
        $('#playersList').append('<div class="list_box_item">' + playerNames[i] + btndel + '</div>');
    };
}

function add_player(){
    var pname = $('#playerNameInput').val();
    if (pname=="") 
        return;
    playerNames.push(pname);
    update_player_names_list();  
    $('#playerNameInput').val('');
}

function remove_player_name(index){
    playerNames.splice(index, 1);
    update_player_names_list();
}

function clear_players_list(){
    $('#playersList').html('');
    playerNames = [];
}

// pre_assignment PAGE
function load_pre_assignment(){
    if(selected_roles.length != playerNames.length){
        alert('تعداد نقش ها و بازیکنان برابر نیست');
        load_roles();
        return;
    }  

    let player_roles = selected_roles.slice();
    assign_roles(player_roles);

    show_page('pre_assignment');
}

function assign_roles(player_roles){
    players = [];
    for (i=0; i < playerNames.length; i++){
        var rnd = Math.random();
        var ri = Math.floor(rnd * player_roles.length);
        let roleid = player_roles[ri];
        players.push(new Player(i, playerNames[i], roleid));
        player_roles.splice(ri, 1);
    }
}

// role_assign PAGE
function load_role_assign(){
    $("#myRoleTitle").html('');  
    $("#page_title").html('توزیع نقش');

    show_page("role_assign"); 
    $("#distMessage").html('نام خود رو انتخاب کنید');
    
    $("#distPlayersList").html("");
    $("#endDistributionButton").show(); 
    for (i=0; i < players.length; i++){
        if(!isNightActionDone(i)){
            $("#distPlayersList").append('<button class="btn btn_player" onClick="showPlayerRole(' + i + ')">'+ players[i].name + '</button>');  
            $("#endDistributionButton").show(); ///
        }
        else {
            $("#distPlayersList").append('<button disabled class="btn btn_player w3-gray">'+ players[i].name + '</button>');  
        }
    }
}

function showPlayerRole(playerIndex){
    MODAL_CONFIRM('آیا ' + "'" + players[playerIndex].name + "'" +   ' هستی؟', 
        () => {
            show_page('show_role');
            $("#myRoleTitle").html(GAME_ROLES[players[playerIndex].roleId].roleName);
            $("#myRoleImage").html('<img src="img/role' + players[playerIndex].roleId + '.jpg" style="height: 20vh;margin-top: 3vh;" />');
            nightActions.push(new Action(numDayNight, 0, playerIndex, playerIndex));
        }, 
        () => { close_modal() });
}

// Day PAGE
function load_day(){
    if (isGameFinished()){
        localStorage.setItem(LS_MG_ONBOARD, false);
        return;
    }
    else{

        $("#page_title").html('روز ' + DAY_NIGHT_NAME[numDayNight]);
        if (numDayNight == 0) {
            $('#votingButton').html('شروع شب معارفه');
        }
        else {
            $('#votingButton').html('رای گیری');
        } 
        show_page("day");    
        save_game_data();
    }
}

var start_time;
var ten_second_alarm = false;
var remain = 0;
countdown_timer_pause = false;

function restart_countdown_timer(val){
    ten_second_alarm = false;
    start_time = Date.now() + val*1000;
    setTimeout(refrechRemainSeconds, 100);
}

function refrechRemainSeconds(){
    remain = ((start_time-Date.now())/1000);
    if(remain < 0) remain = 0;
    $("#countdown_timer_second").html(remain.toFixed(1));
    if (remain < 10 && !ten_second_alarm){
        ten_second_alarm = true;    
        play(4);
    } 
        
    if (remain <= 0){
        play(5);
    }
    else{
        if(!countdown_timer_pause) 
            setTimeout(refrechRemainSeconds, 100);
    }   
 
}

function pause_countdown_timer(){
    countdown_timer_pause = !countdown_timer_pause;
    if(!countdown_timer_pause){
        restart_countdown_timer(remain);
    }
        
}

// Voting PAGE
function load_voting(){
    if(numDayNight == 0){
        load_sleep()
        return;
    }

    show_page("voting");

    $("#votingPlayerList").html("");
    for (i=0; i < players.length; i++){
        if (players[i].isInGame())
            $("#votingPlayerList").append('<button class="btn btn_player" onClick="votePlayer(' + i + ')">' + players[i].name + '</button>');
        else
            $("#votingPlayerList").append('<button disabled class="btn btn_player">' + players[i].name + '</button>')
    }
     
    $("#votingPlayerList").append('<br/><button class="btn btn_player w3-indigo w3-center" onClick="votePlayer(-1)">'+ 'هیچکس' + '</button>');
}

function votePlayer(playerIndex){
    if (playerIndex == -1){
        MODAL_CONFIRM('هیچ بازیکنی خارج نشود و به شب برویم؟', 
        () => {
            load_sleep();
        });
    }
    else{
        MODAL_CONFIRM('آیا ' + "'" + players[playerIndex].name + "'" + ' در رای گیری خارج شود؟',
        () => {
            if(players[playerIndex].roleId == RoleEnum.Guard &&
                guardVoted < GUARD_VOTED_MAX){
                    guardVoted ++;
                    alert('بازیکن ' + "'" + players[playerIndex].name + "'" + ' نگهبان شهر است و در بازی می ماند!')
            }
            else{
                players[playerIndex].voted();
            }
            
            if (isGameFinished()){
                return;
            }
            else{
                load_sleep();
            }
        });
    }
}

//aux funs
function isGameFinished(){
    if (getMafiaCount() == 0){
        load_end(true);
        return true;
    }
    else if (getMafiaCount() >= getCitizenCount()){
        load_end(false);
        return true;
    }

    return false;
}

function getMafiaCount(){
    var count = 0;
    for (i=0; i < players.length; i++){
        if (players[i].isInGame() && GAME_ROLES[players[i].roleId].isMAFIA())
            count++;
    }

    return count;
}

function getCitizenCount(){
    var count = 0;
    for (i=0; i < players.length; i++){
        if (players[i].isInGame() && GAME_ROLES[players[i].roleId].isCITIZEN())
            count++;
    }

    return count;
}

// Sleep PAGE
function load_sleep(){
    show_page("sleep");
    save_game_data();
    $("#page_title").html('شب ' + DAY_NIGHT_NAME[numDayNight]);
    $("#sleepButton").css("display", "block");
    $("#sleepMessage").html('شب شروع میشه<br/>همه چشم ها بسته');
    play(1);
}

function start_mafia_wakeup_process(){
    $("#sleepButton").css("display", "none");
    $("#sleepMessage").html('فقط مافیا بیدار بشه و تصمیم بگیره');
    //playsound MAFIA DECISION
    play(2);
    setTimeout(mafiaDecisionTimeOut, 10 * unit);
}

function mafiaDecisionTimeOut(){
    //playSound MAFIA SLEEP
    $("#sleepMessage").html('مافیا بخوابه');
    play(3);
    setTimeout(prepareForNight, 3 * unit);
}

function prepareForNight(){
    //sound: PLAYERS ACTIONS
    if(numDayNight == 0){
        $("#nightMessage").html('پایان شب معارفه');
        load_night();
    }
    else {
        $("#sleepMessage").html('بازیکن ها به ترتیب نقش های خود رو انجام بدهند');
        play(4);
        setTimeout(load_night, 2 * unit);
    }
}

// Night
function load_night(){
    show_page("night");
    clearNightActionPage();
    $("#page_title").html('شب ' + DAY_NIGHT_NAME[numDayNight]);
    
    if(numDayNight == 0){
        $("#nightMessage").html('پایان شب معارفه');
    }
    else{
        $("#nightMessage").html('نام خود رو انتخاب کنید');
        for (i=0; i < players.length; i++){
            if (players[i].isInGame()){
                if(!isNightActionDone(i))
                    $("#actionPlayersList").append('<button class="btn btn_player" onClick="load_player_night_action(' + i + ')">'+ players[i].name + '</button>');  
                else 
                    $("#actionPlayersList").append('<button disabled class="btn btn_player">'+ players[i].name + '</button>');  
            }
        }
    }
}

function isNightActionDone(playerIndex){
    var done = false;
    nightActions.forEach(act => {
        if (act.numNight == numDayNight && act.rolePlayerIndex == playerIndex)
            done = true;
    });
    
    return done;
}

function clearNightActionPage(){
    $("#nightActionArea").html("");
    $("#nightActionImage").html("");
    $("#actionPlayersList").html("");
}

// Night Actions
function load_player_night_action(playerIndex){
    MODAL_CONFIRM('آیا ' + "'" + players[playerIndex].name + "'" +   ' هستی؟', 
    () => {
        show_page('night_action');
        switch (players[playerIndex].roleId){
            case RoleEnum.NoRole: no_action(playerIndex); break;
            case RoleEnum.GodFather: mafia_nightShoot(playerIndex); break;
            case RoleEnum.Mafia: 
                if (thisMafiaShouldShoot()) 
                    mafia_nightShoot(playerIndex); 
                else 
                    no_action(playerIndex); 
                break;
            case RoleEnum.Citizen: no_action(playerIndex); break;
            case RoleEnum.Doctor: doctor_save(playerIndex); break;
            case RoleEnum.Inspector: inspector_inquiry(playerIndex); break;
            case RoleEnum.DieHard: 
                if (dieHardInquiriesMade < DIEHARD_INQUERY_MAX)    
                    die_hard_inquery(playerIndex); 
                else
                    no_action(playerIndex);
                break;
            case RoleEnum.Snipper: no_action(playerIndex); break;
            case RoleEnum.Guard: no_action(playerIndex); break;
            default: no_role_error(playerIndex);
        }
    }, 
    () => {
        load_night();
        close_modal();
    });
}

function no_action(playerIndex){
    $('#nightActionMessage').html('شما برای هیج کاری ندارید<br/>فقط یک بازیکن را انتخاب کنید');
    $("#nightActionArea").html("");
    for (i=0; i < players.length; i++){
        if (players[i].isInGame())
            $("#nightActionArea").append('<button class="btn btn_action btn_player" onClick="submitNightAction(0,' + playerIndex + ',' + i + ')">' + players[i].name + '</button>');
    }
}

function thisMafiaShouldShoot(){
    nightActions.forEach(act => {
        if (act.numNight == numDayNight && act.type == 1) //night shoot
            return false;
    });

    for (i=0; i < players.length; i++){
        if (players[i].roleId == RoleEnum.GodFather)
            return false;
    }

    return true;
}

function mafia_nightShoot(mafiaIndex){
    $('#nightActionMessage').html('شلیک شب رو انتخاب کن');
    $("#nightActionArea").html("");
    for (i=0; i < players.length; i++){
        if (players[i].isInGame() && GAME_ROLES[players[i].roleId].isCITIZEN())
            $("#nightActionArea").append('<button class="btn btn_action btn_player" onClick="submitNightAction(1,' + mafiaIndex + ',' + i + ')">' + players[i].name + '</button>');
    }
}

function doctor_save(doctorIndex){
    $('#nightActionMessage').html('یک نفر رو نجات بده');
    $("#nightActionArea").html("");
    for (i=0; i < players.length; i++){
        if (i == doctorIndex && 
            doctorSelfSave >= DOCTOR_SELF_SAVE_MAX)
        {
            continue;
        }

        if (players[i].isInGame())
            $("#nightActionArea").append('<button class="btn btn_action btn_player" onClick="submitNightAction(2,' + doctorIndex + ',' + i + ')">' + players[i].name + '</button>');
    }
}

function inspector_inquiry(inspectorIndex){
    $('#nightActionMessage').html('یک نفر را برای استعلام انتخاب کنید');
    $("#nightActionArea").html("");
    for (i=0; i < players.length; i++){
        if (players[i].isInGame() && i != inspectorIndex)
            $("#nightActionArea").append('<button class="btn btn_action btn_player" onClick="submitNightAction(3,' + inspectorIndex + ',' + i + ')">' + players[i].name + '</button>');
    }
}

function die_hard_inquery(dieHardIndex){
    $('#nightActionMessage').html('آیا استعلام می خواهید؟');
    $("#nightActionArea").html("");
    $("#nightActionArea").append('<button class="btn btn_action btn_player w3-lightblue" onClick="submitNightAction(4,' + dieHardIndex + ',' + dieHardIndex + ')">بلی</button>');
    $("#nightActionArea").append('<button class="btn btn_action btn_player w3-palered" onClick="submitNightAction(0,' + dieHardIndex + ',' + dieHardIndex + ')">خیر</button>');    
}

function submitNightAction(actionType, rolePlayerIndex, targetPlayerIndex){
    nightActions.push(new Action(numDayNight, actionType, rolePlayerIndex, targetPlayerIndex));
    
    if (actionType == ActionType.InspectorInquiry){
        var insp = "منفی";
        if(GAME_ROLES[players[targetPlayerIndex].roleId].isMAFIA()){
            var insp = "مثبت";
        }

        if(GAME_ROLES[players[targetPlayerIndex].roleId].roleId == RoleEnum.GodFather && 
            godFatherNegativeInquiry < GODFATHER_NEGATIVE_INSPECTION_MAX)
        {
            insp = 'منفی';
            godFatherNegativeInquiry++;
        }
        
        $('#nightActionMessage').html('جواب استعلام ' + "'" + players[targetPlayerIndex].name + "'" + '<br/><h2>' + insp + '</h2>');
        if (insp=='مثبت'){
            $('#nightActionImage').html('<img src="img/like.png" style="height: 10vh;margin-top: 4vh;" />');
        }
        else{
            $('#nightActionImage').html('<img src="img/dislike.png" style="height: 10vh;margin-top: 4vh;" />');
        }
    }
    
    if (actionType == ActionType.DoctorSave &&
        rolePlayerIndex == targetPlayerIndex)
    {
        doctorSelfSave++;
    }

    if (actionType == ActionType.DieHardInquiry){
        dieHardInquiriesMade++;
    }
    
    $("#nightActionArea").html('<button class="btn btn_submit" onClick="load_night()">اتمام</button>');    
}

// End of Night Actions


function start_next_day(){
    clearNightActionPage();
    
    if(numDayNight == 0){
        numDayNight++;
        load_day();
    }
    else{
        doNightActions(numDayNight);
        numDayNight++;
        play(1);
        load_report();
    }
}

function doNightActions(numNight){   
    var rep_dieHard_inquiry = false;
    var rep_night_shoot = -1;
    var rep_doctor_save = -1;

    nightActions.forEach(act => {
        if (act.numNight == numNight){
            
            switch (players[act.rolePlayerIndex].roleId){
                case RoleEnum.NoRole: break;
                case RoleEnum.GodFather: rep_night_shoot = act.targetPlayerIndex; break;
                case RoleEnum.Mafia: if (act.type == 1) rep_night_shoot = act.targetPlayerIndex; break;
                case RoleEnum.Citizen: break;
                case RoleEnum.Doctor: rep_doctor_save = act.targetPlayerIndex; break;
                case RoleEnum.Inspector: break;
                case RoleEnum.DieHard: rep_dieHard_inquiry = (act.type == ActionType.DieHardInquiry); break;
                case RoleEnum.Snipper: break;
                case RoleEnum.Guard: break;
                default: break;
            }
        }
    });

    var nightMsg = 'در شبی که گذشت هیچکس کشته نشد';
    if (rep_doctor_save != rep_night_shoot){
        if(players[rep_night_shoot].nightShoot())
            nightMsg = 'کشته شب: ' + players[rep_night_shoot].name;
    }
    $('#reportNightShootMessage').html(nightMsg);    
       
    var report = generateReports(rep_dieHard_inquiry);

    hide_diehard_inquiry_report();
    
    if (DETAIL_REPORT){                
        $('#inquiryReportOverall').html(report[0]);
        $('#inquiryReportDetails').html(report[1]);
    }
    else{
        $('#inquiryReportOverall').html(report[0]);
    }

    if(rep_dieHard_inquiry)
        $('#inquiryReportShowButton').css("display", "block");
}

function hide_diehard_inquiry_report(){
    $('#inquiryReportShowButton').css("display", "none");
+    $('#inquiryReportDiv').css("display", "none");
    $('#inquiryReportDetails').css("display", "none");
}

function load_report(){
    $('#inquiryReportDiv').css("display", "none");
    $('#inquiryReportDetails').css("display", "none");
    show_page('report');
}

function generateReports(rep_dieHard_inquiry){
    var detailrep = '';
    var overallrep = '';
    var rep_mafia_out = 0;
    var rep_citizen_out = 0;
    if (rep_dieHard_inquiry){
        for (i=0; i < players.length; i++){
            if (!players[i].isInGame()){
                GAME_ROLES[players[i].roleId].isMAFIA() ? rep_mafia_out++ : rep_citizen_out++;
                var belowAbove = Math.floor((Math.random() * 10));
                if (belowAbove > 5)
                    detailrep += '<br/>' + GAME_ROLES[players[i].roleId].roleName;
                else
                    detailrep = '<br/>' + GAME_ROLES[players[i].roleId].roleName + detailrep;
            }
        }
        overallrep = 'گزارش بازیکنان بیرون از بازی' + '<br/>' + 'مافیا: ' + rep_mafia_out + '<br/>' + 'شهروند: ' + rep_citizen_out;
    }

    return [overallrep, detailrep];
}

function show_inquery_overall(){
    $('#inquiryReportDiv').toggle();
}

function show_inquiry_details(){
    $('#inquiryReportDetails').toggle();//.css("display", "block");
}

function load_end(citizens_won)
{
    show_page('end');
    if(citizens_won){
        $('#endMessage').html('شهروندها برنده شدند!');
        play('win');
    }
    else{
        $('#endMessage').html('مافیا برنده شد!');
        let descr = '<br/>';
        players.forEach(pl => {
            if (GAME_ROLES[pl.roleId].isMAFIA()){
                descr += '<div>' + pl.name + ' : ' + GAME_ROLES[pl.roleId].roleName + '</div>';
            }

        });
        $('#endText').html(descr);
        play('loss');
    }
    
    localStorage.setItem(LS_MG_ONBOARD, false);
} 

function play() {
    var audio = new Audio('http://psychic3d.free.fr/extra_fichiers/sons/alerte3.wav');
    audio.play();
  }

function play(voiceId) {
    var audio = new Audio('audio\\' + voiceId + '.wav');
    audio.play();
}
const unit = 1000;