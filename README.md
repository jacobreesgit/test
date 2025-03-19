# RV - Floorplan Template

This project's goal is to produce template filesets for processors to use to produce individual filesets for showhomes. As we offer that each client gets this in their own brand and price-point but retain consistent functionality, this repository addresses how we can achieve this with minimal costs.

As such, it's not about delivering a final product, but deliver the processors the means to make one. We also use a preview to upload for client services to show.

## 1. Assets

These are the files that are cloned in the creation of a fileset.

### 1.1 client-assets

For each client, they will have some tailored assets. For example, Bloor will have their logo and 360 images here. The folder structure should match that of the end-fileset. e.g. upload/images/gui

### 1.2 client-static

These are assets generic to all clients' upload folder. e.g. VR arrows, and the "click and drag" image.

### 1.3 dev-static

These are assets for the processor (e.g Nick Lavin) to use. In 02-dist, outside of the client folders, there's some files that may be needed for creation of a floorplan, PSDs, etc.

## 2. Components

Generally speaking these are all files that may vary depending on each client config or need handling with SASS etc.

### 2.1 dev (folder)

These are the files used to produce the builder that the processor will use per-client to produce the final filesets. It can read the global.json, edit it, and override it. These files should only be used locally by devs and processors and never uploaded to a webserver.

### 2.2 html (folder)

This contains the index.html file and files that are used to make the start screen.

#### 2.2.1 index.html

Gulp will edit this file, injecting version numbers and GTM container IDs etc.
It also has the power to remove GTM if it's not production mode, as to not get tracking from rv.co.uk previews etc.

#### 2.2.2 templates (folder)

Unless the client config asks for a custom welcome screen, welcome-default.html will be injected into the relavent dev of the index.html file.
Otherwise it will use welcome-{{CLIENT_ID}}.html to inject.
Most just use default

### 2.3 json (folder) / global.json

The global.json file just contains the basic default settings before the config is applied to it.

### 2.4 php (folder)

Unless the client config asks for a custom "page-surround" (ps), _template/ps.php will be added to the fileset so the client can see the fileset utilised as an iframe.
Otherwise it will use {{CLIENT_ID}}/ps.php to show it. Some clients also want this page to be the default, and will rename it to index.php as servers will default to showing this over index.html

### 2.5 sass (folder)

This folder contains generic and client SASS. The CLIENT_ID will be used to apply brand colours over generic styles, and deliver one versioned file.

### 2.6 scripts (folder)

This folder contains JS used to make the tour. These are compiled into just 3 types of JS files in the build. Animations, Utilities, Scripts.

#### 2.6.1 Animations

Currently this ammounts to packaging the Greensock files used into on animations.js file.

#### 2.6.2 Utilities

This is basically just KRP scripts, and jQuery.

#### 2.6.3 Scripts (rv.floorplan.js)

This is our main JS files. Important functional config is injected into this. It reads the global.json to replace text, set client-specific settings such as Auto-rotate, classic mode, gallery, etc.

### 2.7 xml (folder)
This is primarily just for the handling of the KRPano xml files. As we want to inject version number, it's handled here instead of as a generic asset.

## 3. Builds

package.json scripts. On windows, use the win: prefixed scripts.

### 3.1 clearsingle / win:clearsingle

Clears the set SINGLE_ID

### 3.2 dev / win:dev

Runs the build in dev mode. Only one client for faster reponses. Choose which client by setting SINGLE_ID in the enviroment using a CLIENT_ID. Default is generic (RV)

When NODE_ENV is in development, the build will output a single (generic, by default) here with dev and upload. Which single client it is can be set with SINGLE_ID. See client-data.json for client IDs.

Outputs to 00-dev. Access this on your local dev server.

### 3.3 preview / win:preview

Runs the build in preview mode. This means it will output just the "upload" folder to 01-preview to be uploaded to rv.co.uk, under a versioned folder.

### 3.4 prod / win:prod

This runs the build in production mode, used to be copied to the internal RV server for a processor to use. The output folder is 02-dist and includes dev and upload folders per client as well as a 00-assets folder for versioned assets for the processor.

## 4. Delivery

First of all, make sure you're updating the version number in `gulpfile.js`, if only by a bugfix, before running your build for preview and production. IF you've not made a functionality change, but just added a new client, you don't need to bump the version number, and only copy the relevant client folder in the below instructions.

### 4.1 Preview delivery

1. Run the preview build
2. Once finished, upload the contents of `01-preview` to `www.revolutionviewing.co.uk/examples/floorplan/v{{FULL_VERSION_NUMBER}}/`. Get the credentials from the password manager, or Andy Walker.
3. Taking the above link, go to `rv333.com/admin` login in with credentials from the password manager. Update the entry for `floorplan-latest` to the new version folder. Client Services use `rv333.com/floorplan-latest` to see the latest version of the template.

