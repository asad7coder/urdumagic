import { renderToString } from '../src/server/renderToString.js';

async function verify() {
  console.log('--- UrduMagic SSR Verification ---');
  
  const input = '<p>Buy cow in Pakistan</p>';
  console.log('Input:', input);
  
  try {
    const output = await renderToString(input, 'ur');
    console.log('Output (Urdu):', output);
    
    const romanOutput = await renderToString(input, 'roman');
    console.log('Output (Roman):', romanOutput);
    
    const fullHtml = '<html><body><h1>Buy livestock</h1></body></html>';
    const fullOutput = await renderToString(fullHtml, 'ur');
    console.log('Full HTML Output (Urdu):', fullOutput);
    
  } catch (error) {
    console.error('Verification failed:', error);
  }
}

verify();
