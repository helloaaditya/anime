import * as cheerio from 'cheerio';

// Helper function to extract anime object
const extractAnimeObject = ($, el, rank = null) => {
  const obj = {
    title: null,
    alternativeTitle: null,
    id: null,
    poster: null,
    rank: rank,
    type: null,
    quality: null,
    duration: null,
    aired: null,
    synopsis: null,
    episodes: {
      sub: null,
      dub: null,
      eps: null,
    },
  };

  // Extract basic info
  const titleEl = $(el).find('.film-title, .film-name a, .desi-head-title').first();
  obj.title = titleEl.text() || titleEl.attr('title');
  obj.alternativeTitle = titleEl.attr('data-jname');
  obj.id = titleEl.attr('href')?.split('/').at(-1);

  // Extract poster
  obj.poster =
    $(el).find('.film-poster-img, img').first().attr('data-src') ||
    $(el).find('.film-poster-img, img').first().attr('src');

  // Extract episodes info
  const subEl = $(el).find('.tick-sub, .tick-item.tick-sub');
  const dubEl = $(el).find('.tick-dub, .tick-item.tick-dub');
  const epsEl = $(el).find('.tick-eps, .tick-item.tick-eps');

  obj.episodes.sub = Number(subEl.text()) || 0;
  obj.episodes.dub = Number(dubEl.text()) || 0;
  obj.episodes.eps = Number(epsEl.text()) || obj.episodes.sub;

  // Extract additional details for spotlight
  if ($(el).hasClass('swiper-slide')) {
    obj.synopsis = $(el).find('.desi-description').text().trim();

    const details = $(el).find('.sc-detail');
    obj.type = details.find('.scd-item').eq(0).text().trim();
    obj.duration = details.find('.scd-item').eq(1).text().trim();
    obj.aired = details.find('.scd-item.m-hide').text().trim();
    obj.quality = details.find('.scd-item .quality').text().trim();
  }

  return obj;
};

export const extractHomepage = (html) => {
  const $ = cheerio.load(html, {
    normalizeWhitespace: true,
    xmlMode: false,
    decodeEntities: true,
  });

  const response = {
    spotlight: [],
    trending: [],
    topAiring: [],
    mostPopular: [],
    mostFavorite: [],
    latestCompleted: [],
    latestEpisode: [],
    newAdded: [],
    topUpcoming: [],
    top10: {
      today: [],
      week: [],
      month: [],
    },
    genres: [],
  };

  // Extract spotlight (most important, do first)
  const $spotlight = $('.deslide-wrap .swiper-wrapper .swiper-slide');
  $spotlight.each((i, el) => {
    const obj = extractAnimeObject($, el, i + 1);
    response.spotlight.push(obj);
  });

  // Extract trending
  const $trending = $('#trending-home .swiper-container .swiper-slide');
  $trending.each((i, el) => {
    const obj = extractAnimeObject($, el, i + 1);
    response.trending.push(obj);
  });

  // Extract featured sections
  const $featured = $('#anime-featured .anif-blocks .row .anif-block');
  $featured.each((i, el) => {
    const data = $(el)
      .find('.anif-block-ul ul li')
      .map((index, item) => extractAnimeObject($, item))
      .get();

    const dataType = $(el).find('.anif-block-header').text().replace(/\s+/g, '');
    const normalizedDataType = dataType.charAt(0).toLowerCase() + dataType.slice(1);
    response[normalizedDataType] = data;
  });

  // Extract home sections
  const $home = $('.block_area.block_area_home');
  $home.each((i, el) => {
    const data = $(el)
      .find('.tab-content .film_list-wrap .flw-item')
      .map((index, item) => extractAnimeObject($, item))
      .get();

    const dataType = $(el).find('.cat-heading').text().replace(/\s+/g, '');
    const normalizedDataType = dataType.charAt(0).toLowerCase() + dataType.slice(1);

    if (normalizedDataType === 'newOnHiAnime') {
      response.newAdded = data;
    } else {
      response[normalizedDataType] = data;
    }
  });

  // Extract top 10 lists
  const extractTopTen = (selector) => {
    return $(selector)
      .find('ul li')
      .map((i, el) => extractAnimeObject($, el, i + 1))
      .get();
  };

  response.top10.today = extractTopTen('#top-viewed-day');
  response.top10.week = extractTopTen('#top-viewed-week');
  response.top10.month = extractTopTen('#top-viewed-month');

  // Extract genres
  $('.sb-genre-list li').each((i, el) => {
    const genre = $(el).find('a').attr('title')?.toLowerCase();
    if (genre) {
      response.genres.push(genre);
    }
  });

  return response;
};
