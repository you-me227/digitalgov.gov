jQuery(document).ready(function($) {

	// ==============================================================
	// Register clicks on pages that have the short_url
	// ==============================================================

	// The Goal:
	// To be able to display a metric on our News cards content that indicates a measure of interest from our readers.

	// How are we doing this?
	// We are registering all clicks through the go.usa.gov short_url.

	// We are using the short_url in:
	// - links from our newsletter
	// - links on twitter, facebook, etc...
	// - links in any form of sharing outside of the website

	// What about links that originate on digital.gov (e.g. from the homepage)?
	// - If there the referrer is digital.gov...
	// - A script inserts an iframe into the page that then loads the short_url. This then registers a click with the go.usa.gov short_url.
	// - The iframe does not fully load because we block digital.gov from loading within iframes

	// What about direct links (e.g. liks that I copy and paste to a friend)?
	// - These are a little more tricky. At the moment, we are not capturing these.
	// - The best way to capture these is if we were able to capture the referrer of all the links from go.usa.gov and then be able to conditionaly register a click based on this value.


	// How to test
	// 1. Any link originating from digital.gov should register one click, via the iframe
	// 2. Any link originating from a short_url should register a click via the short_url (the iframe should not load)
	// 3. Any direct link -- not being captured


	var referer = document.referrer;
	var domains = ["localhost","digital.gov","demo.digital.gov"];
	if ( (new RegExp(domains.join("|")).test(referer)) || (referer)) {
		// short_url is defined in the <head>
		// If not, none of this runs...
		if (short_url){

			// Get the ID of the short_url — https://go.usa.gov/123ID
			var short_url_id = short_url.replace("https://go.usa.gov/", "");

			// Now create the name of the cookie we're going to set
			var cookie_id = 'view_' + short_url_id;
			// This name will be specific to the article (or short URL) we are viewing
			// If a reader is clicking around a number of articles, they might one cookie for each article they are viewing.
			// Cookies expire after 1hr.


			// Let's set a cookie!
			// If the cookie_id already exists, we are not going to load the iframe and increment the clicks (views) of the short URL.
	    if (getCookie(cookie_id) == 'true') {
	    } else {
				$('#clicks_iframe').prepend('<iframe src="'+short_url+'" width="1" height="1"></iframe>');
	      setCookie(cookie_id,'true');
	    }

		}
	}

	function setCookie(key, value) {
		var expires = new Date();
		// I think this means that the cookie will expire in 60mins?
		expires.setTime(expires.getTime() + (60 * (60 * 1000)) );
		document.cookie = key + '=' + value + ';expires=' + expires.toUTCString() + "; path=/";
	}

	function getCookie(key) {
		var keyValue = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
		return keyValue ? keyValue[2] : null;
	}






	// ==============================================================
	// Display clicks on articles
	// ==============================================================

	// We want to display the clicks/views of any item on the page
	// To do so, we need to merely set the data-short_url attribute in the HTML and include the short_url in
	// e.g. <article data-short_url="https://go.usa.gov/123ID">

	// This finds all of the elements on the page that have the short_url defined
	// - It gets the json API from https://go.usa.gov/ for that short url
	// - identifies the current number of clicks
	// - It adds the number of clicks to the HTML with a little number counting animation for fun

	$('*[data-short_url]').each(function(){
		var short_url = $(this).data('short_url');
		var article = $(this);
		var api = 'https://go.usa.gov/api/clicks.json?login=jeremyz&apiKey=d0ac464a2dfad044147e9537fd51503b&shortUrl=' + encodeURI(short_url);
		$.getJSON( api, function( data ) {
			$.each( data.response.data.entry, function( key, value ) {
				var element = $(article).find('.clicks');
				var element_span = $(element).find('span');
				var stale_clicks = $(element).data('clicks');
				var current_clicks = value.user_clicks;
				// Count up from the existing number to the current_num_clicks
				var interval = setInterval(function() {
					if (stale_clicks >= current_clicks) clearInterval(interval);
					stale_clicks++;
					$(element_span).html(stale_clicks);
				}, 50);

			});
		});
	});



});

