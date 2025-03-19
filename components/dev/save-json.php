<?php
/**
 * Builds JSON for the processors.
 *
 * @package rv-floorplan
 */

$str_json    = file_get_contents( 'php://input' );
$parsed_json = json_decode( $str_json );
$valid_json  = json_encode( $parsed_json );
$bytes       = file_put_contents( '../../upload/global.json', $valid_json );
if ( ! $bytes ) {
  echo 'Error';
} else {
  echo 'The number of bytes written are ' . $bytes . '.';
}
