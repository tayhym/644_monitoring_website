var userAuth = document.getElementById("user-auth").value;
function globalToolTip() {
	
	$("[rel=tooltip][flag=0]").tooltip({ placement: 'top', title:"like it"});
	$("[rel=tooltip][flag=1]").tooltip({ placement: 'top', title:"dislike it"});
	$("[rel=tooltip]:not(a.like)").tooltip({placement:'top'});
	$("[rel=right-tooltip]").tooltip({placement:'right'});
}

function commentCollapse() {
	var orginalTitle = "";
	var icon = $(this).find("i");
	if (icon.hasClass('fa-comment')) {
		icon.attr('data-original-title', 'collapse')
		    .removeClass('fa-comment').addClass('fa-angle-double-up')
		    .tooltip('show');
		    return true;
	}
	if (icon.hasClass('fa-angle-double-up')) {
		icon.attr('data-original-title', 'reply')
		    .removeClass('fa-angle-double-up').addClass('fa-comment')
		    .tooltip('show');
		    return true;
	}
}

function vote() {
	upVoteURL = "/gameTime/up-vote/";
	dnVoteURL = "/gameTime/dn-vote/";
	$("a.up-vote").click(function() {
		if (userAuth === "False") {
			$("#login-modal").modal("show");
			return false
		} 
		$currBtn = $(this);
		var pid = $currBtn.attr("pid");
		$.get(upVoteURL+$currBtn.attr("pid"), function(data){
			if (data === "vote allowed") {
				var parentDiv = $currBtn.parent().parent();
				var numberDiv = parentDiv.find("div")[1];
				numberDiv.innerHTML = numberDiv.innerHTML*1+1;
				$(".up-vote[rel='tooltip:" + pid + "']").tooltip({ placement: 'top', title: 'Vote Successful'});
				$(".up-vote[rel='tooltip:" + pid + "']").tooltip('show');
			} else {
				$(".up-vote[rel='tooltip:" + pid + "']").tooltip({ placement: 'top', title: 'Already Voted'});
				$(".up-vote[rel='tooltip:" + pid + "']").tooltip('show');
			}
			$(".dn-vote[rel='tooltip:" + pid + "']").tooltip({ placement: 'top', title: 'Already Voted'});

			$(".up-vote[rel='tooltip:" + pid + "']").attr('data-original-title', 'Already Voted');

			
			return false;
		});
	});
	$("a.dn-vote").click(function() {
		if (userAuth === "False") {
			$("#login-modal").modal("show");
			return false
		}
		$currBtn = $(this);
		var pid = $currBtn.attr("pid");
		$.get(dnVoteURL+$currBtn.attr("pid"), function(data){
			if (data === "vote allowed") {
				var parentDiv = $currBtn.parent().parent();
				var numberDiv = parentDiv.find("div")[1];
				numberDiv.innerHTML = numberDiv.innerHTML*1-1;
				$(".dn-vote[rel='tooltip:" + pid + "']").tooltip({ placement: 'bottom', title: 'Vote Successful'});
				$(".dn-vote[rel='tooltip:" + pid + "']").tooltip('show');
			} else {
				$(".dn-vote[rel='tooltip:" + pid + "']").tooltip({ placement: 'bottom', title: 'Already Voted'});
				$(".dn-vote[rel='tooltip:" + pid + "']").tooltip('show');
			}
			$(".up-vote[rel='tooltip:" + pid + "']").tooltip({ placement: 'top', title: 'Already Voted'});

			$(".dn-vote[rel='tooltip:" + pid + "']").tooltip({ placement: 'bottom', title: 'Already Voted'});

			
			return false;
		});
	});
}

