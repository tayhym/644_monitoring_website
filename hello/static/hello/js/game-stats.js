
var unitNameHash = new Object();
unitNameHash["nba"] = "Quarter";
unitNameHash["nhl"] = "Period";
unitNameHash["mlb"] = "N/A";

var mlbPlayerURL = "/gameTime/get-mlbplayer/"

var unitName = unitNameHash[league].toLowerCase();

var awayTeamName = $("#away-name").text();
var homeTeamName = $("#home-name").text();

var statAttrHash = new Object();
statAttrHash["nba"] = ["Field Goals", "Free Throws", "3-pointers",
					   "Off. Rebounds", "Def. Rebounds", "Total Rebounds",
					   "Assists", "Blocks", "Fouls", "Steals", "Turnovers"];

// statAttrHash["mlb"] = ["ds"];

statAttrs = statAttrHash[league];

setTimeout(ajaxBoxScore, 0); 	// set an interval between two calls 
								// to go with the api throttle limit
setTimeout(ajaxGameStats, 2000);

function ajaxBoxScore() {
	$.ajax({
		type: "GET",
		dataType: "xml",
		url:"/gameTime/get-boxscore/" + league + "/" + gameID,
		xhrFields: {withCredentials: true},
		success: function(xml){
			$(document).ready(function() {
				if (league === "nba" || league === "nhl") { 
					parseNHLAndNBABoxScore(xml); 
				}
				if (league === "mlb") {
					parseMLBBoxScore(xml);
				}
			});
		}
	});
}

function ajaxGameStats() {
	$.ajax({
		type:"GET",
		dataType: "xml",
		url:"/gameTime/get-stats/" + league + "/" + gameID,
		xhrFields: {withCredentials: true},
		success: function(xml){
			$(document).ready(function() {
				if (league === "nba") { 
					parseNBAGameStats(xml); 
				}
				if (league === "nhl") {
					parseNHLGameStats(xml);
				}
				if (league === "mlb") {
					parseMLBGameStats(xml);
				}
			});
		}
	});
}

function parseMLBBoxScore(xml) {
	var $boxscore = $(xml).find("boxscore");
	var gameStatus = $boxscore.attr("status");
	var finalInning = "";
	var finalHalf = "";

	if (gameStatus === "scheduled") {
		$("#game-status").text("Scheduled");
	}

	if (gameStatus === "closed" || gameStatus === "complete") {
		finalInning = $boxscore.find("final").attr("inning");
		finalHalf = $boxscore.find("final").attr("inning_half");
		$("#game-status").text("Final");
	} 
	if (gameStatus === "inprogress") {
		$clock = $boxscore.find("outcome");

		finalInning = $clock.attr("current_inning");
		finalHalf = $clock.attr("current_inning_half");

		var inning = $clock.attr("current_inning");
		var halfType = $clock.attr("current_inning_half");

		if (halfType === "T") {halfType = "Top";}
		if (halfType === "B") {halfType = "Bottom";}

		if (inning === "1") {$("#game-status").text(halfType + " 1st");}
		if (inning === "2") {$("#game-status").text(halfType + " 2nd");}
		if (inning === "3") {$("#game-status").text(halfType + " 3rd");}
		if (parseInt(inning) > 3) {$("#game-status").text(halfType + " " + inning + "th");}
	}

	$visitor = $boxscore.find("visitor");
	$home = $boxscore.find("home");

	var visitorRuns = $visitor.attr("runs");
	var homeRuns = $home.attr("runs");

	$("#away-score").text(visitorRuns);
	$("#home-score").text(homeRuns);

	var visitorEvents = $visitor.find("runs").find("event");
	var homeEvents = $home.find("runs").find("event");

	var visitorScores = new Object();
	var homeScores = new Object();

	visitorEvents.each(function(){
		var inningNo = $(this).attr("inning");
		var runs = $(this).find("run").size();
		visitorScores[inningNo] = runs;
	});
	homeEvents.each(function(){
		var inningNo = $(this).attr("inning");
		var runs = $(this).find("run").size();
		homeScores[inningNo] = runs;
	});

	$scoreHeadRow = $("#score-head-row");
	$scoreHeadRow.append("<th style=\"width:25%\">Boxscore</th>");
	for (var i = 1; i <= parseInt(finalInning); i++) {
		var th = "<th>" + i + "</th>";
		$scoreHeadRow.append(th);
	}
	$scoreHeadRow.append("<th>R</th>");
	$scoreHeadRow.append("<th>H</th>");
	$scoreHeadRow.append("<th>E</th>");
	// scores for visitor team
	$awayScoreRow = $("#away-score-row");
	$awayScoreRow.append("<th>" + awayTeamName + "</th>");
	for (var i = 1; i <= parseInt(finalInning); i++) {
		var inningKey = i.toString();
		th = "";
		if (inningKey in visitorScores) {
			th = "<th>" + visitorScores[inningKey] + "</th>";
		} else {
			th = "<th>0</th>";
		}
		$awayScoreRow.append(th);
	}
	$awayScoreRow.append("<th>" + $visitor.attr("runs") + "</th>");
	$awayScoreRow.append("<th>" + $visitor.attr("hits") + "</th>");
	$awayScoreRow.append("<th>" + $visitor.attr("errors") + "</th>");
	// scores for home team
	$homeScoreRow = $("#home-score-row");
	$homeScoreRow.append("<th>" + homeTeamName + "</th>");
	for (var i = 1; i <= parseInt(finalInning); i++) {
		var inningKey = i.toString();
		th = "";
		if (inningKey in homeScores) {
			th = "<th>" + homeScores[inningKey] + "</th>";
		} else {
			th = "<th>0</th>";
		}
		$homeScoreRow.append(th);
	}
	$homeScoreRow.append("<th>" + $home.attr("runs") + "</th>");
	$homeScoreRow.append("<th>" + $home.attr("hits") + "</th>");
	$homeScoreRow.append("<th>" + $home.attr("errors") + "</th>");	
}