jQuery(document).ready(function($) {

	function enable_edit_this(){
		$('*[data-edit-this]').each(function(){
			var filepath = $(this).data('edit-this');
			var edit_link = '<a class="edit_this_btn" href="https://workflow.digital.gov'+filepath+'" title="edit this" target="_blank"><span>edit</span></a>';
			$(this).addClass('edit-this').append(edit_link);
		});
	}
	function disable_edit_this(){
		$('*[data-edit-this]').each(function(){
			$(this).removeClass('edit-this');
			$('.edit_this_btn').remove();
		});
	}

	$('.edit_tools .edit-open').click(function(e){
		e.preventDefault();
		// If the editing tool is already active
		if ( $('.edit_tools').is( ".active" ) ) {
			// runs a function that removes edit tools from each item on the page that is editable.
			disable_edit_this();
			// remove the active class from the edit button
			$('.edit_tools').removeClass('active');
			// swap out the icon in the edit button
			$(this).html('<i class="far fa-edit"></i>');
		} else {
			enable_edit_this();
			$('.edit_tools').addClass('active');
			$(this).html('<i class="fas fa-times"></i>');
		}
  });

});

jQuery(document).ready(function($) {

	// Builds the Edit link on posts/pages/events to point to the GitHub file
	function build_edit_file_link(){
		// editpathURL is set the <head>
		if (editpathURL !== undefined) {

			// Build the edit link
			var edit = [
				"<a target='_blank' class='edit_file_link' href='"+editpathURL+"' title='Edit in GitHub'>",
					"<span>Edit</span>",
				"</a>"
			].join("\n");

			// Insert the .edit_file_link html into the .edit_file div and remove the .hidden class
			$('#feedback .edit_file').html(edit).removeClass('hidden');
		}
	}
	build_edit_file_link();

	function get_commit_data(){
		if (branch == "master") {
			branchpath = "";
		} else {
			branchpath = "/" + branch;
		}
		var commit_api_path  = "https://api.github.com/repos/" + git_org + "/" + git_repo + "/commits" + branchpath + "?path=/content/" + filepath;
		if (commit_api_path !== undefined) {
			$.ajax({
			  url: commit_api_path,
			 	dataType: 'json',
			}).done(function(data) {
				if (typeof data !== 'undefined') {
					if (branch == "master") {
						show_last_commit(data, branch);
					} else {
						// show_branch_last_commit(data, branch);
						show_last_commit(data, branch);
					}
				}
			});
		}
	}
	get_commit_data(filepath);

	function get_branch_link(branch){
		var path = 'https://github.com/GSA/digitalgov.gov/tree/' + branch;
		var branch_link = [
			"<a class='branch' href="+path+" title="+branch+">"+branch+"</a> "
		].join("\n");
		return branch_link;
	}

	function show_last_commit(data, branch){
		var branch_link = get_branch_link(branch);
		if (data[0] == null) {
			var commit_date = data.commit.committer.committer.date;
			var commit_author = data.author.login;
		} else {
			var commit_date = data[0].commit.committer.date;
			var commit_author = data[0].author.login;
		}
		var commit_author_url = 'https://github.com/' + commit_author;
		var commit_history_url = 'https://github.com/GSA/digitalgov.gov/commits/'+branch+'/content/' + filepath;
		var last_commit = [
			branch_link,
			"<p>Last updated by",
			"<a href="+commit_author_url+" title="+commit_author+">",
				"<span class='commit-author'>"+commit_author+"</span>",
			"</a> on ",
			"<a href="+commit_history_url+">",
				"<span class='commit-date'>"+getFormattedDate(commit_date)+"</span>",
			"</a></p>",
			""
		].join("\n");
		$('.edit_file').each(function(i, items_list) {
			$(this).append(last_commit);
		});
	}

	function show_branch_last_commit(data, branch){
		var branch_link = get_branch_link(branch);
		var last_commit = [
			branch_link
		].join("\n");
		$('.edit_file').each(function(i, items_list) {
			$(this).append(last_commit).removeClass('hidden');
		});
	}


	function getFormattedDate(d) {
		var date = new Date(d);
		date.setUTCHours(date.getUTCHours() - 4);
		var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
	  var year = date.getUTCFullYear();
	  var month = (date.getUTCMonth()).toString();
	  month = monthNames[month];
	  var day = date.getUTCDate().toString();
	  day = day.length > 1 ? day : '0' + day;
		var globalhours = date.getUTCHours().toString();
		if (globalhours > 12 ) {
			var hours = globalhours - 12;
		} else {
			var hours = globalhours;
		}
		var minutes = date.getUTCMinutes().toString();
		minutes = minutes.length > 1 ? minutes : '0' + minutes;
		var seconds = date.getUTCSeconds().toString();
		if (globalhours > 12 ) {
			var ampm = 'pm';
		} else {
			var ampm = 'am';
		}
		var date_string = month + ' ' + day + ', ' + year + ' at ' + hours + ':' + minutes + ' ' + ampm + ' ET';
	  return date_string;
	}


});

