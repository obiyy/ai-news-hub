const Parser = require('rss-parser');
const parser = new Parser();

exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  try {
    const feeds = [
      {
        name: 'OpenAI Blog',
        url: 'https://openai.com/blog/rss.xml',
        color: '#10a37f'
      },
      {
        name: 'Meta AI',
        url: 'https://ai.meta.com/blog/rss/',
        color: '#0668e1'
      },
      {
        name: 'Anthropic',
        url: 'https://raw.githubusercontent.com/conoro/anthropic-engineering-rss-feed/main/anthropic_engineering_rss.xml',
        color: '#cc785c'
      },
      {
        name: 'Google AI',
        url: 'https://blog.research.google/feeds/posts/default/-/Machine%20Learning',
        color: '#ea4335'
      },
      {
        name: 'DeepMind',
        url: 'https://deepmind.google/blog/rss.xml',
        color: '#1a73e8'
      },
      {
        name: 'Microsoft AI',
        url: 'https://blogs.microsoft.com/ai/feed/',
        color: '#00a4ef'
      }
    ];

    const allNews = [];

    for (const feed of feeds) {
      try {
        const feedData = await parser.parseURL(feed.url);
        
        feedData.items.slice(0, 5).forEach(item => {
          allNews.push({
            source: feed.name,
            color: feed.color,
            title: item.title,
            link: item.link,
            description: item.contentSnippet ? item.contentSnippet.substring(0, 150) + '...' : '',
            date: formatDate(new Date(item.pubDate || item.isoDate)),
            rawDate: new Date(item.pubDate || item.isoDate)
          });
        });
      } catch (err) {
        console.error(`Error fetching ${feed.name}:`, err);
      }
    }

    allNews.sort((a, b) => b.rawDate - a.rawDate);
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