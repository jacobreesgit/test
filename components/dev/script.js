// Polyfill - NodeList.prototype.forEach
if (window.NodeList && !NodeList.prototype.forEach) {
  NodeList.prototype.forEach = Array.prototype.forEach;
}
// Polyfill - DOMTokenList.prototype.forEach
if (window.DOMTokenList && !DOMTokenList.prototype.forEach) {
  DOMTokenList.prototype.forEach = function (callback, thisArg) {
    thisArg = thisArg || window;
    for (var i = 0; i < this.length; i++) {
      callback.call(thisArg, this[i], i, this);
    }
  };
}
// Data
const rv = {
  isV4: true,
  rawTours: [],
  activeTab: false,
  settings: {
    classic: false,
  },
  text: {},
  floorData: [],
  tourData: [],
  contentData: [],
};
// Els
const $builderContent = elById('builder-content');
const $stepsContainer = elById('steps-container') || buildEl();
const $pageNotices = elById('page-notices') || buildEl();
const $steps = arrayFromQSA('.clickable-step');
const $save = elById('step-save') || buildEl();
const $firstStep = isListArr($steps) && $steps[0];
const $addNewItem = elById('add-new-item') || buildEl();

// Assignments
const dataKeyObj = {
  floors: 'floorData',
  tours: 'tourData',
  content: 'contentData',
};
const popFunctions = {
  config: addConfig,
  floors: addFloorItem,
  tours: addTourItem,
  content: addContentItem,
};
const callbackFunctions = {
  floors: floorsCallback,
};
const packUpFunctions = {
  config: packUpConfig,
  floors: packUpFloors,
  tours: packUpTours,
  content: packUpContent,
};
const tourHeadingOptions = [
  'Back Exterior',
  'Bathroom',
  'Bedroom 1',
  'Bedroom 2',
  'Bedroom 3',
  'Bedroom 4',
  'Bedroom 5',
  'Bedroom 6',
  'Cloak',
  'Conservatory',
  'Dining Room',
  'Dressing room',
  'En-suite',
  'Family Room',
  'Front Exterior',
  'Hall',
  'Kitchen',
  'Landing',
  'Lounge',
  'Study',
  'Utility',
  'CUSTOM',
];
const horizontalFields = [0.1, 0, 360];
const verticalFields = [0.1, -90, 90];
const initialBuildType =
  ($firstStep && $firstStep.dataset && $firstStep.dataset.type) || 'content';

// Start
rv.start = (jsonPath) => {
  addNotice(
    'info',
    `This document reads <strong>uploads/global.json</strong>. If this is an old file (v3+ or older), it will reformat it into v4+. <strong>NOTE: Saving will overwrite uploads/global.json.</strong>`,
  );
  // Fetch JSON
  fetchJson(jsonPath || '../upload/global.json');
  // Events
  $steps.forEach(($el) => {
    const { type } = $el.dataset || {};
    $el.addEventListener('click', () => populate(type));
  });
  $addNewItem.addEventListener('click', () => {
    const popFunction = popFunctions[rv.activeTab];
    if (!popFunction) {
      return;
    }
    popFunction();
  });
  $save.addEventListener('click', saveJson);
};

// JSON
function fetchJson(jsonPath) {
  const jsonRequest = window.XMLHttpRequest
    ? new XMLHttpRequest()
    : new ActiveXObject('Microsoft.XMLHTTP');
  jsonRequest.onreadystatechange = function () {
    const { readyState, status, responseText } = this || {};
    if (readyState !== 4) {
      return;
    }
    if (status === 200) {
      parseJSON(JSON.parse(responseText));
    } else if (status === 404) {
      addNotice('error', `Could not find the JSON path "${jsonPath}"`);
    }
  };
  jsonRequest.open('GET', jsonPath, true);
  jsonRequest.send();
}

function parseJSON(newData) {
  if (!newData) {
    return;
  }
  // Settings
  parseSettings(newData.settings);
  parseText(newData.text);
  // Detect Old/New
  rv.isV4 = newData.floors && newData.text.version;
  // Process data
  if (rv.isV4) {
    newData.floors.forEach((item) => rv.floorData.push(item));
    newData.tours.forEach((item) => rv.tourData.push(item));
    newData.content.forEach((item) => rv.contentData.push(item));
  } else {
    // IS OLD (v3+ or older)
    newData.tours.forEach((item) => rv.rawTours.push(item));
    parseContent();
    parseTours();
    parseFloors();
    // Add warning about older version
    addNotice(
      'warning',
      `This seems to be an old version. We have updated the IDs to reflect v4+. Please review them and ensure you rename your 360 folders/files to reflect.`,
    );
  }
  // Show Steps
  $stepsContainer.classList.remove('hidden');
  // Build
  populate(initialBuildType);
}

function saveJson() {
  updateData();
  if (confirm(`Are your sure you are ready to save?`) == true) {
    // Strip OLD ID
    const newTours = rv.tourData.map(({ id, heading, lookat, hotspots }) => ({
      id,
      heading,
      lookat,
      hotspots,
    }));
    // Data
    const saveData = {
      settings: rv.settings,
      text: rv.text,
      floors: rv.floorData,
      tours: newTours,
      content: rv.contentData,
    };
    // Request
    const jsonRequest = window.XMLHttpRequest
      ? new XMLHttpRequest()
      : new ActiveXObject('Microsoft.XMLHTTP');
    jsonRequest.open('POST', './inc/save-json.php', true);
    jsonRequest.setRequestHeader('Content-type', 'application/json');
    jsonRequest.send(JSON.stringify(saveData));
  }
}

// Parse
function parseSettings(newSettings) {
  if (!newSettings) {
    return;
  }
  const settingsKeys = [
    'startFloor',
    'startTour',
    'classic',
    'fov',
    'startScreen',
    'gallery',
    'stillsNumber',
    'autoR',
    'krpanoMouseMode',
    'panoType',
    'ccph',
  ];
  settingsKeys.forEach((key) => {
    const entry = newSettings[key];
    const isValid = isDefined(entry) && entry !== '';
    if (!isValid) {
      return;
    }
    rv.settings[key] = entry;
  });
}

function parseText(newText) {
  if (!newText) {
    return;
  }
  const textKeys = [
    'title',
    'property',
    'description',
    'address',
    'moreinfo',
    'coins',
    'dateCreated',
    'urlid',
    'region',
    'development',
    'conversion',
    'clientName',
    'version',
  ];
  textKeys.forEach((key) => {
    const entry = newText[key];
    const isValid = isDefined(entry) && entry !== '';
    if (!isValid) {
      return;
    }
    rv.text[key] = entry;
  });
  if (isDefined(newText.phone)) {
    const isArr = Array.isArray(newText.phone);
    if (isArr) {
      const [url, text] = isArr || [];
      if (url && text) {
        rv.text.phone = [url, text];
      }
    } else if (rv.text.phone) {
      rv.text.phone = newText.phone;
    }
  }
  if (isDefined(newText.cta) && Array.isArray(newText.cta)) {
    const [url, text] = newText.cta || [];
    if (url && text) {
      rv.text.cta = [url, text];
    }
  }
  if (isDefined(newText.floorplanText)) {
    const { hide, show } = newText.floorplanText || {};
    if (hide || show) {
      rv.text.floorplanText = {
        hide: hide || '',
        show: show || 'Show Floor Plan',
      };
    }
  }
}

function parseFloors() {
  const { floorNames } = rv.settings || {};
  const validFloorLabels = floorNames || ['G', 1, 2, 3, 4, 5, 6];
  const floorArr = [];
  // Parse Tours
  rv.rawTours.forEach((toursArr = [], floorIndex) => {
    const floorObj = {
      label: validFloorLabels[floorIndex],
      tours: toursArr.map(({ id, camera }) => {
        const { x = 50, y = 50 } = camera || {};
        return {
          tour_id: getValidId(floorIndex, id),
          camera: [x, y],
        };
      }),
    };
    floorArr.push(floorObj);
  });
  // Return
  rv.floorData = floorArr;
}

