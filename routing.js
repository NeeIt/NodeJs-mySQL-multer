const Sequelize = require('sequelize');
const express = require('express');
const bodyParser = require('body-parser')
const multer = require('multer');
const fs = require('fs');

const app = express();


const urlencodedParser = bodyParser.urlencoded({ extended: false });



const sequelize = new Sequelize('test', 'root', 'NeeSql04012001ss', {
    host: 'localhost',
    dialect: 'mysql',
    define: {
        timestamps: false,
        charset: 'utf8',
        collate: 'utf8_general_ci'
    }
});

const User = sequelize.define('usersss', {
    id: {
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        type: Sequelize.INTEGER
    },
    name: {
        allowNull: false,
        defaultValue: 'TommioLeodoro',
        type: Sequelize.TEXT
    },
    age: {
        allowNull: true,
        type: Sequelize.INTEGER
    },
    image: {
        type: Sequelize.TEXT,
        defaultValue: './default.jpg'
    }
});

app.set('view engine', 'hbs');

sequelize.sync({force:true}).then(() => {
    app.listen(3000, function () {
        console.log('Server is waiting for connect...');
    })
});
app.get('/', (req, res) => {
    User.findAll({ raw: false }).then(data => {
        res.render('index.hbs', { users: data });
    })
});


app.get('/create', (req, res) => {
    res.render('create.hbs');
});


const avararUploader = multer({
    storage: multer.diskStorage({
        filename: (req, file, cb) => {
            let d = new Date()
            cb(null, file.originalname + d.getDate() + "-" + (d.getMonth() + 1) + "-" + d.getFullYear() + "-" +
                d.getHours() + "-" + d.getMinutes()+"-"+d.getSeconds());
},
    destination: (req, file, cb) => {
        cb(null, __dirname + '/uploads');
    }
    }),
fileFilter: (req, file, cb) => {
    if (file.mimetype === "image/png" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/jpeg") {
        cb(null, true);
    }
    else {
        cb(null, false);
    }
},
    limits: {
    fileSize: 10000000,

}
}).single('avatar')


app.post('/create', avararUploader, urlencodedParser, (req, res) => {

    if (!req.body) res.sendStatus(400);
    let name = req.body.name;
    let age = req.body.age;

    let image = (req.file) ? req.file.filename : 'default/default.jpg';


    User.create({ name, age, image }).then(() => res.redirect('/'));

});

app.get('/image/:url', (req, res) => {
    const url = req.params.url;
    let s = fs.createReadStream("./uploads/" + url);
    s.on('open', () => {
        res.set('Content-Type', 'image/jpg');
        s.pipe(res);
    })

})
app.get('/image/default/default.jpg', (req, res) => {
    let s = fs.createReadStream("./uploads/default/default.jpg");
    s.on('open', () => {
        res.set('Content-Type', 'image/jpg');
        s.pipe(res);
    });
});


app.get('/edit/:id', (req, res) => {
    const userId = req.params['id'];
    User.findAll({ where: { id: userId }, raw: true }).then(data => {
        res.render('edit.hbs', { user: data[0] });
    })
});
app.post('/edit', avararUploader, urlencodedParser, (req, res) => {
    if (!req.body) return res.sendStatus(400);
    let image;
    if (req.file) image = req.file.filename;
    const name = req.body.name;
    const age = req.body.age;
    const id = req.body.id;

    if (image)
        User.update({ name, age, image }, { where: { id } }).then(() => { res.redirect('/') });
    else
        User.update({ name, age }, { where: { id } }).then(() => { res.redirect('/') });
});
app.post('/delete/:id', (req, res) => {
    const id = req.params.id;
    User.destroy({ where: { id } }).then(() => { res.redirect('/') })
})
