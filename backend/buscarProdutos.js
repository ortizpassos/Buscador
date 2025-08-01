const axios = require('axios');
const cheerio = require('cheerio');

async function buscarProdutos(urlBase, termo) {
  const resultados = [];

  let urlBusca;
  if (urlBase.includes('ahavashop.com.br')) {
    urlBusca = `https://ahavashop.com.br/search/?q=${encodeURIComponent(termo)}`;
  } else if (urlBase.includes('lojadoprazer.com.br')) {
    urlBusca = `https://www.lojadoprazer.com.br/listaprodutos.asp?Digitada=True&Texto=${encodeURIComponent(termo)}`;
  } else {
    return resultados;
  }

  try {
    const { data } = await axios.get(urlBusca, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
      },
    });
    const $ = cheerio.load(data);

    if (urlBase.includes('ahavashop.com.br')) {
      $('.product-item-info').each((_, el) => {
        const nome = $(el).find('.product-item-link').text().trim();
        const preco = $(el).find('.price').first().text().trim();
        const imagem =
          $(el).find('.product-image-photo').attr('data-src') ||
          $(el).find('.product-image-photo').attr('src');
        const link = $(el).find('.product-item-link').attr('href');

        if (nome && preco && link) {
          resultados.push({ nome, preco, imagem, link });
        }
      });
    } else if (urlBase.includes('lojadoprazer.com.br')) {
      $('.produto').each((_, el) => {
        const nome = $(el).find('h2 a, h3 a').text().trim();
        const preco = $(el).find('.price-current, .preco').first().text().trim();
        const imagem = $(el).find('img').attr('src');
        const link = $(el).find('h2 a, h3 a').attr('href');

        if (nome && preco && link) {
          resultados.push({ nome, preco, imagem, link });
        }
      });
    }
  } catch (error) {
    console.error(`Erro ao buscar em ${urlBusca}: ${error.message}`);
  }

  return resultados;
}

module.exports = buscarProdutos;