function parseTours() {
  const tourArr = [];
  // Parse Tours
  rv.rawTours.forEach((toursArr = [], floorIndex) => {
    toursArr.forEach(({ id, heading, settings, hotspots }) => {
      const outputObj = { heading };
      // ID
      outputObj.oldId = id;
      outputObj.id = getValidId(floorIndex, id);
      // Start / Limit
      if (settings) {
        const { startPan, startTilt, cameraAlign, panlimit } = settings || {};
        const { horizontal, vertical } = panlimit || {};
        if (startPan || startTilt || cameraAlign || horizontal || vertical) {
          outputObj.lookat = {};
          if (startPan || startTilt || cameraAlign) {
            outputObj.lookat.start = [
              startPan || 0,
              startTilt || 0,
              cameraAlign || 0,
            ];
          }
          if (horizontal || vertical) {
            outputObj.lookat.limit = {};
            if (horizontal) {
              const { min, max } = horizontal || {};
              outputObj.lookat.limit.h = [min || 0, max || 360];
            }
            if (vertical) {
              const { min, max } = vertical || {};
              outputObj.lookat.limit.v = [min || -90, max || 90];
            }
          }
        }
      }
      // Hotspots
      if (hotspots) {
        outputObj.hotspots = [];
        hotspots.forEach(({ id, type, target, position, heading, text }) => {
          const { ath, atv, rotate } = position || {};
          const { floor, tour } = target || {};
          const hsObj = {};
          // At
          if (ath || atv || rotate) {
            hsObj.at = [ath || 0, atv || 0];
            if (rotate) {
              hsObj.at.push(rotate);
            }
          }
          // Nav
          const isNav = type === 'nav' && (floor || tour);
          if (isNav) {
            // Needs to happen on next pass, after all content is present
            hsObj.tour_id = getValidId(floor, tour);
          }
          const isContent = ['info', 'video', 'gallery'].includes(type);
          if (isContent) {
            const contentObj = fiaId(rv.contentData, id);
            if (!contentObj) {
              return;
            }
            hsObj.content_id = id;
          }
          const isPin = type === 'pin' && (heading || text);
          if (isPin) {
            if (heading) {
              hsObj.heading = heading;
            }
            if (text) {
              hsObj.text = text;
            }
          }
          outputObj.hotspots.push(hsObj);
        });
      }
      tourArr.push(outputObj);
    });
  });
  // Return
  rv.tourData = tourArr;
}

function parseContent() {
  const contentArr = [];
  // Parse Content
  rv.rawTours.forEach((toursArr = []) => {
    const filteredTours = toursArr.filter(({ hotspots }) =>
      isListArr(hotspots),
    );
    filteredTours.forEach(({ hotspots }) => {
      const filteredHotspots = hotspots.filter(({ type }) =>
        ['info', 'video', 'gallery'].includes(type),
      );
      filteredHotspots.forEach(
        ({ id, type, heading, text, youtubeId, galleryId }) => {
          const outputObj = {
            id,
            heading,
            type: type === 'info' ? 'article' : type,
          };
          if (text) {
            outputObj.text = text;
          }
          if (youtubeId) {
            outputObj.youtubeId = youtubeId;
          }
          if (galleryId) {
            outputObj.galleryId = galleryId;
          }
          contentArr.push(outputObj);
        },
      );
    });
  });
  // Return
  rv.contentData = contentArr;
}

// Build
function populate(popType) {
  // Update before changeover
  updateData();
  // Check for change
  if (rv.activeTab === popType) {
    return;
  }
  // Empty container
  emptyEl($builderContent);
  // Get data array
  const dataKey = dataKeyObj[popType] || rv[popType];
  const popDataArr = dataKey && rv[dataKey];
  // Get population function
  const popFunction = popFunctions[popType];
  if (!popFunction) {
    return;
  }
  if (Array.isArray(popDataArr) && popFunction) {
    popDataArr.forEach(popFunction);
  } else if (popFunction) {
    popFunction();
  } else if (!popDataArr) {
    return;
  }
  // Set Tabs
  $steps.forEach(($el) => {
    $el.classList.remove('active');
    $el.removeAttribute('tabindex');
  });
  const $newActiveTab = elById(`step-${popType}`);
  if ($newActiveTab) {
    $newActiveTab.classList.add('active');
    $newActiveTab.setAttribute('tabindex', -1);
  }
  // Get callback function
  const callbackFunction = callbackFunctions[popType];
  if (callbackFunction) {
    callbackFunction();
  }
  // Set "Add new"
  const isExpandable = ['floors', 'tours', 'content'].includes(popType);
  if (isExpandable) {
    $addNewItem.style.display = '';
  } else {
    $addNewItem.style.display = 'none';
  }
  // Var
  rv.activeTab = popType;
}

// Update Data
function updateData() {
  const packUpFunction = packUpFunctions[rv.activeTab];
  if (!packUpFunction) {
    return;
  }
  packUpFunction();
}

// Config
function getConfigData() {
  return [
    {
      key: 'settings',
      name: 'Settings',
      fieldGroups: [
        {
          label: 'Starting Tour',
          fields: [
            {
              name: 'startFloor',
              label: 'Starting Floor',
              defaultVal: 0,
              options: rv.floorData.map((item, i1) => [
                i1,
                `Floor ${rv.floorData[i1].label}`,
              ]),
              validator: (input) => parseInt(input),
            },
            {
              name: 'startTour',
              label: 'Starting Tour',
              defaultVal: rv.tourData[0] && rv.tourData[0].id,
              options: getStartFloorTourOptions(),
              validator: (input) => parseInt(input),
            },
          ],
        },
        {
          label: 'Other',
          fields: [
            {
              name: 'classic',
              label: 'Is Classic? (Removes vertical look positions)',
              defaultVal: getBoolean(rv.settings.classic, 0),
              options: [
                [0, 'No'],
                [1, 'Yes'],
              ],
            },
            {
              name: 'fov',
              label: 'Field of view (default 72, Story Homes 85)',
              defaultVal: rv.settings.fov || 72,
              type: 'number',
              minMax: [35, 95],
            },
            {
              name: 'startScreen',
              label: 'Has a welcome screen?',
              defaultVal: getBoolean(rv.settings.startScreen, 1),
              options: [
                [0, 'No'],
                [1, 'Yes'],
              ],
            },
            {
              name: 'gallery',
              label: 'Has a Gallery?',
              defaultVal: getBoolean(rv.settings.gallery, 0),
              options: [
                [0, 'No'],
                [1, 'Yes'],
              ],
            },
            {
              name: 'stillsNumber',
              label: 'Number of Gallery Stills',
              defaultVal: rv.settings.stillNumber || 12,
              type: 'number',
              validator: (input) => parseInt(input),
            },
            {
              name: 'autoR',
              label: 'Auto-rotate',
              defaultVal: getAutoRDefault(rv.settings.autoR),
              options: [
                [0, 'Off'],
                [1, 'On (requires clicking)'],
                ['start', 'On (starts automatically)'],
              ],
            },
            {
              name: 'krpanoMouseMode',
              label: '360 movement mode',
              defaultVal: rv.settings.krpanoMouseMode || 'moveto',
              options: [
                ['moveto', 'Click and hold to move (old)'],
                ['drag', 'Click and drag (newer)'],
              ],
            },
            {
              name: 'panoType',
              label: 'Panorama type',
              defaultVal: rv.settings.panoType || 'equi',
              options: [
                ['equi', 'Equirectangular'],
                ['cube', 'Cube faces'],
              ],
            },
          ],
        },
      ],
    },
    {
      key: 'text',
      name: 'Text',
      fieldGroups: [
        {
          label: 'Main Text',
          fields: [
            {
              name: 'title',
              label: 'Page Title (only complete to override default)',
              defaultVal: rv.text.title || '',
              validator: (input) => input.trim(),
            },
            {
              name: 'property',
              label: 'Property',
              defaultVal: rv.text.property || '',
              validator: (input) => input.trim(),
            },
            {
              name: 'description',
              label: 'Description',
              defaultVal: rv.text.description || '',
              validator: (input) => input.trim(),
            },
            {
              name: 'address',
              label: 'Address',
              defaultVal: rv.text.address || '',
              validator: (input) => input.trim(),
            },
            {
              name: 'phone',
              label: 'Phone',
              defaultVal: rv.text.phone || '',
              validator: (input) => input.trim(),
            },
            {
              name: 'moreinfo',
              label: 'More Info URL',
              defaultVal: rv.text.moreinfo || '',
              validator: (input) => input.trim(),
            },
            // CC/PH - only
            {
              name: 'coins',
              label: 'Coins',
              defaultVal: rv.text.coins || '',
              validator: (input) => input.trim(),
              ccphOnly: true,
            },
            {
              name: 'dateCreated',
              label: 'Date Created',
              defaultVal: rv.text.dateCreated || '',
              validator: (input) => input.trim(),
              ccphOnly: true,
            },
            {
              name: 'urlid',
              label: 'URL ID',
              defaultVal: rv.text.urlid || '',
              validator: (input) => input.trim(),
              ccphOnly: true,
            },
            {
              name: 'region',
              label: 'Region',
              defaultVal: rv.text.region || '',
              validator: (input) => input.trim(),
              ccphOnly: true,
            },
            {
              name: 'development',
              label: 'Development',
              defaultVal: rv.text.development || '',
              validator: (input) => input.trim(),
              ccphOnly: true,
            },
            {
              name: 'conversion',
              label: 'Conversion',
              defaultVal: rv.text.conversion || '',
              validator: (input) => input.trim(),
              ccphOnly: true,
            },
          ],
        },
        {
          key: 'cta',
          label: 'Call to action',
          fields: [
            {
              name: 0,
              label: 'URL',
              defaultVal:
                isDefined(rv.text.cta) && rv.text.cta[0] ? rv.text.cta[0] : '',
            },
            {
              name: 1,
              label: 'Text',
              defaultVal:
                isDefined(rv.text.cta) && rv.text.cta[1] ? rv.text.cta[1] : '',
            },
          ],
        },
        {
          key: 'floorplanText',
          label: 'Floorplan Text',
          fields: [
            {
              name: 'hide',
              label: 'Hide Text',
              defaultVal:
                isDefined(rv.text.floorplanText) && rv.text.floorplanText.hide
                  ? rv.text.floorplanText.hide
                  : '',
            },
            {
              name: 'show',
              label: 'Show Text',
              defaultVal:
                isDefined(rv.text.floorplanText) && rv.text.floorplanText.show
                  ? rv.text.floorplanText.show
                  : 'Show Floor Plan',
            },
          ],
        },
      ],
    },
  ];
}

