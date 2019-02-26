const categories = [...Array(3).keys()].map(key => ({
  id: key,
  name: `category${key}`,
}));

const authors = [...Array(10).keys()].map(key => ({
  id: key,
  name: `author${key}`,
}));

const rand = arr => arr[Math.floor(Math.random() * arr.length)];
const randDate = start =>
  new Date(start.getTime() + Math.random() * (Date.now() - start.getTime()));

const posts = [...Array(100).keys()].map(key => ({
  id: key,
  title: `title${key}`,
  category: rand(categories).name,
  author: rand(authors).name,
  content: `content${key}`,
  createdAt: randDate(new Date(2010, 0, 1)),
  updatedAt: randDate(new Date(2010, 0, 1)),
}));

module.exports = {
  posts,
  posts_infinite: posts,
};
