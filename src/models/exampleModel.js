// For now, we use a simple array. Later, this is where Mongoose or Sequelize goes.
const products = [
    { id: 1, name: 'Automation Tool', price: 99 },
    { id: 2, name: 'Product Scraper', price: 49 }
];

module.exports = {
    findAll: () => products,
    findById: (id) => products.find(p => p.id === parseInt(id))
};