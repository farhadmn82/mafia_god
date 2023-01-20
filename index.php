<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="css/w3.css">
    <link rel="stylesheet" href="css/main.css" />
    <script type="module" src="js/Player.js"></script>
    <script src="js/game.js"></script>
    <script src="js/jquery-2.0.3.min.js"></script>
    
</head>
<body>
    <div id='msg'></div>
    <div id='nav_bar' class='navbar'style="height:6vh">
        <button class="w3-button w3-circle w3-indigo w3-margin-left w3-margin-top"><</button>
    </div>
    <div id='page_header' class='w3-center page_header w3-center'>
        <div id='page_title' class='w3-center page_title w3-center'>MAFIA</div>
    
    </div>

    <div class="w3-container" style="height:80vh">

    <div class='page_content' style="height:100%">
        <divp id="start"><?php include 'pages/start.html'; ?></divp>
        <divp id="voting"><?php include 'pages/voting.html'; ?></divp>
        <divp id="day"><?php include 'pages/day.html'; ?></divp>
        <divp id="night"><?php include 'pages/night.html'; ?></divp>
        <divp id="sleep"><?php include 'pages/sleep.html'; ?></divp>
        <divp id="nightAction"><?php include 'pages/nightAction.html'; ?></divp>
    </div>
    </div>





<script>
    load_start();
</script>


</body>
</html>