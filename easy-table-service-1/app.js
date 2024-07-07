const express = require('express');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

const categories = [
    {
        name: 'Coffee', 
        products: [
            { id: 1, name: 'Espresso', price: '2.50', image: '/images/coffee.jpg', description: 'Strong black coffee' },
            { id: 2, name: 'Latte', price: '3.50', image: '/images/latte.jpg', description: 'Coffee with steamed milk' }
        ]
    },
    {
        name: 'Pastries', 
        products: [
            { id: 3, name: 'Croissant', price: '2.00', image: '/images/croissant.jpg', description: 'Buttery pastry' },
            { id: 4, name: 'Muffin', price: '2.50', image: '/images/muffin.jpg', description: 'Sweet breakfast treat' }
        ]
    },
    {
        name: 'Beverages', 
        products: [
            { id: 5, name: 'Tea', price: '1.50', image: '/images/tea.jpg', description: 'Hot tea' },
            { id: 6, name: 'Juice', price: '2.00', image: '/images/juice.jpg', description: 'Fruit juice' }
        ]
    }
];

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); 
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

app.use((req, res, next) => {
    res.locals.session = req.session;
    res.locals.categories = categories;
    next();
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

function getProductByName(name) {
    for (let category of categories) {
        const product = category.products.find(p => p.name === name);
        if (product) {
            return product;
        }
    }
    return null;
}


app.get('/', (req, res) => {
    res.render('index');
});

app.get('/category/:name', (req, res) => {
    const categoryName = req.params.name;
    const category = categories.find(c => c.name === categoryName);
    if (!category) {
        return res.status(404).send('Category not found');
    }
    res.render('category', { category });
});

app.get('/product/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    let product;
    categories.forEach(category => {
        const foundProduct = category.products.find(p => p.id === productId);
        if (foundProduct) {
            product = foundProduct;
        }
    });
    if (!product) {
        return res.status(404).send('Product not found');
    }
    res.render('product', { product });
});

app.post('/add-to-basket/:productName', (req, res) => {
    const productName = req.params.productName;

    if (!req.session.basket) {
        req.session.basket = {};
    }

    if (req.session.basket[productName]) {
        req.session.basket[productName]++;
    } else {
        req.session.basket[productName] = 1;
    }

    res.sendStatus(200); 
});

app.get('/basket-count', (req, res) => {
    const basketCount = Object.keys(req.session.basket || {}).length;
    res.json({ basketCount });
});
app.get('/explore', (req, res) => {
    res.render('explore', { title: 'Explore Menu', categories });
});


app.get('/basket', (req, res) => {
    const basket = req.session.basket || {};
    const productsInBasket = Object.keys(basket).map(productName => {
        const product = getProductByName(productName);
        return {
            ...product,
            quantity: basket[productName],
            totalPrice: (parseFloat(product.price.slice(1)) * basket[productName]).toFixed(2)
        };
    });

    res.render('basket', {
        title: 'Basket',
        productsInBasket
    });
});

app.get('/checkout', (req, res) => {
    const basket = req.session.basket || {};

    let totalPrice = 0;
    Object.keys(basket).forEach(productName => {
        const product = getProductByName(productName);
        if (product) {
            const price = parseFloat(product.price.slice(1)); 
            totalPrice += price * basket[productName];
        }
    });

    res.render('checkout', { basket: req.session.basket || {}, totalPrice, getProductByName });
});

app.get('/thanks', (req, res) => {
    req.session.basket = {};
    
    res.render('thanks');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
