<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="css/w3.css">
    <link rel="stylesheet" href="css/main.css" />
    <script src="js/game.js"></script>
    <script src="js/jquery-2.0.3.min.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
</head>
<body>
    <div id='nav_bar' class='navbar'>
        <i class="btn_back fa fa-arrow-left w3-large"></i>
    </div>
    <div id='page_header' class='w3-container page_header'>
        <div id='page_title' class='w3-center page_title w3-center'>
            مافیا
        </div>
    
    </div>

    <div class="w3-container content">
        <div class='page_content'>
            
            <divp id="start" class="frame frame_day">
                <button id='btn_start_game' class='btn btn_start center' onclick='load_day()'>شروع بازی</button>
            </divp>

            <divp id="voting" class="frame frame_day">
                <div class="page_text">کدام بازیکن در رای گیری خارج می شود؟</div>
                <div id="votingPlayerList" class="w3-center"></div>
            </divp>
            
            <divp id="day" class="frame frame_day">
                <div id="reportMessage" class="page_text"></div>
                <div id="day_timer_div" class="day_timer_div">
                    <div class="w3-center">
                        <div class="w3-bar">
                        <button class="w3-button w3-margin btn btn_sec" onclick="restart_countdown_timer(30)">30s</button>
                        <button class="w3-button w3-margin btn btn_sec" onclick="restart_countdown_timer(45)">45s</button>
                        <button class="w3-button w3-margin btn btn_sec" onclick="restart_countdown_timer(60)">60s</button>
                        <button class="w3-button w3-margin btn btn_sec" onclick="restart_countdown_timer(90)">90s</button>
                        <button class="w3-button w3-margin btn btn_sec" onclick="restart_countdown_timer(120)">120s</button>
                        </div>
                        
                        <div id="countdown_timer_second" class="countdown_timer_second w3-center">0.0</div>
                        <button id="pause" class="btn btn_pause center" onclick="pause_countdown_timer()">||</button>
                    </div>
                </div>
                <div class="">
                    <button class='w3-align-right btn btn_goto_voting' onclick="load_voting()">رای گیری</button> 
                </div>
            </divp>
            
            <divp id="night" class="frame frame_night">
                <div id="nightMessage" class="page_text"></div>
                <div id="actionPlayersList" class="w3-center"></div>
                <button class="btn btn_end_night center" onclick="start_next_day()">پایان شب</button>
            </divp>
            
            <divp id="sleep" class="frame frame_night">
                <div id="sleepMessage" class="page_text"></div>
                <button id="sleepButton" class="btn center btn_sleep" onClick="load_mafiaWakeUp()">خواب</button>        
            </divp>
            
            <divp id="nightAction" class="frame frame_night">
                <div id="nightActionMessage" class="page_text"></div>
                <div id="nightActionArea" class="w3-center"></div>        
            </divp>
            
            <divp id="report" class="frame frame_night">
            <div id="reportNightShootMessage" class="page_text"></div>
                <button id="showInspctionButton" class="btn center btn_submit w3-amber" onclick="showreportinspection()">مشاهده استعلام جان سخت</button>
                <div id="reportInspectionMessage" class="page_text"></div>
                <button id="reportButton" class="btn center btn_submit" onClick="load_day()">ادامه</button>
            </divp>

            <divp id="end" class="frame frame_day">
                <div id="endMessage" class="page_text"></div>
                <button id="endButton" class="btn center btn_submit" onClick="load_start()">پایان بازی</button>
            </divp>
        </div>
    </div>


    <div class="w3-container footer">

    </div>


<script>
    load_start();
</script>


</body>
</html>