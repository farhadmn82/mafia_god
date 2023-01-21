
//Initialization 
const RoleTypes = {
	None: 0,
	Mafia: 1,
	Citizen: 2,
}

const ActionType = {
    NoAct : 0,
    NightShoot : 1,
    DoctorSave : 2,
    Inspected : 3,
    RequestReport : 4,
    SnipperShoot : 5,
}

class Role{
    constructor(roleName, typeId){
        this.roleName = roleName;
        this.typeId = typeId;
    }
    
    isCitizen(){
        return (this.typeId == 2);
    }

    isMafia(){
        return (this.typeId == 1);
    }
    
}

class Player {
    constructor(name, roleId) {
      this.name = name;
      this.roleId = roleId;
      this.status = 0; // 0: In Game, 1: Voted, 2: NightShoot, 3: KickedOut 
    }
    
    isInGame(){
        return this.status == 0;
    }

    voted() {
      this.status = 1;
    }
  
    nightShoot() {
      this.status = 2;
    }
  
    kickOut() {
      this.status = 3;
    }
  
    setRole(roleId){
      this.roleId = roleId;
    }
  }


class Action{
    constructor(numNight, type, rolePlayer, player){
        this.numNight = numNight;
        this.type = type;
        this.rolePlayer = rolePlayer;
        this.player = player;
    }
}

function Roles_Factory(){
    let roles = [
        new Role("No Role", RoleTypes['None']), 
        new Role("GodFather", RoleTypes['Mafia']), 
        new Role("Mafia", RoleTypes['Mafia']), 
        new Role("Citizen", RoleTypes['Citizen']), 
        new Role("Doctor", RoleTypes['Citizen']), 
        new Role("Inspector", RoleTypes['Citizen']), 
        new Role("Snipper", RoleTypes['Citizen']), 
        new Role("DieHard", RoleTypes['Citizen']), 
        new Role("Security", RoleTypes['Citizen']), 
    ];

    return roles;
}

function Players_Factory(){
    let players = [
        new Player("A", 1), 
        new Player("B", 5), 
        new Player("فرهاد", 3),
        new Player("C", 4) 
    ];

    return players;
}



///
let ROLES = Roles_Factory();
let players = Players_Factory();
let nightActions = [];
var STATUS = ['start', 'day', 'night', '']
var gameStatus = 0;
var numDayNight = 1;


function show_page(page){
    $('divp').hide();

    $("#"+page).show();
    
}

function load_voting(){
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
        if (confirm('هیچ بازیکنی خارج نشود و به شب برویم؟')) {
            load_sleep();
        }    
    }
    else{
        if (confirm('آیا ' + "'" + players[playerIndex].name + "'" + ' در رای گیری خارج شود؟')) {
            players[playerIndex].voted();
            load_sleep();
        }
    }
        
}

function load_start(){
    show_page("start");
}

function load_day(){
    $("#page_title").html('روز ' + numDayNight);
    show_page("day");
}

