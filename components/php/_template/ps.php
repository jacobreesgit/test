<?php
/////////////////////////////////
//     Project Preview v8      //
// SET UP TOUR PROPERTIES HERE //
/////////////////////////////////
date_default_timezone_set( 'Europe/London' );

//TITLE
$client = '{{CLIENT_NAME}}';
$development = 'Development name';
$buildingName = 'Showhome name';

//VERSION NUMBER
$prototype = false;
$version_number = '2';

//LOCATION OF PAGE BEING EMBEDED (IFRAME SRC)
$src = 'index.html';
// $src = 'index.html?fs=true';

$pageTitle = $client ? $client : '';
if ( $development || $buildingName ) $pageTitle .= ' | ';
if ( $development ) $pageTitle .= $development . ' | ';
if ( $buildingName ) $pageTitle .= $buildingName;

?><!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="robots" content="noindex">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <title> <?php echo $pageTitle; ?></title>
    <meta name="viewport" content="user-scalable=no, width=device-width, initial-scale=1, maximum-scale=1">
    <link href="https://fonts.googleapis.com/css?family=Open+Sans:400,700" rel="stylesheet">
    <link href="css/page-surround.css" rel="stylesheet">
  </head>
  <body>
    <div class="vertical-container">
      <div class="horizontal-container">
      <div class="header">
        <a class="logo-link" href="https://www.revolutionviewing.com/" target="_blank" rel="self" title="Revolution Viewing website">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 517.26 134.79">
            <polygon points="121.8 0 86.14 23.49 50.47 0 50.47 0 40.13 22.79 86.14 54.56 132.14 22.79 121.8 0 121.8 0" fill="#00c496" opacity="0.8"/><polygon points="121.8 0 132.14 22.79 139.05 38.02 86.14 91.42 33.23 38.02 40.13 22.79 50.47 0 50.46 0 17.34 7.05 0 44.6 86.14 134.79 172.27 44.6 154.93 7.05 121.81 0 121.8 0" fill="#00c496"/><path d="M197.57,29.1A1.06,1.06,0,0,1,198.63,28H217a12,12,0,0,1,12.12,12c0,5.11-3.39,9.28-8.23,11.23l7.61,14.11a1,1,0,0,1-.94,1.61h-5.84a1,1,0,0,1-.89-.5l-7.39-14.72H204.8V65.89a1.09,1.09,0,0,1-1.06,1h-5.11a1.06,1.06,0,0,1-1.06-1Zm18.86,16.67a5.66,5.66,0,0,0,5.5-5.67,5.53,5.53,0,0,0-5.5-5.39H204.85V45.77Z" transform="translate(-6.86 -5.07)" fill="#00c496"/><path d="M234.25,29.1A1.06,1.06,0,0,1,235.31,28h22.62A1.05,1.05,0,0,1,259,29.1v4.56a1,1,0,0,1-1.05,1.05H241.48v9.12H255.2a1.09,1.09,0,0,1,1.06,1.05v4.61a1.05,1.05,0,0,1-1.06,1.06H241.48v9.73h16.45a1,1,0,0,1,1.05,1v4.56a1,1,0,0,1-1.05,1H235.31a1.06,1.06,0,0,1-1.06-1Z" transform="translate(-6.86 -5.07)" fill="#00c496"/><path d="M263,29.49A1,1,0,0,1,263.9,28h5.67a1,1,0,0,1,.94.62l8.67,23.89h.39l8.67-23.89a1,1,0,0,1,.95-.62h5.67a1,1,0,0,1,.94,1.45l-15.23,37.4a1,1,0,0,1-.94.61h-.56a1,1,0,0,1-.94-.61Z" transform="translate(-6.86 -5.07)" fill="#00c496"/><path d="M315.06,27.49a20,20,0,1,1-19.95,20.06A20,20,0,0,1,315.06,27.49Zm0,32.79a12.79,12.79,0,1,0-12.73-12.73A12.81,12.81,0,0,0,315.06,60.28Z" transform="translate(-6.86 -5.07)" fill="#00c496"/><path d="M340.19,29.1A1.06,1.06,0,0,1,341.25,28h5.11a1.09,1.09,0,0,1,1.06,1.06V60.28h14.17a1,1,0,0,1,1.05,1v4.56a1,1,0,0,1-1.05,1H341.25a1.06,1.06,0,0,1-1.06-1Z" transform="translate(-6.86 -5.07)" fill="#00c496"/><path d="M365.2,29.1A1.09,1.09,0,0,1,366.26,28h5.28a1.05,1.05,0,0,1,1,1.06V51.83c0,4.72,3.22,8.45,8.06,8.45s8.11-3.73,8.11-8.4V29.1A1.06,1.06,0,0,1,389.82,28h5.28a1.09,1.09,0,0,1,1,1.06V52.22a15.48,15.48,0,0,1-30.95,0Z" transform="translate(-6.86 -5.07)" fill="#00c496"/><path d="M411.33,34.71h-8.51a1,1,0,0,1-1.05-1.05V29.1A1.05,1.05,0,0,1,402.82,28h24.29a1.05,1.05,0,0,1,1.05,1.06v4.56a1,1,0,0,1-1.05,1.05h-8.5V65.89a1.09,1.09,0,0,1-1.06,1h-5.17a1.09,1.09,0,0,1-1.05-1Z" transform="translate(-6.86 -5.07)" fill="#00c496"/><path d="M428,23h5.17A1.06,1.06,0,0,1,434.2,24V60.82a1.06,1.06,0,0,1-1.06,1.06H428a1.05,1.05,0,0,1-1.05-1.05V24A1.06,1.06,0,0,1,428,23Z" fill="#00c496"/><path d="M466.14,27.49a20,20,0,1,1-19.95,20.06A20,20,0,0,1,466.14,27.49Zm0,32.79a12.79,12.79,0,1,0-12.73-12.73A12.81,12.81,0,0,0,466.14,60.28Z" transform="translate(-6.86 -5.07)" fill="#00c496"/><path d="M491.28,28.49a1,1,0,0,1,1.05-1h1.39l23.12,24.56h.06V29.1A1.05,1.05,0,0,1,518,28h5.11a1.09,1.09,0,0,1,1.06,1.06V66.5a1,1,0,0,1-1.06,1h-1.33L498.5,42h-.05v23.9a1.06,1.06,0,0,1-1.06,1h-5.06a1.09,1.09,0,0,1-1.05-1Z" transform="translate(-6.86 -5.07)" fill="#00c496"/><path d="M193.24,76.29a1,1,0,0,1,.95-1.44h5.66a1,1,0,0,1,1,.61l10.67,23.89h.39l10.67-23.89a1,1,0,0,1,.94-.61h5.67a1,1,0,0,1,1,1.44l-17.23,37.4a1,1,0,0,1-1,.61h-.55a1,1,0,0,1-1-.61Z" transform="translate(-6.86 -5.07)" fill="#00c496"/><rect x="227.39" y="69.78" width="7.28" height="38.9" rx="1.06" fill="#00c496"/><path d="M247.15,75.9a1,1,0,0,1,1-1.05h22.62a1.06,1.06,0,0,1,1.06,1.05v4.56a1.06,1.06,0,0,1-1.06,1.06H254.37v9.11H268.1a1.09,1.09,0,0,1,1,1.06V96.3a1,1,0,0,1-1,1H254.37v9.73h16.45a1.06,1.06,0,0,1,1.06,1.06v4.55a1.06,1.06,0,0,1-1.06,1.06H248.2a1.05,1.05,0,0,1-1-1.06Z" transform="translate(-6.86 -5.07)" fill="#00c496"/><path d="M275.91,76.15a1,1,0,0,1,1-1.33h5.29a1.15,1.15,0,0,1,1,.78l9,22.33.39,0,8.09-23a.94.94,0,0,1,1-.69h1.09a.89.89,0,0,1,.94.62l8,23.05h.39l8.95-22.33a1.15,1.15,0,0,1,1-.78h5.34a1,1,0,0,1,1,1.33L313.32,113.5a1.08,1.08,0,0,1-1,.78h-.89a.94.94,0,0,1-.94-.62l-8.21-22.45H302l-8.41,22.42a1.08,1.08,0,0,1-.8.65h-.89a1.09,1.09,0,0,1-.86-.81Z" transform="translate(-6.86 -5.07)" fill="#00c496"/><path d="M326.62,69.78h5.17a1.06,1.06,0,0,1,1.06,1.06v36.79a1.06,1.06,0,0,1-1.06,1.06h-5.17a1.05,1.05,0,0,1-1.05-1.05V70.84A1.06,1.06,0,0,1,326.62,69.78Z" fill="#00c496"/><path d="M345.32,75.29a1,1,0,0,1,1.05-1h1.39l23.12,24.56h.06V75.9A1,1,0,0,1,372,74.85h5.11a1.09,1.09,0,0,1,1.06,1.05v37.4a1,1,0,0,1-1.06,1h-1.33L352.54,88.8h-.05v23.89a1.06,1.06,0,0,1-1.06,1.06h-5.06a1.09,1.09,0,0,1-1.05-1.06Z" transform="translate(-6.86 -5.07)" fill="#00c496"/><path d="M403.24,74.29a21,21,0,0,1,13.56,5.17,1.08,1.08,0,0,1,.06,1.56l-3.45,3.61a1,1,0,0,1-1.44,0A12.68,12.68,0,1,0,403.63,107a17.26,17.26,0,0,0,6.61-1.39v-4.72H405.8a1,1,0,0,1-1.06-1V95.52a1,1,0,0,1,1.06-1.06h10.67a1,1,0,0,1,1,1.06v14.23a1.07,1.07,0,0,1-.45.89,28.07,28.07,0,0,1-13.78,3.61,20,20,0,0,1,0-40Z" transform="translate(-6.86 -5.07)" fill="#00c496"/>
          </svg>
        </a>
        <div class="header-details">
          <h1><?php echo $client; ?></h1>
          <p><?php echo $development ?></p>
          <p><?php echo $buildingName ?></p>
        </div>
      </div>

      <div class="iframe-container">
        <iframe src="<?php echo $src ?>" allowfullscreen></iframe>
      </div>

      <div class="footer">
        <p>&copy; <?php echo date("Y"); ?> Revolution Viewing Ltd.</p>
        <p><a href="https://www.revolutionviewing.com/contact/" target="_blank" rel="self" title="Contact Revolution Viewing">Contact</a></p>
      </div>
    </div>
  </body>
</html>