{
  "name": "Auto-Post LinkedIn desde Google Sheets (BA)",
    "nodes": [
      {
        "parameters": {
          "rule": {
            "interval": [
              {
                "field": "minutes",
                "minutesInterval": 1
              }
            ]
          }
        },
        "id": "Schedule Trigger",
        "name": "Schedule Trigger",
        "type": "n8n-nodes-base.scheduleTrigger",
        "typeVersion": 1,
        "position": [240, 260]
      },
      {
        "parameters": {
          "operation": "read",
          "documentId": "={{ $env.GSHEET_DOC_ID }}",
          "sheetName": "posts",
          "options": {
            "returnAll": true
          }
        },
        "id": "Google Sheets - Read",
        "name": "Google Sheets - Read",
        "type": "n8n-nodes-base.googleSheets",
        "typeVersion": 4,
        "position": [460, 260],
        "credentials": {
          "googleSheetsOAuth2Api": {
            "id": "REEMPLAZAR",
            "name": "Google Sheets account"
          }
        }
      },
      {
        "parameters": {
          "jsCode": "const tz = 'America/Argentina/Buenos_Aires';\n\n// Luxon está disponible en n8n\nconst { DateTime } = require('luxon');\n\nconst now = DateTime.now().setZone(tz);\n\n// Items = filas de Google Sheets\nconst rows = items.map(i => i.json);\n\n// Normaliza y filtra candidatos\nconst candidates = rows\n  .map(r => {\n    const scheduledRaw = (r.scheduled_at ?? '').toString().trim();\n    const scheduled = scheduledRaw\n      ? DateTime.fromISO(scheduledRaw, { setZone: true }).setZone(tz)\n      : null;\n\n    return {\n      ...r,\n      _scheduled: scheduled,\n      _scheduledValid: scheduled?.isValid === true\n    };\n  })\n  .filter(r => {\n    const status = (r.status ?? 'PENDING').toString().toUpperCase().trim();\n    if (status === 'POSTED') return false;\n    if (!r._scheduledValid) return false;\n    return r._scheduled <= now;\n  })\n  .sort((a, b) => a._scheduled.toMillis() - b._scheduled.toMillis());\n\nif (!candidates.length) {\n  // Nada para publicar\n  return [];\n}\n\nconst nextPost = candidates[0];\n\n// Visibilidad default\nconst visibility = (nextPost.visibility ?? 'PUBLIC').toString().toUpperCase().trim();\n\nreturn [\n  {\n    json: {\n      id: nextPost.id,\n      text: nextPost.text,\n      scheduled_at: nextPost.scheduled_at,\n      author_urn: nextPost.author_urn || $env.LINKEDIN_AUTHOR_URN,\n      visibility,\n      now_ba: now.toISO()\n    }\n  }\n];"
        },
        "id": "Pick Next Post",
        "name": "Pick Next Post",
        "type": "n8n-nodes-base.code",
        "typeVersion": 2,
        "position": [690, 260]
      },
      {
        "parameters": {
          "method": "POST",
          "url": "https://api.linkedin.com/v2/ugcPosts",
          "authentication": "predefinedCredentialType",
          "nodeCredentialType": "httpHeaderAuth",
          "sendHeaders": true,
          "headerParameters": {
            "parameters": [
              {
                "name": "X-Restli-Protocol-Version",
                "value": "2.0.0"
              }
            ]
          },
          "sendBody": true,
          "contentType": "json",
          "jsonBody": "={\n  \"author\": $json.author_urn,\n  \"lifecycleState\": \"PUBLISHED\",\n  \"specificContent\": {\n    \"com.linkedin.ugc.ShareContent\": {\n      \"shareCommentary\": {\n        \"text\": $json.text\n      },\n      \"shareMediaCategory\": \"NONE\"\n    }\n  },\n  \"visibility\": {\n    \"com.linkedin.ugc.MemberNetworkVisibility\": $json.visibility\n  }\n}",
          "options": {
            "response": {
              "responseFormat": "json"
            }
          }
        },
        "id": "LinkedIn - Create Post",
        "name": "LinkedIn - Create Post",
        "type": "n8n-nodes-base.httpRequest",
        "typeVersion": 4,
        "position": [920, 260],
        "credentials": {
          "httpHeaderAuth": {
            "id": "REEMPLAZAR",
            "name": "LinkedIn Bearer Token"
          }
        }
      },
      {
        "parameters": {
          "jsCode": "const { DateTime } = require('luxon');\nconst tz = 'America/Argentina/Buenos_Aires';\n\nconst now = DateTime.now().setZone(tz).toISO();\n\n// LinkedIn devuelve headers / body; a veces el URN viene en 'id' o en headers según el endpoint.\n// Guardamos lo que podamos.\nconst postedId = $json.id || $json.urn || $json.value || '';\n\nreturn [\n  {\n    json: {\n      id: $node['Pick Next Post'].json.id,\n      status: 'POSTED',\n      posted_at: now,\n      linkedin_urn: postedId\n    }\n  }\n];"
        },
        "id": "Prepare Sheet Update",
        "name": "Prepare Sheet Update",
        "type": "n8n-nodes-base.code",
        "typeVersion": 2,
        "position": [1150, 260]
      },
      {
        "parameters": {
          "operation": "update",
          "documentId": "={{ $env.GSHEET_DOC_ID }}",
          "sheetName": "posts",
          "updateKey": "id",
          "options": {},
          "dataToSend": "autoMapInputData"
        },
        "id": "Google Sheets - Update",
        "name": "Google Sheets - Update",
        "type": "n8n-nodes-base.googleSheets",
        "typeVersion": 4,
        "position": [1380, 260],
        "credentials": {
          "googleSheetsOAuth2Api": {
            "id": "REEMPLAZAR",
            "name": "Google Sheets account"
          }
        }
      }
    ],
      "connections": {
    "Schedule Trigger": {
      "main": [
        [
          {
            "node": "Google Sheets - Read",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Google Sheets - Read": {
      "main": [
        [
          {
            "node": "Pick Next Post",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Pick Next Post": {
      "main": [
        [
          {
            "node": "LinkedIn - Create Post",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "LinkedIn - Create Post": {
      "main": [
        [
          {
            "node": "Prepare Sheet Update",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Prepare Sheet Update": {
      "main": [
        [
          {
            "node": "Google Sheets - Update",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "active": false,
    "settings": {
    "timezone": "America/Argentina/Buenos_Aires"
  }
}
