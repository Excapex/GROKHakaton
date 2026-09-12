// Creates and deletes ONLY this fresh smoke sandbox. No user project is loaded.
import {Daytona} from '@daytonaio/sdk';
if (!process.env.DAYTONA_API_KEY || !process.env.DAYTONA_SNAPSHOT) throw new Error('Popuni Daytona env.');
const daytona=new Daytona({apiKey:process.env.DAYTONA_API_KEY});
const sandbox=await daytona.create({snapshot:process.env.DAYTONA_SNAPSHOT,language:'python',autoStopInterval:15});
try {
  const result=await sandbox.process.executeCommand('python -c "import fitz, docx, openpyxl, yaml, jsonschema; print(\'NALAZNIK_IMPORTS_OK\')" && pdftoppm -v && libreoffice --version',undefined,undefined,60);
  if (result.exitCode!==0) throw new Error(`Sandbox provera nije prosla, exitCode=${result.exitCode}`);
  console.log('PASS: Python biblioteke, Poppler i LibreOffice dostupni. Sledeci korak je stvarni render fixture-a.');
} finally {
  await daytona.delete(sandbox);
}
