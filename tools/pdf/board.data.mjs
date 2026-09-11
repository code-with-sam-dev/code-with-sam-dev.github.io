/**
 * GENERATED FILE. Do not edit.
 *
 * The architecture board, resolved. Written by
 * kafka-youtube-video/motion/tools/export-board-data.mjs from src/board.ts,
 * which is the single description the video and this sheet both draw.
 *
 * Regenerate with:
 *     node tools/export-board-data.mjs <this file>
 *
 * Editing this by hand makes the PDF disagree with the video, which is the one
 * thing splitting the board into two renderers was meant to prevent.
 */
export const BOARD = {
  "width": 1800,
  "height": 1072
};

export const TYPE = {
  "groupLabel": 26,
  "label": 18,
  "sub": 13,
  "bullet": 13,
  "badge": 14
};

export const GROUPS = [
  {
    "id": "clients",
    "label": "CLIENTS",
    "x": 40,
    "y": 70,
    "width": 200,
    "height": 570,
    "cols": 1,
    "rows": 2,
    "gutterY": 80,
    "tint": "#D6F2E8",
    "edge": "#12A87A",
    "labelColor": "#12A87A",
    "labelSize": 20
  },
  {
    "id": "edge",
    "label": "EDGE AND SECURITY",
    "x": 370,
    "y": 70,
    "width": 230,
    "height": 570,
    "cols": 1,
    "rows": 2,
    "gutterY": 80,
    "tint": "#E8E3FF",
    "edge": "#7C5CFF",
    "labelColor": "#7C5CFF",
    "labelSize": 18.595825426944973
  },
  {
    "id": "core",
    "label": "CORE WALLET PLATFORM",
    "x": 730,
    "y": 70,
    "width": 600,
    "height": 570,
    "cols": 2,
    "rows": 3,
    "gutterX": 120,
    "gutterY": 64,
    "tint": "#F4F0FF",
    "edge": "#12161F",
    "labelColor": "#12161F",
    "labelSize": 20
  },
  {
    "id": "async",
    "label": "ASYNC AND EVENTING",
    "x": 1460,
    "y": 70,
    "width": 300,
    "height": 570,
    "cols": 1,
    "rows": 3,
    "gutterY": 64,
    "tint": "#F6F0E7",
    "edge": "#8A6B3F",
    "labelColor": "#8A6B3F",
    "labelSize": 20
  },
  {
    "id": "obs",
    "label": "OBSERVABILITY, CROSS CUTTING",
    "x": 40,
    "y": 760,
    "width": 1120,
    "height": 272,
    "cols": 4,
    "rows": 1,
    "gutterX": 40,
    "tint": "#FCF0F3",
    "edge": "#5A6473",
    "labelColor": "#5A6473",
    "labelSize": 20
  },
  {
    "id": "fail",
    "label": "FAILURE AND UNCERTAIN OUTCOME",
    "x": 1220,
    "y": 760,
    "width": 540,
    "height": 272,
    "cols": 2,
    "rows": 2,
    "gutterX": 40,
    "gutterY": 40,
    "tint": "#FCE9E9",
    "edge": "#D93A3A",
    "labelColor": "#D93A3A",
    "labelSize": 20
  }
];

