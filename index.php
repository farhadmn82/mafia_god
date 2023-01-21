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
            <divp id="start" class="frame frame_day"><?php include 'pages/start.html'; ?></divp>
            <divp id="voting" class="frame frame_day"><?php include 'pages/voting.html'; ?></divp>
            <divp id="day" class="frame frame_day"><?php include 'pages/day.html'; ?></divp>
            <divp id="night" class="frame frame_night"><?php include 'pages/night.html'; ?></divp>
            <divp id="sleep" class="frame frame_night"><?php include 'pages/sleep.html'; ?></divp>
            <divp id="nightAction" class="frame frame_night"><?php include 'pages/nightAction.html'; ?></divp>
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