function getStartFloorTourOptions() {
  return rv.tourData
    .filter(({ id }) => {
      const floorObj = rv.floorData[rv.settings.startFloor];
      const { tours = [] } = floorObj || {};
      const floorTourIds = tours.map(({ tour_id }) => tour_id);
      return !tours.length || floorTourIds.includes(id);
    })
    .map(({ id, heading }) => [id, `Tour #${id}: ${heading}`]);
}

function getConfigField(fieldObj, parentKey) {
  const {
    key,
    name,
    label,
    type,
    defaultVal,
    options,
    classes = [],
    ccphOnly = false,
    minMax = [],
  } = fieldObj || {};
  const fieldType = type || (options ? 'select' : 'text');
  if (!fieldType) {
    return;
  }
  let $fieldContainer = false;
  const fieldName = parentKey ? `${parentKey}-${key || name}` : key || name;
  if (fieldType === 'select') {
    $fieldContainer = getSelectField(fieldName, label, defaultVal, options);
  } else if (fieldType === 'number') {
    $fieldContainer = getNumberField(
      fieldName,
      label,
      defaultVal,
      1,
      minMax[0],
      minMax[1],
    );
  } else {
    $fieldContainer = getTextField(fieldName, label, defaultVal);
  }
  // Classes
  if (ccphOnly) {
    classes.push('onlyType_ccph');
  }
  classes
    .filter(Boolean)
    .forEach((className) => $fieldContainer.classList.add(className));
  // Return
  return $fieldContainer;
}

function getConfigItem(inputObj) {
  // Default fields
  const { key, name, fieldGroups } = inputObj || {};
  // Item title
  const $itemTitle = buildEl('h2', ['mainItem-title'], '', [textNode(name)]);
  // Fields
  const $fieldGroups = fieldGroups.map((fieldGroupObj, i1) => {
    const { key, label, fields } = fieldGroupObj || {};
    const $fields = fields
      .map((item) => getConfigField(item, key))
      .filter(Boolean);
    return getFieldGroup(label || '', $fields, [i1 % 2 ? 'even' : 'odd']);
  });
  const classesArr = [
    'mainItem',
    `mainItem_${key || name}`,
    isCCPH() ? 'type-ccph' : '',
  ].filter(Boolean);
  const childArr = [
    buildEl('header', ['mainItem-header', 'mainItem-header_settings'], '', [
      $itemTitle,
    ]),
    ...$fieldGroups,
  ];
  const $settingsItem = buildEl('div', classesArr, '', childArr);
  // Append Tour Section
  return $settingsItem;
}

function addConfig() {
  // Populate
  getConfigData()
    .map(getConfigItem)
    .forEach(($item) => $builderContent.appendChild($item));
  // Events
  const $startFloorField = elFromQS('.field-input-startFloor') || buildEl();
  const $startTourField = elFromQS('.field-input-startTour') || buildEl();
  $startFloorField.addEventListener('change', () => {
    // Empty Start Tour options
    emptyEl($startTourField);
    // Get new options based on updated rv.settings.startFloor
    const newOptions = getStartFloorTourOptions();
    // Build options into elements
    const $newOptions = getOptionEls(newOptions);
    // Append new options and set value to first
    $newOptions.forEach(($el) => $startTourField.appendChild($el));
    $startTourField.value = newOptions[0][0];
  });
}

function packUpConfig() {
  // Data
  const IS_CCPH = isCCPH();
  const configData = getConfigData();
  configData.forEach((inputObj) => {
    const { key, name, fieldGroups } = inputObj || {};
    // Use a custom key or just the title
    const rvKey = key || name;
    // Get the Object
    const rvObj = rv[rvKey];
    // Loop through field groups
    fieldGroups.forEach((fieldGroupObj) => {
      const { key, fields } = fieldGroupObj || {};
      // Get the Object (Could be nested like CTA + floorplanText)
      const targetObj = rvObj[key] || rvObj;
      // Loop through fields
      fields.forEach((fieldObj) => {
        const { name, validator = false, ccphOnly = false } = fieldObj;
        if (ccphOnly && !IS_CCPH) {
          return;
        }
        // If there's a parent key (e.g. CTA and floorplanText) use that, or just the main obj
        const fieldKey = key ? `${key}-${name}` : name;
        const $field = document.querySelector(`.field-input-${fieldKey}`);
        const fieldVal = $field && $field.value;
        if (validator) {
          // Use Custom validation
          targetObj[name] = validator(fieldVal);
        } else if ($field.type === 'number') {
          // Use Number validation
          targetObj[name] = parseInt(fieldVal);
        } else {
          // Use a mix of boolean and string for text and selects (e.g. autoR)
          const isBoolean = ['0', '1'].includes(fieldVal);
          targetObj[name] = isBoolean ? fieldVal != false : fieldVal;
        }
      });
    });
  });
  // Programatic selections
  rv.settings.ccph = IS_CCPH;
  rv.text.clientName = '{{CLIENT_NAME}}';
  rv.text.version = '{{FP_VERSION}}';
}