jQuery(document).ready(function($) {

	var topListItem = $(".usa-current").parents("li").last();
	$( topListItem).addClass('current');

	// Cleans up the #TableOfContents from HUGO
	// $('#TableOfContents ul').addClass('add-list-reset');
	$('#TableOfContents > ul:first').contents().unwrap();
	$('#TableOfContents > li:first').contents().unwrap();
	$('#TableOfContents > ul > ul').remove();

	function mobile_check(){
		var isMobile = false; //initiate as false
		// device detection
		if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v)|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) {
				isMobile = true;
		}
		return isMobile;
	}

	function format_toc(hash){
		// for each of the items in #TableOfContents
		$('#TableOfContents > ul').each(function(i, items_list) {
			$(items_list).find('li a').each(function(i, li){
				// console.log(li);
				// remove any 'active' classes
				$(li).removeClass('active');

				// Get the title for the Title attribute
				var title = $(li).html();

				// get the anchor link of the li
				var anchor = $(li).attr('href').substring(1);

				// If the anchor == hash, then set that <li> to 'active'
				var state;
				if (anchor == hash) {
					state = 'active';
				} else {
					state = '';
				}
				$(li).attr('title', title).attr('name', anchor).attr('class', state);

	    });
		});
	}

	function truncate_nav(){
		// checks if it is a mobile browser
		if (mobile_check() == true) {
			console.log('mobile device!');
			var num = $('nav#TableOfContents ul:first-child > li').size();
			console.log(num);
			// if the number of H2 items in the in-page nav is greater than 6
			// then truncate the list after 4 items, by adding the .ex and .display-none classes to the additional <li> tags in the nav
			if (num > 6) {
				var rem = num - 4;
				$('nav#TableOfContents ul:first-child > li').slice(-rem).addClass("ex display-none");
				// If greater than 6, the show / hide button appears as the last item in the list
				$('<li class="more"><a href="#" title="view the '+rem+' more items in this page">+ '+rem+' more »</a></li>').appendTo($('#TableOfContents ul:first-child'));
				$('<li class="close display-none"><a href="#" title="close the navigation">close</a></li>').appendTo($('#TableOfContents ul:first-child'));
			}

		} else {
			console.log('not a mobile device');
		}
	}
	truncate_nav();


	// Looks out for a click on the in-page nav
	// passes the hash onto format_toc()
	$("#TableOfContents a").click(function() {
		var hash = $(this).attr('name');
		console.log(hash);
		format_toc(hash);
	});

	// If the page loads, and there is a hash in the URL,
	// pass that along to format_toc()
	if(window.location.hash) {
		var hash = window.location.hash.substring(1); //Puts hash in variable, and removes the # character
		format_toc(hash);
	}

	if ($("#TableOfContents").length > 0) {
		$(this).show();
	} else{
		$(this).hide();
	}


	$("#TableOfContents .more").click(function(e) {
		e.preventDefault();
		$(this).addClass('display-none');
		$("nav#TableOfContents ul:first-child > li.ex").removeClass('display-none');
		$("#TableOfContents .close").removeClass('display-none');
	});

	$("#TableOfContents .close").click(function(e) {
		e.preventDefault();
		$("#TableOfContents .more").removeClass('display-none');
		$("nav#TableOfContents ul:first-child > li.ex").addClass('display-none');
		$("#TableOfContents .close").addClass('display-none');
	});

});

