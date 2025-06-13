const express = require('express');
const { Pool } = require('pg');
const app = express();
const port = process.env.PORT || 3000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.set('view engine', 'ejs');

// <-- Add this root route here:
app.get('/', (req, res) => {
  res.send('Hello! Use /p/:slug?lang=eng to see place info.');
});

// Your existing /p/:slug route
app.get('/p/:slug', async (req, res) => {
  const slug = req.params.slug;
  const lang = req.query.lang || 'eng';

  const languageMap = {
    eng: 1,
    rus: 2,
    // other languages...
  };

  const langId = languageMap[lang] || 1;

  console.log('Looking up slug:', slug, 'lang:', lang, 'langId:', langId);

  try {
    const result = await pool.query(`
      SELECT
        p.slug_place, p.name_place, p.lat_place, p.lng_place,
        p.fee_adults_place, p.fee_kids_place, p.fee_locals_place,
        p.address_place, p.image_url_place, p.url_official_place,
        c.name_category, t.name_type,
        pa.name_basic_adapt, pa.name_alternative_adapt,
        pa.descr_full_place_adapt, pa.tips_place_adapt
      FROM places p
      LEFT JOIN categories c ON p.slug_category = c.slug_category
      LEFT JOIN types t ON p.slug_type = t.slug_type
      LEFT JOIN place_adaptations pa ON pa.id_place = p.id_place AND pa.id_language = $2
      WHERE p.slug_place = $1
    `, [slug, langId]);

    console.log('Query result:', result.rows);

    if (result.rows.length === 0) return res.status(404).send('Not found');
    res.render('place', { place: result.rows[0], lang });
  } catch (err) {
    console.error('DB Error:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
