const mainUrl = process.env.VIRTUAL_HOST ? 'https://' + process.env.VIRTUAL_HOST : 'http://localhost:8080'

const dropboxUrl = 'https://www.dropbox.com/oauth2/authorize?response_type=code&redirect_uri=' + mainUrl + '/qr&client_id=ib7yg6jhh4xb7m3&state=dropbox'
const googleUrl = 'https://accounts.google.com/o/oauth2/auth?response_type=code&scope=profile%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fcloudprint&approval_prompt=force&access_type=offline&client_id=289383398542-oluetan6ds67bdtbgj5mb850jdjhmfbo.apps.googleusercontent.com&redirect_uri=' + mainUrl + '/print'

const express = require('express')
const mustacheExpress = require('mustache-express')
const qrCode = require('qrcode-npm')
const cloudPrint = require('node-gcp')
const promiseRequest = require('request-promise')

const app = express()
app.engine('mustache', mustacheExpress())
app.set('view engine', 'mustache')
app.set('views', __dirname + '/views')

app.get('/', (req, res) => res.render('index.mustache', {dropboxUrl: dropboxUrl, googleUrl: googleUrl}))

app.get('/wifi', (req, res) => res.render('wifi.mustache'))

app.get('/print', function (req, res) {
    promiseRequest({
        method: 'POST',
        url: 'https://www.googleapis.com/oauth2/v3/token',
        form: {
            code: req.query.code,
            redirect_uri: mainUrl + '/print',
            client_id: '289383398542-oluetan6ds67bdtbgj5mb850jdjhmfbo.apps.googleusercontent.com',
            client_secret: '4D7nk4yui_P92_sxuGuHKnZI',
            grant_type: 'authorization_code'
        }
    })
        .then((response) => {
            let printClient = new cloudPrint({
                clientId: '289383398542-oluetan6ds67bdtbgj5mb850jdjhmfbo.apps.googleusercontent.com',
                clientSecret: '4D7nk4yui_P92_sxuGuHKnZI',
                accessToken: response.access_token,
                refreshToken: response.refresh_token
            })
            return printClient.getPrinters()
        })
        .then((printers) => res.render('print.mustache', {printers: JSON.stringify(printers)}))
        .catch((error) => res.render('print.mustache', {printers: JSON.stringify(error)}))
})

app.get('/qr', function (req, res) {
    let qr = qrCode.qrcode(5, 'L')
    qr.addData(JSON.stringify(req.query))
    qr.make()
    res.render('qr.mustache', {qrcode: qr.createImgTag(4)})
})

app.listen(8080)


//