/* Light YouTube Embeds by @labnol */
/* Web: http://labnol.org/?p=27941 */

document.addEventListener("DOMContentLoaded", function() {
	var div, n,
		v = document.getElementsByClassName("youtube-player");
		c = document.getElementsByClassName("youtube-card");
	for (n = 0; n < v.length; n++) {
		div = document.createElement("div");
		div.setAttribute("data-id", v[n].dataset.id);
		div.innerHTML = labnolThumb(v[n].dataset.id);
		div.onclick = labnolIframe;
		v[n].appendChild(div);
	}
	for (n = 0; n < c.length; n++) {
		div = document.createElement("div");
		div.setAttribute("data-id", c[n].dataset.id);
		div.innerHTML = youtube_card(c[n].dataset.id);
		c[n].appendChild(div);
	}
});

function youtube_card(id) {
	var thumb = '<img src="https://i.ytimg.com/vi/'+id+'/hqdefault.jpg">';
	return thumb;
}

function labnolThumb(id) {
	var thumb = '<img src="https://i.ytimg.com/vi/ID/hqdefault.jpg" class="an image from the video">',
			play = '<div class="play"></div>';
	return thumb.replace("ID", id) + play;
}

function labnolIframe() {
		var iframe = document.createElement("iframe");
		var embed = "https://www.youtube.com/embed/ID?autoplay=1";
		iframe.setAttribute("src", embed.replace("ID", this.dataset.id));
		iframe.setAttribute("frameborder", "0");
		iframe.setAttribute("allowfullscreen", "1");
		this.parentNode.replaceChild(iframe, this);
}

var content_type = $('#workflow-posts').data('content_type');
var base_field = $('#workflow-posts').data('base_field');

// NEW date
// var date = new Date();


// returns the year and month for use in the filepath on GitHub
// Returns: 2019/09
function file_yearmo() {
  var dateInput = $(".block-date input").val().match(/^[^\s]+/);
  var dateObj = new Date(dateInput);
  var year = dateObj.getUTCFullYear();
  var month = ("0" + (dateObj.getUTCMonth() + 1)).slice(-2); //months from 1-12
  var yearmo = year + "/" + month + "/";
  return yearmo;
}
// returns the year and month for use in the filepath in the front matter
// Returns: 2019/09/01
function file_yearmoday() {
  if ($(".block-date input").length > 0) {
    var dateInput = $(".block-date input").val().match(/^[^\s]+/);
    var dateObj = new Date(dateInput);
    var year = dateObj.getUTCFullYear();
    var month = ("0" + (dateObj.getUTCMonth() + 1)).slice(-2); //months from 1-12
    var day = ("0" + (dateObj.getDate() + 1)).slice(-2); //months from 1-12
    return yearmoday = year + "/" + month + "/" + day + "/";
  }
}
function update_matter(){
  file_yearmoday();

  var post_matter = "";
  var page_url_comment = get_page_url_comment(content_type);
  var branch = "master";
  post_matter += "---";
  post_matter += page_url_comment;
  post_matter += "\n# Learn how to edit our pages at https://workflow.digital.gov";

  var community_list_1 = false;
  var community_list_2 = false;

  // For each field in the editor...
  $('*[data-block]').each(function(i, e){

		var id = $(this).data('block'); // gets the id
		var data_type = $(this).data('block-data_type'); // gets the data_type
		var comment = $(this).data('block-comment') !== "" ? '\n# ' + $(this).data('block-comment') + '\n' : ""; // gets the comment

    // Process the text by
    var val = process_text(id, $(this));

    // checks if the data should 'skip' and not appear in the front matter
    if ((val !== "skip") && (data_type !== "skip")) {
      if ((data_type == "string")) {
        var front_matter = '\n'+ comment + id + ': "' + val + '"';
      } else {
        var front_matter = '\n'+ comment+ id + ': ' + val;
      }
      post_matter += front_matter;
    }

    if ($(this).hasClass('community_list-1') == true ) {
      var output = "\n\n";
      output += "community_list:\n";
      output += get_community_list_data(id, $(this), 'community_list-1');
      if (community_list_1 == false) {
        post_matter += output;
      }
      community_list_1 = true;
    }

    if ($(this).hasClass('community_list-2') == true ) {
      var output = get_community_list_data(id, $(this), 'community_list-2');
      if (community_list_2 == false) {
        post_matter += output;
      }
      community_list_2 = true;
    }

	});
  post_matter += "\n\n# Make it better ♥\n";
  post_matter += "---";
  post_matter += "\n\n\n";
  var post_content = simplemde.value();

  var post_file_contents = post_matter;
  post_file_contents += post_content;

  $("#post-matter").html(post_matter);
  var github_path = github_base + get_github_url(post_file_contents);
  $("#new_file").attr('href', github_path);
}