// Floors
function getFloorTourItem(floorTourObj, floorIndex) {
  let isValidTourId = false;
  let $editorSelectInner = false;
  let $editorSelectBtn = false;
  let $removeTourItemBtn = false;
  // Default fields
  const { tour_id, camera } = floorTourObj || {};
  const [cameraX, cameraY] = camera || [];
  // Options
  const tourOptionsArr = rv.tourData.map(({ id, heading }) => [
    id,
    `Tour #${id}: ${heading}`,
  ]);
  // Fields - rest
  const $targetField = getSelectField(
    'tour-target',
    'Target',
    tour_id,
    tourOptionsArr,
  );
  const $cameraXField = getNumberField(
    'camera-x',
    'Camera X (%)',
    cameraX || 0,
    0.1,
    0,
    100,
  );
  const $cameraYField = getNumberField(
    'camera-y',
    'Camera Y (%)',
    cameraY || 0,
    0.1,
    0,
    100,
  );
  // Fields - Editor
  isValidTourId = rv.tourData.find(({ id }) => id === tour_id);
  $editorSelectInner = buildEl('span', ['inner']);
  $editorSelectBtn = buildEl(
    'button',
    ['floor-tour-editor-select', isValidTourId ? 'enabled' : ''],
    'Select this tour to edit position',
    [$editorSelectInner],
  );
  $editorSelectBtn.dataset.tourId = tour_id;
  // Fields - Remove Btn
  $removeTourItemBtn = getControlBtn('remove', 'Remove tour from floor', [
    'sm',
    'remove-child',
  ]);
  // LI inner
  const $floorTourFields = buildEl('div', ['fieldRepeater-item-inner'], '', [
    $targetField,
    $cameraXField,
    $cameraYField,
    $editorSelectBtn,
    $removeTourItemBtn,
  ]);
  // Build Tour Id item
  const $tourItem = buildEl(
    'li',
    ['fieldRepeater-item', 'floor-tour-id-item'],
    '',
    [$floorTourFields],
  );
  $tourItem.dataset.tourId = tour_id;
  // Events
  const delayedUpdate = () => {
    setTimeout(() => {
      updateFloorPreview(floorIndex);
    }, 50);
  };
  $editorSelectBtn.addEventListener('click', (e) => {
    const $el = e.target;
    const tourId = $el.dataset.tourId && parseInt($el.dataset.tourId);
    const $oldActives = arrayFromQSA(
      `.mainItem_floor_${floorIndex} .floor-tour-editor-select.active`,
    );
    $oldActives.forEach(($old) => $old.classList.remove('active'));
    $el.classList.add('active');
    rv.activeFloorEditors[floorIndex] = tourId;
  });
  $targetField.addEventListener('change', (e) => {
    const $el = e.target;
    const tourId = $el.value && parseInt($el.value);
    const isValidTourId = rv.tourData.find(({ id }) => id === tourId);
    if (isValidTourId) {
      $editorSelectBtn.classList.add('enabled');
    } else {
      $editorSelectBtn.classList.remove('enabled');
    }
    $tourItem.dataset.tourId = tourId;
    $editorSelectBtn.dataset.tourId = tourId;
  });
  const fieldsThatUpdate = [$targetField, $cameraXField, $cameraYField];
  fieldsThatUpdate.forEach(($el) =>
    $el.addEventListener('change', delayedUpdate),
  );
  $removeTourItemBtn.addEventListener('click', () => {
    removeEl($tourItem);
    updateData();
    delayedUpdate();
  });
  // Return to Tour ID Container
  return $tourItem;
}

function getFloorTourPin(floorTourObj) {
  // Default fields
  const { tour_id, camera } = floorTourObj || {};
  const isValidTourId = fiaId(rv.tourData, tour_id);
  if (!isValidTourId) {
    return;
  }
  const [cameraX, cameraY] = camera || [];
  // Validate
  const validCameraX = cameraX || 0;
  const validCameraY = cameraY || 0;
  // Build
  const $tourItem = buildEl('div', ['pin'], '', [textNode(tour_id)]);
  $tourItem.style.left = `${validCameraX}%`;
  $tourItem.style.top = `${validCameraY}%`;
  // Return
  return $tourItem;
}

function addFloorItem(floorObj, floorIndex) {
  floorIndex = isDefined(floorIndex) ? floorIndex : rv.floorData.length;
  const isEven = floorIndex % 2 === 0;
  // Default fields
  const { label = '', tours = [] } = floorObj || {};
  // Header
  const $itemTitle = buildEl('h2', ['mainItem-title'], '', [
    textNode('Floor Item'),
  ]);
  const $removeFloorBtn = getControlBtn('remove', 'Remove this floor', [
    'md',
    'remove-item',
  ]);
  // Floor Info
  const $labelField = getTextField(
    'label',
    'Floor label (e.g. G, M, etc.)',
    label,
  );
  // Tours
  const $floorTourItems = tours.map((item) =>
    getFloorTourItem(item, floorIndex),
  );
  const $floorTourOl = buildEl(
    'ol',
    ['fieldRepeater-container'],
    '',
    $floorTourItems,
  );
  const $addBtn = getControlBtn('add', 'Add tour', ['sm']);
  // Floor Preview
  const $floorImg = buildEl('img', 'floor-preview-img');
  $floorImg.src = `../upload/images/floorplans/floorplan-${floorIndex}.png`;
  const $floorplanPinLayer = buildEl(
    'div',
    ['floorplan-pins'],
    '',
    tours.map((item) => getFloorTourPin(item, floorIndex)),
  );
  const $floorPreview = buildEl('div', ['floorplan-preview'], '', [
    $floorImg,
    $floorplanPinLayer,
  ]);
  // Build floor item
  const sideBySideFields = [
    buildEl('div', ['floor-info-wrapper'], '', [
      getFieldGroup('Info', [$labelField]),
      getFieldGroup(
        'Tours',
        [$floorTourOl],
        ['fieldGroup_floor-tours', 'fieldRepeater'],
        false,
        $addBtn,
      ),
    ]),
    getFieldGroup(
      'Preview - Click to place/move active tour pin',
      [$floorPreview],
      ['fieldGroup_floor-preview'],
    ),
  ];
  const childArr = [
    buildEl('header', ['mainItem-header', 'mainItem-header_floor'], '', [
      $itemTitle,
      $removeFloorBtn,
    ]),
    buildEl('div', ['flex', 'flex-wrap'], '', sideBySideFields),
  ];
  const $floorItem = buildEl(
    'div',
    [
      'mainItem',
      'mainItem_floor',
      `mainItem_floor_${floorIndex}`,
      isEven ? 'even' : 'odd',
    ],
    '',
    childArr,
  );
  // Append floor item
  $builderContent.appendChild($floorItem);
  // Events
  $removeFloorBtn.addEventListener('click', () => removeEl($floorItem));
  $removeFloorBtn.addEventListener('click', updateData);
  $addBtn.addEventListener('click', () => {
    $floorTourOl.appendChild(getFloorTourItem(false, floorIndex));
  });
  // Events - Preview functionality
  $floorPreview.addEventListener('click', (e) => {
    // Calculate click percentages
    const { offsetX, offsetY, target } = e;
    const { offsetWidth, offsetHeight } = target || {};
    const parsePerc = (axis, dim) =>
      (((axis || 1) / (dim / 1)) * 100).toFixed(1);
    const validXPerc = parsePerc(offsetX, offsetWidth);
    const validYPerc = parsePerc(offsetY, offsetHeight);
    // Apply to fields
    // const $floorItem = elFromQS(``.mainItem_floor_${floorIndex}``)
    const $activeTourItem = $floorItem.querySelector(
      `.floor-tour-id-item[data-tour-id='${rv.activeFloorEditors[floorIndex]}']`,
    );
    const $cameraXField =
      $activeTourItem.querySelector('.field-input-camera-x') || buildEl();
    $cameraXField.value = validXPerc;
    const $cameraYField =
      $activeTourItem.querySelector('.field-input-camera-y') || buildEl();
    $cameraYField.value = validYPerc;
    updateData();
    updateFloorPreview(floorIndex);
  });
}

function updateFloorPreview(floorIndex) {
  const floorObj = rv.floorData[floorIndex];
  const { tours } = floorObj || {};
  const $floorItem =
    document.querySelector(`.mainItem_floor_${floorIndex}`) || buildEl();
  const $floorplanPins = $floorItem.querySelector(`.floorplan-pins`);
  emptyEl($floorplanPins);
  const childArr = tours.map((item) => getFloorTourPin(item)).filter(Boolean);
  childArr.forEach(($child) => $floorplanPins.appendChild($child));
}

function floorsCallback() {
  const $floorItems = arrayFromQSA('.mainItem_floor');
  rv.activeFloorEditors = {};
  $floorItems.forEach(($floorItem, i1) => {
    const floorObj = rv.floorData[i1];
    const { tours } = floorObj || {};
    // Set actives
    const validTours = tours.filter((floorTourObj) => {
      const { tour_id } = floorTourObj || {};
      // Return if valid / enabled
      return fiaId(rv.tourData, tour_id);
    });
    const firstFloorTourObj = validTours.find(Boolean);
    const { tour_id } = firstFloorTourObj || {};
    // Give class
    const $editorSelectBtn =
      elFromQS(
        `.floor-tour-editor-select[data-tour-id='${tour_id}']`,
        $floorItem,
      ) || buildEl();
    $editorSelectBtn.classList.add('active');
    // Set Global active
    rv.activeFloorEditors[i1] = tour_id;
  });
}