function parseNHLAndNBABoxScore(xml) {
	var $game = $(xml).find("game");
	var gameStatus = $game.attr("status");

	if (gameStatus === "scheduled") {
		$("#game-status").text("Scheduled");
	}

	if (gameStatus === "closed" || gameStatus === "complete") {
		$("#game-status").text("Final");
	} 

	if (gameStatus === "inprogress") {
		var clock = $game.attr("clock");
		
		if (league === "nba") {
			var quarter = $game.attr("quarter");
			if (quarter === "1") {$("#game-status").text("1st Quarter " + clock);}
			if (quarter === "2") {$("#game-status").text("2nd Quarter " + clock);}
			if (quarter === "3") {$("#game-status").text("3rd Quarter " + clock);}
			if (quarter === "4") {$("#game-status").text("4th Quarter " + clock);}
			if (parseInt(quarter) > 4) {$("#game-status").text("OT" + (parseInt(quarter) - 4) + " " + clock);}
		}
		if (league === "nhl") {
			var period = $game.attr("period");
			if (period === "1") {$("#game-status").text("1st Period " + clock);}
			if (period === "2") {$("#game-status").text("2nd Period " + clock);}
			if (period === "3") {$("#game-status").text("3rd Period " + clock);}
			if (parseInt(period) > 3) {$("#game-status").text("OT" + (parseInt(period) - 3) + " " + clock);}
		}
	}

	$scoreHeadRow = $("#score-head-row");
	$scoreHeadRow.append("<th style=\"width:30%\">" + "Scores by " + unitNameHash[league] + "</th>");
	var unitNumbers = parseInt($game.attr(unitName));
	if (league === "nba") {
		for (var i = 1; i <= unitNumbers; i++) {
			if (i <= 4) {$scoreHeadRow.append("<th>" + i + "</th>");}
			if (i > 4) {$scoreHeadRow.append("<th>" + "OT" + (i-4) + "</th>");}
				
		}
	}
	if (league === 'nhl') {
		for (var i = 1; i <= unitNumbers; i++) {
			if (i <= 3) {$scoreHeadRow.append("<th>" + i + "</th>");}
			if (i > 3) {$scoreHeadRow.append("<th>" + "OT" + (i-3) + "</th>");}
		}
	}

	$game.find("team").each(function() {
		if ($(this).attr("name") === awayTeamName) {
			$("#away-score").text($(this).attr("points"));
			$awayScoreRow = $("#away-score-row");
			$awayScoreRow.append("<th>" + awayTeamName + "</th>");
			$scoring = $(this).find("scoring");
			$scoring.children().each(function(i, val) {
				var th = "<th>" + $(this).attr("points") + "</th>";
				$awayScoreRow.append(th);
			});

		}
		if ($(this).attr("name") === homeTeamName) {
			
			$("#home-score").text($(this).attr("points"));
			$homeScoreRow = $("#home-score-row")
			$homeScoreRow.append("<th>" + homeTeamName + "</th>");
			$scoring = $(this).find("scoring");
			$scoring.children().each(function(i, val) {
				var th = "<th>" + $(this).attr("points") + "</th>";
				$homeScoreRow.append(th);
			});
		}
	});	
}

