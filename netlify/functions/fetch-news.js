const Parser = require('rss-parser');
const parser = new Parser();

exports.handler = async function(event, context) {
  // CORSヘッダーを設定
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  try {
    const feeds = [
      {
        name: 'OpenAI Blog',
        url: 'https://openai.com/blog/rss.xml'
      },
      {
        name: 'Meta AI',
        url: 'https://ai.meta.com/blog/rss/'
      },
      {
        name: 'Google AI Blog',
        url: 'https://blog.research.google/feeds/posts/default/-/Machine%20Learning'
      },
      {
        name: 'DeepMind Blog',
        url: 'https://deepmind.google/blog/rss.xml'
      },
      {
        name: 'Microsoft AI',
        url: 'https://blogs.microsoft.com/ai/feed/'
      }
    ];

    const allNews = [];

    for (const feed of feeds) {
      try {
        const feedData = await parser.parseURL(feed.url);
        
        feedData.items.slice(0, 5).forEach(item => {
          allNews.push({
            source: feed.name,
            title: item.title,
            link: item.link,
            description: item.contentSnippet ? item.contentSnippet.substring(0, 150) + '...' : '',
            date: formatDate(new Date(item.pubDate || item.isoDate)),
            rawDate: new Date(item.pubDate || item.isoDate)
          });
        });
      } catch (err) {
        console.error(`Error fetching ${feed.name}:`, err);
        // エラーが出ても他のフィードは続行
      }
    }

    // 日付でソート（新しい順）
    allNews.sort((a, b) => b.rawDate - a.rawDate);

    // rawDateを削除してクリーンなデータに
    const cleanNews = allNews.map(({rawDate, ...item}) => item);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ news: cleanNews.slice(0, 30) })
    };

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'ニュースの取得に失敗しました' })
    };
  }
};

function formatDate(date) {
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '今';
  if (minutes < 60) return `${minutes}分前`;
  if (hours < 24) return `${hours}時間前`;
  if (days < 7) return `${days}日前`;
  
  return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
}