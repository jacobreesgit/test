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
	<main>
		<div class="card-container">
			<div class="iframe-container">
				<iframe title="Virtual Tour" src="index.html" width="100%" height="100%" allowfullscreen="true"></iframe>
			</div>

			<footer>
				<div class="footer-section">
					<a id="clientLogo" href="#" target="_blank" rel="nofollow">
						<img src="images/gui/client-logo.jpg" width="276" height="130" />
					</a>
				</div>

				<div id="informationContainer" class="footer-section">
					<div id="showhomeDetails">
						<p id="property"><span class="label">Property:</span> <span class="value"></span></p>
						<p class="showhome-address"><span class="label">Address:</span> <span class="value"></span></p>
						<p id="telephone"><span class="label">Telephone:</span> <span class="value"></span></p>
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
		</main>
	</div> <!-- END containerMain div -->

	<script src="js/jquery-3.3.1.min.js"></script>

	<script type="text/javascript">
		window.fbAsyncInit=function(){FB.init({appId:'117598071670339',status:true,cookie:true,xfbml:true});FB.Event.subscribe('edge.create',function(href,widget){});};(function(){var e=document.createElement('script');e.type='text/javascript';e.src=document.location.protocol+'//connect.facebook.net/en_US/all.js';e.async=true;document.getElementById('fb-root').appendChild(e);}());
		var currentURL = window.location.href;
		var generic;

		$(document).ready(function(){
			$.getJSON("./global.json", function(data) {
				const { text } = data || {}
				const { clientName, title, property, description, address, phone, moreinfo, coins, dateCreated, urlid, region, development, conversion } = text || {}

				if(typeof property !== 'undefined' && property !== '' && typeof description !== 'undefined' && description !== ''){
					document.title = clientName+' | Showhome: '+property+' - '+description;
					$('#property .value').text(property+' - '+description);
				} else if(typeof property !== 'undefined' && property !== ''){
					document.title = clientName+' | Showhome: '+property;
					$('#property .value').text(property);
				} else if(typeof description !== 'undefined' && description !== ''){
					document.title = clientName+' | '+description;
					$('#property .value').text(description);
				} else {
					document.title = clientName;
					$('#property').hide();
				}

				if(typeof address !== 'undefined' && address !== ''){
					$('.showhome-address .value').text(address);
				} else {
					$('.showhome-address').hide();
				}

				if(typeof phone !== 'undefined' && phone !== ''){
					$('#telephone .value').text(phone);
				} else {
					$('#telephone').hide();
				}

				if(typeof moreinfo !== 'undefined' && moreinfo !== ''){
					$('#moreInfo').attr('href', moreinfo);
				} else {
					$('#moreInfo').hide();
				}

				$('#clientLogo').attr({
					href: 'https://www.millerhomes.co.uk/',
					title: clientName
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