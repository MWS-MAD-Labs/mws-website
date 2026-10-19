# Virtual Tour API

Base URL lokal: `http://localhost:4004`.

Endpoint admin membutuhkan cookie session CMS dengan permission `content:manage`.
Panorama harus menggunakan UUID gambar yang sudah ada di Gallery.

```bash
export BASE_URL=http://localhost:4004
export CMS_SESSION='paste-session-cookie-value'
export PANORAMA_IMAGE_ID='paste-gallery-image-uuid'
```

## Public

```bash
curl -i "$BASE_URL/api/virtual-tours"
curl -i "$BASE_URL/api/virtual-tours/tour-kampus"
```

## Tour

```bash
curl -i -X POST "$BASE_URL/admin/virtual-tours" \
  -H 'Content-Type: application/json' \
  -H "Cookie: mws_cms_session=$CMS_SESSION" \
  --data '{"title":"Tour Kampus","slug":"tour-kampus","description":"Tur virtual area sekolah","status":"DRAFT"}'

curl -i "$BASE_URL/admin/virtual-tours" \
  -H "Cookie: mws_cms_session=$CMS_SESSION"

curl -i -X PATCH "$BASE_URL/admin/virtual-tours/$TOUR_ID" \
  -H 'Content-Type: application/json' \
  -H "Cookie: mws_cms_session=$CMS_SESSION" \
  --data '{"status":"PUBLISHED"}'
```

## Scene

Create two scenes before creating a link. Save both response IDs as `SCENE_ID` and
`TARGET_SCENE_ID`.

```bash
curl -i -X POST "$BASE_URL/admin/virtual-tours/$TOUR_ID/scenes" \
  -H 'Content-Type: application/json' \
  -H "Cookie: mws_cms_session=$CMS_SESSION" \
  --data "{\"panoramaImageId\":\"$PANORAMA_IMAGE_ID\",\"name\":\"Lobby\",\"slug\":\"lobby\",\"initialYaw\":0,\"initialPitch\":0,\"sortOrder\":0,\"isActive\":true}"

curl -i -X PATCH "$BASE_URL/admin/virtual-tours/$TOUR_ID/scenes/$SCENE_ID" \
  -H 'Content-Type: application/json' \
  -H "Cookie: mws_cms_session=$CMS_SESSION" \
  --data '{"initialYaw":25,"initialPitch":-5}'
```

## Link Antar-scene

```bash
curl -i -X POST "$BASE_URL/admin/virtual-tours/$TOUR_ID/scenes/$SCENE_ID/links" \
  -H 'Content-Type: application/json' \
  -H "Cookie: mws_cms_session=$CMS_SESSION" \
  --data "{\"toSceneId\":\"$TARGET_SCENE_ID\",\"label\":\"Ke koridor\",\"yaw\":90,\"pitch\":0,\"sortOrder\":0}"

curl -i "$BASE_URL/admin/virtual-tours/$TOUR_ID/scenes/$SCENE_ID/links" \
  -H "Cookie: mws_cms_session=$CMS_SESSION"
```

Import `virtual-tour.postman_collection.json` dari folder ini untuk seluruh
request CRUD. Isi collection variables `cmsSession`, `panoramaImageId`, dan
`targetPanoramaImageId`, lalu jalankan request berurutan. ID hasil create akan
disimpan otomatis oleh Postman.