function packUpFloors() {
  // Process group items
  const $floorItemNodes = document.querySelectorAll('.mainItem_floor');
  const $floorItemArr = arrayFromQSA('.mainItem_floor');
  const floorsArr = $floorItemArr
    .map(($el1, i1) => {
      // New Obj
      const floorObj = {};
      // item element
      const $floorItem = $floorItemNodes[i1];
      if (!$floorItem) {
        return;
      }
      // Label
      const $labelField =
        $floorItem.querySelector('.field-input-label') || buildEl();
      const labelValue = $labelField.value || 'X';
      floorObj.label = labelValue;
      // Tours
      const $floorTourIdItemNodes = $floorItem.querySelectorAll(
        '.floor-tour-id-item',
      );
      const $floorTourIdItemArr = arrayFromQSA(
        '.floor-tour-id-item',
        $floorItem,
      );
      const floorTourArr = $floorTourIdItemArr
        .map(($el2, i2) => {
          // New Obj
          const tourObj = {};
          // item element
          const $fieldContainer = $floorTourIdItemNodes[i2];
          if (!$fieldContainer) {
            return;
          }
          // ID
          const $targetField =
            $fieldContainer.querySelector('.field-input-tour-target') ||
            buildEl();
          const targetVal = parseInt($targetField.value);
          if (!targetVal) {
            return;
          }
          tourObj.tour_id = targetVal;
          // Camera
          const $cameraXField =
            $fieldContainer.querySelector('.field-input-camera-x') || buildEl();
          const cameraXVal = parseFloat($cameraXField.value) || 0;
          const $cameraYField =
            $fieldContainer.querySelector('.field-input-camera-y') || buildEl();
          const cameraYVal = parseFloat($cameraYField.value) || 0;
          tourObj.camera = [cameraXVal, cameraYVal];
          return tourObj;
        })
        .filter(Boolean);
      // Add to object
      floorObj.tours = floorTourArr;
      // Return
      return floorObj;
    })
    .filter(Boolean);
  // Add new tour data
  rv.floorData = floorsArr;
}

// Tours
function addTourItem(tourObj) {
  // Default fields
  const { oldId, id, heading, lookat, hotspots = [] } = tourObj || {};
  const { start, limit } = lookat || {};
  // Item title
  const $itemTitle = buildEl('h2', ['mainItem-title'], '', [
    textNode('Tour Item'),
  ]);
  // ID
  const hasUpdatedId = oldId && oldId !== id;
  const $oldIdField =
    hasUpdatedId && getTextField('old-id', 'Old Tour ID', oldId, true);
  const $newIdField =
    hasUpdatedId && getNumberField('new-id', 'Suggested new Tour ID', id);
  const $idField = !hasUpdatedId && getNumberField('id', 'Tour ID', id);
  // Heading
  const inHeadingList = tourHeadingOptions.find((item) => item === heading);
  const headingSelectVal = heading ? (inHeadingList ? heading : 'CUSTOM') : '';
  const $headingSelectField = getSelectField(
    'heading-select',
    'Tour Heading',
    headingSelectVal,
    [['', 'Please select a heading'], ...tourHeadingOptions],
  );
  const headingCustomVal = !inHeadingList && heading ? heading : '';
  const $headingCustomField = getTextField(
    'heading-custom',
    'Custom Tour Heading',
    headingCustomVal,
  );
  // Start
  const startPos = isListArr(start) ? start : [];
  const [startH = 0, startV = 0, startN = 0] = startPos || [];
  const migratedNorth = rv.isV4 ? startN : startN * -1;
  const $startLookatHField = getNumberField(
    'start-h',
    'Start H Angle',
    normalAth(startH),
    ...horizontalFields,
  );
  const $startLookatVField = getNumberField(
    'start-v',
    'Start V Angle',
    normalAtv(startV),
    ...verticalFields,
  );
  const $startLookatNField = getNumberField(
    'start-n',
    '"North" Angle',
    normalAth(migratedNorth),
    ...horizontalFields,
  );
  // Limit
  const limitObj = limit || {};
  const [limitHMin = 0, limitHMax = 360] = limitObj.v || [];
  const [limitVMin = -90, limitVMax = 90] = limitObj.v || [];
  const $panlimitHMinField = getNumberField(
    'panlimit-h-min',
    'H Min Angle',
    normalAth(limitHMin),
    ...horizontalFields,
  );
  const $panlimitHMaxField = getNumberField(
    'panlimit-h-max',
    'H Max Angle',
    normalAth(limitHMax),
    ...horizontalFields,
  );
  const $panlimitVMinField = getNumberField(
    'panlimit-v-min',
    'V Min Angle',
    normalAtv(limitVMin),
    ...verticalFields,
  );
  const $panlimitVMaxField = getNumberField(
    'panlimit-v-max',
    'V Max Angle',
    normalAtv(limitVMax),
    ...verticalFields,
  );
  // Hotspots
  const $addHotspotBtn = getControlBtn('add', 'Add hotspot', ['sm']);
  const $tourHotspotsListItems = hotspots.map(getHotspotItem);
  const $tourHotspotOl = buildEl(
    'ol',
    ['fieldRepeater-container'],
    '',
    $tourHotspotsListItems,
  );
  // Remove Btn
  const $removeTourBtn = getControlBtn('remove', 'Remove this tour', [
    'md',
    'remove-item',
  ]);
  // Build Tour Section
  const classesArr = [
    'mainItem',
    'mainItem_tour',
    `type-${rv.settings.classic ? 'classic' : 'premier'}`,
  ];
  const childArr = [
    buildEl('header', ['mainItem-header', 'mainItem-header_tour'], '', [
      $itemTitle,
      $removeTourBtn,
    ]),
    getFieldGroup('Info', [
      $oldIdField,
      $newIdField,
      $idField,
      $headingSelectField,
      $headingCustomField,
    ]),
    getFieldGroup(
      'Start Position',
      [$startLookatHField, $startLookatVField, $startLookatNField],
      ['odd'],
    ),
    getFieldGroup(
      'Pan Limit - Horizontal',
      [$panlimitHMinField, $panlimitHMaxField],
      ['odd'],
    ),
    getFieldGroup(
      'Pan Limit - Vertical',
      [$panlimitVMinField, $panlimitVMaxField],
      ['odd', 'onlyType_premier'],
    ),
    getFieldGroup(
      'Hotspots',
      [$tourHotspotOl],
      ['fieldGroup_tour-hotspots', 'fieldRepeater'],
      false,
      $addHotspotBtn,
    ),
  ];
  const $tourItem = buildEl('div', classesArr, '', childArr);
  // Append Tour Section
  $builderContent.appendChild($tourItem);
  // Events
  $removeTourBtn.addEventListener('click', () => removeEl($tourItem));
  $removeTourBtn.addEventListener('click', updateData);
  $addHotspotBtn.addEventListener('click', () =>
    $tourHotspotOl.appendChild(getHotspotItem()),
  );
  // Conditional Fields
  const conditionalFields = [$headingCustomField];
  conditionalFields.forEach(($el) => $el.classList.add('conditional'));
  // Field functions
  const isCustomHeading = headingSelectVal === 'CUSTOM';
  $headingCustomField.style.display = isCustomHeading ? 'block' : '';
  $headingSelectField.addEventListener('change', (e) => {
    const $select = e.target;
    const val = $select.value;
    const isNowCustomHeading = val === 'CUSTOM';
    $headingCustomField.style.display = isNowCustomHeading ? 'block' : '';
  });
}

function getHotspotTargetOptions() {
  const contentOptionsArr = rv.contentData.map(({ id, heading }) => [
    `contentId_${id}`,
    `Content #${id}: ${heading}`,
  ]);
  const tourOptionsArr = rv.tourData.map(({ id, heading }) => [
    `tourId_${id}`,
    `Tour #${id}: ${heading}`,
  ]);
  return [
    ['', 'Please select a target'],
    ['pin', 'Pin'],
    ...contentOptionsArr,
    ...tourOptionsArr,
  ];
}