function parseMLBGameStats(xml) {
	var $game = $(xml).find("statistics");
	if ($game.attr("status") === "scheduled" || $game.attr("status") === "created") {
		return;
	}
	var teamStats = new Object();
	teamStats["visitor"] = new Object();
	teamStats["home"] = new Object();

	teamStats["visitor"]["hitting"] = new Object();
	teamStats["home"]["hitting"] = new Object();

	teamStats["visitor"]["pitching"] = new Object();
	teamStats["home"]["pitching"] = new Object();

	teamStats["visitor"]["fielding"] = new Object();
	teamStats["home"]["fielding"] = new Object();

	var $visitor = $game.find("visitor");
	var $visitorHitting = $visitor.find("hitting");
	var $visitorPitching = $visitor.find("pitching");
	var $visitorFielding = $visitor.find("fielding");

	var $home = $game.find("home");
	var $homeHitting = $home.find("hitting");
	var $homePitching = $home.find("pitching");
	var $homeFielding = $home.find("fielding");

	getMLBTeamStats($visitorHitting, teamStats["visitor"]["hitting"]);
	getMLBTeamStats($homeHitting, teamStats["home"]["hitting"]);

	getMLBTeamStats($visitorPitching, teamStats["visitor"]["pitching"]);
	getMLBTeamStats($homePitching, teamStats["home"]["pitching"]);

	getMLBTeamStats($visitorFielding, teamStats["visitor"]["fielding"]);
	getMLBTeamStats($homeFielding, teamStats["home"]["fielding"]);

	// hitting team stats
	var hittingTeamStatTbody = $("#hitting-stat-tbody");
	for (attrib in teamStats["visitor"]["hitting"]) {
		var tr = "<tr><th>" + attrib.toUpperCase() + "</th><th>" + 
				 teamStats["visitor"]["hitting"][attrib] + "</th><th>" + 
				 teamStats["home"]["hitting"][attrib] + "</th></th>";
		hittingTeamStatTbody.append(tr);
	}
	// pitching team stats
	var pitchingTeamStatTbody = $("#pitching-stat-tbody");
	for (attrib in teamStats["visitor"]["pitching"]) {
		var tr = "<tr><th>" + attrib.toUpperCase() + "</th><th>" + 
				 teamStats["visitor"]["pitching"][attrib] + "</th><th>" + 
				 teamStats["home"]["pitching"][attrib] + "</th></th>";
		pitchingTeamStatTbody.append(tr);
	}
	// fielding team stats
	var fieldingTeamStatTbody = $("#fielding-stat-tbody");
	for (attrib in teamStats["visitor"]["fielding"]) {
		var tr = "<tr><th>" + attrib.toUpperCase() + "</th><th>" + 
				 teamStats["visitor"]["fielding"][attrib] + "</th><th>" + 
				 teamStats["home"]["fielding"][attrib] + "</th></th>";
		fieldingTeamStatTbody.append(tr);
	}

	var playerStats = new Object();
	playerStats["visitor"] = new Object();
	playerStats["home"] = new Object();

	playerStats["visitor"]["hitting"] = new Array();
	playerStats["home"]["hitting"] = new Array();

	playerStats["visitor"]["pitching"] = new Array();
	playerStats["home"]["pitching"] = new Array();

	playerStats["visitor"]["fielding"] = new Array();
	playerStats["home"]["fielding"] = new Array();

	// parsing the player stats
	getMLBPlayerStats($visitorHitting, playerStats["visitor"]["hitting"]);
	getMLBPlayerStats($homeHitting, playerStats["home"]["hitting"]);

	getMLBPlayerStats($visitorPitching, playerStats["visitor"]["pitching"]);
	getMLBPlayerStats($homePitching, playerStats["home"]["pitching"]);

	getMLBPlayerStats($visitorFielding, playerStats["visitor"]["fielding"]);
	getMLBPlayerStats($homeFielding, playerStats["home"]["fielding"]);

	// hitting player stats
	$visitorPlayerHittingThead = $("#hitting-away-player-thead");
	$visitorPlayerHittingTbody = $("#hitting-away-player-tbody");
	playerStats["visitor"]["hitting"].sort(function(a,b){return Number(b["avg"])- Number(a["avg"])});
	populateMLBPlayerStats(playerStats["visitor"]["hitting"], $visitorPlayerHittingThead, $visitorPlayerHittingTbody);

	$homePlayerHittingThead = $("#hitting-home-player-thead");
	$homePlayerHittingTbody = $("#hitting-home-player-tbody");
	playerStats["home"]["hitting"].sort(function(a,b){return Number(b["avg"])- Number(a["avg"])});
	populateMLBPlayerStats(playerStats["home"]["hitting"], $homePlayerHittingThead, $homePlayerHittingTbody);

	// pitching player stats
	$visitorPlayerPitchingThead = $("#pitching-away-player-thead");
	$visitorPlayerPitchingTbody = $("#pitching-away-player-tbody");
	populateMLBPlayerStats(playerStats["visitor"]["pitching"], $visitorPlayerPitchingThead, $visitorPlayerPitchingTbody);

	$homePlayerPitchingThead = $("#pitching-home-player-thead");
	$homePlayerPitchingTbody = $("#pitching-home-player-tbody");
	populateMLBPlayerStats(playerStats["home"]["pitching"], $homePlayerPitchingThead, $homePlayerPitchingTbody);

	// fielding player stats
	$visitorPlayerFieldingThead = $("#fielding-away-player-thead");
	$visitorPlayerFieldingTbody = $("#fielding-away-player-tbody");
	populateMLBPlayerStats(playerStats["visitor"]["fielding"], $visitorPlayerFieldingThead, $visitorPlayerFieldingTbody);

	$homePlayerFieldingThead = $("#fielding-home-player-thead");
	$homePlayerFieldingTbody = $("#fielding-home-player-tbody");
	populateMLBPlayerStats(playerStats["home"]["fielding"], $homePlayerFieldingThead, $homePlayerFieldingTbody);
}

