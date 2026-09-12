// Run explicitly: node --env-file=.env.local scripts/setup/smoke-api.mjs xai|anthropic|exa|firecrawl
// Each run makes one real API request and may consume credits. No private documents are sent.
const service = process.argv[2];
function need(name) {
  const value = process.env[name];
  if (!value || /YOUR_|REPLACE_|<.*>/.test(value)) throw new Error(`Popuni ${name}`);
  return value;
}
const schema = {type:'object', properties:{answer:{type:'integer'}}, required:['answer'], additionalProperties:false};
let url, headers, body;
switch (service) {
  case 'xai':
    url='https://api.x.ai/v1/chat/completions';
    headers={Authorization:`Bearer ${need('XAI_API_KEY')}`};
    body={model:need('XAI_MODEL'), messages:[{role:'user',content:'Compute 2 + 2. Return answer as an integer in JSON.'}],
      response_format:{type:'json_schema',json_schema:{name:'smoke',strict:true,schema}}};
    break;
  case 'anthropic':
    url='https://api.anthropic.com/v1/messages';
    headers={'x-api-key':need('ANTHROPIC_API_KEY'),'anthropic-version':'2023-06-01'};
    body={model:need('ANTHROPIC_MODEL'),max_tokens:128,messages:[{role:'user',content:'Compute 2 + 2. Return answer as an integer in JSON.'}],output_config:{format:{type:'json_schema',schema}}};
    break;
  case 'exa':
    url='https://api.exa.ai/search'; headers={'x-api-key':need('EXA_API_KEY')};
    body={query:'Firecrawl official documentation scrape',includeDomains:['docs.firecrawl.dev'],numResults:1};
    break;
  case 'firecrawl':
    url='https://api.firecrawl.dev/v2/scrape'; headers={Authorization:`Bearer ${need('FIRECRAWL_API_KEY')}`};
    body={url:'https://docs.firecrawl.dev/introduction',formats:['markdown'],onlyMainContent:true};
    break;
  default: throw new Error('Izaberi xai, anthropic, exa ili firecrawl.');
}
try {
  const started=Date.now();
  const response=await fetch(url,{method:'POST',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(120000)});
  if (!response.ok) throw new Error(`HTTP ${response.status}; proveri nalog, model, kvotu i dashboard. Sadrzaj odgovora nije ispisan.`);
  const data=await response.json();
  if (service==='xai' || service==='anthropic') {
    const content=service==='xai' ? data.choices?.[0]?.message?.content : data.content?.filter(x=>x.type==='text').map(x=>x.text).join('');
    const parsed=JSON.parse(content);
    if (parsed.answer!==4 || Object.keys(parsed).length!==1) throw new Error('Model nije prosao proveru vrednosti i oblika.');
  }
  if (service==='exa' && !data.results?.[0]?.url) throw new Error('Nema pronadjenog URL-a.');
  if (service==='firecrawl' && (!data.success || !data.data?.markdown?.trim())) throw new Error('Nema markdown rezultata.');
  console.log(JSON.stringify({service,status:'PASS',elapsed_ms:Date.now()-started,usage:data.usage??null}));
} catch (error) {
  console.error(`${service}: ${error.message}`);
  process.exitCode=1;
}