function process_text(id, el){
  if (id == base_field) {
    return el.val();
  } else if (id == 'authors') {
    var authors_list = make_yaml_list($('.block-authors select').val());
    if (authors_list == '') {
      return 'skip';
    } else {
      return authors_list;
    }
  } else if (id == 'topics'){
    var topics_list = make_yaml_list($('.block-topics select').val());
    if (topics_list == '') {
      return 'skip';
    } else {
      return topics_list;
    }
  } else if (id == 'source') {
    if ($('.block-'+id).hasClass('display-none') == true) {
      return 'skip';
    } else {
      return el.val();
    }
  } else if (id == 'source_url') {
    if ($('.block-'+id).hasClass('display-none') == true) {
      return 'skip';
    } else {
      return el.val();
    }
  } else if (id == 'aliases') {
    if (el.val() == '') {
      return 'skip';
    } else {
      return "\n"+el.val();
    }
  } else if (id == 'kicker') {
    if ($(el).val().length == 0) {
      return 'skip';
    } else {
      return $(el).val();
    }
  } else if (id == 'branch') {
    return 'skip';
  } else if (id == 'date') {
    var time = $('.block-time input').val();
    return el.val() + ' ' + time + ' -0500';
  } else if (id == 'end_date') {
    var time = $('.block-end_time input').val();
    return el.val() + ' ' + time + ' -0500';
  } else if (id == 'primary_image') {
    var primary_image = $(el).val();
    if (primary_image.length == 0) {
      return 'skip';
    } else {
      return primary_image;
    }
  } else if (id == 'slug') {
    if ($(el).is('[readonly]')){
      var slug = $(el).val();
      return slug;
    } else {
      var slug = slugify();
      $(el).val(slug);
      return slug;
    }

  } else if (id == 'weight') {
    var weight = $(el).val();
    if (weight.length == 0) {
      return 'skip';
    } else {
      return weight;
    }

  } else if (id == 'event_platform') {
    var event_platform = $(el).val();
    if (event_platform.length == 0) {
      return 'skip';
    } else {
      return event_platform;
    }
  } else if (id == 'filename') {
    var slug = slugify();
    var filename = slug + '.md';
    $('.block-filename input').val(filename);
    $('#filename').text(filename);
    return 'skip';
  } else if (id == 'filename-dated') {
    var slug = slugify();
    var date = $('.block-date input').val();
    var filename = date + '-' + slug + '.md';
    $('.block-filename-dated input').val(filename);
    $('#filename').text(filename);
    return 'skip';
  } else if (el.hasClass('community_list')) {
    return 'skip';
  } else if (id == 'venue_name' || id == 'room' || id == 'address' || id == 'city' || id == 'state' || id == 'country' || id == 'zip' || id == 'map') {
    return get_venue_info(id, el);
  } else {
    return el.val();
  }
}

function make_yaml_list(items) {
  var output = '';
  if (items.length === 0) {
    return output;
  } else {
    output += "\n";
    $.each( items, function( i, e ) {
      if (i === items.length - 1) {
        output += "  - " + $.trim(e);
      } else {
        output += "  - " + $.trim(e) + "\n";
      }
    });
    return output;
  }
}

