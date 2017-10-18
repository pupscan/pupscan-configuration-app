const express = require('express')
const mustacheExpress = require('mustache-express')
const qrcode = require('qrcode')

const mainUrl = process.env.VIRTUAL_HOST ? 'https://' + process.env.VIRTUAL_HOST : 'http://localhost:8080'
const app = express()
app.engine('mustache', mustacheExpress())
app.set('view engine', 'mustache')
app.set('views', __dirname + '/pages')

app.get('/', (req, res) => res.render('index.mustache'))
app.get('/wifi', (req, res) => res.render('wifi.mustache'))
app.get('/mail', (req, res) => res.render('mail.mustache'))
app.get('/qr', (req, res) => qrcode.toDataURL(JSON.stringify(req.query), (err, url) => res.render('qr.mustache', {qrcode: url})))

app.listen(8080)
console.log('Server start',mainUrl)
