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
    constructor(id, name, roleId) {
        this.id = id
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

const RoleName = {
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

function Roles_Factory(){
    let roles = [
        new Role(RoleName.NoRole, RoleTypes['None']), 
        new Role(RoleName.GodFather, RoleTypes['Mafia']), 
        new Role(RoleName.Mafia, RoleTypes['Mafia']), 
        new Role(RoleName.Citizen, RoleTypes['Citizen']), 
        new Role(RoleName.Doctor, RoleTypes['Citizen']), 
        new Role(RoleName.Inspector, RoleTypes['Citizen']), 
        new Role(RoleName.Snipper, RoleTypes['Citizen']), 
        new Role(RoleName.DieHard, RoleTypes['Citizen']), 
        new Role(RoleName.Guard, RoleTypes['Citizen']), 
    ];

    return roles;
}

function Players_Factory(){
    let players = [
        new Player(0, "A", 1), 
        new Player(1, "B", 5), 
        new Player(2, "فرهاد", 3),
        new Player(3, "C", 4) 
    ];

    return players;
}

///
let ROLES = Roles_Factory();
let players = Players_Factory();
let nightActions = [];
var gameStatus = 0;
var numDayNight = 1;
const DETAIL_REPORT = false;
const DOCTOR_SELF_SAVE_MAX = 1
const GODFATHER_NEGATIVE_INSPECTION_MAX = 1

function show_page(page){
    $('divp').hide();

    $("#"+page).show();
}

function load_start(){
    show_page("start");
}

// DAY
function load_day(){
    if (getMafiaCount() == 0){
        load_end(true);
    }
    else if (getMafiaCount() >= getCitizenCount()){
        load_end(false);
    }
    else{
        $("#page_title").html('روز ' + numDayNight);
        show_page("day");    
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

// VOTING
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
            if (getMafiaCount() == 0){
                load_end(true);
            }
            else if (getMafiaCount() >= getCitizenCount()){
                load_end(false);
            }
            else{
                load_sleep();
            }
        }
    }
}

function getMafiaCount(){
    var count = 0;
    for (i=0; i < players.length; i++){
        if (players[i].isInGame() && ROLES[players[i].roleId].typeId == RoleTypes.Mafia)
            count++;
    }

    return count;
}

function getCitizenCount(){
    var count = 0;
    for (i=0; i < players.length; i++){
        if (players[i].isInGame() && ROLES[players[i].roleId].typeId == RoleTypes.Citizen)
            count++;
    }

    return count;
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
            if(!isNightActionDone(i))
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

function isNightActionDone(playerIndex){
    var done = false;
    nightActions.forEach(act => {
        if (act.numNight == numDayNight && act.rolePlayer == playerIndex)
            done = true;
    });
    
    return done;
}

// Night Actions
function showPlayerNightAction(playerIndex){
    if (confirm('آیا ' + "'" + players[playerIndex].name + "'" +   ' هستی؟')) {
        show_page('nightAction');
        switch (players[playerIndex].roleId){
            case RoleName.NoRole: no_action(playerIndex); break;
            case RoleName.GodFather: godFather_nightShoot(playerIndex); break;
            case RoleName.Mafia: no_action(playerIndex); break;
            case RoleName.Citizen: no_action(playerIndex); break;
            case RoleName.Doctor: doctor_save(playerIndex); break;
            case RoleName.Inspector: inspector_inspection(playerIndex); break;
            case RoleName.DieHard: no_action(playerIndex); break;
            case RoleName.Snipper: no_action(playerIndex); break;
            case RoleName.Guard: no_action(playerIndex); break;
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
            $("#nightActionArea").append('<button class="btn btn_action btn_player" onClick="submitNightAction(0,' + playerIndex + ',' + i + ')">' + players[i].name + '</button>');
    }
}

function godFather_nightShoot(godFatherId){
    $('#nightActionMessage').html('شلیک شب رو انتخاب کن');
    $("#nightActionArea").html("");
    for (i=0; i < players.length; i++){
        if (players[i].isInGame() && ROLES[players[i].roleId].isCitizen())
            $("#nightActionArea").append('<button class="btn btn_action btn_player" onClick="submitNightAction(1,' + godFatherId + ',' + i + ')">' + players[i].name + '</button>');
    }
}

function doctor_save(doctorIndex){
    $('#nightActionMessage').html('یک نفر رو نجات بده');
    $("#nightActionArea").html("");
    for (i=0; i < players.length; i++){
        if (i == doctorIndex && !doctorSelfSaveIsAllowed())
            continue;
        if (players[i].isInGame())
            $("#nightActionArea").append('<button class="btn btn_action btn_player" onClick="submitNightAction(2,' + doctorIndex + ',' + i + ')">' + players[i].name + '</button>');
    }
}

var doctorSelfSave = 0;

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
            $("#nightActionArea").append('<button class="btn btn_action btn_player" onClick="submitNightAction(3,' + inspectorIndex + ',' + i + ')">' + players[i].name + '</button>');
    }
}

function submitNightAction(actionType, rolePlayerIndex, playerIndex){
    nightActions.push(new Action(numDayNight, actionType, rolePlayerIndex, playerIndex));
    if (actionType == ActionType.Inspected){
        var inps = "منفی";
        if(ROLES[players[playerIndex].roleId].isMafia())
        var inps = "مثبت";
        if(ROLES[players[playerIndex].roleId].roleName == RoleName.GodFather && !godFatherInspectionResult())
        inps = 'منفی';
        
        $('#nightActionMessage').html('جواب استعلام ' + "'" + players[playerIndex].name + "'" + '<br/><strog>' + inps + '</strong>');
    }
        
    $("#nightActionArea").html('<button class="btn btn_submit" onClick="load_night()">اتمام</button>');    
}

var godFatherNegativeInspection = 0;
function godFatherInspectionResult(){
    if (godFatherNegativeInspection < GODFATHER_NEGATIVE_INSPECTION_MAX)
        return false;
    else
        return true;
}

function start_next_day(){
    doNightActions();
    numDayNight++;
    play(1);
    load_report();
}

function load_report(){
    $('#reportInspectionMessage').css("display", "none");
    show_page('report');
}

function doNightActions(){   
    var rep_dieHard_inspection = false;
    var rep_night_shoot = -1;
    var rep_doctor_save = -1;

    nightActions.forEach(act => {
        if (act.numNight == numDayNight){
            
            switch (players[act.rolePlayer].roleId){
                case RoleName.NoRole: break;
                case RoleName.GodFather: rep_night_shoot = act.player; break;
                case RoleName.Mafia: break;
                case RoleName.Citizen: break;
                case RoleName.Doctor: rep_doctor_save = act.player; break;
                case RoleName.Inspector: break;
                case RoleName.DieHard: rep_dieHard_inspection = (act.player == 1); break;
                case RoleName.Snipper: break;
                case RoleName.Guard: break;
                default: break;
            }
        }
    });

    var nightMsg = 'در شبی که گذشت هیچکس کشته نشد';
    if (rep_doctor_save != rep_night_shoot){
        players[rep_night_shoot].nightShoot();
        nightMsg = 'کشته شب: ' + players[rep_night_shoot].name;
    }
    $('#reportNightShootMessage').html(nightMsg);    
    
    var rep_mafia_out = 0;
    var rep_citizen_out = 0;
    var detailrep = '';
    var repInsp = '';
    $('#reportInspectionMessage').css("display", "none");
    $('#showInspctionButton').css("display", "none");
    if (rep_dieHard_inspection){
        $('#showInspctionButton').css("display", "block");
        for (i=0; i < players.length; i++){
            if (!players[i].isInGame()){
                ROLES[players[i].roleId] == RoleTypes.Mafia ? rep_mafia_out++ : rep_citizen_out++;
                var belowAbove = Math.floor((Math.random() * 10));
                if (belowAbove > 5)
                    detailrep += '<br/>' + players[i].name;
                else
                    detailrep = '<br/>' + players[i].name + detailrep;
            }
        }
        repInsp = 'گزارش بازیکنان بیرون از بازی' + '<br/>' + 'مافیا: ' + rep_mafia_out + '<br/>' + 'شهروند: ' + rep_citizen_out;
    }

    
    if (DETAIL_REPORT){                
        $('#reportInspectionMessage').html(repInsp + detailrep);
    }

    $('#reportInspectionMessage').html(repInsp);
}

function showreportinspection(){
    $('#reportInspectionMessage').css("display", "block");
}

function load_end(citizenWin)
{
    show_page('end');
    if(citizenWin){
        $('#endMessage').html('شهروندها برنده شدند!');
    }
    else{
        $('#endMessage').html('مافیا برنده شد!');
    }
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