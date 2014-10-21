function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}



$("a[data-target=#register-modal]").click(function(){
	$("#login-modal").modal('hide');
});

$("a[data-target=#login-modal]").click(function(){
	$("#register-modal").modal('hide');
});
function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

var csrftoken = getCookie('csrftoken');
// console.log(csrftoken);

$("#login-form").submit(function(e) {
	e.preventDefault();
	// var csrftoken = $(this).find("[name=csrfmiddlewaretoken]").val();
	$.ajaxSetup({
	    crossDomain: false, // obviates need for sameOrigin test
	    beforeSend: function(xhr, settings) {
	        if (!csrfSafeMethod(settings.type)) {
	            xhr.setRequestHeader("X-CSRFToken", csrftoken);
	        }
	    }
	});
	$form = $(this);
	var requestURL = $form.attr("action");
	var username = $form.find("[name=usrname]").val();
	var password = $form.find("[name=pwd]").val();
	// console.log(requestURL);
	var loginPosting = $.post(requestURL, {usrname:username, pwd:password});
	loginPosting.done(function(data) {
		if (data.status === "false") {
			var $alertDiv = $form.find(".message");
			$alertDiv.html("");
			$alertDiv.append("<div class=\"alert alert-danger fade in\">"+
							 "<button style=\"font-size:12px;\" class=\"close\" data-dismiss=\"alert\" aria-hidden=\"true\">&#10006;</button>" + 
							 data.reason + "</div>");
			$form.find("input.form-control").val("");
		} else {
			userAuth = "True";
			$("#login-modal").modal("hide");
			$("#signup-li").remove();
			$("#last-li").html("");
			$("#last-li").append("<a href=\"#\"><i class=\"fa fa-user fa-lg\"></i> " + data.name + "<strong></strong></a>");
			$("#last-li").append("<ul class='submenu'></ul>");
			var $submenu = $("#last-li").find("ul");
			$submenu.append("<li><a href=\"/gameTime/manage\">Manage</a></li>");
			$submenu.append("<li><a href=\"/gameTime/logout\">Log out</a></li>");
			$(function(){$('.sf-menu').superfish()})
			csrftoken = getCookie('csrftoken');
			$("[name=csrfmiddlewaretoken]").val(csrftoken);
		}
	});
});

$("#register-form").submit(function(e) {
	e.preventDefault();
	var csrftoken = $(this).find("[name=csrfmiddlewaretoken]").val();
	$.ajaxSetup({
	    crossDomain: false, // obviates need for sameOrigin test
	    beforeSend: function(xhr, settings) {
	        if (!csrfSafeMethod(settings.type)) {
	            xhr.setRequestHeader("X-CSRFToken", csrftoken);
	        }
	    }
	});
	$form = $(this);
	var requestURL = $form.attr("action");
	var postData = new Object();
	$form.find("input.form-control").each(function() {
		postData[$(this).attr("name")] = $(this).val();
	});
	var registerPosting = $.post(requestURL, postData);
	registerPosting.done(function(data) {
		$alertDiv = $form.find(".message");
		$alertDiv.html("");
		if (data.status === 'false') {
			$alertDiv.append("<div class=\"alert alert-danger fade in\"></div>");
			$errors = $alertDiv.find("div.alert");
			$errors.append("<button style=\"font-size:12px;\" class=\"close\" data-dismiss=\"alert\" aria-hidden=\"true\">&#10006;</button>");
			var errors = data.errors;
			console.log(errors);
			for (var i = 0; i < errors.length; i++) {
				$errors.append("<li>" + errors[i] + "</li>");
			}			
		} else {
			console.log(data.message);
			$alertDiv.append("<div class=\"alert alert-success fade in\">" + data.message + "</div>");
		}
		$form.find("input.form-control").val("");
	});

});
