<?php
date_default_timezone_set( 'Europe/London' );
?><!DOCTYPE html>
<html class="no-js" lang="en">
<head>
	<meta http-equiv="X-UA-Compatible" content="chrome=1" />
	<link rel="apple-touch-icon" href="images/gui/bookmark.png"/>
	<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
	<meta name="viewport" content="target-densitydpi=device-dpi, width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0" />
	<title>360 Tour by Revolution Viewing</title>
	<script type="text/javascript">if(window.innerWidth <= 1024) window.location = 'index.html?fs=true';</script>
	<link rel="stylesheet" type="text/css" href="css/page-surround.css" />
</head>
<body>
	<div class="container">
		<div class="container-inner">
			<div id="iframeContainer" class="page-body">
				<iframe title="Virtual Tour" src="index.html" width="100%" height="100%" allowfullscreen="true"></iframe>
				<noscript><p>If you can see this message rather than a virtual tour then please <a href="http://www.adobe.com/go/getflashplayer/" target="_blank">click here to install the adobe flash player.</a> <br>If you are still unable to view the virtual tour then you may need to enable javascript in your browser <a href="http://www.google.com/support/bin/answer.py?hl=en&amp;answer=23852" target="_blank">(click here for instructions)</a>.<br /> If you are still experiencing problems then please email Revolution Viewing at <a href="mailto:support@revolutionviewing.com">support@revolutionviewing.com</a></p></noscript>
			</div>

			<div id="page-footer" class="page-footer">

				<a id="clientLogo" class="footer-col" href="javascript:void(0)" target="_blank">
					<img src="images/gui/client-logo.jpg" width="250" height="92" />
				</a>

				<div id="informationContainer" class="footer-col">
					<div id="showhomeDetails">
						<p id="property"><span class="label">Property:</span> <span class="value"></span></p>
						<p class="showhome-address"><span class="label">Address:</span> <span class="value"></span></p>
						<p id="telephone"><span class="label">Telephone:</span> <span class="value"></span></p>
					</div>

					<a id="moreInfo" href="javascript:void(0)" target="_blank" title="More Information">More Information</a>
				</div>

				<div id="third-parties" class="footer-col">
					<div id="footer-social">
						<div id="facebook">
							<div id="facebook-inner"><fb:like layout="button_count" href="" action="like"></fb:like></div><div id="fb-root"></div>
						</div>
						<div id="twitter"><a href="http://twitter.com/share" class="twitter-share-button" data-count="none">Tweet</a>
							<script type="text/javascript" src="http://platform.twitter.com/widgets.js"></script>
						</div>
					</div>

					<div id="copyright">
						<a href="http://www.revolutionviewing.com/" target="_blank" rel="nofollow" title="Revolution Viewing Website">&copy; <?php echo date("Y"); ?> Revolution Viewing Ltd.</a>
					</div>
				</div>

			</div>
		</div><!-- container-inner -->
	</div><!-- container -->

	<script src="js/jquery-3.3.1.min.js"></script>

	<script type="text/javascript">
		window.fbAsyncInit=function(){FB.init({appId:'117598071670339',status:true,cookie:true,xfbml:true});FB.Event.subscribe('edge.create',function(href,widget){});};(function(){var e=document.createElement('script');e.type='text/javascript';e.src=document.location.protocol+'//connect.facebook.net/en_US/all.js';e.async=true;document.getElementById('fb-root').appendChild(e);}());

		var currentURL = window.location.href;
		var generic;

		$(document).ready(function() {
			$.getJSON("./global.json", function(data) {
				var TEXT = data.text;

				if ( TEXT.property && TEXT.description ) {
					$('title').text(TEXT.clientName+' | Showhome: '+TEXT.property+' - '+TEXT.description);
					$('#property .value').text(TEXT.property+' - '+TEXT.description);
				} else if ( TEXT.property ) {
					$('title').text(TEXT.clientName+' | Showhome: '+TEXT.property);
					$('#property .value').text(TEXT.property);
				} else if ( TEXT.description ) {
					$('title').text(TEXT.clientName+' | '+TEXT.description);
					$('#property .value').text(TEXT.description);
				} else {
					$('title').text(TEXT.clientName);
					$('#property').hide();
				}

				if ( TEXT.address ) {
					$('.showhome-address .value').text(TEXT.address);
				} else {
					$('.showhome-address').hide();
				}

				if ( TEXT.phone ) {
					$('#telephone .value').text(TEXT.phone);
				} else {
					$('#telephone').hide();
				}

				if ( TEXT.moreinfo ) {
					$('#moreInfo').attr('href', TEXT.moreinfo);
				} else {
					$('#moreInfo').hide();
				}

				$('#clientLogo').attr({
					href: 'http://www.orbithomes.org.uk',
					title: TEXT.clientName
				});

			});
		});

		var _gaq = _gaq || [];
		_gaq.push(['_setAccount', 'UA-3045538-1']);
		_gaq.push(['_trackPageview']);

		(function() {
			var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
			ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
			var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
		})();
	</script>
</body>
</html>