### 4.2 Production delivery

1. Run the production build
2. Once finished, copy the contents of `02-dist` to `W:\webfiles\rv-touch\clients\floorplan-v{{FULL_VERSION_NUMBER}}`.

### 4.3 Inform Client Services and Nick Lavin

Inform the relevant parties of the new version with preview and server locations.

## 5. Adding a new client

From time-to-time, client services may want a new client template making. Before you can start, I would ask for the following:

- Any special fonts as woff and woff2 format. If a Google Font this isn't necessary. If fonts aren't provided, I would find a suitable font similar to their website usage on Google Fonts.
- The logo as a vector (EPS or SVG) or a good-quality PNG.
- The website URL / and brand guidelines / preferred colour usage.

### 5.1 client-data.json

First you'll want to set up the config so any script will know to build it. I would copy another common one, such as Bellway's. I recommend familiarising yourself with how each client object has variances in settings such as auto-roatate and gallery.

Settings to update:

1. id / name - Update these, id is used as the CLIENT_ID for folder names, etc. Name can be more formal.

2. client_embed_width - This is if the client intends to embed this on their website smaller than we recommend (1100px). You should be informed, this is injected into important parts to ensure this happends. Otherwise leave this as `1100`.

3. gtm_code - The GTM container ID. We set up individual tracking for each client with a UA property too. Since GA4, it is with Jonny Harper to update this process and inform you. **NOTE: It's better to leave blank. DO NOT USE ANOTHER CLIENT'S GTM CODE as we can't undo this.**

4. index_php - Only change this if you've been told to. Some clients such as Charles Church and Persimmon Homes use a custom page-surround. If `custom` is true, it tells the build to look for a file. **See 2.4**. If you'd like to show the page-surround by default, as some do, you can set the filename to `index`. Most servers will read `index.php` before `index.html`.

5. index_html - These settings pertain to the `index.html` file. You can inject code into the head, such as Google Fonts, etc. `client_logo_name` - Override the default client logo filename. Used for if it's a different file format etc. `forwarder_btn_text` - If the your is too small when embedded in an iframe on the clients' website, a button appears to open the tour in a new tab. You can override what the button text says with this.

6. welcome_html - Bearing in mind that this project creates **templates**, you can set the structure of the text used on the welcome screen. You can see in `rv.floorplan.js` what element classes are targeted to replace text. You can add a class name such as `showhome-desc` to replace the description of the home. A Processor will set what this is in their builder. For example the template may say "4 bedroom home" but the processor is building a 2-bed home. They have a description field to override the template.

7. global_json - These are the client defaults. Consult with the processor (likely Nick Lavin) to ask what defaults to use here. I recommend mimicing what the `generic` client uses here. KRPano in drag mode, no auto-roate, and VR enabled. Gallery may be needed. As the tour hasn't been created yet, and templates are usually made before shoots, I recommend copying the `floors`, `tours`, and `content` data from another client. Ensure you also copy the assets to a CLIENT_ID-matching folder in `client-assets`. See below for more info

### 5.2 client-assets (folder)
Using the CLIENT_ID, create a folder an name it as such. I actually would recommend copying the `generic` one. The main thing to replace is the `client-logo.jpg`. As we're trying to move across to using equis on here, `generic` uses 2 images per-360. For example, `1_preview.jpg` is a compressed image produced by the processor to make a quickly-loaded image to show before loading the full 360 (named `1.jpg`). You may need to work with cubefaces, the structure for this is with subfolders. Each 360 will be made into 7 images, preview and then a directional `smallscreen_X.jpg` where `X` is directional. You shouldn't need to know these, but just as an explanation as to how this differs from equis.

### 5.3 components/sass/clients/_{{CLIENT_ID}}-main.scss

In the `components/sass/clients` folder, you need to create a SCSS file that the build will look for to brand the tour to this client. Again, I recommend copying `generic` and renaming it. This part is a little more creatinve. Basically replace the colours to use the clients' brand. It will take some  trial and error. The main things to look out fore are hover states, hotspots, the camera icons, and make sure you check mobile and to import your client's font(s).

## Cal's parting notes.
> Before I left I hoped to replace the gallery functionality away from juicebox, as it's a pain. jQuery was taking too long to dig out, so I was forced to used it for now. We are now in a better position to move away from KRPano in other sectors, but the HB clients like VR so we need to use KRPano until a suitable alternative pops-up.

> I know I won't be on payroll, but if you ever get stuck with this, give me an email (I'll make sure you all get my personal email), and I'll help you as soon as I can.