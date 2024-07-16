const express = require('express');
const app = express();
const port = 4000;
const bodyParser = require('body-parser');

const config = require('./config/key');

const { User } = require('./models/User');

//application/x-www/form-urlencoded
app.use(bodyParser.urlencoded({extended: true}));

//application/json
app.use(bodyParser.json());

const mongoose = require('mongoose')
mongoose.connect(config.mongoURI, {
    // useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
}).then(() => {
    console.log('MongoDB Connected...')
}).catch(err => console.log(err))

app.get('/', (req, res) => {
    res.send('Hello World! 안녕하세요')
})

app.post('/register', (req, res) => {
    //회원가입할때 필요한 정보들을 client에서 가져요면 그것들을 데이터베이스에 넣어준다
    const user = new User(req.body);
    user.save().then(() => {
       res.status(200).json({ success: true });
    }).catch((err) => {
        res.json({success: false, err});
    });
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})