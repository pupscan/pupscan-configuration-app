const mainUrl = process.env.VIRTUAL_HOST ? "https://" + process.env.VIRTUAL_HOST : "http://localhost:8080"

const dropboxUrl = "https://www.dropbox.com/oauth2/authorize?response_type=code&redirect_uri=" + mainUrl + "/qr&client_id=ib7yg6jhh4xb7m3&state=dropbox"

const express = require("express")
const mustacheExpress = require('mustache-express')
const qrCode = require("qrcode-npm")

const app = express()
app.engine('mustache', mustacheExpress())
app.set('view engine', 'mustache')
app.set('views', __dirname + '/views')

app.get('/', (req, res) => res.render('index.mustache', {dropboxUrl: dropboxUrl}))

app.get('/wifi', (req, res) => res.render('wifi.mustache'))

app.get('/qr', function (req, res) {
    let qr = qrCode.qrcode(4, 'L')
    qr.addData(JSON.stringify(req.query))
    qr.make()
    res.render('qr.mustache', {qrcode: qr.createImgTag(4)})
})

app.listen(8080)