function getHotspotItem(hsObj) {
  // Positions
  const { content_id, tour_id, at, heading = '', text = '' } = hsObj || {};
  const hsTargetType = (content_id && 'contentId') || (tour_id && 'tourId');
  const hsTargetObj =
    (content_id && fiaId(rv.contentData, content_id)) ||
    (tour_id && fiaId(rv.tourData, tour_id));
  // Options
  const targetVal =
    (hsTargetObj && `${hsTargetType}_${hsTargetObj.id}`) ||
    ((heading || text) && 'pin') ||
    '';
  const isPin = targetVal === 'pin';
  const isContentOrTour = ['contentId', 'tourId'].includes(hsTargetType);
  // Fields
  const $targetField = getSelectField(
    'hotspot-target',
    'Target',
    targetVal,
    getHotspotTargetOptions(),
  );
  const [ath = 0, atv = 0, rotation = 0] = at || [];
  const $atHField = getNumberField(
    'hotspot-at-h',
    'H Angle',
    normalAth(ath),
    ...horizontalFields,
  );
  const $atVField = getNumberField(
    'hotspot-at-v',
    'V Angle',
    normalAtv(atv),
    ...verticalFields,
  );
  const $rotationField = getNumberField(
    'hotspot-rotation',
    'Rotation',
    rotation,
    5,
  );
  // Override Text
  const $hsOverrideTextField = getTextField(
    'hotspot-override-text',
    'Override text (optional)',
    text,
  );
  // Pin Text
  const $pinHeadingField = getTextField(
    'pin-heading',
    'Tooltip Heading',
    heading,
  );
  const $pinTextField = getTextField('pin-text', 'Tooltip text', text);
  // Remove btn
  const $removeBtn = getControlBtn('remove', 'Remove hotspot from tour', [
    'sm',
    'remove-child',
  ]);
  // LI inner
  const $tourHotspotFields = buildEl('div', ['fieldRepeater-item-inner'], '', [
    $targetField,
    $atHField,
    $atVField,
    $rotationField,
    $hsOverrideTextField,
    $pinHeadingField,
    $pinTextField,
    $removeBtn,
  ]);
  // Build Hotspot Item
  const $tourHotspotItem = buildEl(
    'li',
    ['fieldRepeater-item', 'tour-hotspot-item'],
    '',
    [$tourHotspotFields],
  );
  // Events
  $removeBtn.addEventListener('click', () => removeEl($tourHotspotItem));
  $removeBtn.addEventListener('click', updateData);
  // Conditional Fields
  const conditionalFields = [
    $atHField,
    $atVField,
    $rotationField,
    $hsOverrideTextField,
    $pinHeadingField,
    $pinTextField,
  ];
  conditionalFields.forEach(($el) => $el.classList.add('conditional'));
  // Field functions
  $atHField.style.display = targetVal ? 'block' : '';
  $atVField.style.display = targetVal ? 'block' : '';
  $rotationField.style.display = targetVal ? 'block' : '';
  $hsOverrideTextField.style.display = isContentOrTour ? 'block' : '';
  $pinHeadingField.style.display = isPin ? 'block' : '';
  $pinTextField.style.display = isPin ? 'block' : '';
  $targetField.addEventListener('change', (e) => {
    const $select = e.target;
    const val = $select.value;
    const isNowPin = val === 'pin';
    const isNowContent = val.includes('contentId');
    const isNowTour = val.includes('tourId');
    $atHField.style.display = val ? 'block' : '';
    $atVField.style.display = val ? 'block' : '';
    $rotationField.style.display = val ? 'block' : '';
    $hsOverrideTextField.style.display =
      isNowContent || isNowTour ? 'block' : '';
    $pinHeadingField.style.display = isNowPin ? 'block' : '';
    $pinTextField.style.display = isNowPin ? 'block' : '';
  });
  // Return to Hotspot Container
  return $tourHotspotItem;
}

function packUpTours() {
  // Process Tour items
  const $tourItemNodes = document.querySelectorAll('.mainItem_tour');
  const $tourItemArr = arrayFromQSA('.mainItem_tour');
  const toursArr = $tourItemArr
    .map(($el1, i1) => {
      // New Obj
      const tourObj = {};
      // Start Pos
      const lookat = {};
      // item element
      const $tourItem = $tourItemNodes[i1];
      if (!$tourItem) {
        return;
      }
      // ID
      const $newIdField =
        $tourItem.querySelector('.field-input-new-id') || buildEl();
      const newIdVal = $newIdField.value && parseInt($newIdField.value);
      const $idField = $tourItem.querySelector('.field-input-id') || buildEl();
      const idVal = $idField.value && parseInt($idField.value);
      const tourId = newIdVal || idVal;
      if (!tourId) {
        return;
      }
      tourObj.id = tourId;
      // Heading
      const $headingSelectField =
        $tourItem.querySelector('.field-input-heading-select') || buildEl();
      const $headingCustomField =
        $tourItem.querySelector('.field-input-heading-custom') || buildEl();
      const headingSelectVal = $headingSelectField.value;
      const headingCustomVal = validateTextField($headingCustomField);
      const inHeadingList = tourHeadingOptions.find(
        (value) => value === headingSelectVal,
      );
      const isCustom = headingSelectVal === 'CUSTOM';
      const validHeading =
        (inHeadingList && !isCustom ? headingSelectVal : headingCustomVal) ||
        '';
      tourObj.heading = validHeading;
      // Start Lookat H/V
      const $startLookatH = $tourItem.querySelector('.field-input-start-h');
      const startLookatHVal =
        fieldSet($startLookatH.value) && parseFloat($startLookatH.value);
      const lookatHSet = fieldSet(startLookatHVal) && startLookatHVal !== 0;
      const $startLookatV = $tourItem.querySelector('.field-input-start-v');
      const startLookatVVal =
        fieldSet($startLookatV.value) && parseFloat($startLookatV.value);
      const lookatVSet = fieldSet(startLookatVVal) && startLookatVVal !== 0;
      const $startLookatN = $tourItem.querySelector('.field-input-start-n');
      const startLookatNVal =
        fieldSet($startLookatN.value) && parseFloat($startLookatN.value);
      const lookatNSet = fieldSet(startLookatNVal) && startLookatNVal !== 0;
      const addStart = lookatHSet || lookatVSet || lookatNSet;
      if (addStart) {
        lookat.start = [startLookatHVal || 0];
        if (lookatVSet || lookatNSet) {
          lookat.start.push(startLookatVVal);
          if (lookatNSet) {
            lookat.start.push(startLookatNVal);
          }
        }
      }
      // Set Panlimit Hs
      const $panlimitHMin = $tourItem.querySelector(
        '.field-input-panlimit-h-min',
      );
      const panlimitHMinVal = fieldSet($panlimitHMin.value)
        ? parseFloat($panlimitHMin.value)
        : 0;
      const $panlimitHMax = $tourItem.querySelector(
        '.field-input-panlimit-h-max',
      );
      const panlimitHMaxVal = fieldSet($panlimitHMax.value)
        ? parseFloat($panlimitHMax.value)
        : 360;
      const panlimitHMinSet = panlimitHMinVal !== 0;
      const panlimitHMaxSet = panlimitHMaxVal !== 360;
      const addPanlimitH = panlimitHMinSet || panlimitHMaxSet;
      // Set Panlimit Vs
      const $panlimitVMin = $tourItem.querySelector(
        '.field-input-panlimit-v-min',
      );
      const panlimitVMinVal = fieldSet($panlimitVMin.value)
        ? parseFloat($panlimitVMin.value)
        : -90;
      const $panlimitVMax = $tourItem.querySelector(
        '.field-input-panlimit-v-max',
      );
      const panlimitVMaxVal = fieldSet($panlimitVMax.value)
        ? parseFloat($panlimitVMax.value)
        : 90;
      const panlimitVMinSet = panlimitVMinVal !== -90;
      const panlimitVMaxSet = panlimitVMaxVal !== 90;
      const addPanlimitV =
        (panlimitVMinSet || panlimitVMaxSet) && !rv.settings.classic;
      // Add to object
      if (addPanlimitH || addPanlimitV) {
        lookat.limit = {};
        if (addPanlimitH) {
          lookat.limit.h = [panlimitHMinVal || 0];
          if (panlimitHMaxSet) {
            lookat.limit.h.push(panlimitHMaxVal);
          }
        }
        if (addPanlimitV) {
          lookat.limit.v = [panlimitVMinVal || -90];
          if (panlimitVMaxSet) {
            lookat.limit.v.push(panlimitVMaxVal);
          }
        }
      }
      // Hotspots
      const $hotspotItemNodes =
        $tourItem.querySelectorAll('.tour-hotspot-item');
      const $hotspotItemArr = arrayFromQSA('.tour-hotspot-item', $tourItem);
      const hotspotsArr = $hotspotItemArr
        .map(($el2, i2) => {
          // New Obj
          const hotspotObj = {};
          // item element
          const $hotspotItem = $hotspotItemNodes[i2];
          if (!$hotspotItem) {
            return;
          }
          // Content/Tour Target
          const $targetField = $hotspotItem.querySelector(
            '.field-input-hotspot-target',
          );
          const hsTargetVal = $targetField && $targetField.value;
          if (!hsTargetVal) {
            return;
          }
          const isPin = hsTargetVal === 'pin';
          const hsTargetSplit = hsTargetVal && hsTargetVal.split('_');
          const hsTargetType =
            hsTargetSplit && isListArr(hsTargetSplit) && hsTargetSplit[0];
          const hsTargetId =
            hsTargetSplit &&
            isListArr(hsTargetSplit) &&
            hsTargetSplit[1] &&
            parseInt(hsTargetSplit[1]);
          if (hsTargetId) {
            if ('contentId' == hsTargetType) {
              hotspotObj.content_id = hsTargetId;
            } else if ('tourId' == hsTargetType) {
              hotspotObj.tour_id = hsTargetId;
            }
          }
          // AT
          const $atHField = $hotspotItem.querySelector(
            '.field-input-hotspot-at-h',
          );
          const atHVal =
            $atHField && $atHField.value && parseFloat($atHField.value);
          const $atVField = $hotspotItem.querySelector(
            '.field-input-hotspot-at-v',
          );
          const atVVal =
            $atVField && $atVField.value && parseFloat($atVField.value);
          hotspotObj.at = [atHVal || 0, atVVal || 0];
          // Rotation
          const $rotationField = $hotspotItem.querySelector(
            '.field-input-hotspot-rotation',
          );
          const rotationVal =
            $rotationField &&
            $rotationField.value &&
            parseFloat($rotationField.value);
          if (rotationVal) {
            hotspotObj.at.push(rotationVal);
          }
          // Text
          if (isPin) {
            const $pinHeadingField = $hotspotItem.querySelector(
              '.field-input-pin-heading',
            );
            const heading = validateTextField($pinHeadingField);
            if (heading) {
              hotspotObj.heading = heading;
            }
            const $pinTextField = $hotspotItem.querySelector(
              '.field-input-pin-text',
            );
            const text = validateTextField($pinTextField);
            if (text) {
              hotspotObj.text = text;
            }
          } else {
            const $hsOverrideTextField = $hotspotItem.querySelector(
              '.field-input-hotspot-override-text',
            );
            const text = validateTextField($hsOverrideTextField);
            if (text) {
              hotspotObj.text = text;
            }
          }
          // Return
          return hotspotObj;
        })
        .filter(Boolean);
      // Add lookat, if necessary
      if (Object.entries(lookat).length > 0) {
        tourObj.lookat = lookat;
      }
      // Add hotspots, if necessary
      if (isListArr(hotspotsArr)) {
        tourObj.hotspots = hotspotsArr;
      }
      // Return
      return tourObj;
    })
    .filter(Boolean);
  // Add new tour data
  rv.tourData = toursArr;
  // Update Hotspot Target Options
  const hotspotTargetOptionArr = getHotspotTargetOptions();
  const $hotspotTargets = arrayFromQSA('.field-input-hotspot-target');
  $hotspotTargets.forEach(($el1) => {
    const currentValue = $el1.value;
    // Build options into elements
    const $hotspotTargetOptions = getOptionEls(hotspotTargetOptionArr);
    // Empty all Hotspot Target Options
    emptyEl($el1);
    // Append new options
    $hotspotTargetOptions.forEach(($el2) => $el1.appendChild($el2));
    $el1.value = currentValue;
  });
}

