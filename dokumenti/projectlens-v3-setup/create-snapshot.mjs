// Explicitly creates a billable team snapshot. Run once by A after checking account credits.
import {Daytona, Image} from '@daytonaio/sdk';
if (!process.env.DAYTONA_API_KEY || !process.env.DAYTONA_SNAPSHOT) throw new Error('Popuni DAYTONA_API_KEY i DAYTONA_SNAPSHOT.');
const daytona=new Daytona({apiKey:process.env.DAYTONA_API_KEY});
const image=Image.debianSlim('3.12')
  .runCommands('apt-get update && apt-get install -y --no-install-recommends poppler-utils libreoffice-writer libreoffice-calc fonts-dejavu-core')
  .pipInstall(['pymupdf','pdfplumber','python-docx','openpyxl','Pillow','pydantic','PyYAML','jsonschema','pytest']);
await daytona.snapshot.create({name:process.env.DAYTONA_SNAPSHOT,image},{onLogs:(line)=>console.log(line)});
console.log('Snapshot create zavrsen; proveri Active/ready status pre smoke testa.');
