import { addonBuilder, serveHTTP } from 'stremio-addon-sdk'
import parseTorrentTitle from 'parse-torrent-title'

const manifest = {
  id: 'org.frameiq.clean',
  version: '1.0.0',
  name: 'FrameIQ Clean',
  description: 'Smart stream sorting addon',
  resources: ['stream'],
  types: ['movie', 'series'],
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

  const streams = [
    {
      title: '4K REMUX DV ATMOS',
      url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'
    },
    {
      title: '1080p HDR',
      url: 'https://test-streams.mux.dev/test_001/stream.m3u8'
    }
  ]

  const sorted = streams
    .map(stream => ({
      ...stream,
      ...scoreStream(stream.title)
    }))
    .sort((a, b) => b.score - a.score)

  return { streams: sorted }
})

serveHTTP(builder.getInterface(), {
  port: process.env.PORT || 3000
})
