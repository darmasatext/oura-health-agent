const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function takeScreenshots() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  // Crear directorio para screenshots
  const screenshotDir = path.join(__dirname, '../screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  try {
    console.log('📸 Navegando a página de sueño...');
    await page.goto('http://localhost:3000/sleep', { waitUntil: 'networkidle' });
    
    // Esperar a que se carguen las gráficas
    await page.waitForSelector('text=Análisis de Sueño', { timeout: 10000 });
    await page.waitForTimeout(3000); // Esperar render de gráficas
    
    console.log('📸 Capturando vista completa...');
    await page.screenshot({ 
      path: path.join(screenshotDir, '01-sleep-page-full.png'),
      fullPage: true 
    });

    console.log('📸 Capturando vista del header y KPIs...');
    await page.screenshot({ 
      path: path.join(screenshotDir, '02-sleep-header-kpis.png')
    });

    // Scroll a las gráficas
    await page.evaluate(() => window.scrollTo(0, 400));
    await page.waitForTimeout(500);
    
    console.log('📸 Capturando gráficas...');
    await page.screenshot({ 
      path: path.join(screenshotDir, '03-sleep-charts.png')
    });

    // Scroll a la tabla
    await page.evaluate(() => window.scrollTo(0, 1000));
    await page.waitForTimeout(500);
    
    console.log('📸 Capturando tabla de detalle...');
    await page.screenshot({ 
      path: path.join(screenshotDir, '04-sleep-table.png')
    });

    // Click en primera noche para abrir modal
    console.log('📸 Abriendo modal de detalle...');
    const firstNight = await page.locator('.cursor-pointer').first();
    await firstNight.click();
    await page.waitForTimeout(1000);
    
    console.log('📸 Capturando modal de drill-down...');
    await page.screenshot({ 
      path: path.join(screenshotDir, '05-sleep-detail-modal.png')
    });

    // Probar filtro de 7 días
    await page.keyboard.press('Escape'); // Cerrar modal
    await page.waitForTimeout(500);
    
    console.log('📸 Probando filtro de 7 días...');
    await page.locator('button:has-text("7 días")').click();
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: path.join(screenshotDir, '06-sleep-7days-filter.png'),
      fullPage: true
    });

    console.log('✅ Capturas completadas en:', screenshotDir);
    console.log('📂 Archivos generados:');
    fs.readdirSync(screenshotDir).forEach(file => {
      const stats = fs.statSync(path.join(screenshotDir, file));
      console.log(`   - ${file} (${(stats.size / 1024).toFixed(1)} KB)`);
    });

  } catch (error) {
    console.error('❌ Error al capturar screenshots:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

takeScreenshots().catch(console.error);