// Content
function addContentItem(contentObj) {
  // Default fields
  const { id, type, heading, text, youtubeId, galleryId } = contentObj || {};
  const contentType = type || '';
  const options = [
    ['', 'Please select a content type'],
    ['article', 'Article'],
    ['video', 'Video'],
    ['gallery', 'Gallery'],
  ];
  // Item title
  const $itemTitle = buildEl('h2', ['mainItem-title'], '', [
    textNode('Content Item'),
  ]);
  // Fields
  const $idField = getNumberField('id', 'Content ID', id);
  const $typeField = getSelectField(
    'type',
    'Content Type',
    contentType,
    options,
  );
  const $headingField = getTextField('heading', 'Content Heading', heading);
  // Article
  const $articleTextField = getTextareaField('body_text', 'Body text', text);
  // Video
  const $youtubeIdField = getTextField('youtube-id', 'YouTube ID', youtubeId);
  // Gallery images
  const $galleryIdField = getTextField('gallery-id', 'Gallery ID', galleryId);
  // Remove Btn
  const $removeContentBtn = getControlBtn('remove', 'Remove this content', [
    'md',
    'remove-item',
  ]);
  // Build Content Section
  const classesArr = ['mainItem', 'mainItem_content', `type-${type}`];
  const childArr = [
    buildEl('header', ['mainItem-header', 'mainItem-header_content'], '', [
      $itemTitle,
      $removeContentBtn,
    ]),
    getFieldGroup('Info', [$idField, $typeField, $headingField], ['odd']),
    getFieldGroup('Article Content', [$articleTextField], ['onlyType_article']),
    getFieldGroup('Video Content', [$youtubeIdField], ['onlyType_video']),
    getFieldGroup('Gallery Content', [$galleryIdField], ['onlyType_gallery']),
  ];
  const $contentItem = buildEl('div', classesArr, '', childArr);
  // Append Tour Section
  $builderContent.appendChild($contentItem);
  // Events
  $typeField.addEventListener('change', (event) => {
    const $type = $typeField.querySelector('.field-input-type') || buildEl;
    const typeVal = $type.value || 'article';
    options.forEach(([value]) =>
      $contentItem.classList.remove(`type-${value}`),
    );
    if (typeVal) {
      $contentItem.classList.add(`type-${typeVal}`);
    }
  });
  $removeContentBtn.addEventListener('click', () => removeEl($contentItem));
  $removeContentBtn.addEventListener('click', updateData);
}

function packUpContent() {
  // Process Content items
  const $contentItemNodes = document.querySelectorAll('.mainItem_content');
  const $contentItemArr = arrayFromQSA('.mainItem_content');
  const contentArr = $contentItemArr
    .map(($el1, i1) => {
      // New Obj
      const contentObj = {};
      // item element
      const $contentItem = $contentItemNodes[i1];
      if (!$contentItem) {
        return;
      }
      // ID
      const $idField =
        $contentItem.querySelector('.field-input-id') || buildEl();
      const idVal = $idField.value && parseInt($idField.value);
      if (!idVal) {
        return;
      }
      contentObj.id = idVal;
      // Heading
      const $headingField = $contentItem.querySelector('.field-input-heading');
      const headingVal = validateTextField($headingField);
      contentObj.heading = headingVal;
      // Content type
      const $typeField = $contentItem.querySelector('.field-input-type');
      const typeVal = $typeField && $typeField.value;
      const isValidType = ['article', 'video', 'gallery'].includes(typeVal);
      if (!typeVal || !isValidType) {
        return;
      }
      contentObj.type = typeVal;
      // Article
      const isArticle = typeVal === 'article';
      const $articleTextField = $contentItem.querySelector(
        '.field-input-body_text',
      );
      const articleTextVal = validateTextField($articleTextField);
      if (isArticle) {
        contentObj.text = articleTextVal;
      }
      // Video
      const isVideo = typeVal === 'video';
      const $youtubeIdField =
        $contentItem.querySelector('.field-input-youtube-id') || buildEl();
      const youtubeIdVal = validateTextField($youtubeIdField);
      if (isVideo) {
        contentObj.youtubeId = youtubeIdVal;
      }
      // Gallery
      const isGallery = typeVal === 'gallery';
      const $galleryIdField =
        $contentItem.querySelector('.field-input-gallery-id') || buildEl();
      const galleryIdVal =
        $galleryIdField.value && parseInt($galleryIdField.value);
      if (isGallery) {
        contentObj.galleryId = galleryIdVal;
      }
      // Run Tests
      const $temp = buildEl('div');
      $temp.innerHTML = articleTextVal;
      if ($temp.querySelectorAll('*').length) {
        alert(
          `HTML detcted in "Body Text" of #${idVal}: "${headingVal}". HTML in this field may break the render. Hyperlinks can be added using the [text|url] method.`,
        );
      }
      // Validation
      const articlePassed = isArticle && (headingVal || articleTextVal);
      const videoPassed = isVideo && youtubeIdVal;
      const galleryPassed = isGallery && galleryIdVal;
      const validationPass = articlePassed || videoPassed || galleryPassed;
      // Return
      return validationPass && contentObj;
    })
    .filter(Boolean);
  // Add new content data
  rv.contentData = contentArr;
}

