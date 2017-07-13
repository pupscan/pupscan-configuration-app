const mainUrl = process.env.VIRTUAL_HOST ? 'https://' + process.env.VIRTUAL_HOST : 'http://localhost:8080'
const dropbox = {
    clientId: 'ib7yg6jhh4xb7m3',
    url: 'https://www.dropbox.com/oauth2/authorize?response_type=code&redirect_uri=' + mainUrl + '/qr&client_id=ib7yg6jhh4xb7m3&state=dropbox'
}
const google = {
    clientId: '289383398542-oluetan6ds67bdtbgj5mb850jdjhmfbo.apps.googleusercontent.com',
    clientSecret: '4D7nk4yui_P92_sxuGuHKnZI',
    url: 'https://accounts.google.com/o/oauth2/auth?response_type=code&scope=profile%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fcloudprint&approval_prompt=force&access_type=offline&client_id=289383398542-oluetan6ds67bdtbgj5mb850jdjhmfbo.apps.googleusercontent.com&redirect_uri=' + mainUrl + '/printer'
}

const express = require('express')
const mustacheExpress = require('mustache-express')
const qrcode = require('qrcode')
const cloudPrint = require('node-gcp')
const promiseRequest = require('request-promise')

const app = express()
app.engine('mustache', mustacheExpress())
app.set('view engine', 'mustache')
app.set('views', __dirname + '/pages')

app.get('/', (req, res) => res.render('index.mustache', {dropboxUrl: dropbox.url, googleUrl: google.url}))

app.get('/wifi', (req, res) => res.render('wifi.mustache'))

app.get('/printer', function (req, res) {
    promiseRequest({
        method: 'POST',
        url: 'https://www.googleapis.com/oauth2/v3/token',
        form: {
            code: req.query.code,
            redirect_uri: mainUrl + '/printer',
            client_id: google.clientId,
            client_secret: google.clientSecret,
            grant_type: 'authorization_code'
        },
        json: true
    })
        .then((response) => {
            let printClient = new cloudPrint({
                clientId: google.clientId,
                clientSecret: google.clientSecret,
                accessToken: response.access_token,
                refreshToken: response.refresh_token
            })
            printClient.getPrinters()
                .then((printers) => {
                    let printerList = printers.map((printer) => {
                        printer.isOnline = (printer.status === 'ONLINE')
                        return printer
                    }).filter((printer) => printer.id !== '__google__docs')
                    res.render('printer.mustache', {
                        printers: printerList,
                        accessToken: response.access_token,
                        refreshToken: response.refresh_token
                    })
                })
        })
        .catch((error) => res.render('printer.mustache', {printers: []}))
})

app.get('/qr', (req, res) => qrcode.toDataURL(JSON.stringify(req.query), (err, url) => res.render('qr.mustache', {qrcode: url})))

app.listen(8080)