function getMLBTeamStats($team, target) {
	teamStats = $team.find("team")[0];
	$.each(teamStats.attributes, function(i,attrib) {
		target[attrib.name] = attrib.value;
	});
}

function getMLBPlayerStats($team, target) {
	$team.find("players").find("player").each(function(){
		var player = new Object();
		$.each(this.attributes, function(i, attrib) {
			player[attrib.name] = attrib.value;
		});
		target.push(player);
	});

}

function getNHLTeamStats($team, target) {
	teamStats = $team.find("statistics")[0];
	$.each(teamStats.attributes, function(i, attrib) {
		target[attrib.name] = attrib.value;
	});
}

function getNHLPlayerStats($team, target) {
	$team.find("players").find("player").each(function(){
		var player = new Object();
		player["name"] = $(this).attr("full_name") + ", " + $(this).attr("position");
		var stats = $(this).find("statistics")[0];
		$.each(stats.attributes, function(i, attrib){
			player[attrib.name] = attrib.value;
		});
		target.push(player);
	});
}

function parseNHLGameStats(xml) {
	var $game = $(xml).find("game");
	if ($game.attr("status") === "scheduled" || $game.attr("status") === "created") {
		return;
	}
	var teamStats = new Object();
	teamStats["away"] = new Object();
	teamStats["home"] = new Object();

	var playerStats = new Object();
	playerStats["away"] = new Array();
	playerStats["home"] = new Array();

	var teamFlag = "";
	$game.find("team").each(function() {
		if ($(this).attr("name") === awayTeamName) {
			teamFlag = "away";
		}
		if ($(this).attr("name") === homeTeamName) {
			teamFlag = "home";
		}

		getNHLTeamStats($(this), teamStats[teamFlag]);
		getNHLPlayerStats($(this), playerStats[teamFlag]);
	});
	var $teamStatTBody = $("#stat-tbody");
	// team stats
	for (var attrib in teamStats["away"]) {
		var tr = "<tr><th>" + toTitleCase(attrib.replace(/_/g," ")) + 
		         "</th><th>" + teamStats["away"][attrib] + "</th><th>" + 
		         teamStats["home"][attrib] + "</th></tr>";
		$teamStatTBody.append(tr);
	}
	// player stats for away team
	var awayPlayers = playerStats["away"];
	awayPlayers.sort(function(a,b){return b["goals"]- a["goals"]});
	$awayPlayerThead = $("#away-player-thead");
	$awayPlayerTbody = $("#away-player-tbody");
	populateNHLPlayerStats(awayPlayers, $awayPlayerThead, $awayPlayerTbody);
	// player stats for home team
	var homePlayers = playerStats["home"];
	homePlayers.sort(function(a,b){return b["goals"]- a["goals"]});
	$homePlayerThead = $("#home-player-thead");
	$homePlayerTbody = $("#home-player-tbody");
	populateNHLPlayerStats(homePlayers, $homePlayerThead, $homePlayerTbody);

}

