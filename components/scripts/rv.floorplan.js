/* VERSION_HEADER */
(function (rv, $, TweenLite) {
  //Private Property
  const env = '{{ENVIRONMENT}}';
  const clientEmbedWidth = parseInt(`{{CLIENT_EMBED_WIDTH}}`);
  rv.text = {};
  rv.settings = {};
  rv.floorData = [];
  rv.tourData = [];
  rv.contentData = [];
  const GAD = 0.4;
  const MOBILE_BP = 767;
  const $container = $('#container');
  const $editorContainer = elById('editor-container');
  const $editorPositionH = elById('editor-position-h');
  const $editorPositionV = elById('editor-position-v');
  const $floorplanWrapper = $('#floorplan-wrapper');
  const $floorplanSwitchContainer = $('#floorplan-switch-container');
  const $floorplans = $('#floorplans');
  const $floorplanCloseBtn = $('#floorplan-close-btn');
  const $floorplanOpenBtn = $('#floorplan-open-btn');
  const $helpScreen = $('#help-screen');
  const $forwarderScreen = $('#forwarder');
  // Buttons
  const $fsToggle = elById('button-fs');
  const $fsClose = elById('fs-close');
  const $zoomIn = elById('button-zoomin');
  const $zoomOut = elById('button-zoomout');
  const $autoRotate = elById('button-auto');
  const $helpOpen = elById('button-help');
  const $motionToggle = elById('button-motion');
  const $vrEnable = elById('button-vr');
  const $galleryToggle = elById('button-gallery');
  // VR
  const vrButtonNames = ['prev', 'next'];
  const vrBtnFollowSpeed = 0.1;
  const $vrBtns = [];

  let currentFovOffset = 0;
  let arManuallyDisabled = false;
  const winDim = {
    width: windowWidth(),
    height: windowHeight(),
  };
  const openModals = {
    help: false,
    contentspot: false,
  };
  const hsWidth = 60;
  // iframe forarder vars
  const isInIframe = inIframe();
  const iframeCleared = getParameterByName('fs') !== '';

  // Public
  rv.contentLoaded = {
    krpano: false,
    gui: false,
  };
  rv.krpano = false;
  rv.krpDevice = false;
  rv.activeFloorIndex = false;
  rv.activeTourObj = null;
  rv.navShown = false;
  rv.smallScreen = false;
  rv.contentspotName = false;
  rv.guiHiddenByWindowWidth = false;

  // Forwarder required
  const forwarderWidthBreakpoint =
    clientEmbedWidth <= MOBILE_BP ? clientEmbedWidth - 1 : MOBILE_BP;
  const forwarderHeightBreakpoint = forwarderWidthBreakpoint * 0.625;
  const tooThin = winDim.width <= forwarderWidthBreakpoint;
  const tooShort = winDim.height <= forwarderHeightBreakpoint;
  const forwarderRequired =
    (tooThin || tooShort) && isInIframe && !iframeCleared;

  // Start
  rv.start = () => {
    // Fetch data
    $.getJSON(`./global.json`, function (data) {
      const { text, settings, floors, tours, content } = data;
      rv.settings = settings || {};
      rv.text = text || {};
      rv.floorData = floors || {};
      rv.tourData = tours || [];
      rv.contentData = content || [];

      // Update page text
      updateText();

      if (forwarderRequired) {
        return;
      }

      // Once data is fetched, time to build the navigation
      buildNavigation();
    });

    // Forwarder doesn't require panorama, shows "click to launch in new tab" deal.
    if (forwarderRequired) {
      TweenLite.set('#forwarder', { autoAlpha: 1 });
      return;
    } else {
      $forwarderScreen.remove();
    }

    // Start KRPano
    embedpano({
      xml: 'xml/krpano.xml',
      id: 'krpanorv',
      target: 'pano',
      consolelog: env === 'development',
      mobilescale: 1.0,
      onready: krpReady,
    });
  };

  // Build
  function buildNavigation() {
    // Launch juicebox gallery, if required
    const { gallery, stillsNumber = 12 } = rv.settings;
    if (gallery) {
      juicebox({
        containerId: `gallery`,
        configUrl: `xml/tour-gallery/${stillsNumber}.xml`,
        galleryWidth: `100%`,
        galleryHeight: `100%`,
        backgroundColor: `#222222`,
      });
    }

    // Create GUI elements
    createGui();

    // === Editor ===
    if ($editorPositionH) {
      $editorPositionH.addEventListener('click', () => {
        $editorPositionH.select();
        $editorPositionH.setSelectionRange(0, 99999);
        document.execCommand('copy');
      });
    }
    if ($editorPositionV) {
      $editorPositionV.addEventListener('click', () => {
        $editorPositionV.select();
        $editorPositionV.setSelectionRange(0, 99999);
        document.execCommand('copy');
      });
    }

    // Window listeners
    window.addEventListener('keyup', windowKeyUpHandler);
    window.addEventListener('resize', resizeHandler);
    window.addEventListener('webkitfullscreenchange', fsChange);
    window.addEventListener('mozfullscreenchange', fsChange);
    window.addEventListener('fullscreenchange', fsChange);
    window.addEventListener('MSFullscreenChange', fsChange);

    resizeHandler();
    gtmClicks();

    loadingDone('gui');
  }

  function updateText() {
    const { clientName, title, property, description, address, phone, cta } =
      rv.text;

    // If there is a title, update document title
    const doctitle =
      title || (property ? `${property} | ${clientName}` : clientName);
    document.title = doctitle;

    // Text population of UI
    if (property) $('.showhome-name').text(property);
    if (description) $('.showhome-desc').text(description);
    if (address) $('.showhome-address').text(address);
    if (phone) {
      $('.showhome-phone')
        .attr({
          href: `tel:${phone}`,
          title: `${clientName} Telephone`,
        })
        .text(phone);
    }
    const [ctaUrl, ctaText] = cta || [];
    if (ctaUrl && ctaText) {
      $('.showhome-cta')
        .attr({
          href: ctaUrl,
          title: ctaText,
        })
        .text(ctaText);
    }
  }

  function createGui() {
    const {
      classic,
      startScreen = true,
      autoR = false,
      gallery = false,
    } = rv.settings;

    // Welcome screen
    if (startScreen) {
      $('#welcome-container #start-tour').click(removeWelcome);
    } else {
      $('#welcome-container').remove();
    }

    // Help
    if (classic) {
      $helpScreen.addClass('is-classic');
      $helpScreen.find('#col-fs').remove();
    }

    // Fullscreen - Toggle / Close
    if (classic) {
      $fsToggle.parentNode.removeChild($fsToggle);
      $fsClose.parentNode.removeChild($fsClose);
    } else {
      $fsToggle.addEventListener('click', () => fsAction());
      $fsClose.addEventListener('click', () => fsAction(true));
    }

    // Zoom - in
    $zoomIn.addEventListener('mousedown', () =>
      rv.krpano.call(`set(fov_moveforce, -0.2);`),
    );
    $zoomIn.addEventListener('mouseup', () =>
      rv.krpano.call(`set(fov_moveforce, 0);`),
    );
    $zoomIn.addEventListener('mouseout', () =>
      rv.krpano.call(`set(fov_moveforce, 0);`),
    );

    // Zoom - out
    $zoomOut.addEventListener('mousedown', () =>
      rv.krpano.call(`set(fov_moveforce, +0.2);`),
    );
    $zoomOut.addEventListener('mouseup', () =>
      rv.krpano.call(`set(fov_moveforce, 0);`),
    );
    $zoomOut.addEventListener('mouseout', () =>
      rv.krpano.call(`set(fov_moveforce, 0);`),
    );

    // Auto-rotate
    if (autoR) {
      $autoRotate.addEventListener('click', () => {
        $autoRotate.classList.contains('enabled')
          ? disableAutoRotate(true)
          : enableAutoRotate(true);
      });
    } else {
      $autoRotate.parentNode.removeChild($autoRotate);
    }

    // Help Screen
    $helpOpen.addEventListener('click', showHelp);
    $helpScreen.click(hideHelp);

    // Motion Control & VR
    if (!classic && !rv.krpDevice.desktop) {
      $motionToggle.addEventListener('click', () => {
        if ($motionToggle.classList.contains('enabled')) {
          disableMotionControl();
        } else {
          enableMotionControl();
        }
      });
      $vrEnable.addEventListener('click', () => {
        rv.krpano.call('WebVR.enterVR();');
      });
    } else {
      $motionToggle.parentNode.removeChild($motionToggle);
      $vrEnable.parentNode.removeChild($vrEnable);
    }

    // Gallery
    if (gallery) {
      $galleryToggle.addEventListener('click', () => {
        $galleryToggle.classList.contains('galleryOpen')
          ? hideGallery()
          : showGallery();
        $galleryToggle.classList.toggle('galleryOpen');
      });
    } else {
      $galleryToggle.parentNode.removeChild($galleryToggle);
    }

    // Infospot
    $('#info-close, #info-spot').click(closeContentspot);
    $('#info-inner').click(function (e) {
      e.stopPropagation();
    });

    // Create Floorplan
    createFloorplan();
  }

  function createFloorplan() {
    const { floorplanText } = rv.text;
    const { show, hide } = floorplanText || {};

    // Show/Hide text setup
    if (hide) {
      $floorplanCloseBtn.find('.text').text(hide);
      $floorplanCloseBtn.addClass('inline');
    } else {
      $floorplanCloseBtn.find('.text').remove();
      $floorplanCloseBtn.addClass('floating');
    }

    if (show) {
      $floorplanOpenBtn.find('.text').text(show);
    } else {
      $floorplanOpenBtn.find('.text').remove();
    }

    $floorplanCloseBtn.click(function (e) {
      e.preventDefault();
      const callback =
        winDim.width > MOBILE_BP ? slideoutDesktopClose : slideoutDeviceClose;
      callback();
    });

    $floorplanOpenBtn.click(function (e) {
      e.preventDefault();
      $(this).find('.notification-dot').remove();
      const callback =
        winDim.width > MOBILE_BP ? slideoutDesktopOpen : slideoutDeviceOpen;
      callback();
    });

    // Add notification dot
    $('<div>').addClass('notification-dot').appendTo($floorplanOpenBtn);

    const $legendWrapper = $('<div>')
      .addClass('mobile-legend-wrapper')
      .appendTo($floorplans);

    // Create the actual legend container (scrollable)
    const $legendContainer = $('<div>')
      .addClass('mobile-legend')
      .css('display', 'none')
      .appendTo($legendWrapper);

    // Create the fade effect
    const $legendFade = $('<div>')
      .addClass('mobile-legend-fade')
      .appendTo($legendWrapper);

    function checkLegendScroll() {
  const scrollable = $legendContainer[0].scrollHeight > $legendContainer[0].clientHeight;
  
  if (scrollable) {
    $legendFade.show();
  } else {
    $legendFade.hide();
  }
}

// Run on load and after content updates
$legendContainer.on('scroll', function () {
  checkLegendScroll();
});

// Also check on content load
$(document).ready(function () {
  checkLegendScroll();
});

    // Set default active floor index if not set
    if (typeof rv.activeFloorIndex === 'undefined' && rv.floorData.length > 0) {
      rv.activeFloorIndex = 0; // Set to first floor if not defined
    }

    // Function to update floor visibility
    function updateFloorVisibility(activeIndex = 0) {
      $('.floorplan').hide();
      $(`#floorplan-${activeIndex}`).show();

      $('.legend-floor-section').hide();
      $(`#legend-floor-${activeIndex}`).show();
    }

    // Floorplans
    rv.floorData.forEach((floorObj, i1) => {
      const { label, tours = [] } = floorObj || {};

      const $floorplan = $('<div>')
        .attr({
          id: `floorplan-${i1}`,
          class: 'floorplan',
        })
        .css(
          'background-image',
          `url('./images/floorplans/floorplan-${i1}.png')`,
        );

      const $floorSection = $('<div>')
        .attr({
          id: `legend-floor-${i1}`,
          class: 'legend-floor-section',
        })
        .appendTo($legendContainer);

      $('<h3>')
        .addClass('legend-floor-title')
        .text(label)
        .appendTo($floorSection);

      const $fpSwitchText = $('<span>').addClass('text').text(label);

      // Add active state to initial floor button
      const buttonClasses = [
        'button',
        'fp-switch',
        'gtm-floor-click',
        'gtm-button-switch-floor',
      ];
      if (i1 === rv.activeFloorIndex) {
        buttonClasses.push('active');
      }

      $('<button>')
        .attr({
          id: `floor-switch-${i1}`,
          class: buttonClasses.join(' '),
          'data-floor-index': i1,
        })
        .append($fpSwitchText)
        .click(function (e) {
          const floorIndex = parseInt(this.dataset.floorIndex);
          if (rv.activeFloorIndex === floorIndex) {
            return;
          }
          // Update active button state
          $('.fp-switch').removeClass('active');
          $(this).addClass('active');

          const floorObj = rv.floorData[floorIndex];
          const { tours = [] } = floorObj || {};
          const firstTourObj = tours.find(Boolean);

          updateFloorVisibility(floorIndex);
          rv.goToTour(floorIndex, firstTourObj.tour_id);
            checkLegendScroll();

        })
        .prependTo($floorplanSwitchContainer);

      let stopCounter = 0;

      tours.forEach((floorTourObj) => {
        stopCounter = stopCounter + 1;
        const { tour_id, camera } = floorTourObj || {};
        const tourObj = rv.tourData.find(({ id }) => id === tour_id) || {};
        const [x, y] = camera || [];

        const $cameraBtn = $('<button>').attr({
          id: `camera-icon-${tour_id}`,
          class:
            'camera-icon gtm-camera-click gtm-button-switch-camera fa-regular fa-circle-video',
          'data-floor-index': i1,
          'data-tour-id': tour_id,
          'data-stop-number': stopCounter,
          style: `left: ${x}%; top: ${y}%;`,
        });

        $('<span>')
          .addClass('camera-number')
          .text(`${stopCounter}  `)
          .appendTo($cameraBtn);

        const $legendEntry = $('<div>')
          .addClass('legend-entry')
          .appendTo($floorSection);

        $('<span>')
          .addClass('legend-number')
          .text(stopCounter)
          .css('margin-right', '8px')
          .appendTo($legendEntry);

        $('<span>')
          .addClass('legend-title')
          .text(tourObj.heading)
          .appendTo($legendEntry);
        const floorIndex = i1;
        const tourId = tour_id;

        updateFloorVisibility();

        $cameraBtn
          .click(function (e) {
            const tourId = parseInt(this.dataset.tourId);
            if (rv.activeTourObj.id === tourId) {
              return;
            }
            rv.goToTour(rv.activeFloorIndex, tourId);

            if (winDim.width <= MOBILE_BP) {
              slideoutDeviceClose();
            }
          })
          .hover(
            () => {
              TweenLite.to(`#camera-label-${floorIndex}-${tourId}`, GAD * 0.5, {
                autoAlpha: 1,
              });
            },
            () => {
              TweenLite.to(
                `#camera-label-${floorIndex}-${tourId}`,
                GAD * 0.25,
                {
                  autoAlpha: 0,
                },
              );
            },
          )
          .appendTo($floorplan);

        const $panoLabel = $('<span>')
          .attr({
            id: `camera-label-${i1}-${tour_id}`,
            class: 'camera-label',
            style: `left: ${x}%; top: ${y}%;`,
          })
          .text(tourObj.heading)
          .append($('<span class="label-after">'))
          .appendTo($floorplan);
      });

      $floorplans.append($floorplan);
    });

    // Show/hide legend based on screen size
    $(window).on('resize', function () {
      if (winDim.width <= MOBILE_BP) {
        $legendContainer.show();
      } else {
        $legendContainer.hide();
      }
    });

    // Trigger initial resize
    $(window).trigger('resize');

    if (rv.floorData.length < 2) {
      $floorplanSwitchContainer.remove();
    }
  }

  function krpReady(krpanoInterface) {
    if (!krpanoInterface) {
      return;
    }
    rv.krpano = krpanoInterface;
    rv.krpDevice = krpanoInterface.get('device');
    loadingDone('krpano');
  }

  function loadingDone(key) {
    rv.contentLoaded[key] = true;
    const { krpano, gui } = rv.contentLoaded || {};
    if (!(krpano && gui)) {
      return;
    }
    const { startFloor, startTour, startScreen } = rv.settings;
    const krpCall = [];

    // Mouse mode
    const krpanoMouseMode = /Mobi|Android|iPhone|iPad|iPod/i.test(
      navigator.userAgent,
    )
      ? 'drag'
      : rv.settings.krpanoMousMode;
    krpCall.push(
      `set(control.mousetype, ${krpanoMouseMode});set(control.touchtype, ${krpanoMouseMode});`,
    );

    // Start
    if (startScreen) {
      $container.addClass('welcome-active');
      rv.welcomeOpen = true;
    } else {
      showGui();
      krpCall.push('clickdrag_run();');
    }

    rv.krpano.call(krpCall.join(''));
    rv.goToTour(startFloor, startTour);
  }

  rv.loadpano = function (tourObj) {
    if (!tourObj) {
      return;
    }
    const { classic, fov, panoType } = rv.settings;
    const isEqui = panoType === 'equi';
    const { lookat } = tourObj;
    const { start, limit } = lookat || {};
    const [startAth = 0, startAtv = 0] = start || {};
    const { h = [], v = [] } = limit || {};
    const startFov = rv.krpDevice.desktop ? fov || 72 : 95;
    // Start KRP
    const krpCall = [];
    const viewXml = `<view
			fov="${startFov}"
			fovmin="35"
			fovmax="95"
			hlookat="${startAth}"
			vlookat="${startAtv}"
			hlookatmin="${h[0] || 0}"
			hlookatmax="${h[1] || 360}"
			vlookatmin="${classic ? 0 : v[0] || -90}"
			vlookatmax="${classic ? 0 : v[1] || 90}"
			limitview="lookat"
			fisheye="0"
		/>`;
    const previewPath = isEqui
      ? `./images/vts/${tourObj.id}_preview.jpg`
      : `./images/vts/${tourObj.id}/preview.jpg`;
    const panoPath = isEqui
      ? `./images/vts/${tourObj.id}.jpg`
      : `./images/vts/${tourObj.id}/smallscreen_%s.jpg`;
    const panoXml = isEqui
      ? `<sphere url="${panoPath}"/>`
      : `<cube url="${panoPath}"/>`;
    const krpScene = `<krpano>${viewXml}<preview url="${previewPath}"/><image>${panoXml}</image></krpano>`;

    // Piece together
    krpCall.push(
      `loadxml('${escape(krpScene)}', null, MERGE, BLEND(${GAD}, linear));`,
    );
    krpCall.push('glassMeterAppear();');
    krpCall.push(getHotspotBuilder(tourObj));
    rv.krpano.call(krpCall.join(''));
    rv.activeTourObj = tourObj;

    if (rv.navShown) {
      setTimeout(showFirstPinHotspot, 500);
    }
  };

  // Slideout Functionality
  function slideoutDesktopClose() {
    TweenLite.to($floorplanWrapper, GAD, {
      x: '-100%',
      y: '-50%',
      autoAlpha: 0,
      onComplete: () => {
        $floorplanWrapper.removeClass('open');
      },
    });
    TweenLite.to($floorplanOpenBtn, GAD, { x: '-50%' });
  }

  function slideoutDesktopOpen(first) {
    if (first) {
      TweenLite.set($floorplanOpenBtn, { x: '-100%' });
      TweenLite.fromTo(
        $floorplanWrapper,
        GAD,
        {
          x: '-100%',
          y: '-50%',
          autoAlpha: 0,
        },
        {
          x: '0%',
          y: '-50%',
          autoAlpha: 1,
        },
      );
      TweenLite.to($floorplanSwitchContainer, GAD / 3, {
        opacity: 1,
        x: '0%',
      });
    } else {
      TweenLite.to($floorplanOpenBtn, GAD, { x: '-100%' });
      TweenLite.to($floorplanWrapper, GAD, {
        x: '0%',
        autoAlpha: 1,
        onComplete: function () {
          TweenLite.to($floorplanSwitchContainer, GAD / 3, {
            opacity: 1,
            x: '0%',
          });
        },
      });
    }

    $floorplanWrapper.addClass('open');
  }

  function slideoutDeviceClose() {
    TweenLite.to($floorplanWrapper, GAD, {
      autoAlpha: 0,
      onComplete: function () {
        $floorplanWrapper.removeClass('open');
      },
    });
    TweenLite.to($floorplanOpenBtn, GAD, { x: '-50%' });
  }

  function slideoutDeviceOpen() {
    $floorplanWrapper.addClass('open');
    TweenLite.to($floorplanOpenBtn, GAD, { x: '-100%' });
    TweenLite.to($floorplanWrapper, GAD, { autoAlpha: 1 });
  }

  function switchFloor(floorIndex) {
    $('.fp-switch').removeClass('active').attr('tabindex', null);
    $(`#floor-switch-${floorIndex}`).addClass('active').attr('tabindex', -1);
    $('.floorplan').removeClass('show');
    $(`#floorplan-${floorIndex}`).addClass('show');
    rv.activeFloorIndex = floorIndex;
  }

  // GUI
  function showGui() {
    const showDesktopControls = winDim.width > MOBILE_BP;
    if (rv.navShown) {
      return;
    }
    TweenLite.to($floorplanOpenBtn, GAD, { autoAlpha: 1 });
    TweenLite.fromTo(
      $galleryToggle,
      GAD,
      { y: '100%', autoAlpha: 0 },
      { y: '0%', autoAlpha: 1 },
    );
    TweenLite.fromTo(
      '#room-title',
      GAD,
      { y: '-100%', autoAlpha: 0 },
      { y: '0%', autoAlpha: 1 },
    );
    TweenLite.fromTo(
      '#mobile-gui-container',
      GAD,
      { y: '100%', autoAlpha: 0 },
      { y: '0%', autoAlpha: 1 },
    );
    if (showDesktopControls) {
      slideoutDesktopOpen(true);
      TweenLite.fromTo(
        '#desktop-gui-container',
        GAD,
        { y: '100%', autoAlpha: 0 },
        { y: '0%', autoAlpha: 1 },
      );
      enableAutoRotate();
    } else {
      disableAutoRotate();
    }
    rv.krpano.call('clickdrag_run();');
    setTimeout(showFirstPinHotspot, 1000);
    // Add VR hotspots
    buildVirtualRealityButtons();
    rv.navShown = true;
  }

  rv.viewchangeHandler = () => {
    const view = rv.krpano.get('view') || {};
    const { hlookat, vlookat } = view;
    const cleanAth = normalAth(hlookat);
    const cleanAtv = normalAtv(vlookat);
    // Update FOV radar
    const fovRotation = normalAth(hlookat - currentFovOffset - 135);
    TweenLite.set('#fov-radar', { rotationZ: fovRotation });
    // Editor
    const editorEnabled = isDataOpen($editorContainer);
    if (editorEnabled) {
      if ($editorPositionH) {
        $editorPositionH.value = cleanAth;
      }
      if ($editorPositionV) {
        $editorPositionV.value = cleanAtv;
      }
    }
  };

  rv.goToTour = function (floorIndex, tourId) {
    const floorObj = rv.floorData[floorIndex];
    const tourObj = fiaId(rv.tourData, tourId);
    if (!(floorObj && tourObj)) {
      return;
    }
    const { id, lookat } = tourObj;
    const floorTourObj = floorObj.tours.find(({ tour_id }) => tour_id === id);
    // Set Camera north-offset
    const { start } = lookat || {};
    const [h, v, n] = start || [];
    currentFovOffset = n || 0;
    // Update Camera View
    const { camera } = floorTourObj || {};
    const [x, y] = camera || {};
    TweenLite.set('#fov-radar', { left: `${x}%`, top: `${y}%` });
    $('.camera-icon').removeClass('active').attr('tabindex', null);
    $(`#camera-icon-${tourId}`).addClass('active visited').attr('tabindex', -1);
    // Update text
    $('#room-title').text(tourObj.heading);
    // Load Pano
    rv.loadpano(tourObj);
    // Update Floorplan
    switchFloor(floorIndex);
  };

  function showFirstPinHotspot() {
    // Get hotspots
    const { hotspots } = rv.activeTourObj || {};
    const allHotspots = hotspots || [];
    // Get first pin hotspot
    const firstPinObj = allHotspots.find(
      ({ tour_id, content_id }) => !tour_id && !content_id,
    );
    if (!firstPinObj) {
      return;
    }
    const firstPinIndex = allHotspots.indexOf(firstPinObj);
    const tourId = rv.activeTourObj.id;
    // Get KRP element
    const hsName = `hotspotPin-${tourId}-${firstPinIndex}`;
    const $sprite = getSprite(hsName);
    if (!($sprite && $sprite[0])) {
      return;
    }
    const $hs = $sprite[0].querySelector('.pin-hotspot');
    const $tooltip = $hs.querySelector('.tooltip');
    if (!$tooltip) {
      return;
    }
    showTooltip($tooltip);
  }

  // HOTSPOT functions
  function getHotspotBuilder(tourObj) {
    const { id, hotspots = [] } = tourObj;
    return hotspots
      .map((hsObj, i1) => {
        const { tour_id, content_id } = hsObj;
        return tour_id || content_id
          ? getHotspot(hsObj)
          : getPin(hsObj, id, i1);
      })
      .join('');
  }

  function getHotspotRemover(tourObj) {
    const { id, hotspots = [] } = tourObj;
    return hotspots
      .map((hsObj, i1) => {
        const { tour_id, content_id } = hsObj;
        const hsName =
          tour_id || content_id
            ? `hotspot${tour_id ? 'Tour' : 'Content'}${tour_id || content_id}`
            : `hotspotPin-${id}-${i1}`;
        return `removehotspot(${hsName});`;
      })
      .join('');
  }

  function getHotspot(hsObj) {
    const { tour_id, content_id, text = '', at } = hsObj;
    // Navspot
    const floorObj = rv.floorData
      .map((floorObj, i1) => {
        floorObj.index = i1;
        return floorObj;
      })
      .find(({ tours }) =>
        tours.find((floorTourObj) => floorTourObj.tour_id === tour_id),
      );
    // Tour object
    const tourObj = fiaId(rv.tourData, tour_id);
    const tourFail = tour_id && !tourObj;
    // Content object
    const contentObj = fiaId(rv.contentData, content_id);
    const contentFail = content_id && !contentObj;
    if (tourFail || contentFail) {
      return '';
    }
    const { id, type = 'nav', heading } = contentObj || tourObj || {};
    const isNav = type === 'nav';
    const [ath = 0, atv = 0, rotate = 0] = at || [];
    const hsName = `hotspot${isNav ? 'Tour' : 'Content'}${isNav ? tourObj.id : id}`;
    const iconStyles = rotate
      ? `webkit-transform: rotate(${rotate}deg); transform: rotate(${rotate}deg)`
      : '';
    const iconClasses = {
      nav: 'fa-regular fa-angle-up',
      article: 'fa-regular fa-info',
      gallery: 'fa-regular fa-images',
      video: 'fa-brands fa-youtube',
    };
    const icon = `<span class="icon mainIcon ${iconClasses[type]}" style="${iconStyles}"></span>`;
    const tooltip = `<span class="tooltip">${text || heading}</span>`;
    const html =
      `<div class="hotspot noKeep ${type}-rv ${isNav ? 'gtm-navspot-click' : ''}" data-hsname="${hsName}">${icon}${tooltip}</div>`
        .replace('[', '[[')
        .replace(']', ']]');
    const onClick = isNav
      ? `rv.navspotClick(${floorObj.index}, ${tour_id}, ${hsName})`
      : `rv.onContentspotClick(${content_id}, ${hsName})`;
    // Return
    return `
		addhotspot(${hsName});
		set(hotspot[${hsName}].ath, ${ath});
		set(hotspot[${hsName}].atv, ${atv});
		set(hotspot[${hsName}].type, text);
		set(hotspot[${hsName}].html, ${html});
		set(hotspot[${hsName}].padding, 0);
		set(hotspot[${hsName}].wordwrap, false);
		set(hotspot[${hsName}].interactivecontent, true);
		set(hotspot[${hsName}].zoom, false);
		set(hotspot[${hsName}].bg, false);
		set(hotspot[${hsName}].renderer, css3d);
		set(hotspot[${hsName}].onclick, looktohotspot(get(name), get(view.fov)); js(${onClick}); );
		set(hotspot[${hsName}].onloaded, js(rv.onHotspotLoaded('${hsName}')); );
		`;
  }

  rv.onHotspotLoaded = function (hsName) {
    const $sprite = getSprite(hsName);
    if (!$sprite) {
      return;
    }

    $sprite.addClass('krpanoHotspot');
    // Why oh why to we have to wait to get the element...
    setTimeout(() => {
      const $hs = $sprite.find('.hotspot');
      if (!$hs) {
        return;
      }

      // if (localStorage.getItem(hsName)) {
      //   $hs.addClass('clicked');
      // }

      $hs.on('mouseenter', () => {
        $hs.addClass('hover');
        TweenLite.to($hs.find('.icon'), GAD, { autoAlpha: 0 });

        TweenLite.set($hs, { width: 'auto' });
        TweenLite.from($hs, GAD, { width: hsWidth });
        TweenLite.to($hs.find('.tooltip'), GAD, { autoAlpha: 1 });
      });

      $hs.on('mouseleave', () => {
        $hs.removeClass('hover');
        TweenLite.to($hs.find('.icon'), GAD, { autoAlpha: 1 });
        TweenLite.to($hs, GAD, { width: hsWidth });
        TweenLite.to($hs.find('.tooltip'), GAD, { autoAlpha: 0 });
      });
    }, 50);
  };

  function getPin(hsObj, tourId, id) {
    const { heading, text, direction, at } = hsObj || {};
    const [ath = 0, atv = 0] = at || [];
    const tooltipDirection = direction || 'left';
    const hsName = `hotspotPin-${tourId}-${id}`;
    const $text = text ? parseHotspotText(text).prop('outerHTML') : '';
    const tooltip = `<div class="tooltip ${tooltipDirection}"><div class="inner main-copy"><h2>${heading}</h2>${$text}</div></div>`;
    const html =
      `<div class="pin-hotspot" tabindex="0" aria-label="${heading}">${tooltip}</div>`
        .replace(/\[/g, '[[')
        .replace(/\]/g, ']]');

    return `
		addhotspot(${hsName});
		set(hotspot[${hsName}].ath, ${ath});
		set(hotspot[${hsName}].atv, ${atv});
		set(hotspot[${hsName}].type, text);
		set(hotspot[${hsName}].html, ${html});
		set(hotspot[${hsName}].padding, 0);
		set(hotspot[${hsName}].interactivecontent, true);
		set(hotspot[${hsName}].zoom, false);
		set(hotspot[${hsName}].bg, false);
		set(hotspot[${hsName}].renderer, css3d);
		set(hotspot[${hsName}].onloaded, js(rv.onPinLoaded('${hsName}')); );
		`;
  }

  rv.onPinLoaded = function (hsName) {
    const $sprite = getSprite(hsName);
    if (!$sprite) {
      return;
    }
    $sprite.addClass('krpanoHotspot');
    // Why oh why to we have to wait to get the element...
    setTimeout(() => {
      let focussed = false;
      const $hs = $sprite[0].querySelector('.pin-hotspot');
      const $tooltip = $hs.querySelector('.tooltip');
      if (!$hs || !$tooltip) {
        return;
      }
      $hs.addEventListener('mouseenter', () => {
        showTooltip($tooltip);
      });
      $hs.addEventListener('mouseleave', () => {
        if (!focussed) {
          hideTooltip($tooltip);
        }
      });
      $hs.addEventListener('focus', () => {
        focussed = true;
        showTooltip($tooltip);
      });
      $hs.addEventListener('blur', () => {
        focussed = false;
        hideTooltip($tooltip);
      });
    }, 50);
  };

  function showTooltip($tooltip) {
    if (!$tooltip) {
      return;
    }
    TweenLite.to($tooltip, GAD, { autoAlpha: 1 });
  }

  function hideTooltip($tooltip) {
    if (!$tooltip) {
      return;
    }
    TweenLite.to($tooltip, GAD, { autoAlpha: 0 });
  }

  rv.navspotClick = function (floorIndex, tourId, hsName) {
    // const $hs = $(`[data-hsname="${hsName}"]`);
    // if ($hs.length) {
    // const stored = localStorage.getItem(hsName);
    // const now = new Date().getTime();

    // Check if item exists and hasn't expired
    // if (stored) {
    //   const storedData = JSON.parse(stored);
    //   if (now > storedData.expiry) {
    //     localStorage.removeItem(hsName);
    //     $hs.removeClass('clicked');
    //   }
    // }

    // Set new item if it doesn't exist or has expired
    //   if (!localStorage.getItem(hsName)) {
    //     const threeMonths = 90 * 24 * 60 * 60 * 1000; // Three months in milliseconds
    //     const data = {
    //       clicked: true,
    //       expiry: now + threeMonths,
    //     };
    //     $hs.addClass('clicked');
    //     localStorage.setItem(hsName, JSON.stringify(data));
    //   }
    // }
    rv.goToTour(parseInt(floorIndex), parseInt(tourId));
    pushEventToDataLayer('navspotClick');
    pushEventToDataLayer(`buttonClick`, 'buttonFunction', 'Navspot');
  };

  rv.onContentspotClick = function (contentId, hsName) {
    const $hs = $(`[data-hsname="${hsName}"]`);
    // if ($hs.length) {
    //   const stored = localStorage.getItem(hsName);
    //   const now = new Date().getTime();

    //   // Check if item exists and hasn't expired
    //   if (stored) {
    //     const storedData = JSON.parse(stored);
    //     if (now > storedData.expiry) {
    //       localStorage.removeItem(hsName);
    //       $hs.removeClass('clicked');
    //     }
    //   }

    //   // Set new item if it doesn't exist or has expired
    //   if (!localStorage.getItem(hsName)) {
    //     const threeMonths = 90 * 24 * 60 * 60 * 1000; // Three months in milliseconds
    //     const data = {
    //       clicked: true,
    //       expiry: now + threeMonths,
    //     };
    //     $hs.addClass('clicked');
    //     localStorage.setItem(hsName, JSON.stringify(data));
    //   }
    // }

    const contentObj = fiaId(rv.contentData, contentId);
    if (!contentObj) {
      return;
    }
    const { type, heading, text, youtubeId, galleryId } = contentObj;
    var $infoContent = $('#info-content');
    const $contentIframe = $('<iframe>').attr({
      allowfullscreen: true,
      id: 'content-iframe',
    });
    if (type === 'video' || type === 'gallery') {
      if (type === 'video' && youtubeId) {
        $contentIframe.attr(
          'src',
          `https://www.youtube.com/embed/${youtubeId}?rel=0&amp;autoplay=1&amp;showinfo=0&amp;wmode=transparent`,
        );
        $('#info-spot').addClass('video youtube');
      }
      if (type === 'gallery' && galleryId) {
        $contentIframe.attr('src', `xml/360-galleries/${galleryId}/index.html`);
        $('#info-spot').addClass(')gallery');
      }
      $infoContent.append($contentIframe);
      $('#info-spot').addClass('iframed');
      $('#info-spot .title').text(heading);
    } else if (type === 'article' && typeof text !== 'undefined') {
      $('#info-spot .title').text(heading);
      $infoContent.append(parseHotspotText(text));
    } else {
      return;
    }

    // ANIMATED
    TweenLite.to('#info-spot', GAD, { autoAlpha: 1 });

    if (winDim.width > MOBILE_BP) {
      TweenLite.from('#info-inner', GAD, {
        scale: 0.95,
        y: '-50%',
        clearProps: 'transform',
      });
    }

    // VARS
    openModals.contentspot = true;
    disableAutoRotate();

    rv.contentspotName = heading;
    pushEventToDataLayer('contentspotClick', 'contentspotType', type);
    pushEventToDataLayer(`buttonClick`, 'buttonFunction', 'Contentspot');
  };

  function closeContentspot() {
    TweenLite.to('#info-spot', GAD, {
      autoAlpha: 0,
      onComplete: function () {
        $('#info-spot').removeClass();
        $('#info-spot .title').text('');
        $('#info-content').empty();
      },
    });

    // Fade out infospot
    if (winDim.width > MOBILE_BP) {
      TweenLite.to('#info-inner', GAD, {
        scale: 0.95,
        y: '-50%',
        clearProps: 'transform',
      });
    }

    openModals.contentspot = false;
    rv.contentspotName = false;
    enableAutoRotate();
  }

  // Help Screen
  function showHelp() {
    if (openModals.help) {
      return;
    }
    TweenLite.to('#help-screen', GAD, { autoAlpha: 1 });
    TweenLite.to('#help-inner', GAD, {
      scale: 1,
    });

    disableAutoRotate();
    openModals.help = true;
  }

  function hideHelp() {
    if (!openModals.help) {
      return;
    }
    TweenLite.to('#help-screen', GAD, { autoAlpha: 0 });
    TweenLite.to('#help-inner', GAD, {
      scale: 0.95,
    });

    enableAutoRotate();
    openModals.help = false;
  }

  // Gallery Screen
  function hideGallery() {
    TweenLite.to('#gallery', GAD, { autoAlpha: 0 });
    enableAutoRotate();
  }

  function showGallery() {
    TweenLite.to('#gallery', GAD, { autoAlpha: 1 });
    disableAutoRotate();
  }

  function removeWelcome() {
    TweenLite.to('#welcome-container', GAD, {
      opacity: 0,
      scale: 0.95,
      autoAlpha: 1,
      onComplete: function () {
        $container.removeClass('welcome-active');
        $('#welcome-container').remove();
        rv.welcomeOpen = false;
      },
    });

    showGui();
  }

  // AUTO ROTATE
  function enableAutoRotate(clicked) {
    const { autoR } = rv.settings;
    const isStart = autoR === 'start';
    const allowedToStart = autoR && !rv.editor;
    const clickMethod = clicked || isStart;
    const autoMethod = !arManuallyDisabled && allowedToStart && clickMethod;
    const arConditions = (clicked && clickMethod) || (!clicked && autoMethod);
    if (arConditions) {
      rv.krpano.call('set(autorotate.enabled, true);');
      $autoRotate.classList.add('enabled');
      if (clicked) {
        arManuallyDisabled = false;
      }
    }
  }

  function disableAutoRotate(clicked) {
    rv.krpano.call('if(autorotate.enabled, set(autorotate.enabled, false); );');
    $autoRotate.classList.remove('enabled');
    if (clicked) {
      arManuallyDisabled = true;
    }
  }

  // Motion Control
  function enableMotionControl() {
    rv.krpano.call('set(layer[gyro].enabled,true); set(motionOn,y);');
    $motionToggle.classList.add('enabled');
  }

  function disableMotionControl() {
    rv.krpano.call(
      'set(layer[gyro].enabled,false); set(view.camroll,0); set(motionOn,n);',
    );
    $motionToggle.classList.remove('enabled');
  }

  // RESIZE EVENTS
  function windowWidth() {
    const docElemProp = window.document.documentElement.clientWidth,
      body = window.document.body;
    return (
      window.innerWidth ||
      (window.document.compatMode === 'CSS1Compat' && docElemProp) ||
      (body && body.clientWidth) ||
      docElemProp
    );
  }

  function windowHeight() {
    const docElemProp = window.document.documentElement.clientHeight,
      body = window.document.body;
    return (
      window.innerHeight ||
      (window.document.compatMode === 'CSS1Compat' && docElemProp) ||
      (body && body.clientHeight) ||
      docElemProp
    );
  }

  function windowKeyUpHandler({ altKey, shiftKey, keyCode }) {
    // Vars
    const isE = [69].indexOf(keyCode) !== -1;
    // Editor (Shift + Alt + E)
    if (shiftKey && altKey && isE) {
      editorToggle();
    }
  }

  function resizeHandler() {
    winDim.width = windowWidth();
    winDim.height = windowHeight();
    const showDesktopGui = winDim.width > MOBILE_BP;

    TweenLite.set('#container, #gallery', {
      width: winDim.width,
      height: winDim.height,
    });

    TweenLite.set('#floorplan-wrapper, #floorplan-switch-container', {
      clearProps: 'transform',
    });

    if (showDesktopGui && rv.smallScreen) {
      TweenLite.set('#mobile-gui-container', { clearProps: 'bottom' });
      if (rv.navShown) {
        slideoutDesktopOpen();
        TweenLite.set('.gui-container', { autoAlpha: 1 });
      }
      enableAutoRotate();
      rv.smallScreen = false;
    } else if (!showDesktopGui && !rv.smallScreen) {
      TweenLite.set('#mobile-gui-container', { bottom: 0 });
      hideHelp();
      if (rv.navShown) {
        TweenLite.set('#desktop-gui-container', { autoAlpha: 0 });
      }
      disableAutoRotate();
      slideoutDeviceClose();
      rv.smallScreen = true;
    }
  }

  // Fullscreen functions
  function fsAction(forceExit) {
    if (
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement
    ) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    } else if (!forceExit) {
      if (document.body.requestFullscreen) {
        document.body.requestFullscreen();
      } else if (document.body.mozRequestFullScreen) {
        document.body.mozRequestFullScreen();
      } else if (document.body.webkitRequestFullscreen) {
        document.body.webkitRequestFullscreen(
          document.body.ALLOW_KEYBOARD_INPUT,
        );
      } else if (document.body.msRequestFullscreen) {
        document.body.msRequestFullscreen();
      }
    }
  }

  function fsChange() {
    document.webkitIsFullScreen ||
    document.mozFullScreen ||
    document.msFullscreenElement
      ? fsChangeActions(true)
      : fsChangeActions();
  }

  function fsChangeActions(enabled) {
    if (enabled) {
      TweenLite.to('.fs-close', GAD, { autoAlpha: 1 });
      document.body.classList.add('fullscreen');
      $fsToggle.classList.add('fsActive');
      pushEventToDataLayer('fullscreenEntered');
    } else {
      TweenLite.to('.fs-close', GAD, { autoAlpha: 0 });
      document.body.classList.remove('fullscreen');
      $fsToggle.classList.remove('fsActive');
      pushEventToDataLayer('fullscreenExited');
    }
  }

  // VR events
  rv.enterVrActions = () => {
    vrBtnsChange(true);
    rv.krpano.call(getHotspotRemover(rv.activeTourObj));
    rv.inVr = true;
  };

  rv.exitVrActions = () => {
    rv.krpano.call(getHotspotBuilder(rv.activeTourObj));
    rv.inVr = false;
    vrBtnsChange(false);
  };

  function buildVirtualRealityButtons() {
    const startAth = 0;
    const startAtv = 35;
    const btnSize = 88;
    const callArr = vrButtonNames.map((direction) => {
      // Direction
      const isPrev = 'prev' === direction;
      const isNext = 'next' === direction;
      // Hotspot name
      const hsName = `vr_btn_${direction}`;
      const offsetX = `${isPrev ? '-' : '+'}${btnSize / 3}`;
      // Return
      return `
			addhotspot(${hsName});
			set(hotspot[${hsName}].ath, ${startAth});
			set(hotspot[${hsName}].atv, ${startAtv});
			set(hotspot[${hsName}].ox, ${offsetX});
			set(hotspot[${hsName}].depth, 800);
			set(hotspot[${hsName}].scale, 0.5);
			set(hotspot[${hsName}].distorted, true);
			set(hotspot[${hsName}].alpha, 0.5);
			set(hotspot[${hsName}].url, './images/gui/vr_btn_${direction}.png');
			set(hotspot[${hsName}].keep, true);
			set(hotspot[${hsName}].enabled, true);
			set(hotspot[${hsName}].visible, false);
			set(hotspot[${hsName}].vr_timeout, 750);
			set(hotspot[${hsName}].onover, tween(scale, 0.625));
			set(hotspot[${hsName}].onout, tween(scale, 0.5));
			set(hotspot[${hsName}].onloaded, js( rv.vrBtnLoaded('${hsName}') ));
			set(hotspot[${hsName}].onclick, js( rv.vrBtnClick('${direction}') ));
			`;
    });
    // Call
    rv.krpano.call(callArr.join(' '));
  }

  function vrBtnsChange(show) {
    $vrBtns.filter(Boolean).forEach(($el) => ($el.visible = show));
    rv.krpano.call(
      `set(events[vr_events].onviewchange, ${show ? 'js( rv.vrBtnFollow() )' : 'null'});`,
    );
  }

  const getLimited360 = (input) => {
    const newInput = input | 0;
    return input - newInput + ((newInput + 360180) % 360) - 180.0;
  };

  rv.vrBtnFollow = () => {
    // Get Btns
    const $followHotspots = $vrBtns.filter(Boolean);
    if (!$followHotspots.length) {
      return;
    }
    const anyHovered = $followHotspots
      .map(({ hovering }) => hovering)
      .filter(Boolean);
    if (anyHovered.length) {
      return;
    }
    // Pano view
    const panoView = rv.krpano.get('view');
    if (!panoView) {
      return;
    }
    const hlookat = panoView.hlookat || 0;
    const vlookat = panoView.vlookat || 0;
    // Get Data
    const $first = $followHotspots[0];
    const parsedH = getLimited360(hlookat);
    const v = getLimited360(vlookat);
    const hsh = getLimited360($first.ath || 0);
    const hsv = $first.atv || 0;
    const parsedHDiff = parsedH - hsh;
    const hDiff =
      parsedHDiff + (parsedHDiff > 180 ? -360 : parsedHDiff < -180 ? 360 : 0);
    const newHsH = hsh + hDiff * vrBtnFollowSpeed;
    const baseAlpha = Math.abs(v - hsv) / 90.0;
    const newAlpha = 1.0 * Math.max(1.0 - 2.0 * Math.sqrt(baseAlpha), 0);
    const vLimited = v + 40 - v * 1.5;
    const newHsV = hsv * (1.0 - vrBtnFollowSpeed) + vLimited * vrBtnFollowSpeed;
    // Update VR Buttons
    $followHotspots.forEach(($btn) => {
      $btn.ath = newHsH.toFixed(2);
      $btn.atv = newHsV.toFixed(2);
      $btn.alpha = newAlpha.toFixed(2);
    });
  };

  rv.vrBtnLoaded = (hsName) =>
    $vrBtns.push(rv.krpano.get(`hotspot[${hsName}]`));
  rv.vrBtnClick = (direction) => {
    const toursLength = rv.tourData.length;
    const firstTourObj = rv.tourData[0];
    const lastTourObj = rv.tourData[toursLength - 1];
    // Get Tour
    const offset = direction === 'prev' ? -1 : 1;
    const currentIndex = rv.tourData.indexOf(rv.activeTourObj);
    const newIndex = currentIndex + offset;
    const tooLow = newIndex < 0;
    const tooHigh = newIndex >= toursLength;
    const newTourObj = tooLow
      ? lastTourObj
      : tooHigh
        ? firstTourObj
        : rv.tourData[newIndex];
    if (!newTourObj) return;
    // Floor
    const { id } = newTourObj;
    const newFloorObj = rv.floorData.find(({ tours }) =>
      tours.find(({ tour_id }) => tour_id === id),
    );
    const newFloorIndex = rv.floorData.indexOf(newFloorObj);
    // Action
    rv.goToTour(newFloorIndex, id);
  };

  // Editor
  function editorToggle() {
    if (!$editorContainer) {
      return;
    }
    const editorEnabled = isDataOpen($editorContainer);
    if (editorEnabled) {
      // Disable
      setDataOpen($editorContainer, false);
      // Body
      $container.removeClass('editor-enabled');
      $container.addClass('editor-disabled');
    } else {
      // Var
      setDataOpen($editorContainer, true);
      // Enable
      disableAutoRotate();
      rv.viewchangeHandler();
      // Body
      $container.removeClass('editor-disabled');
      $container.addClass('editor-enabled');
    }
  }

  // Google Tag Manager
  function pushEventToDataLayer(eventName, variableType, variableValue) {
    if (!window.dataLayer || !eventName) return;
    const dataObj = { event: eventName };
    if (variableType && variableValue) dataObj[variableType] = variableValue;
    window.dataLayer.push(dataObj);
  }

  function gtmClicks() {
    $('.gtm-floor-click').click(() => {
      pushEventToDataLayer(`floorClick`);
    });
    $('.gtm-camera-click').click(() => {
      pushEventToDataLayer(`cameraClick`);
    });

    $('.gtm-button-close-fp').click(() => {
      pushEventToDataLayer(`buttonClick`, 'buttonFunction', 'Close Floorplan');
    });
    $('.gtm-button-open-fp').click(() => {
      pushEventToDataLayer(`buttonClick`, 'buttonFunction', 'Open Floorplan');
    });
    $('.gtm-button-switch-floor').click(() => {
      pushEventToDataLayer(`buttonClick`, 'buttonFunction', 'Switch Floor');
    });
    $('.gtm-button-switch-camera').click(() => {
      pushEventToDataLayer(`buttonClick`, 'buttonFunction', 'Switch Camera');
    });
    $('.gtm-button-gallery-toggle').click(() => {
      pushEventToDataLayer(
        `buttonClick`,
        'buttonFunction',
        'Gallery/Tour Toggle',
      );
    });
    $('.gtm-button-fullscreen-toggle').click(() => {
      pushEventToDataLayer(
        `buttonClick`,
        'buttonFunction',
        'Fullscreen Toggle',
      );
    });
    $('.gtm-button-fullscreen-close').click(() => {
      pushEventToDataLayer(`buttonClick`, 'buttonFunction', 'Fullscreen Close');
    });
    $('.gtm-button-zoom-in').click(() => {
      pushEventToDataLayer(`buttonClick`, 'buttonFunction', 'Zoom In');
    });
    $('.gtm-button-zoom-out').click(() => {
      pushEventToDataLayer(`buttonClick`, 'buttonFunction', 'Zoom Out');
    });
    $('.gtm-button-autorotate-toggle').click(() => {
      pushEventToDataLayer(
        `buttonClick`,
        'buttonFunction',
        'Autorotate Toggle',
      );
    });
    $('.gtm-button-help-open').click(() => {
      pushEventToDataLayer(`buttonClick`, 'buttonFunction', 'Help Open');
    });
    $('.gtm-button-motion-toggle').click(() => {
      pushEventToDataLayer(`buttonClick`, 'buttonFunction', 'Motion Toggle');
    });
    $('.gtm-button-info-close').click(() => {
      pushEventToDataLayer(`buttonClick`, 'buttonFunction', 'Info Close');
    });
  }

  // Utility functions
  function fiaId(array, input) {
    return array.filter((item) => item.id == input).pop();
  }
  function elById(id) {
    return document.getElementById(id);
  }
  function arrayFromQSA(selector) {
    return [].slice.call(document.querySelectorAll(selector));
  }
  function isDefined(inputVar) {
    return typeof inputVar !== 'undefined';
  }
  function setDataOpen($el, value) {
    $el.dataset.open = value || false;
  }
  function isDataOpen($el) {
    return $el && $el.dataset && isDataTrue($el.dataset);
  }
  function isDataTrue(dataset, key) {
    return dataset && 'true' == dataset[key || 'open'];
  }
  function returnFloatTo1(input) {
    return parseFloat(parseFloat(input).toFixed(1).replace(/\.0+$/, ''));
  }
  function buildEl() {
    return document.createElement('div');
  }

  function normalAth(hlookat) {
    let ph = returnFloatTo1(hlookat);
    while (ph >= 360) ph -= 360;
    while (ph < 0) ph += 360;
    return returnFloatTo1(ph);
  }

  function normalAtv(vlookat) {
    let pv = returnFloatTo1(vlookat);
    if (pv > 90) pv = 90;
    if (pv < -90) pv = -90;
    return returnFloatTo1(pv);
  }

  // http://stackoverflow.com/a/901144/1482673
  function getParameterByName(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)'),
      results = regex.exec(location.search);
    return results === null
      ? ''
      : decodeURIComponent(results[1].replace(/\+/g, ' '));
  }

  function isOdd(num) {
    return num % 2;
  }

  function inIframe() {
    try {
      return window.self !== window.top;
    } catch (e) {
      return true;
    }
  }

  function getSprite(hsName) {
    return $(rv.krpano.get(`hotspot[${hsName}].sprite`));
  }

  function parseHotspotText(text) {
    // Square brackets [] are used to denote links in the JSON
    // Split the supplied content
    const paragraphParsed = text.split(/[\[\]]+/);
    const $newParagraph = $('<p class="p">');

    for (let i1 = 0; i1 < paragraphParsed.length; i1++) {
      if (isOdd(i1)) {
        const linkParts = paragraphParsed[i1].split('|');
        const $anchorTag = $('<a>')
          .attr({
            href: linkParts[1],
            target: '_blank',
            title: linkParts[2],
          })
          .text(linkParts[0]);

        $newParagraph.append($anchorTag);
      } else {
        $newParagraph.append(paragraphParsed[i1]);
      }
    }
    return $newParagraph;
  }
})((window.rv = window.rv || {}), jQuery, TweenLite);
