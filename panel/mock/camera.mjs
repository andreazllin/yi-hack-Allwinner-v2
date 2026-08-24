#!/usr/bin/env node
// Mock yi-hack-Allwinner-v2 camera server for panel frontend development.
//
// Emulates the BusyBox httpd CGI shell scripts documented in
// panel/yi-hack-openapi.yaml, INCLUDING their hostile behaviors:
//   - every response is HTTP 200, failures are the body {"error":"true"}
//   - error / yes-no values are quoted strings, never booleans
//   - camera_settings.sh sleeps ~0.5s per query param and applies values to
//     LIVE state only; get_configs?conf=camera keeps returning the old values
//     until set_configs?conf=camera persists them (the A1 persistence bug)
//   - get_configs responses carry the fake trailing "NULL":"NULL" sentinel
//   - set_configs truncates the body at the first newline like `read -r`
//   - every 20th status.json response is malformed JSON (unescaped quote)
//   - reboot.sh replies, then drops all connections for ~10 seconds
//
// Run:   node mock/camera.mjs [port]     (default port 8080, Node >= 20)
// Point the panel dev proxy at it with, in panel/.env.local:
//   CAM_HOST=http://localhost:8080

import http from 'node:http';

const PORT = Number(process.argv[2]) || 8080;
const LOCAL_IP = '192.168.10.211';
const START = Date.now();

// ---------------------------------------------------------------- constants

// 1x1 grey JPEG.
const JPEG_B64 =
  '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRof' +
  'Hh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAABAAEBAREA/8QAFAAB' +
  'AAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AKp//2Q==';
const JPEG = Buffer.from(JPEG_B64, 'base64');
// Minimal ftyp+mdat stub; valid box structure, not playable.
const MP4 = Buffer.concat([
  Buffer.from('000000146674797069736f6d0000020069736f6d', 'hex'), // ftyp
  Buffer.from('000000106d646174', 'hex'), Buffer.alloc(8),        // mdat
]);
const SEVENZ = Buffer.concat([Buffer.from('377abcaf271c', 'hex'), Buffer.alloc(26)]);

const ERR_TRUE = '{"error":"true"}';
const ERR_FALSE = '{"error":"false"}';

