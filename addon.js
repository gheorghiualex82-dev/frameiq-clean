import pkg from 'stremio-addon-sdk'
import parseTorrentTitlePkg from 'parse-torrent-title'

const parseTorrentTitle =
  parseTorrentTitlePkg.default || parseTorrentTitlePkg

const { addonBuilder, serveHTTP } = pkg

const manifest = {
  id: 'org.frameiq.clean',
  version: '1.0.0',
  name: 'FrameIQ Clean',
  description: 'Smart stream sorting addon',
  resources: ['stream'],
  types: ['movie', 'series'],
  catalogs: [],
  idPrefixes: ['tt']
}

const builder = new addonBuilder(manifest)

function scoreStream(title = '') {
  const parsed = parseTorrentTitle(title)

  let score = 0

  if (/remux/i.test(title)) score += 100
  if (/2160p|4k/i.test(title)) score += 80
  if (/1080p/i.test(title)) score += 50
  if (/dolby.?vision|dv/i.test(title)) score += 40
  if (/atmos/i.test(title)) score += 30
  if (/hdr/i.test(title)) score += 20

  return {
    parsed,
    score
  }
}

builder.defineStreamHandler(async ({ type, id }) => {
  try {

    const response = await fetch(
      `https://comet.feels.legal/eyJtYXhSZXN1bHRzUGVyUmVzb2x1dGlvbiI6OCwibWF4U2l6ZSI6ODU4OTkzNDU5MjAsImNhY2hlZE9ubHkiOnRydWUsInNvcnRDYWNoZWRVbmNhY2hlZFRvZ2V0aGVyIjpmYWxzZSwicmVtb3ZlVHJhc2giOnRydWUsInJlc3VsdEZvcm1hdCI6WyJhbGwiXSwiZGVicmlkU2VydmljZXMiOlt7InNlcnZpY2UiOiJyZWFsZGVicmlkIiwiYXBpS2V5IjoiN1NFRktIRUdGQ0VIV1lHTlozNFBYSUVZVlhWWERKR0QyMlpEUE9HU1lVTlJSVFNBV1BUQSJ9XSwiZW5hYmxlVG9ycmVudCI6ZmFsc2UsImRlZHVwbGljYXRlU3RyZWFtcyI6dHJ1ZSwic2NyYXBlRGVicmlkQWNjb3VudFRvcnJlbnRzIjpmYWxzZSwiZGVicmlkU3RyZWFtUHJveHlQYXNzd29yZCI6IiIsImxhbmd1YWdlcyI6eyJyZXF1aXJlZCI6W10sImFsbG93ZWQiOltdLCJleGNsdWRlIjpbXSwicHJlZmVycmVkIjpbXX0sInJlc29sdXRpb25zIjp7fSwib3B0aW9ucyI6eyJyZW1vdmVfcmFua3NfdW5kZXIiOi0xMDAwMDAwMDAwMCwiYWxsb3dfZW5nbGlzaF9pbl9sYW5ndWFnZXMiOmZhbHNlLCJyZW1vdmVfdW5rbm93bl9sYW5ndWFnZXMiOmZhbHNlfX0=/stream/${type}/${id}.json`
    )

    const data = await response.json()

    console.log(data)

    const streams = Array.isArray(data.streams)
      ? data.streams
      : []

const sorted = streams
  .map(stream => ({
    ...stream,
    name: 'FrameIQ Clean',
    ...scoreStream(stream.title || '')
  }))
  .sort((a, b) => b.score - a.score)
return { streams: sorted }

} catch (e) {

  console.log(e)

  return { streams: [] }

}
})
