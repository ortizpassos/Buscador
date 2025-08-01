const puppeteer = require('puppeteer');

async function buscarProdutosPuppeteer(url) {
  const browser = await puppeteer.launch({ headless: false }); // ou 'new' se quiser invisível
  const page = await browser.newPage();

  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/115.0.0.0 Safari/537.36'
  );

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Tenta primeiro com o seletor do primeiro site
    let produtos = [];

    const existeClasseProdutos = await page.$('.js-product-item-private');

    if (existeClasseProdutos) {
      // Site com estrutura baseada em .js-product-item-private
      await page.waitForSelector('.js-product-item-private', { timeout: 20000 });

      produtos = await page.$$eval('.js-product-item-private', elementos =>
        elementos.map(el => ({
          nome: el.querySelector('.js-item-name')?.innerText || 'Sem nome',
          preco: el.querySelector('.js-price-display')?.innerText || 'Sem preço',
          link: el.querySelector('a')?.href || ''
        }))
      );
    } else {
      // Site com estrutura de imagens (lojadoprazer)
      produtos = await page.evaluate(() => {
        const lista = [];
        const imagens = document.querySelectorAll('img[src*="/prod/"]');

        imagens.forEach(img => {
          const titulo = img.alt?.trim() || 'Sem título';
          const imagem = img.src.startsWith('http')
            ? img.src
            : 'https://www.lojadoprazer.com.br/' + img.getAttribute('src').replace(/^\.\.\//, '');

          lista.push({
            titulo,
            imagem,
            preco: 'Preço não capturado',
            link: window.location.href
          });
        });

        return lista;
      });
    }

    await browser.close();
    return produtos;
  } catch (err) {
    console.error('Erro ao capturar:', err.message);
    await browser.close();
    return [];
  }
}

module.exports = buscarProdutosPuppeteer;
