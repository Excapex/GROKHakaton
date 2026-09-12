#!/usr/bin/env node
/**
 * Run sandbox/ingest/manifest.py inside Daytona snapshot saglasnik-docs-v1.
 * Original PDFs stay local. Only manifests may be copied back to artifacts-local/
 * (gitignored). Usage:
 *   node --env-file=.env.local scripts/ingest-daytona.mjs /abs/path/a.pdf
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { basename, resolve } from 'node:path'
import { Daytona } from '@daytonaio/sdk'

if (!process.env.DAYTONA_API_KEY || !process.env.DAYTONA_SNAPSHOT) {
  throw new Error('Popuni DAYTONA_API_KEY i DAYTONA_SNAPSHOT u .env.local')
}
const pdfs = process.argv.slice(2).map((p) => resolve(p))
if (pdfs.length === 0) {
  console.error('Usage: node --env-file=.env.local scripts/ingest-daytona.mjs <pdf>...')
  process.exit(2)
}

const ingestSrc = await readFile(new URL('../sandbox/ingest/manifest.py', import.meta.url))
const daytona = new Daytona({ apiKey: process.env.DAYTONA_API_KEY })
const sandbox = await daytona.create({
  snapshot: process.env.DAYTONA_SNAPSHOT,
  language: 'python',
  autoStopInterval: 15,
})

try {
  await sandbox.process.executeCommand('mkdir -p in out', undefined, undefined, 30)
  await sandbox.fs.uploadFile(Buffer.from(ingestSrc), 'manifest.py')
  const summaries = []
  for (const pdf of pdfs) {
    const remotePdf = `in/${basename(pdf)}`
    const out = `out/${basename(pdf, '.pdf')}`
    await sandbox.fs.uploadFile(await readFile(pdf), remotePdf)
    const cmd = `python manifest.py ${JSON.stringify(remotePdf)} --out ${JSON.stringify(out)} --document-id ${JSON.stringify(basename(pdf, '.pdf'))}`
    const result = await sandbox.process.executeCommand(cmd, undefined, undefined, 600)
    if (result.exitCode !== 0) {
      throw new Error(`ingest failed for ${basename(pdf)}: ${result.result || result.exitCode}`)
    }
    console.log(String(result.result || '').trim())
    const manifestBuf = await sandbox.fs.downloadFile(`${out}/manifest.json`)
    const localDir = resolve('artifacts-local', 'ingest', basename(pdf, '.pdf'))
    await mkdir(localDir, { recursive: true })
    await writeFile(`${localDir}/manifest.json`, manifestBuf)
    const manifest = JSON.parse(String(manifestBuf))
    summaries.push({
      file: basename(pdf),
      document_id: manifest.document_id,
      page_count: manifest.page_count,
    })
  }
  console.log(JSON.stringify({ ok: true, documents: summaries }, null, 2))
} finally {
  await daytona.delete(sandbox)
}
