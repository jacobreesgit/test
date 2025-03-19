<?php
date_default_timezone_set( 'Europe/London' );
$url = $_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI'];
?><!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8">
		<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
		<title>Loading...</title>
		<meta name="viewport" content="target-densitydpi=device-dpi, width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0" />
		<script type="text/javascript">if(window.innerWidth <= 1024) window.location = 'index.html?fs=true';</script>
		<link rel="stylesheet" type="text/css" href="css/page-surround.css" />
		<link rel="apple-touch-icon" href="images/gui/bookmark.png" />
		<meta name="twitter:widgets:csp" content="on">
	</head>

	<body>

		<div class="containerBehindMain">

			<div class="containerMain">

				<div class="page-header">
					<div id="contactDetailsBox">
						<a href="javascript:void(0)" id="development"><h1></h1></a>
						<p class="showhome-address"></p>
						<p id="property"></p>
					</div>

					<a href="javascript:void(0)" id="clientLogo" target="_blank">
						<img src="images/gui/logo.png" width="260" height="105" />
					</a>
				</div>

				<div id="iframeContainer" class="page-body">
					<iframe title="Virtual Tour" src="index.html" width="100%" height="100%" allowfullscreen="true"></iframe>
					<noscript>
						<p>If you can see this message rather than a virtual tour then please <a href="http://www.adobe.com/go/getflashplayer/" target="_blank">click here to install the adobe flash player.</a>
							<br /> If you are still unable to view the virtual tour then you may need to enable javascript in your browser <a href="http://www.google.com/support/bin/answer.py?hl=en&amp;answer=23852" target="_blank">(click here for instructions)</a>.
							<br /> If you are still experiencing problems then please email Revolution Viewing at <a href="mailto:support@revolutionviewing.com">support@revolutionviewing.com</a>
						</p>
					</noscript>
				</div>

				<div id="footer-outer">
					<div id="interested-development" class="page-footer">

						<div id="interested-section" class="footer-left">
							<div class="interested">Interested in this property?</div>
							<div class="links">
								<a href="javascript:void(0)" target="_blank" id="arrangeAppointment"></a>
								<div class="orCall">or call: <strong id="phone"></strong></div>
							</div>
						</div>

						<div class="footer-right">
							<div class="footer-social">
								<div id="facebook">
									<div id="facebook-inner"><fb:like layout="button_count" href="http://<?php echo $url ?>" action="like"></fb:like></div>
									<script id="fb-root" type="text/javascript" src="//connect.facebook.net/en_US/all.js" async></script>
								</div>
							</div>

							<div id="poweredBy">
								<p>powered by</p>
								<a id="copyrightRvLogo" href="http://www.revolutionviewing.com/" target="_blank" title="Revolution Viewing's Website"><span>Revolution Viewing&#8482;</span></a>
							</div>
						</div>

					</div>

					<div id="interested-generic" class="page-footer">

						<div class="footer-left">
							<div class="footer-social">
								<div id="facebook">
									<div id="facebook-inner"><fb:like layout="button_count" href="http://<?php echo $url ?>" action="like"></fb:like></div>
									<script id="fb-root" type="text/javascript" src="//connect.facebook.net/en_US/all.js" async></script>
								</div>
							</div>
						</div>

						<div class="footer-right">
							<div id="poweredBy">
								<p>powered by</p>
								<a id="copyrightRvLogo" href="http://www.revolutionviewing.com/" target="_blank" title="Revolution Viewing's Website"><span>Revolution Viewing&#8482;</span></a>
							</div>
						</div>

					</div>
				</div>
			</div>

			<div class="disclaimer">
				Images depict typical Charles Church house types. This information is for guidance only and does not form any part of any contract or constitute a warranty. All information correct at time of publication and is subject to change. Please check specification with the sales advisor on site.
			</div>
		</div>

		<script src="js/jquery-3.3.1.min.js"></script>
		<script type="text/javascript">
			var isGenericText = false;
			var gallery;
			var currentURL = window.location.href;
			currentURL = currentURL.replace('https://', '');
			currentURL = currentURL.replace('http://', '');
			currentURL = currentURL.replace('www.', '');
			currentURL = currentURL.replace('virtualtours.charleschurch.com', '');
			currentURL = currentURL.replace('revolutionviewing.co.uk', '');
			var tourData;

			$(document).ready(function(){
				$.getJSON('./global.json', function(data) {
					const { settings, text } = data || {}
					const { generic, gallery } = settings || {}
					const { clientName, title, property, description, address, phone, moreinfo, coins, dateCreated, urlid, region, development, conversion, template, version } = text || {}
					var developmentSlug = "";

					// ON FB SUCCESS - USE EDGE>CREATE FUNCTION
					window.fbAsyncInit = function() {
						// Don't use my app id, use your own or it won't work!
						FB.init({
							appId: '558604754201856',
							status: true,
							cookie: true,
							xfbml: true
						});
						FB.Event.subscribe('edge.create', createNew);
					};

					var FBScript;
					FBScript = $('<script>').attr({
						type: 'text/javascript',
						src: document.location.protocol + '//connect.facebook.net/en_US/all.js',
						async: true
					});

					document.title = title || (property ? `${property} | ${clientName}`: clientName)

					if ( generic ) {
						$('body').addClass('generic');
						$('#interested-generic').show();
						$('#development h1').text(property);
						$('#property').text(description);
						isGenericText = "true";
					} else {
						$('#interested-development').show();
						$('#development h1').text(development);
						$('.showhome-address').text(address);
						$('#property').text(property+' - '+description);
						$('#phone').text(phone);
						developmentSlug = urlid;

						$('#arrangeAppointment')
							.attr({
								href: 'http://www.charleschurch.com/'+developmentSlug+'/arrange-appointment?utm_source=Revolution%20Viewing&amp;utm_medium=Virtual%20tour&amp;utm_content=Arrange%20Appointment%20button&amp;utm_campaign=Show%20homes'
							})

						$('#development')
							.attr({
								href: 'http://www.charleschurch.com/'+developmentSlug+'?utm_source=Revolution%20Viewing&amp;utm_medium=Virtual%20tour&amp;utm_content=Development%20name&amp;utm_campaign=Show%20homes',
								target: '_blank',
								title: clientName
							});
						isGenericText = "false";
					}

					$('#clientLogo')
						.attr({
							href: 'http://www.charleschurch.com/'+developmentSlug+'?utm_source=Revolution%20Viewing&amp;utm_medium=Virtual%20tour&amp;utm_content=Logo&amp;utm_campaign=Show%20homes',
							title: clientName
						});

					tourData = {
						'houseCode': coins,
						'dateCreated': dateCreated,
						'brand': clientName,
						'region': region,
						'development': development,
						'showhome': property,
						'url': currentURL,
						'gallery': gallery,
						'type': template,
						'rvtouch': version,
						'generic': isGenericText
					};
				});
			});

			// AJAX CREATE NEW DB ENTRY - SEND TO PROCESS.PHP
			function createNew() {
				$.ajax({
					type: "POST",
					url: "http://virtualtours.charleschurch.com/head-office/show-home-360s/process.php",
					data: 'tourData=' + JSON.stringify(tourData),
					datatype: "html",
					success: function(msg) {

						if (parseInt(msg) != 5) {
							$('#success').html('Successfully added ' + JSON.stringify(tourData) + ' into database.');
							$('#loading').css('visibility', 'hidden');
						} else {
							$('#err').html('Failed to add ' + JSON.stringify(tourData) + ' into database.');
							$('#loading').css('visibility', 'hidden');
						}
					}

				})
			}
		</script>
	</body>
</html>