// validate.sh blocklists (approximate, per the OpenAPI notes).
const QS_BLOCK = /['!"@#$%^*(),:;]/;                    // validateQueryString
const STR_BLOCK = /['!"@#$%&^*().,:;]/;                 // validateString
const KEY_BLOCK = /[|\\/'!"@#$%&^*().,:;{}=?]/;         // validateKey
const NUM_OK = /^[0-9.,-]+$/;                           // validateNumber

// ------------------------------------------------------------------- state
// Seeds mirror the shipped templates in src/static/static/yi-hack/etc/,
// written as KEY=VALUE pairs separated by ';' (values may contain spaces).

const conf = (s) => Object.fromEntries(
  s.split(/[;\n]/).map((t) => t.trim()).filter(Boolean)
    .map((kv) => [kv.slice(0, kv.indexOf('=')), kv.slice(kv.indexOf('=') + 1)]));
const SEED = {
  camera: conf(`SWITCH_ON=yes;SAVE_VIDEO_ON_MOTION=yes;MOTION_DETECTION=no;SENSITIVITY=low
    AI_HUMAN_DETECTION=no;AI_VEHICLE_DETECTION=no;AI_ANIMAL_DETECTION=no;FACE_DETECTION=no
    MOTION_TRACKING=no;SOUND_DETECTION=no;SOUND_SENSITIVITY=80;LED=no;ROTATE=no;IR=yes;CRUISE=no`),
  system: conf(`HTTPD=yes;TELNETD=yes;SSHD=yes;FTPD=yes;BUSYBOX_FTPD=no;MDNSD=yes;DISABLE_CLOUD=no
    REC_WITHOUT_CLOUD=no;MQTT=no;RTSP=yes;RTSP_ALT=standard;RTSP_STREAM=high;RTSP_AUDIO=yes
    RTSP_STI=yes;SPEAKER_AUDIO=yes;SNAPSHOT=yes;SNAPSHOT_VIDEO=no;SNAPSHOT_LOW=no;TIMELAPSE=no
    TIMELAPSE_FTP=no;TIMELAPSE_FTP_SAME_NAME=no;TIMELAPSE_DT=60;TIMELAPSE_VDT=;ONVIF=yes
    ONVIF_WSDD=yes;ONVIF_PROFILE=high;ONVIF_NETIF=wlan0;ONVIF_WM_SNAPSHOT=yes;ONVIF_AUDIO_BC=NONE
    ONVIF_ENABLE_MEDIA2=no;ONVIF_FAULT_IF_UNKNOWN=no;ONVIF_FAULT_IF_SET=no;ONVIF_SYNOLOGY_NVR=no
    TIME_OSD=no;NTPD=yes;NTP_SERVER=pool.ntp.org;PROXYCHAINSNG=no;SWAP_FILE=yes
    SWAP_SWAPPINESS=15;KERNEL_TUNING=yes;RTSP_PORT=554;HTTPD_PORT=8080;USERNAME=;PASSWORD=
    TIMEZONE=;EVENTS_TIME=autodetect;FREE_SPACE=0;FTP_UPLOAD=no;FTP_HOST=;FTP_DIR=
    FTP_DIR_TREE=no;FTP_USERNAME=;FTP_PASSWORD=;FTP_FILE_DELETE_AFTER_UPLOAD=yes;SSH_PASSWORD=
    CRONTAB=;DEBUG_LOG=no;STATIC_IP=;STATIC_MASK=;STATIC_GW=;STATIC_DNS1=;STATIC_DNS2=
    CUSTOM_WATERMARK=no`),
  mqtt: conf(`MQTT_IP=0.0.0.0;MQTT_PORT=1883;MQTT_TLS=0;MQTT_CLIENT_ID=yi-cam;MQTT_USER=
    MQTT_PASSWORD=;MQTT_PREFIX=yicam;TOPIC_BIRTH_WILL=status;TOPIC_MOTION=motion_detection
    TOPIC_MOTION_IMAGE=motion_detection_image;MOTION_IMAGE_DELAY=0.5;TOPIC_MOTION_FILES=motion_files
    TOPIC_SOUND_DETECTION=sound_detection;BIRTH_MSG=online;WILL_MSG=offline
    MOTION_START_MSG=motion_start;MOTION_STOP_MSG=motion_stop;AI_HUMAN_DETECTION_MSG=human
    AI_VEHICLE_DETECTION_MSG=vehicle;AI_ANIMAL_DETECTION_MSG=animal;BABY_CRYING_MSG=crying
    SOUND_DETECTION_MSG=sound;MQTT_KEEPALIVE=120;MQTT_QOS=1;MQTT_RETAIN_BIRTH_WILL=1
    MQTT_RETAIN_MOTION=0;MQTT_RETAIN_MOTION_IMAGE=0;MQTT_RETAIN_MOTION_FILES=0
    MQTT_RETAIN_SOUND_DETECTION=0`), // mqttv4.conf
  mqtt_advertise: conf(`MQTT_ADV_LINK_ENABLE=no;MQTT_ADV_LINK_BOOT=no;MQTT_ADV_LINK_CRON=no
    MQTT_ADV_LINK_CRONTAB=0 * * * *;MQTT_ADV_LINK_TOPIC=links;MQTT_ADV_LINK_RETAIN=1
    MQTT_ADV_LINK_QOS=0;MQTT_ADV_INFO_GLOBAL_ENABLE=no;MQTT_ADV_INFO_GLOBAL_BOOT=no
    MQTT_ADV_INFO_GLOBAL_CRON=no;MQTT_ADV_INFO_GLOBAL_CRONTAB=0 * * * *
    MQTT_ADV_INFO_GLOBAL_TOPIC=info_global;MQTT_ADV_INFO_GLOBAL_RETAIN=1;MQTT_ADV_INFO_GLOBAL_QOS=0
    MQTT_ADV_CAMERA_SETTING_ENABLE=no;MQTT_ADV_CAMERA_SETTING_BOOT=no
    MQTT_ADV_CAMERA_SETTING_CRON=no;MQTT_ADV_CAMERA_SETTING_CRONTAB=0 * * * *
    MQTT_ADV_CAMERA_SETTING_TOPIC=camera_setting;MQTT_ADV_CAMERA_SETTING_RETAIN=1
    MQTT_ADV_CAMERA_SETTING_QOS=0;MQTT_ADV_TELEMETRY_ENABLE=no;MQTT_ADV_TELEMETRY_BOOT=no
    MQTT_ADV_TELEMETRY_CRON=no;MQTT_ADV_TELEMETRY_CRONTAB=*/10 * * * *
    MQTT_ADV_TELEMETRY_TOPIC=telemetry;MQTT_ADV_TELEMETRY_RETAIN=1;MQTT_ADV_TELEMETRY_QOS=0
    HOMEASSISTANT_ENABLE=no;HOMEASSISTANT_BOOT=no;HOMEASSISTANT_CRON=no
    HOMEASSISTANT_CRONTAB=0 * * * *;HOMEASSISTANT_MQTT_PREFIX=homeassistant
    HOMEASSISTANT_NAME=Yi Camera;HOMEASSISTANT_IDENTIFIERS=yi-cam;HOMEASSISTANT_MANUFACTURER=YI
    HOMEASSISTANT_MODEL=YI Hack;HOMEASSISTANT_RETAIN=1;HOMEASSISTANT_QOS=1`),
  ptz_presets: conf('0=home;1=door;2=window;3=;4=;5=;6=;7='),
  proxychains: conf('PROXYCHAINS_SERVERS=socks5 127.0.0.1 1080'),
};

let persisted, applied, hostname, events, timelapse;
function resetState() {
  persisted = structuredClone(SEED);
  applied = structuredClone(SEED.camera); // live state, camera_settings writes here
  hostname = 'yi-cam-mock';
  events = ['09', '10', '11', '12', '13', '14'].map((h) => ({
    dirname: `2026Y08M23D${h}H`, date: '2026-08-23', hour: h,
    files: ['05M00S60.mp4', '17M30S60.mp4', '42M10S60.mp4'],
  }));
  timelapse = [
    { date: 'Date: 2026-08-22', time: 'Time: 12:00:00', filename: '2026-08-22_12-00-00.avi' },
    { date: 'Date: 2026-08-23', time: 'Time: 06:30:00', filename: '2026-08-23_06-30-00.avi' },
  ];
}
resetState();
let statusCount = 0;
let rebootUntil = 0;

// ----------------------------------------------------------------- helpers

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Raw (undecoded) query string, like the CGI's $QUERY_STRING.
const rawQuery = (req) => req.url.split('?')[1] ?? '';
// key=value pairs split on '&', at most `cap` parsed (extra silently dropped).
const parseParams = (raw, cap) =>
  raw.split('&').filter(Boolean).slice(0, cap).map((p) => {
    const i = p.indexOf('=');
    return i < 0 ? [p, ''] : [p.slice(0, i), p.slice(i + 1)];
  });
// The `cut -d'=' -f2` idiom: field 2 of the WHOLE query string.
const cutValue = (raw) => raw.split('=')[1] ?? '';

function send(ctx, body, type = 'application/json', headers = {}) {
  const h = type ? { 'Content-Type': type, ...headers } : headers;
  ctx.res.writeHead(200, h);
  ctx.res.end(body);
  const preview = Buffer.isBuffer(body)
    ? `<${body.length} bytes>` : String(body ?? '').slice(0, 80) || '<empty>';
  const delay = ctx.slept ? ` [slept ${ctx.slept}ms]` : '';
  console.log(`${ctx.req.method} ${ctx.req.url} -> ${type || 'no content-type'} ${preview}${delay}`);
}

const readBody = (req) => new Promise((resolve) => {
  const chunks = [];
  req.on('data', (c) => chunks.push(c));
  req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
});

// Hand-built (order-preserving, unescaped like the real printf) conf JSON.
const confJson = (map, extra = {}) =>
  '{' +
  [...Object.entries(map), ...Object.entries(extra)]
    .map(([k, v]) => `"${k}":"${v}"`).join(',') +
  ',"NULL":"NULL"}';

// -------------------------------------------------------------------- routes

async function cameraSettings(ctx) {
  const params = parseParams(rawQuery(ctx.req), 15);
  const binary = {
    switch_on: 'SWITCH_ON', save_video_on_motion: 'SAVE_VIDEO_ON_MOTION',
    ai_human_detection: 'AI_HUMAN_DETECTION', ai_vehicle_detection: 'AI_VEHICLE_DETECTION',
    ai_animal_detection: 'AI_ANIMAL_DETECTION', face_detection: 'FACE_DETECTION',
    motion_tracking: 'MOTION_TRACKING', sound_detection: 'SOUND_DETECTION',
    led: 'LED', ir: 'IR', rotate: 'ROTATE',
  };
  const enums = {
    motion_detection: ['yes', 'no'], sensitivity: ['low', 'medium', 'high'],
    sound_sensitivity: ['30', '35', '40', '45', '50', '60', '70', '80', '90'],
    cruise: ['no', 'presets', '360'],
  };
  for (const [name, value] of params) {
    await sleep(500); // firmware's unconditional per-iteration sleep 0.5
    ctx.slept += 500;
    if (STR_BLOCK.test(name) || STR_BLOCK.test(value)) return send(ctx, ERR_TRUE);
    if (name in binary) {
      applied[binary[name]] = value === 'no' ? 'no' : 'yes'; // only 'no' means off
      if (name === 'switch_on' && value === 'no') { await sleep(1000); ctx.slept += 1000; }
    } else if (name in enums && enums[name].includes(value)) {
      applied[name === 'motion_detection' ? 'MOTION_DETECTION'
        : name === 'sensitivity' ? 'SENSITIVITY'
        : name === 'sound_sensitivity' ? 'SOUND_SENSITIVITY' : 'CRUISE'] = value;
      if (name === 'cruise' && value !== 'no') { await sleep(500); ctx.slept += 500; }
    } // out-of-domain enum values and unknown params: silently dropped
  }
  // NOTE: `persisted.camera` is deliberately NOT updated (A1 persistence bug).
  send(ctx, ERR_FALSE);
}

function getConfigs(ctx) {
  const raw = rawQuery(ctx.req);
  if (QS_BLOCK.test(raw)) return send(ctx, ERR_TRUE);
  const conf = raw.split('=')[0] === 'conf' ? cutValue(raw) : '';
  if (conf === 'proxychains') return send(ctx, confJson(persisted.proxychains));
  if (conf === 'camera')
    return send(ctx, confJson(persisted.camera, { HOMEVER: '7.1.00.26A_202101191703' }));
  if (conf === 'system')
    return send(ctx, confJson(persisted.system, { HOSTNAME: hostname }));
  if (['mqtt', 'mqtt_advertise', 'ptz_presets'].includes(conf))
    return send(ctx, confJson(persisted[conf]));
  send(ctx, '{"NULL":"NULL"}'); // any other value = missing file, not an error
}

async function setConfigs(ctx) {
  const raw = rawQuery(ctx.req);
  const body = await readBody(ctx.req);
  if (QS_BLOCK.test(raw)) return send(ctx, ERR_TRUE);
  const conf = raw.split('=')[0] === 'conf' ? cutValue(raw) : '';
  const target = persisted[conf]; // mqtt already keyed as mqttv4 contents
  let obj;
  try {
    obj = JSON.parse(body.split('\n')[0]); // `read -r`: first line only
  } catch { return send(ctx, ERR_TRUE); }
  if (typeof obj !== 'object' || obj === null) return send(ctx, ERR_TRUE);
  for (const [key, value] of Object.entries(obj)) {
    if (KEY_BLOCK.test(key)) return send(ctx, ERR_TRUE);
    if (key === 'HOSTNAME') { hostname = String(value) || 'yi-hack'; continue; }
    if (key === 'PROXYCHAINS_SERVERS') { persisted.proxychains[key] = String(value); continue; }
    if (key === 'MOTION_IMAGE_DELAY' &&
        !(NUM_OK.test(String(value)) && Number(value) <= 5.0)) continue;
    if (key === 'TIMELAPSE_DT') {
      const ok = ['1','2','3','4','5','6','10','15','20','30','60','120','180','240','360','1440']
        .includes(String(value)) ||
        (/^1440\+\d+$/.test(String(value)) && Number(String(value).slice(5)) <= 1440);
      if (!ok) continue; // silently dropped, still error=false
    }
    // Generic keys: written only if the key already exists in the target file.
    if (target && key in target) target[key] = String(value);
  }
  send(ctx, ERR_FALSE);
}

function statusJson(ctx) {
  statusCount += 1;
  const up = Math.floor((Date.now() - START) / 1000);
  const hh = String(Math.floor((up % 86400) / 3600)).padStart(2, '0');
  const mm = String(Math.floor((up % 3600) / 60)).padStart(2, '0');
  // Every 20th response: unescaped quote in wlan_essid = malformed JSON,
  // like the real script's raw interpolation.
  const essid = statusCount % 20 === 0 ? 'Mock"Net' : 'MockNet';
  const body = '{' + [
    ['name', 'yi-hack-allwinner-v2'], ['hostname', hostname],
    ['fw_version', '0.5.4'], ['home_version', '7.1.00.26A_202101191703'],
    ['model_suffix', 'h51ga'], ['ptz', 'yes'], ['go2rtc', 'no'],
    ['serial_number', 'MOCK0123456789ABCDEF'], ['local_time', new Date().toString()],
    ['uptime', `${Math.floor(up / 86400)} days, ${hh}:${mm}`],
    ['load_avg', '0.42, 0.35, 0.30'], ['total_memory', '73048 kB'],
    ['free_memory', '18204 kB'], ['free_sd', '42%'], ['local_ip', LOCAL_IP],
    ['netmask', '255.255.255.0'], ['gateway', '192.168.10.1'],
    ['mac_addr', '0C:8C:24:A1:B2:C3'], ['wlan_essid', essid], ['wlan_strength', '55'],
  ].map(([k, v]) => `"${k}":"${v}"`).join(',') + '}';
  send(ctx, body);
}

function snapshot(ctx) {
  const raw = rawQuery(ctx.req);
  if (QS_BLOCK.test(raw)) return send(ctx, ERR_TRUE);
  const params = Object.fromEntries(parseParams(raw, 4));
  if (params.file && !params.file.startsWith('.') && !params.file.includes('/'))
    return send(ctx, ERR_FALSE); // save-to-disk path returns JSON
  if (params.base64 === 'yes') return send(ctx, JPEG_B64, 'image/jpeg;base64');
  send(ctx, JPEG, 'image/jpeg'); // res/watermark accepted but same tiny JPEG
}

function eventsDir(ctx) {
  const records = events
    .map((d) => `{"datetime":"Date: ${d.date} Time: ${d.hour}:00","dirname":"${d.dirname}"}`)
    .join(',');
  send(ctx, `{"records":[${records}],"error":"false"}`);
}

function eventsFile(ctx) {
  const raw = rawQuery(ctx.req);
  if (QS_BLOCK.test(raw) || raw.split('=')[0] !== 'dirname') return send(ctx, ERR_TRUE);
  const dir = events.find((d) => d.dirname === cutValue(raw));
  if (!dir) return send(ctx, '{"error":"false","date":"","records":[]}');
  const records = dir.files.map((f) =>
    `{"time":"Time: ${dir.hour}:${f.slice(0, 2)}","filename":"${f}","thumbfilename":"${f.replace('.mp4', '.jpg')}"}`
  ).join(',');
  send(ctx, `{"error":"false","date":"${dir.date}","records":[${records}]}`);
}

function eventsDirDel(ctx) {
  const raw = rawQuery(ctx.req);
  if (QS_BLOCK.test(raw)) return send(ctx, ERR_TRUE);
  const [key, value] = parseParams(raw, 1)[0] ?? [];
  if (key === 'dir') events = value === 'all' ? [] : events.filter((d) => d.dirname !== value);
  send(ctx, ERR_FALSE); // always error=false on the pass path, even on a no-op
}

function eventsFileDel(ctx) {
  const raw = rawQuery(ctx.req);
  if (QS_BLOCK.test(raw)) return send(ctx, ERR_TRUE);
  const [key, file] = parseParams(raw, 1)[0] ?? [];
  // validateRecFile: length 27/29 with fixed Y/M/D/H + M + S marker positions.
  const ok = key === 'file' && file && (file.length === 27 || file.length === 29) &&
    file[4] === 'Y' && file[7] === 'M' && file[10] === 'D' && file[13] === 'H' &&
    (file[17] === 'M' || file[19] === 'M') && (file[20] === 'S' || file[22] === 'S');
  if (!ok) return send(ctx, ERR_TRUE);
  const [dirname, filename] = file.split('/');
  const dir = events.find((d) => d.dirname === dirname);
  if (dir) dir.files = dir.files.filter((f) => f !== filename);
  send(ctx, ERR_FALSE); // rm -f never fails, even when the file was absent
}

function ptz(ctx) {
  const raw = rawQuery(ctx.req);
  if (QS_BLOCK.test(raw)) return send(ctx, ERR_TRUE);
  const p = Object.fromEntries(parseParams(raw, 5));
  for (const k of ['x', 'y', 'time'])
    if (p[k] !== undefined && !NUM_OK.test(p[k])) return send(ctx, ERR_TRUE);
  if (p.dir !== undefined && STR_BLOCK.test(p.dir)) return send(ctx, ERR_TRUE);
  if (!['step', 'abs', 'rel', 'cont', undefined].includes(p.action)) return send(ctx, ERR_TRUE);
  send(ctx, ERR_FALSE); // error=false even when dir=none moved nothing
}

function preset(ctx) {
  const raw = rawQuery(ctx.req);
  if (QS_BLOCK.test(raw)) return send(ctx, '{"error":"true","message":"Invalid query"}');
  const p = Object.fromEntries(parseParams(raw, 3));
  const action = p.action ?? 'none';
  if (action === 'none' || action === 'get_presets')
    return send(ctx, '{"error":"true","message":"-99"}'); // read via get_configs instead
  if (p.num !== undefined && p.num !== 'all' && !NUM_OK.test(p.num))
    return send(ctx, '{"error":"true","message":"Wrong arguments"}');
  if (p.name !== undefined && STR_BLOCK.test(p.name))
    return send(ctx, '{"error":"true","message":"Wrong arguments"}');
  const presets = persisted.ptz_presets;
  if (action === 'add_preset') {
    const slot = p.num ?? Object.keys(presets).find((k) => presets[k] === '');
    if (slot !== undefined) presets[slot] = p.name ?? `preset_${slot}`;
  } else if (action === 'del_preset') {
    if (p.num === 'all') for (const k of Object.keys(presets)) presets[k] = '';
    else if (p.num !== undefined) presets[p.num] = '';
  } else if (!['go_preset', 'set_home_position'].includes(action)) {
    return send(ctx, '{"error":"true","message":"Wrong arguments"}');
  }
  send(ctx, ERR_FALSE);
}

async function wifi(ctx) {
  const raw = rawQuery(ctx.req);
  const body = await readBody(ctx.req);
  if (raw.split('=')[0] !== 'action') return send(ctx, '', null); // empty, no headers
  const action = cutValue(raw);
  if (action === 'scan') {
    // Trailing "" element absorbs the real script's trailing comma.
    const list = ['MockNet', 'MockNet-5G', 'NeighborWifi', 'xfinitywifi', ''];
    return send(ctx, `{"wifi":[${list.map((s) => `"${s}"`).join(',')}]}`);
  }
  if (action === 'save') {
    try {
      const o = JSON.parse(body.split('\n')[0]);
      if (o.WIFI_PASSWORD !== o.WIFI_PASSWORD2) return send(ctx, ERR_TRUE);
      await sleep(1000); ctx.slept += 1000; // configure_wifi.sh + sleep 1
      return send(ctx, ERR_FALSE);
    } catch { return send(ctx, ERR_TRUE); }
  }
  send(ctx, '', null); // any other action: empty body, no Content-type
}

async function speak(ctx) {
  const raw = rawQuery(ctx.req);
  const body = await readBody(ctx.req);
  if (QS_BLOCK.test(raw)) return send(ctx, ERR_TRUE);
  const p = Object.fromEntries(parseParams(raw, 2));
  if (p.lang !== undefined && !/^[A-Za-z-]{5}$/.test(p.lang))
    return send(ctx, '{"error":"true","description":"Invalid language"}', null);
  if (p.vol !== undefined && !NUM_OK.test(p.vol))
    return send(ctx, '{"error":"true","description":"Invalid volume"}', null);
  if (p.voldb !== undefined && !NUM_OK.test(p.voldb))
    return send(ctx, '{"error":"true","description":"Invalid volume (dB)"}', null);
  await sleep(1000); ctx.slept += 1000;
  // Text spliced back raw/unescaped, exactly like the script (a `"` breaks it).
  send(ctx, `{"error":"false","description":"${body.split('\n')[0]}"}`);
}

async function speakerFile(ctx) {
  const file = (await readBody(ctx.req)).split('\n')[0];
  if (!file) // faithful malformed body: missing comma, like the real script
    return send(ctx, '{"error":"true""description":"File not found"}');
  await sleep(1000); ctx.slept += 1000;
  send(ctx, `{"error":"false","description":"${file}"}`);
}

function timelapseRoute(ctx) {
  const raw = rawQuery(ctx.req);
  if (QS_BLOCK.test(raw)) return send(ctx, ERR_TRUE);
  const p = Object.fromEntries(parseParams(raw, 2));
  if (p.action === 'list') {
    const records = timelapse
      .map((r) => `{"date":"${r.date}","time":"${r.time}","filename":"${r.filename}"}`)
      .join(',');
    return send(ctx, `{"error":"false","records":[${records}]}`);
  }
  if (p.action === 'delete') {
    const f = p.file ?? '';
    const ok = f.length === 23 && f[4] === '-' && f[7] === '-' && f[10] === '_' &&
      f[13] === '-' && f[16] === '-' && f.endsWith('.avi');
    if (!ok) return send(ctx, ERR_TRUE);
    timelapse = timelapse.filter((r) => r.filename !== f);
    return send(ctx, ERR_FALSE);
  }
  send(ctx, '', null); // any other action: completely empty response
}

function fwUpgrade(ctx) {
  const raw = rawQuery(ctx.req);
  if (QS_BLOCK.test(raw)) return send(ctx, ERR_TRUE);
  if (raw.split('=')[0] !== 'get') return send(ctx, '', null);
  const mode = cutValue(raw);
  if (mode === 'info') // local_fw is the API's ONE bare JSON boolean
    return send(ctx, '{"error":"false","fw_version":"0.5.4","latest_fw":"0.5.5","local_fw":false}');
  if (mode === 'upgrade') return send(ctx, 'No new firmware available.\n', 'text/html');
  send(ctx, '', null);
}

function reboot(ctx) {
  send(ctx, ERR_FALSE);
  setTimeout(() => { // reply first, then "reboot": ~10s of dropped connections
    rebootUntil = Date.now() + 10_000;
    console.log('-- simulating reboot: dropping connections for 10s --');
    for (const s of sockets) s.destroy();
  }, 200);
}

function links(ctx) {
  const port = persisted.system.HTTPD_PORT === '80' ? '' : `:${persisted.system.HTTPD_PORT}`;
  send(ctx, JSON.stringify({
    low_res_stream: `rtsp://${LOCAL_IP}/ch0_1.h264`,
    high_res_stream: `rtsp://${LOCAL_IP}/ch0_0.h264`,
    audio_stream: `rtsp://${LOCAL_IP}/ch0_2.h264`,
    low_res_snapshot: `http://${LOCAL_IP}${port}/cgi-bin/snapshot.sh?res=low&watermark=yes`,
    high_res_snapshot: `http://${LOCAL_IP}${port}/cgi-bin/snapshot.sh?res=high&watermark=yes`,
  }));
}

const routes = {
  '/cgi-bin/camera_settings.sh': cameraSettings,
  '/cgi-bin/get_configs.sh': getConfigs,
  '/cgi-bin/set_configs.sh': setConfigs,
  '/cgi-bin/status.json': statusJson,
  '/cgi-bin/snapshot.sh': snapshot,
  '/cgi-bin/eventsdir.sh': eventsDir,
  '/cgi-bin/eventsfile.sh': eventsFile,
  '/cgi-bin/eventsdirdel.sh': eventsDirDel,
  '/cgi-bin/eventsfiledel.sh': eventsFileDel,
  '/cgi-bin/ptz.sh': ptz,
  '/cgi-bin/preset.sh': preset,
  '/cgi-bin/wifi.sh': wifi,
  '/cgi-bin/speak.sh': speak,
  '/cgi-bin/speaker.sh': async (ctx) => { await readBody(ctx.req); send(ctx, '{"error":"false","description":""}'); },
  '/cgi-bin/speaker_file.sh': speakerFile,
  '/cgi-bin/timelapse.sh': timelapseRoute,
  '/cgi-bin/fw_upgrade.sh': fwUpgrade,
  '/cgi-bin/reboot.sh': reboot,
  '/cgi-bin/reset.sh': (ctx) => { resetState(); send(ctx, ERR_FALSE); },
  '/cgi-bin/save.sh': (ctx) => send(ctx, SEVENZ, 'application/octet-stream',
    { 'Content-Disposition': 'attachment; filename="config.7z"' }),
  '/cgi-bin/load.sh': async (ctx) => {
    const body = await readBody(ctx.req);
    if (body.length > 10000) return send(ctx, '', null); // silent empty exit
    send(ctx, 'Upload completed successfully, restart your camera', 'text/html');
  },
  '/cgi-bin/proxy.sh': (ctx) => {
    const raw = rawQuery(ctx.req);
    if (QS_BLOCK.test(raw) || raw.split('&')[0].split('=')[0] !== 'proxy')
      return send(ctx, ERR_TRUE);
    send(ctx, '{"error":"false","result":{"ip":"203.0.113.7","city":"Milan","region":"Lombardy","country":"IT","org":"AS64496 MockISP"}}');
  },
  '/cgi-bin/hostname.js': (ctx) => send(ctx, `hostname="${hostname}";`, 'text/javascript'),
  '/cgi-bin/links.sh': links,
};

// -------------------------------------------------------------------- server

const sockets = new Set();
const server = http.createServer(async (req, res) => {
  const ctx = { req, res, slept: 0 };
  try {
    const pathname = req.url.split('?')[0];
    if (pathname.startsWith('/record/')) {
      if (pathname.endsWith('.jpg')) return send(ctx, JPEG, 'image/jpeg');
      if (pathname.endsWith('.mp4')) return send(ctx, MP4, 'video/mp4; charset=utf-8');
    }
    const handler = routes[pathname];
    if (!handler) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return console.log(`${req.method} ${req.url} -> 404`);
    }
    await handler(ctx);
  } catch (e) {
    if (!res.headersSent) send(ctx, ERR_TRUE);
    console.error('handler error:', e);
  }
});
server.on('connection', (s) => {
  sockets.add(s);
  s.on('close', () => sockets.delete(s));
  if (Date.now() < rebootUntil) s.destroy(); // "rebooting": refuse everything
});
server.listen(PORT, () => {
  console.log(`mock yi-hack camera listening on http://localhost:${PORT}`);
  console.log(`panel dev proxy: set CAM_HOST=http://localhost:${PORT} in panel/.env.local`);
});