function like() {
	var url = "/gameTime/like/";
	if (userAuth === "False") {
		$("#login-modal").modal("show");
		return false;
	}
	var $currBtn = $(this);
	if ($currBtn.attr("flag") == 0) {
		$currBtn.css("color", "#8E2800");
		$.get(url + $currBtn.attr("pid") + "/0", function(data){
			var numberSpan = $currBtn.parent().find("span")[1];
			numberSpan.innerHTML = numberSpan.innerHTML*1+1;
			$currBtn.attr("flag",1)
					.attr('data-original-title', 'dislike it')
					.tooltip('show');

		});
	}
	if ($currBtn.attr("flag") == 1) {
		$currBtn.css("color", "#468966");
		$.get(url + $currBtn.attr("pid") + "/1", function(data){
			var numberSpan = $currBtn.parent().find("span")[1];
			numberSpan.innerHTML = numberSpan.innerHTML*1-1;
			$currBtn.attr("flag",0)
					.attr('data-original-title', 'like it')
					.tooltip('show')
		});
	}
	return false;
}

function selectAnswer() {
	$("a.bounty-select").each(function() {
	$currBtn = $(this);
	resolvedStatus = $(this).attr("resolved");
	if (resolvedStatus==="True") {
		$currBtn.css("color", "#468966");
		}	
	});

	$("a.bounty-select").click(function() {
		selBountyURL = "/gameTime/selectBounty/" 
		$currBtn = $(this);
		var pid = $currBtn.attr("pid");
		
		$.get(selBountyURL+pid,function(data) {
			if (data==="Chosen best answer") {
				$currBtn.tooltip({placement:'top', title:'Chosen as best answer'});
				$currBtn.tooltip('show');
				$currBtn.css("color", "#468966");
				$statusSpan = $("#question-status-" + $currBtn.attr("qid"));
				// console.log($statusSpan.length);
				$statusSpan.html("Solved");
				$statusSpan.css('color','#468966');
			} else {
				$currBtn.tooltip({placement:'top', title:data});
				$currBtn.tooltip('show');
			}
		});
	});
}

$(document).ready(function(){
	$("[role=form]").submit(function(e) {
		if (userAuth === "False") {
			e.preventDefault();
			$("#login-modal").modal("show");
			return false;
		}
	});
});


$(document).ready(function(){
	$('input[type=file]').bootstrapFileInput();
});


$(document).ready(globalToolTip);


$("a[data-toggle=collapse]").click(commentCollapse);



$(document).ready(function(){
	$("a.like").click(like);
});

$(document).ready(vote); 

$(document).ready(selectAnswer);
	
// this script deals with the tab collapsing when there are multiple stats books for mlb games
$(".mlb-tabs a[data-toggle='tab']").click(function(){
	var tab = $(this);
	var targetPanel = $(tab.attr("href"));
	if (tab.parent("li").hasClass("active")) {
		window.setTimeout(function(){
			targetPanel.removeClass("active");
			tab.parent("li").removeClass("active");
			var dropdownParent = tab.closest("li.dropdown");
			if (dropdownParent.length != 0 && dropdownParent.hasClass("active")) {
				dropdownParent.removeClass("active");
			}
		},1);
	}
});



	// $("#tabs a").click(function(e) {
	// 	// $("#commentary").tab('hide');
	// 	// $("#Q-A").tab('hide');
	// 	e.preventDefault();
	// 	// $("#commentary").tab('hide');
	// 	// $("#Q-A").tab('hide');
	// 	$(this).tab('show');
	// })
	// $(function () {
 	// $('.nav-tabs a:first').tab('show');
 	// });
    // make the right tab active
$(function () {
	$('.stats-tabs a:first').tab('show');
	$('.nav-tabs>li.active').click(function(){
		// $(this).removeClass("active");
	});

	if ($("#activeTab").attr("value") == "q&A") { 
		// $('.nav-tabs a:nth-child(2)').tab('show');
		$('#commentary').removeClass("active in");
		// $('#commentary').parent.removeClass("active");
		$('#Q-A').addClass("active in");
		$('#questionsHeader').addClass("active");
	}
	else {
		// $('.nav-tabs a:first').tab('show');
		$('#Q-A').removeClass("active in");
		// $('#Q-A').parent.removeClass("active");
		$('#commentary').addClass("active in");
		$('#commentsHeader').addClass("active");

	}
});



