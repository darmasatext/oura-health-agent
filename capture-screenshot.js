const { chromium } = require('playwright');

async function capture() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Navegar al dashboard
  await page.goto('http://localhost:3000/(dashboard)', { waitUntil: 'networkidle' });
  
  // Esperar a que los datos se carguen (esperar que desaparezca "Cargando datos...")
  await page.waitForTimeout(3000);
  
  // Tomar captura
  await page.screenshot({ 
    path: 'dashboard-screenshot.png', 
    fullPage: true 
  });
  
  console.log('✅ Captura guardada en dashboard-screenshot.png');
  
  await browser.close();
}

capture().catch(console.error);