export const BOXES = [
  {
    "id": "sender",
    "group": "clients",
    "col": 0,
    "row": 0,
    "label": "Sender app",
    "sub": "starts the transfer",
    "stroke": "#12A87A",
    "rect": {
      "x": 60,
      "y": 196,
      "width": 160,
      "height": 132,
      "cx": 140,
      "cy": 262
    },
    "drawnShape": "box",
    "glyph": null,
    "glyphSpot": null
  },
  {
    "id": "receiver",
    "group": "clients",
    "col": 0,
    "row": 1,
    "label": "Receiver app",
    "sub": "never polls",
    "stroke": "#12A87A",
    "rect": {
      "x": 60,
      "y": 408,
      "width": 160,
      "height": 132,
      "cx": 140,
      "cy": 474
    },
    "drawnShape": "box",
    "glyph": null,
    "glyphSpot": null
  },
  {
    "id": "lb",
    "group": "edge",
    "col": 0,
    "row": 0,
    "label": "Load balancer",
    "sub": "TLS terminates here",
    "stroke": "#7C5CFF",
    "rect": {
      "x": 390,
      "y": 196,
      "width": 190,
      "height": 132,
      "cx": 485,
      "cy": 262
    },
    "drawnShape": "box",
    "glyph": null,
    "glyphSpot": null
  },
  {
    "id": "gw",
    "group": "edge",
    "col": 0,
    "row": 1,
    "label": "API gateway",
    "stroke": "#7C5CFF",
    "bullets": [
      "Auth",
      "Rate limiting",
      "Correlation id"
    ],
    "rect": {
      "x": 390,
      "y": 408,
      "width": 190,
      "height": 132,
      "cx": 485,
      "cy": 474
    },
    "drawnShape": "box",
    "glyph": null,
    "glyphSpot": null
  },
  {
    "id": "transfer",
    "group": "core",
    "col": 0,
    "row": 0,
    "label": "Transfer service",
    "bullets": [
      "Owns the lifecycle",
      "Idempotency",
      "Status transitions"
    ],
    "rect": {
      "x": 750,
      "y": 116,
      "width": 220,
      "height": 125.33333333333333,
      "cx": 860,
      "cy": 178.66666666666666
    },
    "drawnShape": "box",
    "glyph": null,
    "glyphSpot": null
  },
  {
    "id": "idem",
    "group": "core",
    "col": 1,
    "row": 0,
    "label": "Idempotency store",
    "sub": "key, request hash, result",
    "rect": {
      "x": 1090,
      "y": 116,
      "width": 220,
      "height": 125.33333333333333,
      "cx": 1200,
      "cy": 178.66666666666666
    },
    "drawnShape": "box",
    "glyph": null,
    "glyphSpot": null
  },
  {
    "id": "db",
    "group": "core",
    "col": 0,
    "row": 1,
    "label": "Financial DB",
    "shape": "cylinder",
    "tech": "postgresql",
    "bullets": [
      "Transfers",
      "Ledger entries",
      "Outbox events"
    ],
    "rect": {
      "x": 750,
      "y": 305.3333333333333,
      "width": 220,
      "height": 125.33333333333333,
      "cx": 860,
      "cy": 368
    },
    "drawnShape": "box",
    "glyph": "store",
    "glyphSpot": {
      "x": 928,
      "y": 390.66666666666663,
      "size": 26
    }
  },
  {
    "id": "ledger",
    "group": "core",
    "col": 1,
    "row": 1,
    "label": "Ledger",
    "sub": "append only, double entry",
    "stroke": "#7C5CFF",
    "rect": {
      "x": 1090,
      "y": 305.3333333333333,
      "width": 220,
      "height": 125.33333333333333,
      "cx": 1200,
      "cy": 368
    },
    "drawnShape": "box",
    "glyph": null,
    "glyphSpot": null
  },
  {
    "id": "outbox",
    "group": "core",
    "col": 0,
    "row": 2,
    "label": "Outbox table",
    "sub": "in the same commit",
    "stroke": "#7C5CFF",
    "rect": {
      "x": 750,
      "y": 494.66666666666663,
      "width": 220,
      "height": 125.33333333333333,
      "cx": 860,
      "cy": 557.3333333333333
    },
    "drawnShape": "box",
    "glyph": null,
    "glyphSpot": null
  },
  {
    "id": "balance",
    "group": "core",
    "col": 1,
    "row": 2,
    "label": "Balance",
    "sub": "derived, never edited",
    "rect": {
      "x": 1090,
      "y": 494.66666666666663,
      "width": 220,
      "height": 125.33333333333333,
      "cx": 1200,
      "cy": 557.3333333333333
    },
    "drawnShape": "box",
    "glyph": null,
    "glyphSpot": null
  },
  {
    "id": "publisher",
    "group": "async",
    "col": 0,
    "row": 0,
    "label": "Outbox relay",
    "sub": "at least once",
    "stroke": "#8A6B3F",
    "rect": {
      "x": 1480,
      "y": 116,
      "width": 260,
      "height": 125.33333333333333,
      "cx": 1610,
      "cy": 178.66666666666666
    },
    "drawnShape": "box",
    "glyph": null,
    "glyphSpot": null
  },
  {
    "id": "broker",
    "group": "async",
    "col": 0,
    "row": 1,
    "label": "Message broker",
    "sub": "wallet-events",
    "stroke": "#8A6B3F",
    "tech": "apachekafka",
    "rect": {
      "x": 1480,
      "y": 305.3333333333333,
      "width": 260,
      "height": 125.33333333333333,
      "cx": 1610,
      "cy": 368
    },
    "drawnShape": "box",
    "glyph": null,
    "glyphSpot": null
  },
  {
    "id": "notify",
    "group": "async",
    "col": 0,
    "row": 2,
    "label": "Notification service",
    "sub": "consumers are idempotent",
    "stroke": "#8A6B3F",
    "rect": {
      "x": 1480,
      "y": 494.66666666666663,
      "width": 260,
      "height": 125.33333333333333,
      "cx": 1610,
      "cy": 557.3333333333333
    },
    "drawnShape": "box",
    "glyph": null,
    "glyphSpot": null
  },
  {
    "id": "metrics",
    "group": "obs",
    "col": 0,
    "row": 0,
    "label": "Prometheus",
    "sub": "metrics and alerting",
    "stroke": "#5A6473",
    "tech": "prometheus",
    "rect": {
      "x": 60,
      "y": 843,
      "width": 240,
      "height": 132,
      "cx": 180,
      "cy": 909
    },
    "drawnShape": "box",
    "glyph": null,
    "glyphSpot": null
  },
  {
    "id": "dash",
    "group": "obs",
    "col": 1,
    "row": 0,
    "label": "Grafana",
    "sub": "alert on the invariant",
    "stroke": "#5A6473",
    "tech": "grafana",
    "rect": {
      "x": 340,
      "y": 843,
      "width": 240,
      "height": 132,
      "cx": 460,
      "cy": 909
    },
    "drawnShape": "box",
    "glyph": null,
    "glyphSpot": null
  },
  {
    "id": "logs",
    "group": "obs",
    "col": 2,
    "row": 0,
    "label": "Structured logs",
    "sub": "one correlation id, end to end",
    "stroke": "#5A6473",
    "rect": {
      "x": 620,
      "y": 843,
      "width": 240,
      "height": 132,
      "cx": 740,
      "cy": 909
    },
    "drawnShape": "box",
    "glyph": null,
    "glyphSpot": null
  },
  {
    "id": "traces",
    "group": "obs",
    "col": 3,
    "row": 0,
    "label": "Traces",
    "sub": "a span per hop",
    "stroke": "#5A6473",
    "tech": "opentelemetry",
    "rect": {
      "x": 900,
      "y": 843,
      "width": 240,
      "height": 132,
      "cx": 1020,
      "cy": 909
    },
    "drawnShape": "box",
    "glyph": null,
    "glyphSpot": null
  },
  {
    "id": "fail-retry",
    "group": "fail",
    "col": 0,
    "row": 0,
    "label": "The retry",
    "sub": "same key, same result",
    "stroke": "#D93A3A",
    "rect": {
      "x": 1240,
      "y": 806,
      "width": 230,
      "height": 83,
      "cx": 1355,
      "cy": 847.5
    },
    "drawnShape": "box",
    "glyph": null,
    "glyphSpot": null
  },
  {
    "id": "fail-race",
    "group": "fail",
    "col": 1,
    "row": 0,
    "label": "Two at once",
    "sub": "lost update",
    "stroke": "#D93A3A",
    "rect": {
      "x": 1510,
      "y": 806,
      "width": 230,
      "height": 83,
      "cx": 1625,
      "cy": 847.5
    },
    "drawnShape": "box",
    "glyph": null,
    "glyphSpot": null
  },
  {
    "id": "fail-crash",
    "group": "fail",
    "col": 0,
    "row": 1,
    "label": "Crash mid transfer",
    "sub": "money nowhere",
    "stroke": "#D93A3A",
    "tone": "bad",
    "shape": "terminal",
    "rect": {
      "x": 1240,
      "y": 929,
      "width": 230,
      "height": 83,
      "cx": 1355,
      "cy": 970.5
    },
    "drawnShape": "terminal",
    "glyph": null,
    "glyphSpot": null
  },
  {
    "id": "fail-publish",
    "group": "fail",
    "col": 1,
    "row": 1,
    "label": "Publish doubt",
    "sub": "sent twice",
    "stroke": "#D93A3A",
    "rect": {
      "x": 1510,
      "y": 929,
      "width": 230,
      "height": 83,
      "cx": 1625,
      "cy": 970.5
    },
    "drawnShape": "box",
    "glyph": null,
    "glyphSpot": null
  }
];