function speak_countdown_time(){

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

// Sleep
function load_sleep(){
    show_page("sleep");
    $("#page_title").html('شب ' + numDayNight);
    $("#sleepButton").css("display", "block");
    $("#sleepMessage").html('شب شروع میشه<br/>همه چشم ها بسته');
    play(1);
}

function load_mafiaWakeUp(){
    //show_page("mafiaWakeUp");
    $("#sleepButton").css("display", "none");
    $("#sleepMessage").html('فقط مافیا بیدار بشه و تصمیم بگیره');
    //playsound MAFIA DECISION
    play(2);
    setTimeout(mafiaDecisionTimeOut, 3 * unit);
}

function mafiaDecisionTimeOut(){
    //playSound MAFIA SLEEP
    $("#sleepMessage").html('مافیا بخوابه');
    play(3);
    setTimeout(prepareForNight, 2 * unit);
}

function prepareForNight(){
    //sound: PLAYERS ACTIONS
    $("#sleepMessage").html('بازیکن ها به ترتیب نقش های خود رو انجام بدن');
    play(4);
    setTimeout(load_night, 1 * unit);
}

// Night
function load_night(){
    show_page("night");
    $("#nightActionArea").html("");   
    $("#page_title").html('شب ' + numDayNight);
    $("#nightMessage").html('نام خود رو انتخاب کنید');
    
    $("#actionPlayersList").html("");
    for (i=0; i < players.length; i++){
        if (players[i].isInGame()){
            if(!isNightActionDone(players[i]))
                $("#actionPlayersList").append('<button class="btn btn_player" onClick="showPlayerNightAction(' + i + ')">'+ players[i].name + '</button>');  
            else 
                $("#actionPlayersList").append('<button disabled class="btn btn_player">'+ players[i].name + '</button>');  
        }
    }
}

function clearNightActionPage(){
    $('#nightActionMessage').html('');
    $("#nightActionArea").html("");
}

function isNightActionDone(player){
    var done = false;
    nightActions.forEach(act => {
        if (act.numNight == numDayNight && player.name == act.rolePlayer.name)
            done = true;
    });
    
    return done;
}


// Night Actions
function showPlayerNightAction(playerIndex){
    if (confirm('آیا ' + "'" + players[playerIndex].name + "'" +   ' هستی؟')) {
        show_page('nightAction');
        switch (players[playerIndex].roleId){
            case 0: no_action(playerIndex); break;
            case 1: godFather_nightShoot(playerIndex); break;
            case 2: no_action(playerIndex); break;
            case 3: no_action(playerIndex); break;
            case 4: doctor_save(playerIndex); break;
            case 5: inspector_inspection(playerIndex); break;
            default: no_role_error(playerIndex);
        }
    }  
    else{
        load_night();
    }
}

function no_action(playerIndex){
    $('#nightActionMessage').html('شما برای هیج کاری ندارید<br/>فقط یک بازیکن را انتخاب کنید');
    $("#nightActionArea").html("");
    for (i=0; i < players.length; i++){
        if (players[i].isInGame())
            $("#nightActionArea").append('<button class="btn btn_player" onClick="submitNightAction(0,' + playerIndex + ',' + i + ')">' + players[i].name + '</button>');
    }
}

function godFather_nightShoot(godFatherId){
    $('#nightActionMessage').html('شلیک شب رو انتخاب کن');
    $("#nightActionArea").html("");
    for (i=0; i < players.length; i++){
        if (players[i].isInGame() && ROLES[players[i].roleId].isCitizen())
            $("#nightActionArea").append('<button class="btn btn_player" onClick="submitNightAction(1,' + godFatherId + ',' + i + ')">' + players[i].name + '</button>');
    }
}

function doctor_save(doctorIndex){
    $('#nightActionMessage').html('یک نفر رو نجات بده');
    $("#nightActionArea").html("");
    for (i=0; i < players.length; i++){
        if (i == doctorIndex && !doctorSelfSaveIsAllowed())
            continue;
        if (players[i].isInGame())
            $("#nightActionArea").append('<button class="btn btn_player" onClick="submitNightAction(2,' + doctorIndex + ',' + i + ')">' + players[i].name + '</button>');
    }
}

var doctorSelfSave = 0;
const DOCTOR_SELF_SAVE_MAX = 1
function doctorSelfSaveIsAllowed(){
    if (doctorSelfSave < DOCTOR_SELF_SAVE_MAX)
        return true;
    else
        return false;
}

function inspector_inspection(inspectorIndex){
    $('#nightActionMessage').html('یک نفر را برای استعلام انتخاب کنید');
    $("#nightActionArea").html("");
    for (i=0; i < players.length; i++){
        if (players[i].isInGame())
            $("#nightActionArea").append('<button class="btn btn_player" onClick="submitNightAction(3,' + inspectorIndex + ',' + i + ')">' + players[i].name + '</button>');
    }
}


function submitNightAction(actionType, rolePlayerIndex, playerIndex){
    nightActions.push(new Action(numDayNight, actionType, players[rolePlayerIndex], players[playerIndex]));
    if (actionType == ActionType.Inspected){
        var inps = "منفی";
        if(ROLES[players[playerIndex].roleId].isMafia())
        var inps = "مثبت";
        if(ROLES[players[playerIndex].roleId].roleName == 'GodFather' && !godFatherInspectionResult())
        inps = 'منفی';
        
        $('#nightActionMessage').html('جواب استعلام ' + "'" + players[playerIndex].name + "'" + '<br/><strog>' + inps + '</strong>');
    }
        
    $("#nightActionArea").html('<button class="btn btn_submit" onClick="load_night()">اتمام</button>');    
}



var godFatherNegativeInspection = 0;
const GODFATHER_NEGATIVE_INSPECTION_MAX = 1
function godFatherInspectionResult(){
    if (godFatherNegativeInspection < GODFATHER_NEGATIVE_INSPECTION_MAX)
        return false;
    else
        return true;
}


function start_next_day(){
    numDayNight++;
    //voice
    //create report
    //show report
    //do changes
    load_day();
}

function getPlayer(name){
    var pl = undefined;
    players.forEach(player => {
        if (player.name == name)
            pl = player;
    });

    return pl;
}


function changeGameStatus(status){
    switch (status){
        case 'start': load_start(); break;
        case 'voting': load_voting(); break;
        case 'day': load_day(); break;
        case 'night': break;
        case 'sleep': load_sllep(); break;
        case 'mafiaWakeUp': break;
        case 'nightReport': break;
        
    }
}

function play() {
    var audio = new Audio('http://psychic3d.free.fr/extra_fichiers/sons/alerte3.wav');
    audio.play();
  }

function play(voiceId) {
    var audio = new Audio('audio\\' + voiceId + '.wav');
    //audio.play();
}
const unit = 100;