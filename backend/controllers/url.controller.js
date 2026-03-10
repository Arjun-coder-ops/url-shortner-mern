const { nanoid } = require('nanoid');
const QRCode = require('qrcode');
const Url = require('../models/Url.model');

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

/**
 * POST /api/url/shorten
 * Creates a shortened URL for the authenticated user.
 */
const shortenUrl = async (req, res) => {
  try {
    const { originalUrl, customCode, title, expiresAt } = req.body;

    // Determine short code: custom or auto-generated (7 chars)
    let shortCode = customCode ? customCode.toLowerCase() : nanoid(7);

    // Ensure uniqueness
    const existing = await Url.findOne({ shortCode });
    if (existing) {
      return res.status(409).json({
        error: customCode
          ? 'Custom code already taken. Please choose another.'
          : 'Code collision – please retry.',
      });
    }

    const shortUrl = `${BASE_URL}/${shortCode}`;

    const url = await Url.create({
      originalUrl,
      shortCode,
      shortUrl,
      title: title || '',
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      createdBy: req.user._id,
    });

    res.status(201).json({ message: 'URL shortened successfully.', url });
  } catch (err) {
    console.error('Shorten error:', err);
    res.status(500).json({ error: 'Server error while shortening URL.' });
  }
};

/**
 * GET /api/url/user-links
 * Returns all URLs created by the authenticated user (paginated).
 */
const getUserLinks = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const skip = (page - 1) * limit;

    const [urls, total] = await Promise.all([
      Url.find({ createdBy: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-clickHistory'), // exclude heavy history from list view
      Url.countDocuments({ createdBy: req.user._id }),
    ]);

    res.json({
      urls,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('Get links error:', err);
    res.status(500).json({ error: 'Server error fetching links.' });
  }
};

/**
 * GET /api/url/analytics/:id
 * Returns detailed analytics for a single URL (owner only).
 */
const getUrlAnalytics = async (req, res) => {
  try {
    const url = await Url.findOne({ _id: req.params.id, createdBy: req.user._id });
    if (!url) return res.status(404).json({ error: 'URL not found.' });

    // Build clicks-per-day chart data from clickHistory (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const clicksByDay = {};
    url.clickHistory
      .filter((c) => c.timestamp >= thirtyDaysAgo)
      .forEach((c) => {
        const day = c.timestamp.toISOString().split('T')[0];
        clicksByDay[day] = (clicksByDay[day] || 0) + 1;
      });

    // Fill in zeros for days with no clicks
    const chartData = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      chartData.push({ date: key, clicks: clicksByDay[key] || 0 });
    }

    res.json({ url, chartData });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ error: 'Server error fetching analytics.' });
  }
};

/**
 * GET /api/url/dashboard
 * Returns aggregate stats for the authenticated user's dashboard.
 */
const getDashboard = async (req, res) => {
  try {
    const urls = await Url.find({ createdBy: req.user._id }).select(
      'clicks createdAt title shortCode shortUrl originalUrl clickHistory'
    );

    const totalLinks = urls.length;
    const totalClicks = urls.reduce((sum, u) => sum + u.clicks, 0);

    // Clicks per day for the last 14 days (all links combined)
    const dailyMap = {};
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    urls.forEach((u) => {
      u.clickHistory
        .filter((c) => c.timestamp >= fourteenDaysAgo)
        .forEach((c) => {
          const day = c.timestamp.toISOString().split('T')[0];
          dailyMap[day] = (dailyMap[day] || 0) + 1;
        });
    });

    const clicksOverTime = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      clicksOverTime.push({ date: key, clicks: dailyMap[key] || 0 });
    }

    // Top 5 links by clicks
    const topLinks = [...urls]
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 5)
      .map((u) => ({
        id: u._id,
        title: u.title || u.originalUrl,
        shortCode: u.shortCode,
        shortUrl: u.shortUrl,
        clicks: u.clicks,
        createdAt: u.createdAt,
      }));

    res.json({ totalLinks, totalClicks, clicksOverTime, topLinks });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: 'Server error fetching dashboard.' });
  }
};

/**
 * DELETE /api/url/:id
 * Deletes a URL (owner only).
 */
const deleteUrl = async (req, res) => {
  try {
    const url = await Url.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });
    if (!url) return res.status(404).json({ error: 'URL not found.' });
    res.json({ message: 'URL deleted successfully.' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Server error deleting URL.' });
  }
};

/**
 * GET /api/url/qr/:id
 * Generates and returns a QR code PNG for the short URL.
 */
const getQrCode = async (req, res) => {
  try {
    const url = await Url.findOne({ _id: req.params.id, createdBy: req.user._id });
    if (!url) return res.status(404).json({ error: 'URL not found.' });

    const qrDataUrl = await QRCode.toDataURL(url.shortUrl, {
      width: 300,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
    });

    res.json({ qrCode: qrDataUrl, shortUrl: url.shortUrl });
  } catch (err) {
    console.error('QR error:', err);
    res.status(500).json({ error: 'Server error generating QR code.' });
  }
};

module.exports = { shortenUrl, getUserLinks, getUrlAnalytics, getDashboard, deleteUrl, getQrCode };