export const CONNECTORS = [
  {
    "kind": "step",
    "step": 1,
    "from": "sender",
    "to": "lb",
    "note": "POST /transfers",
    "d": "M 220 262 L 386 262",
    "badge": {
      "x": 269.8,
      "y": 262
    },
    "label": {
      "x": 329.56,
      "y": 250
    },
    "anchor": "middle",
    "room": 166
  },
  {
    "kind": "step",
    "step": 2,
    "from": "lb",
    "to": "gw",
    "note": "route",
    "d": "M 485 328 L 485 404",
    "badge": {
      "x": 485,
      "y": 350.8
    },
    "label": {
      "x": 495,
      "y": 382.16
    },
    "anchor": "start",
    "room": 245
  },
  {
    "kind": "step",
    "step": 3,
    "from": "gw",
    "to": "transfer",
    "note": "validated",
    "d": "M 580 474 L 665 474 L 665 178.66666666666666 L 746 178.66666666666666",
    "badge": {
      "x": 665,
      "y": 385.4
    },
    "label": {
      "x": 675,
      "y": 283.0799999999999
    },
    "anchor": "start",
    "room": 1115
  },
  {
    "kind": "step",
    "step": 4,
    "from": "transfer",
    "to": "idem",
    "note": "check the key",
    "d": "M 970 178.66666666666666 L 1086 178.66666666666666",
    "badge": {
      "x": 1004.8,
      "y": 178.66666666666666
    },
    "label": {
      "x": 1046.56,
      "y": 166.66666666666666
    },
    "anchor": "middle",
    "room": 116
  },
  {
    "kind": "step",
    "step": 5,
    "from": "transfer",
    "to": "db",
    "note": "one transaction",
    "d": "M 860 241.33333333333331 L 860 301.3333333333333",
    "badge": {
      "x": 860,
      "y": 259.3333333333333
    },
    "label": {
      "x": 870,
      "y": 284.93333333333334
    },
    "anchor": "start",
    "room": 920
  },
  {
    "kind": "step",
    "step": 6,
    "from": "db",
    "to": "ledger",
    "note": "double entry",
    "d": "M 970 368 L 1086 368",
    "badge": {
      "x": 1004.8,
      "y": 368
    },
    "label": {
      "x": 1046.56,
      "y": 356
    },
    "anchor": "middle",
    "room": 116
  },
  {
    "kind": "step",
    "step": 7,
    "from": "db",
    "to": "outbox",
    "note": "same commit",
    "d": "M 860 430.66666666666663 L 860 490.66666666666663",
    "badge": {
      "x": 860,
      "y": 448.66666666666663
    },
    "label": {
      "x": 870,
      "y": 474.26666666666665
    },
    "anchor": "start",
    "room": 920
  },
  {
    "kind": "step",
    "step": 8,
    "from": "ledger",
    "to": "balance",
    "note": "derived",
    "d": "M 1200 430.66666666666663 L 1200 490.66666666666663",
    "badge": {
      "x": 1200,
      "y": 448.66666666666663
    },
    "label": {
      "x": 1210,
      "y": 474.26666666666665
    },
    "anchor": "start",
    "room": 580
  },
  {
    "kind": "step",
    "step": 9,
    "from": "outbox",
    "to": "publisher",
    "note": "relay reads",
    "d": "M 860 620 L 860 656 L 1395 656 L 1395 178.66666666666666 L 1476 178.66666666666666",
    "badge": {
      "x": 1020.5,
      "y": 656
    },
    "label": {
      "x": 1213.1,
      "y": 644
    },
    "anchor": "middle",
    "room": 535
  },
  {
    "kind": "step",
    "step": 10,
    "from": "publisher",
    "to": "broker",
    "note": "publish event",
    "d": "M 1610 241.33333333333331 L 1610 301.3333333333333",
    "badge": {
      "x": 1610,
      "y": 259.3333333333333
    },
    "label": {
      "x": 1620,
      "y": 284.93333333333334
    },
    "anchor": "start",
    "room": 170
  },
  {
    "kind": "step",
    "step": 11,
    "from": "broker",
    "to": "notify",
    "note": "consume",
    "d": "M 1610 430.66666666666663 L 1610 490.66666666666663",
    "badge": {
      "x": 1610,
      "y": 448.66666666666663
    },
    "label": {
      "x": 1620,
      "y": 474.26666666666665
    },
    "anchor": "start",
    "room": 170
  },
  {
    "kind": "step",
    "step": 12,
    "from": "notify",
    "to": "receiver",
    "note": "push, not poll",
    "d": "M 1610 620 L 1610 678 L 140 678 L 140 544",
    "badge": {
      "x": 1169,
      "y": 678
    },
    "label": {
      "x": 639.8,
      "y": 666
    },
    "anchor": "middle",
    "room": 1470
  },
  {
    "kind": "tap",
    "from": "transfer",
    "to": "metrics",
    "note": "metrics",
    "d": "M 750 210.66666666666666 L 665 210.66666666666666 L 665 700 L 180 700 L 180 839",
    "badge": {
      "x": 665,
      "y": 357.4666666666667
    },
    "label": {
      "x": 675,
      "y": 537.6266666666667
    },
    "anchor": "start",
    "room": 65
  },
  {
    "kind": "tap",
    "from": "ledger",
    "to": "logs",
    "note": "logs",
    "d": "M 1310 400 L 1395 400 L 1395 722 L 740 722 L 740 839",
    "badge": {
      "x": 1198.5,
      "y": 722
    },
    "label": {
      "x": 962.7,
      "y": 710
    },
    "anchor": "middle",
    "room": 655
  },
  {
    "kind": "tap",
    "from": "publisher",
    "to": "traces",
    "note": "traces",
    "d": "M 1480 210.66666666666666 L 1395 210.66666666666666 L 1395 744 L 1020 744 L 1020 839",
    "badge": {
      "x": 1395,
      "y": 370.66666666666663
    },
    "label": {
      "x": 1405,
      "y": 566.6666666666667
    },
    "anchor": "start",
    "room": 65
  }
];
