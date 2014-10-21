var req; 

function sendRequest() {
	if (window.XMLHttpRequest) {
		req = new XMLHttpRequest();
	} else {
		req = new ActiveXObject("Microsoft.XMLHTTP");
	}
	game_id = $("#game-id").attr("value");
	req.onreadystatechange = handleResponse;
	req.open("GET","/gameTime/refresh-gamepage/"+game_id,true);
	req.send();
}

function handleResponse() {
	// check for server status
	if ((req.readyState != 4) || (req.status != 200)) {
		return;
	}

	responseHtml = req.responseText;
	
	var div = document.createElement('div');
	div.innerHTML = responseHtml;

	dom = div;
	// refresh comment posts with responses
	$blogContainer = $("#post-container[role=blog]");
	$(dom).find("div.post-wrapper[type=blogPost]").each(function(){

		postId = $(this).attr('id');
		$targetPost = $("#" + postId);
		if ($targetPost.length == 0) {
			$blogContainer.prepend($(this));
		} else {
			$targetPost.find(".post-time").html($(this).find(".post-time").html());
			$targetPost.find(".post-reputation").html($(this).find(".post-reputation").html());
			$targetPost.find(".post-status").html($(this).find(".post-status").html());
			$replyContainer = $(this).find(".reply-container");
			$targetPost.find(".reply-container").html($replyContainer.html());

		}
	});

	// refresh Q&A cotents
	$qaContainer = $("#post-container[role=QA]");
	$(dom).find("div.post-wrapper[type=question]").each(function (){
		questionID = $(this).attr('id');

		$targetQuestion = $("#" + questionID);
		if ($targetQuestion.length == 0) {
			$qaContainer.prepend($(this));
		} else {
			$targetQuestion.find("post-time").html($(this).find(".post-time").html());
			$targetQuestion.find("[role=question-status]").html($(this).find("[role=question-status]").html());
			$targetQuestion.find("[rel=reply-count]").html($(this).find("[rel=reply-count]").html());
			$replyContainer = $(this).find(".reply-container");
			$targetQuestion.find(".reply-container").html($replyContainer.html());
		}
	});
	$(document).ready(function(){
		$("a.like").click(like);
	});
	$(document).ready(vote);
	$(document).ready(selectAnswer);
	$(document).ready(globalToolTip);
}	


window.setInterval(sendRequest,5000);
