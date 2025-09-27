export const success = (c, data, statusCode = 200, cacheTime = 300) => {
  // Add caching headers for better performance
  c.header('Cache-Control', `public, max-age=${cacheTime}`);
  c.header('ETag', `"${Buffer.from(JSON.stringify(data)).toString('base64').slice(0, 16)}"`);

  return c.json({ success: true, data }, { status: statusCode });
};

export const fail = (c, message = 'internal server error', statusCode = 500, details = null) => {
  return c.json({ success: false, message, details }, { status: statusCode });
};
