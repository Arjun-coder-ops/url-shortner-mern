const Url = require('../models/Url.model');

/**
 * GET /:shortCode
 * Looks up the short code, increments the click counter, records
 * click metadata, and redirects to the original URL.
 */
const redirect = async (req, res, next) => {
  try {
    const { shortCode } = req.params;

    const url = await Url.findOne({ shortCode, isActive: true });

    if (!url) {
      // If this looks like a frontend route, fall through to the SPA handler.
      const accept = req.headers.accept || '';
      const path = req.path || '';
      const isFrontendRoute =
        path === '/' ||
        /^\/(login|register|dashboard|shorten)(\/|$)/.test(path) ||
        /^\/analytics\/[^/]+$/.test(path);

      if (accept.includes('text/html') && isFrontendRoute) {
        return next();
      }

      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
          <body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#0f172a;color:#e2e8f0">
            <div style="text-align:center">
              <h1 style="font-size:4rem;margin:0">404</h1>
              <p>Short link not found or has been removed.</p>
              <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}" style="color:#6366f1"><- Go home</a>
            </div>
          </body>
        </html>
      `);
    }

    // Check expiry
    if (url.expiresAt && new Date() > url.expiresAt) {
      return res.status(410).send(`
        <!DOCTYPE html>
        <html>
          <body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#0f172a;color:#e2e8f0">
            <div style="text-align:center">
              <h1 style="font-size:4rem;margin:0">410</h1>
              <p>This link has expired.</p>
              <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}" style="color:#6366f1"><- Go home</a>
            </div>
          </body>
        </html>
      `);
    }

    // Record click metadata
    const clickData = {
      timestamp: new Date(),
      referrer: req.headers.referer || '',
      userAgent: req.headers['user-agent'] || '',
      ip: req.ip || req.connection.remoteAddress || '',
    };

    // Atomically increment clicks and push click record
    await Url.findByIdAndUpdate(url._id, {
      $inc: { clicks: 1 },
      $push: { clickHistory: clickData },
    });

    return res.redirect(301, url.originalUrl);
  } catch (err) {
    console.error('Redirect error:', err);
    res.status(500).send('Server error during redirect.');
  }
};

module.exports = { redirect };
