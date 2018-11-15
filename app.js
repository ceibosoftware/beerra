const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const apiKeg = require('./Routes/keg')
const apiBrewery = require('./Routes/brewery')
const apiPipe = require('./Routes/pipe');
const apiBottle = require('./Routes/bottle');
const apiSale = require('./Routes/sale');
const apiOutflow = require('./Routes/outflow');
const api = require('./Routes/index')
const morgan = require('morgan');
const cors = require('cors');




app.use(morgan('dev')); 
app.use(bodyParser.json());

app.use(cors());
app.use('/keg',apiKeg);
app.use('/outflow',apiOutflow);
app.use('/bottle',apiBottle);
app.use('/pipe',apiPipe);
app.use('/brewery',apiBrewery);
app.use('/sale',apiSale);
app.use('/',api);

module.exports = app;