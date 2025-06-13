app.get('/p/:slug', async (req, res) => {
  const slug = req.params.slug;
  const langMap = { eng: 1, rus: 2 }; // adjust based on your DB data
  const langCode = req.query.lang || 'eng';
  const langId = langMap[langCode] || 1;

  console.log('Looking up slug:', slug, 'lang:', langCode, 'langId:', langId);

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
      WHERE slug_place = $1
    `, [slug, langId]);

    console.log('Query result:', result.rows);

    if (result.rows.length === 0) return res.status(404).send('Not found');
    res.render('place', { place: result.rows[0], lang: langCode });
  } catch (err) {
    console.error('DB Error:', err);
    res.status(500).send('Internal Server Error');
  }
});
