import { Hono } from 'hono';
import handler from '../utils/handler';

// Lazy load controllers for faster startup
const loadController = async (controllerPath) => {
  const module = await import(controllerPath);
  return module.default;
};

const router = new Hono();

// Lazy-loaded route handlers
router.get('/', async (c) => {
  const documentationController = await loadController(
    '../controllers/documentation.controller.js'
  );
  return handler(documentationController)(c);
});

router.get('/home', async (c) => {
  const homepageController = await loadController('../controllers/homepage.controller.js');
  return handler(homepageController)(c);
});

router.get('/anime/:id', async (c) => {
  const detailpageController = await loadController('../controllers/detailpage.controller.js');
  return handler(detailpageController)(c);
});

router.get('/animes/:query/:category?', async (c) => {
  const listpageController = await loadController('../controllers/listpage.controller.js');
  return handler(listpageController)(c);
});

router.get('/search', async (c) => {
  const searchController = await loadController('../controllers/search.controller.js');
  return handler(searchController)(c);
});

router.get('/suggestion', async (c) => {
  const suggestionController = await loadController('../controllers/suggestion.controller.js');
  return handler(suggestionController)(c);
});

router.get('/characters/:id', async (c) => {
  const charactersController = await loadController('../controllers/characters.controller.js');
  return handler(charactersController)(c);
});

router.get('/character/:id', async (c) => {
  const characterDetailConroller = await loadController(
    '../controllers/characterDetail.controller.js'
  );
  return handler(characterDetailConroller)(c);
});

router.get('/episodes/:id', async (c) => {
  const episodesController = await loadController('../controllers/episodes.controller.js');
  return handler(episodesController)(c);
});

router.get('/servers', async (c) => {
  const serversController = await loadController('../controllers/serversController.js');
  return handler(serversController)(c);
});

router.get('/stream', async (c) => {
  const streamController = await loadController('../controllers/streamController.js');
  return handler(streamController)(c);
});

router.get('/genres', async (c) => {
  const allGenresController = await loadController('../controllers/allGenres.controller.js');
  return handler(allGenresController)(c);
});
router.get('/*', (c) => {
  return c.html(`
        <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <body>
    <h1>
      bro please stop using unnececery resources by making request to the
      endpoints which is not even exist
    </h1>
    <p>if you want anything you can contact me here :</p>
    <a href="https://t.me/Mst83din">here</a>
  </body>
</html>

    `);
});

export default router;