function get_filename(){
  return $('#filename').text();
}

function get_edit_branch(){
  return "master";
}

function get_page_url_comment(content_type){
  var url = get_publish_url(content_type);
  var comment = "\n# View this page at " + url;
  return comment;
}

function get_publish_url(content_type) {
  var slug = slugify();
  if (content_type == 'posts') {
    var url = "https://digital.gov/" + file_yearmoday() + slug;
  } else if (content_type == 'events') {
    var url = "https://digital.gov/event/" + file_yearmo() + slug;
  } else if (content_type == 'resources') {
    var url = "https://digital.gov/resources/" + slug;
  } else if (content_type == 'services') {
    var url = "https://digital.gov/services/" + slug;
  } else if (content_type == 'communities') {
    var url = "https://digital.gov/communities/" + slug;
  } else if (content_type == 'authors') {
    var url = "https://digital.gov/authors/" + slug;
  } else if (content_type == 'topics') {
    var url = "https://digital.gov/topics/" + slug;
  } else if (content_type == 'sources') {
    var url = "https://digital.gov/sources/" + slug;
  } else {
    var url = "https://digital.gov/" + file_yearmo() + slug;
  }
  return url;
}


function get_github_url(post_matter) {
  var base_url = get_edit_branch()+"/content/"+content_type+"/";

  // Passing in the commit message to GitHub
  var commit_msg = "New "+ content_type +": " + ($('.block-'+base_field +' input').val()).trim();

  // Passing in the commit description to GitHub
  var commit_desc = "";
  if ($(".block-deck textarea").length) {
    var commit_desc = ($(".block-deck textarea").val()).trim();
  }

  // Setting the file path based on content_type
  if (content_type == 'posts' || content_type == 'events') {
    base_url += file_yearmoday() + '?filename=' + get_filename() + '&value=' + encodeURIComponent(post_matter) + '&message=' + encodeURIComponent(commit_msg) + '&description=' + encodeURIComponent(commit_desc) + '&target_branch=' + get_edit_branch();
  } else if (content_type == 'authors' || content_type == 'topics') {
    base_url += slugify() + '/?filename='+slugify()+'/_index.md' + '&value=' + encodeURIComponent(post_matter) + '&message=' + encodeURIComponent(commit_msg) + '&description=' + encodeURIComponent(commit_desc) + '&target_branch=' + get_edit_branch();
  } else if (content_type == 'sources') {
    base_url += slugify() + '/?filename=source_'+slugify()+'.md' + '&value=' + encodeURIComponent(post_matter) + '&message=' + encodeURIComponent(commit_msg) + '&description=' + encodeURIComponent(commit_desc) + '&target_branch=' + get_edit_branch();
  } else {
    base_url += content_type + '?filename=' + get_filename() + '&value=' + encodeURIComponent(post_matter) + '&message=' + encodeURIComponent(commit_msg) + '&description=' + encodeURIComponent(commit_desc) + '&target_branch=' + get_edit_branch();
  }
  return base_url;
}

function get_venue_info(id, el){
  // If Venue is not checked
  if ($('.block-venue input').is(':checked') == false) {
    // hide the venue fields
    $('.block-'+id).addClass('display-none');
    return 'skip';
  } else {
    // show the venue fields
    $('.block-'+id).removeClass('display-none');
    return el.val();
  }
}


function get_community_list_data(id, el, group){

  // Find all the elements that have the .community_list class
  if ($(el).hasClass('community_list')) {
    var output = ""; // setting the output variable
    var i = 0; // count starts at 0

    // For each element that has the "group" class [community_list_1]
    $('*[class$="'+group+'"]').each(function(i, e) {
      var data = $(e).val(); // get the value from the field
      var block_id = $(this).data('block'); // gets the id or front matter key
      var data_type = $(this).data('block-data_type'); // gets the data_type
      if (data) {
        // Run only on the first iteraton of the each
        if (i == 0) {
          output += "  - " + block_id + ": "+ $.trim(data) + "\n";
        } else {
          if (data_type == "string") {
            output += '    ' + block_id + ': "'+ data + '"\n';
          } else {
            output += '    ' + block_id + ': '+ data + '\n';
          }
        }
        i++;
      }
    });
   return output;
  }
}