function parseNBAGameStats(xml) {
	var $game = $(xml).find("game");
	if ($game.attr("status") === "scheduled" || $game.attr("status") === "created") {
		return;
	}
	var teamStats = new Object();
	teamStats["away"] = new Object();
	teamStats["home"] = new Object();

	var playerStats = new Object();
	playerStats["away"] = new Array();
	playerStats["home"] = new Array();

	var teamFlag = "";

	$game.find("team").each(function() {
		if ($(this).attr("name") === awayTeamName) {
			teamFlag = "away";
		}
		if ($(this).attr("name") === homeTeamName) {
			teamFlag = "home";
		}
		$stats = $(this).find("statistics");
		populateNBATeamStats($stats, teamStats[teamFlag]);
		$players = $(this).find("players").find("player");

		$players.each(function() {
			var player = new Object();
			player["fullName"] = $(this).attr("full_name");
			player["Position"] = $(this).attr("primary_position");
			$playerStats = $(this).find("statistics");
			player["Points"] = $playerStats.attr("points");
			populateNBATeamStats($playerStats, player);
			playerStats[teamFlag].push(player);
		});
		
	});
	var $teamStatTBody = $("#stat-tbody");
	// team stats
	for (var i = 0; i < statAttrs.length; i++) {
		var tr = "<tr><th>" + statAttrs[i] + "</th><th>" + 
				 teamStats["away"][statAttrs[i]] + "</th><th>" + 
				 teamStats["home"][statAttrs[i]] + "</th></tr>";
		$teamStatTBody.append(tr);
	}
	// player stats for away team
	var awayPlayers = playerStats["away"];
	awayPlayers.sort(function(a,b){return b["Points"]- a["Points"]});
	$awayPlayerThead = $("#away-player-thead");
	$awayPlayerTbody = $("#away-player-tbody");
	populateNBAPlayerStats(awayPlayers, $awayPlayerThead, $awayPlayerTbody);
	// player stats for home team
	var homePlayers = playerStats["home"];
	homePlayers.sort(function(a,b){return b["Points"]- a["Points"]});
	$homePlayerThead = $("#home-player-thead");
	$homePlayerTbody = $("#home-player-tbody");
	populateNBAPlayerStats(homePlayers, $homePlayerThead, $homePlayerTbody);
	
}