// Build Field Group
function getFieldGroup(title = '', childArr, classesArr, tagName, $addBtn) {
  tagName = tagName || 'div';
  childArr = isListArr(childArr) ? childArr : [];
  classesArr = isListArr(classesArr) ? classesArr : [];
  const elClasses = ['fieldGroup', ...classesArr];
  // Heading
  const $fieldGroupTitle =
    title && buildEl('h3', ['fieldGroup-title'], '', [textNode(title)]);
  const $fieldGroupHeading =
    $fieldGroupTitle &&
    buildEl('div', ['fieldGroup-heading'], '', [$fieldGroupTitle]);
  // Fields
  const $fieldGroupFields = buildEl('div', ['fieldGroup-fields'], '', childArr);
  // Footer
  const $fieldGroupFooter =
    $addBtn && buildEl('div', ['fieldGroup-footer'], '', [$addBtn]);
  // Build
  return buildEl(tagName, elClasses, '', [
    $fieldGroupHeading,
    $fieldGroupFields,
    $fieldGroupFooter,
  ]);
}

// Build Remove Btn
function getControlBtn(which, title, classesArr) {
  // Validate Params
  classesArr = isListArr(classesArr) ? classesArr : [];
  // Icon
  const removeIcon = 'remove' == which && 'trash-alt';
  const addIcon = 'add' == which && 'plus';
  const iconSlug = removeIcon || addIcon;
  // Classes
  const elClasses = ['control-btn', `control-btn-${which}`, ...classesArr];
  // Icon
  const $icon = buildEl('span', ['icon', 'fal', `fa-${iconSlug}`]);
  // Build
  return buildEl('button', elClasses, title, [$icon]);
}

// Build Fields Types
function getFieldLabel(title) {
  return buildEl('span', ['field-label'], title, [textNode(title)]);
}

function getInput(type = 'text', title, value, placeholder) {
  // Validate Params
  title = title || type;
  //
  const $input = buildEl('input', ['field-input'], title);
  if (isDefined(value)) {
    $input.value = value;
  }
  $input.type = type;
  $input.setAttribute('placeholder', placeholder || '');
  $input.addEventListener('change', updateData);
  // Return
  return $input;
}

function getTextField(typeSlug, title, value, readOnly) {
  // Label
  const $label = title && getFieldLabel(title);
  // Input
  const $input = getInput('text', title, value);
  $input.classList.add(`field-input-${typeSlug}`);
  if (readOnly) {
    $input.setAttribute('readonly', true);
  }
  $input.addEventListener('change', updateData);
  // Return
  return buildEl(
    'div',
    ['fieldContainer', 'fieldContainer-text', `fieldContainer_${typeSlug}`],
    '',
    [$label, $input],
  );
}

function getNumberField(typeSlug, title, value, steps = 1, min, max) {
  // Label
  const $label = title && getFieldLabel(title);
  // Input
  const $input = getInput('number', title, value);
  $input.classList.add(`field-input-${typeSlug}`);
  $input.setAttribute('step', steps);
  $input.addEventListener('change', updateData);
  if (isDefined(min)) {
    $input.setAttribute('min', min);
  }
  if (max) {
    $input.setAttribute('max', max);
  }
  // Return
  return buildEl(
    'div',
    ['fieldContainer', 'fieldContainer-number', `fieldContainer_${typeSlug}`],
    '',
    [$label, $input],
  );
}

function getOptionEls(options = []) {
  return options.map((option) => {
    const isArray = Array.isArray(option);
    const [val, text] = option || [];
    const validVal = isArray ? val : option;
    const validText = isArray && text ? text : validVal;
    const $option = buildEl('option', '', '', [textNode(validText)]);
    $option.value = validVal;
    return $option;
  });
}

function getSelectField(typeSlug, title, value, options = []) {
  // Label
  const $label = getFieldLabel(title);
  // Input
  const $select = buildEl(
    'select',
    ['field-input', `field-input-${typeSlug}`],
    title || typeSlug,
    getOptionEls(options),
  );
  $select.addEventListener('change', updateData);
  $select.value = value;
  // Container
  return buildEl(
    'div',
    ['fieldContainer', 'fieldContainer-select', `fieldContainer_${typeSlug}`],
    '',
    [$label, $select],
  );
}

function getTextareaField(typeSlug, title, value) {
  const valueIsString = typeof value === 'string';
  const valueIsArray = isListArr(value);
  const parsedValue = valueIsString
    ? value
    : valueIsArray
      ? value.join('\n\n')
      : '';
  // Label
  const $label = title && getFieldLabel(title);
  // Input
  const $input = buildEl('textarea', [
    'field-input',
    `field-input-${typeSlug}`,
  ]);
  $input.rows = 2;
  $input.addEventListener('change', updateData);
  $input.value = parsedValue;
  return buildEl(
    'div',
    ['fieldContainer', 'fieldContainer-textarea', `fieldContainer_${typeSlug}`],
    '',
    [$label, $input],
  );
}

// Notices
function addNotice(type, text) {
  type = type || 'info';
  const typeClasses = {
    info: ['bg-green', 'text-white'],
    warning: ['bg-yellow'],
    error: ['bg-red', 'text-white'],
  };
  // Content
  const childArr = [];
  if (Array.isArray(text) && text.length) {
    text.forEach((item) => childArr.push(getParagraph(item)));
  } else if (text) {
    childArr.push(getParagraph(text));
  }
  // Remove Btn
  const $removeBtn = buildEl(
    'button',
    ['fal', 'fa-times'],
    'Remove this notice for now',
  );
  childArr.push($removeBtn);
  // Container
  const $notice = buildEl(
    'div',
    ['page-notice', ...typeClasses[type]],
    '',
    childArr,
  );
  $pageNotices.appendChild($notice);
  // Events
  $removeBtn.addEventListener('click', () => {
    removeEl($notice);
  });
}

// Validation
function validateTextField($el) {
  return ($el && $el.value && $el.value.trim()) || '';
}

// Utilities
function buildEl(tagName = 'div', classesArr, title = '', childArr) {
  // Validate Params
  classesArr = isListArr(classesArr) ? classesArr : [];
  childArr = isListArr(childArr) ? childArr : [];
  // El
  const $el = document.createElement(tagName);
  // Classes
  classesArr
    .filter(Boolean)
    .forEach((className) => $el.classList.add(className));
  // Title
  if (title) {
    $el.setAttribute('title', title);
    $el.setAttribute('aria-label', title);
  }
  // Children
  childArr.filter(Boolean).forEach(($child) => $el.appendChild($child));
  return $el;
}
function getValidId(floorIndex, oldTourId) {
  return oldTourId + floorIndex * 100;
}

function normalAth(hlookat) {
  let ph = getFloat1(hlookat);
  while (ph > 360) ph -= 360;
  while (ph < 0) ph += 360;
  return getFloat1(ph);
}

function normalAtv(vlookat) {
  let pv = getFloat1(vlookat);
  if (pv > 90) pv = 90;
  if (pv < -90) pv = -90;
  return getFloat1(pv);
}

function fiaId(array, input) {
  return array.filter((item) => item.id == input).pop();
}
function elById(id) {
  return document.getElementById(id);
}
function elFromQS(selector, $parent) {
  return ($parent || document).querySelector(selector);
}
function arrayFromQSA(selector, $parent) {
  return [].slice.call(($parent || document).querySelectorAll(selector));
}
function textNode(textInput) {
  return document.createTextNode(textInput);
}
function removeEl($el) {
  $el.parentNode.removeChild($el);
}
function emptyEl($el) {
  while ($el.firstChild) removeEl($el.firstChild);
}
function isDefined(inputVar) {
  return typeof inputVar !== 'undefined';
}
function isListArr(inputArr) {
  return inputArr && Array.isArray(inputArr) && inputArr.length;
}
function fieldSet(inputVar) {
  return isDefined(inputVar) && inputVar !== '';
}
function isCCPH() {
  return ['Charles Church', 'Persimmon Homes'].includes('{{CLIENT_NAME}}');
}
function getFloat1(input) {
  return parseFloat(parseFloat(input).toFixed(1));
}
function getBoolean(field, fallback) {
  return isDefined(field) ? (field ? 1 : 0) : fallback;
}
function getAutoRDefault(state) {
  return state ? (state === 'start' ? 'start' : 1) : 0;
}
function getParagraph(text) {
  const $p = buildEl('p');
  $p.innerHTML = text;
  return $p;
}