function slugify() {
  var base = $('.block-'+base_field +' input').val();
  var small_words = /\band |\bthe |\bare |\bis |\bof |\bto /gi;
  var slug = base.replace(new RegExp(small_words, "gi"), '');
  var output = slug.split(" ").splice(0,6).join(" ");
  output = output.replace(/[^a-zA-Z0-9\s]/g, "");
  output = output.toLowerCase();
  output = output.replace(/\s\s+/g, " ");
  output = output.trim();
  output = output.replace(/\s/g, "-");
  return output;
}

function encodeEntities(input) {
  var entityPattern = /[&<>"'’`)(=+*@$%\/]/g;

  var entityMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    "’": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;',
    '*': '&#42;',
    '$': '&#36;',
    '%': '&#37;',
    '(': '&#40;',
    ')': '&#41;',
    '+': '&#43;',
    '@': '&#64;',
    '-': '&#8208;',
    '–': '&#8211;',
    '—': '&#8212;'
  };
  input.replace(entityPattern, function (s) {
    return entityMap[s];
  });
}


// Hide and show the Source and source_url fields
if ($('#card_display_dg').is(':checked') == true) {
  $(".block-source, .block-source_url").addClass('display-none');
  // update_matter();
}

$('#card_display input').click(function() {
  if($(this).is(':checked')){
    var val = $(this).val();
    if (val == 'card_display_dg') {
      $(".block-source, .block-source_url").addClass('display-none');
    } else {
      $(".block-source, .block-source_url").removeClass('display-none');
    }
    update_matter();
  }
});

// Venue information
$('.block-venue input').change(function() {
  update_matter();
});

jQuery(document).ready(function ($) {

  github_base = "https://github.com/GSA/digitalgov.gov/new/";

  var date = new Date();
  update_date(date);

  function update_date(date){
    // Get date — set to +1 date in the future
    var yearmoday = `${date.getFullYear()}-${('0' + (date.getMonth()+1)).slice(-2)}-${('0' + (date.getDate())).slice(-2)}`;

    // Get current time — not being used at the moment
    var time = `${date.getHours()+1}:${(date.getMinutes()<10?'0':'') + '00:00'}`;
    var end_time = `${date.getHours()+2}:${(date.getMinutes()<10?'0':'') + '00:00'}`;
    // Set time to 9am ET — our daily pub time
    // var time = '09:00';
    // Insert the time into the time fields
    $(".block-date input, .block-end_date input").val(yearmoday);
    $(".block-time input").val(time);
    $(".block-end_time input").val(end_time);
  }

  $('.block-event_organizer input').val('Digital.gov');
  $("input").keyup(update_matter);
  $("textarea").keyup(update_matter);
  $("select").on('change', function() {
    update_matter();
  });
  $("select").on("select2:select select2:unselect", function(e) {
    update_matter();
  });

});

var simplemde = new SimpleMDE({
  autosave: {
		enabled: false,
		uniqueId: "MyUniqueID", // This needs to be a unique ID
		delay: 1000,
	},
  element: $("#editor")[0],
  insertTexts: {
		horizontalRule: ["", "\n\n-----\n\n"],
		image: ["![](http://", ")"],
		link: ["[", "](http://)"],
		table: ["", "\n\n| Column 1 | Column 2 | Column 3 |\n| -------- | -------- | -------- |\n| Text     | Text      | Text     |\n\n"],
	},
  promptURLs: true,
  toolbar: ["bold", "italic", "quote", "|", "heading-2", "heading-3", "|", "unordered-list", "ordered-list", "code", "table", "|", "preview", "side-by-side", "fullscreen", "guide"]
});

// const pos = simplemde.codemirror.getCursor();
// simplemde.codemirror.replaceRange(post_matter, pos);