function populateNBATeamStats($stats, target) {
	target["Field Goals"] = $stats.attr("field_goals_made") + 
									   	   "-" + $stats.attr("field_goals_att") + 
					 				       ", " + $stats.attr("field_goals_pct") + "%";
	target["Free Throws"] = $stats.attr("free_throws_made") + 
									       "-" + $stats.attr("free_throws_att") + 
					 				       ", " + $stats.attr("free_throws_pct") + "%";
	target["3-pointers"] = $stats.attr("three_points_made") + 
									       "-" + $stats.attr("three_points_att") + 
					 				       ", " + $stats.attr("three_points_pct") + "%";
	target["Off. Rebounds"] = $stats.attr("offensive_rebounds");
	target["Def. Rebounds"] = $stats.attr("defensive_rebounds");
	target["Total Rebounds"] = $stats.attr("rebounds");
	target["Assists"] = $stats.attr("assists");
	target["Blocks"] = $stats.attr("blocks");
	target["Fouls"] = $stats.attr("personal_fouls");
	target["Steals"] = $stats.attr("steals");
	target["Turnovers"] = $stats.attr("turnovers");
}

function populateMLBPlayerStats(players, thead, tbody, callback) {
	examplePlayer = players[0];
	var counter1 = 0;
	for (attrib in examplePlayer) {
		counter1++;
		if (attrib !== "id") {
			thead.append("<th>" + toTitleCase(attrib.replace(/_/g," ")) + "</th>");
		}
		if (counter1 > 15) {break;}
	}
	for (var i = 0; i < players.length; i++) {
		targetPlayer = players[i];
		var tr = "<tr><th>";
		$.ajaxSetup({async: false});
		$.get(mlbPlayerURL+targetPlayer["id"], function(data){
			tr += data + "</th>";
		});
		var attrCounter = 0;
		for (attrib in targetPlayer) {
			attrCounter++;
			if (attrib !== "id") {
				tr += "<th>" + targetPlayer[attrib] + "</th>";
			}
			if (attrCounter > 15) {break;}
		}
		tr += "</tr>";
		tbody.append(tr);
	}
}

function populateNBAPlayerStats(players, thead, tbody) {
	thead.append("<th>Position</th>");
	thead.append("<th>Points</th>");
	for (var i = 0; i < statAttrs.length; i++) {
		thead.append("<th>" + statAttrs[i] + "</th>");
	}
	
	for (var i = 0; i < players.length; i++) {
		var tr = "<tr><th>" + players[i]["fullName"] + 
				 "</th><th>" + players[i]["Position"] +
				 "</th><th>" + players[i]["Points"] + "</th>";
		for (var j = 0; j < statAttrs.length; j++) {
			tr += "<th>" + players[i][statAttrs[j]] + "</th>";
		}
		tr += "</tr>";
		tbody.append(tr);
	}
}

function populateNHLPlayerStats(players, thead, tbody) {
	var counter1= 0;
	for (attrib in players[0]) {
		counter1++;
		if (attrib !== "name") {
			thead.append("<th>" + toTitleCase(attrib.replace(/_/g," ")) + "</th>");
		}
		if (counter1 > 12) {break;}
	}
	for (var i = 0; i < players.length; i++) {
		var tr = "<tr><th>" + players[i]["name"] + "</th>";
		var counter2 = 0;
		for (attrib in players[i]) {
			counter2++;
			if (attrib !== "name") {
				tr += "<th>" + players[i][attrib] + "</th>";
			}
			if (counter2 > 12) {
				break;
			}
		}
		tr += "</tr>" 
		tbody.append(tr);
	}
}

function toTitleCase(str) {
	return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}
