export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Метод не разрешён' });
  }

  const tag = (req.query.tag || '').toString().replace('#', '').trim();
  if (!tag) {
    return res.status(400).json({ error: 'Тег игрока не указан' });
  }

  try {
    // Используем сторонний API через сервер — так CORS не мешает
    const apiRes = await fetch(`https://api.brawlapi.club/v1/player/${tag}`, {
      headers: {
        // Если API требует ключ, раскомментируй и вставь его сюда:
        // 'Authorization': 'ТВОЙ_КЛЮЧ'
      },
      timeout: 5000,
    });

    const data = await apiRes.json();

    if (!apiRes.ok || data.error) {
      return res.status(apiRes.status || 502).json({
        error: true,
        message: data.message || data.error || 'Игрок не найден или ошибка API',
      });
    }

    // Возвращаем только нужные поля, чтобы не тащить лишнее
    return res.json({
      name: data.name,
      tag: data.tag,
      trophies: data.trophies,
      highestTrophies: data.highestTrophies,
      expLevel: data.expLevel,
      '3vs3Victories': data['3vs3Victories'],
      club: data.club,
      clubPosition: data.clubPosition,
    });
  } catch (err) {
    console.error(err);
    return res.status(502).json({
      error: true,
      message: 'Ошибка соединения с API статистики',
    });
  }
}