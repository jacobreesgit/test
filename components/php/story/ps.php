<?php
date_default_timezone_set( 'Europe/London' );
?><!DOCTYPE html>
<html class="no-js" lang="en">
<head>
	<meta http-equiv="X-UA-Compatible" content="chrome=1" />
	<link rel="apple-touch-icon" href="images/gui/bookmark.png"/>
	<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0" />
	<script type="text/javascript">if(window.innerWidth <= 1024) window.location = 'index.html?fs=true';</script>
	<title>360 Tour by Revolution Viewing</title>
	<link href="https://fonts.googleapis.com/css?family=Lato:400,700&display=swap" rel="stylesheet">
	<link rel="stylesheet" type="text/css" href="css/page-surround.css" />
</head>
<body>
	<main>
		<div class="card-container">
			<div class="iframe-container">
				<iframe src="index.html" allowfullscreen title="Virtual Tour"></iframe>
			</div>

			<footer>
				<div class="footer-section">
					<a id="clientLogo" href="#" target="_blank" rel="nofollow" title="Story Homes">
						<img src="images/gui/client-logo.jpg" width="400" />
					</a>
				</div>

				<div id="informationContainer" class="footer-section">
					<div id="showhomeDetails">
						<p id="property"><span class="label">Property:</span> <span class="value"></span></p>
						<p class="showhome-address"><span class="label">Address:</span> <span class="value"></span></p>
						<p id="phone"><span class="label">Telephone:</span> <span class="value"></span></p>
					</div>

					<a id="moreInfo" href="#" target="_blank" rel="nofollow">More Information</a>
				</div>

				<div id="third-parties" class="footer-section">
					<div class="footer-social">
						<div id="facebook">
							<div id="facebook-inner"><fb:like layout="button_count" href="" action="like" ></fb:like></div><div id="fb-root"></div>
						</div>
						<div id="twitter"><a href="http://twitter.com/share" class="twitter-share-button" data-count="none">Tweet</a>
							<script type="text/javascript" src="http://platform.twitter.com/widgets.js"></script>
						</div>
					</div>

					<div class="copyright">
						<a href="http://www.revolutionviewing.com/" target="_blank" rel="nofollow" title="Revolution Viewing Website">&copy; <?php echo date("Y"); ?> Revolution Viewing Ltd.</a>
					</div>
				</div>
			</footer>
		</div> <!-- END story-homes-container div -->
	</main>

	<script src="js/jquery-3.3.1.min.js"></script>
	<script type="text/javascript">
		window.fbAsyncInit=function(){FB.init({appId:'117598071670339',status:true,cookie:true,xfbml:true});FB.Event.subscribe('edge.create',function(href,widget){});};(function(){var e=document.createElement('script');e.type='text/javascript';e.src=document.location.protocol+'//connect.facebook.net/en_US/all.js';e.async=true;document.getElementById('fb-root').appendChild(e);}());

		var currentURL = window.location.href;

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

				if ( TEXT.address ){
					$('.showhome-address .value').text(TEXT.address);
				} else {
					$('.showhome-address').hide();
				}

				if ( TEXT.phone ) {
					$('#phone .value').text(TEXT.phone);
				} else {
					$('#phone').hide();
				}

				if ( TEXT.moreinfo ){
					$('#moreInfo').attr('href', TEXT.moreinfo);
				} else {
					$('#moreInfo').hide();
				}

				$('#clientLogo').attr({
					href: 'https://www.storyhomes.co.uk/',
					title: TEXT.clientName
				});
			});
		});
	</script>
</body>
</html>