
const express = require('express'),
    app = express(),
    crypto = require('crypto'),
    cookieParser = require('cookie-parser');
const path = require('path')
const {v4} = require('uuid')
const {wordsToNumbers} = require('words-to-numbers');

const createError = require('http-errors');
const bodyParser = require('body-parser');
const cors = require('cors');
app.use(express.static(__dirname + "/"));

//let lsnum_en, lsnum_converted, lsresult;
var lsCount;            //Количество найденных ЛС
var cntCounts;
var lsnum_translated;
var a = [];
var lsnum_yapi = '';
var ls_text;
var lsNum;
var lsNumSplited;

let rnd = Math.random()
const tokenKey = '1a2b-3c4d-5e6f-7g8h-3c4d-5e6f-7g8h'
let iamToken = ''
let host, port;
var sql = require('mssql');

const fs = require('fs');
const oracledb = require('oracledb');
const dbConfig = require('./dbconfig.js');

const cron = require('node-cron');

const yandexPassportOauthToken = `AQAEA7qj-3chAATuwVsHVdbgv0DNrAYvWg-KJHs`

var server = app.listen(8081, function () {
    host = server.address().address
    port = server.address().port

    console.log("url http://%s:%s", host, port)
});

app.use(express.json())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(cors());

app.use(express.urlencoded({extended: true}))
app.use(cookieParser('FtrIfgkg887%$9fF'));
'use strict';

let libPath;
if (process.platform === 'win32') {           // Windows
    libPath = 'C:\\instantclient_21_6';
} else if (process.platform === 'darwin') {   // macOS
    libPath = process.env.HOME + '/Downloads/instantclient_19_8';
}
if (libPath && fs.existsSync(libPath)) {
    oracledb.initOracleClient({libDir: libPath});
}

oracledb.extendedMetaData = true;

app.get('/', (req, res) => {
    return res.status(403).json({message: 'Action not allowed'})
})

app.use((req, res, next) => {
    if (req.headers.authorization) {
        let tokenParts = req.headers.authorization
            .split(' ')[1]
            .split('.')
        let signature = crypto
            .createHmac('SHA256', tokenKey)
            .update(`${tokenParts[0]}.${tokenParts[1]}`)
            .digest('base64')

        if (signature === tokenParts[2])
            req.user = JSON.parse(
                Buffer.from(tokenParts[1], 'base64').toString(
                    'utf8'
                )
            )

        next()
    }

    next()
})

app.post('/api/account/auth', (req, res) => {
    async function run_auth() {

        let login = String(req.body.login);

        let passwd = String(req.body.password);

        let connection;

        try {
            connection = await oracledb.getConnection(dbConfig);

            await (connection);

            const sql =
                `select COUNT(ID) AS ID from SG_REG where LOGIN = :lgn and PASS = :pwd order by id desc`;

            let result;

            result = await connection.execute(
                sql,
                [login, passwd],
                {
                    outFormat: oracledb.OUT_FORMAT_OBJECT,
                }
            );
            let login_count = result.rows[0]['ID'];

            if (login_count > 0) {

                try {
                    const sql =
                        `select * from SG_REG where LOGIN = :lgn order by id desc`;

                    let result;

                    result = await connection.execute(
                        sql,
                        [login],
                        {
                            outFormat: oracledb.OUT_FORMAT_OBJECT,
                        }
                    );

                    let login_count = result.rows[0]['LOGIN'];

                    let head = Buffer.from(
                        JSON.stringify({alg: 'HS256', typ: 'jwt'})
                    ).toString('base64')
                    let body = Buffer.from(JSON.stringify(req.body.login)).toString(
                        'base64'
                    )
                    let signature = crypto
                        .createHmac('SHA256', tokenKey)
                        .update(`${head}.${body}`)
                        .digest('base64')

                    return res.status(200).json({
                        id: login_count,
                        login: req.body.login,
                        token: `${head}.${body}.${signature}`,
                    })
                } catch (err) {
                    console.error(err);
                }

            } else {
                return res.status(404).json({message: 'User not found'})
            }

        } catch (err) {
            console.error(err);
        } finally {
            if (connection) {
                try {
                    // Connections should always be released when not needed
                    await connection.close();
                } catch (err) {
                    console.error(err);
                }
            }
        }
    }

    run_auth();
})


/*app.get('/user', (req, res) => {
    if (req.user) return res.status(200).json(req.user)
    else
        return res
            .status(401)
            .json({ message: 'Not authorized' })
})*/

//app.use('/api', indexRouter)


/*app.get('/', (req, res) => {
    res.status(200).type('text/plain')
    res.send('Home page')
})*/

/*app.get('/about', (req, res) => {
    res.status(200).type('text/plain')
    res.send('About page')
})

app.post('/api/admin', (req, res) => {
    res.status(200).type('text/plain')
    res.send('Create admin request')
})

app.post('/api/user', (req, res) => {
    res.status(200).type('text/plain')
    res.send('Create user request')
})*/

/*app.use((req, res, next) => {
    res.status(404).type('text/plain')
    res.send('Not found')
})*/

/*app.get('/api/sale', function (req, res) {
    sql.connect('Server=10.3.1.3,1433;Database=*****;User Id=sa;Password=*******;Encrypt=false', function () {
        var request = new sql.Request();
        request.query('SELECT * FROM [communa].[dbo].[t_recline] where recdate like \'%2022-07-14%\'  order by recdate, rectime', function (err, resp) {
            if (err) console.log(err);
            res.json(resp.recordset); // СЂРµР·СѓР»СЊС‚Р°С‚ РІ С„РѕСЂРјР°С‚Рµ JSON
            sql.close(); // Р·Р°РєСЂС‹РІР°РµРј СЃРѕРµРґРёРЅРµРЅРёРµ СЃ Р±Р°Р·РѕР№ РґР°РЅРЅС‹С…
        });
    });
});*/

/*app.use('/api/pk_bot.get_bot_sessions', function (req, res) {
    async function run() {

        let connection;

        try {
            connection = await oracledb.getConnection(dbConfig);

            await (connection);  // create the demo table

            const sql =
                `select * from t_pok_bot_sessions order by id desc`;

            let result;

            //result = await connection.execute(sql);

            result = await connection.execute(
                sql,
                [], // A bind parameter is needed to disambiguate the following options parameter and avoid ORA-01036
                {
                    outFormat: oracledb.OUT_FORMAT_OBJECT,     // outFormat can be OBJECT or ARRAY.  The default is ARRAY
                    // prefetchRows:   100,                    // internal buffer allocation size for tuning
                    // fetchArraySize: 100                     // internal buffer allocation size for tuning
                }
            );
            res.json(result.rows); // СЂРµР·СѓР»СЊС‚Р°С‚ РІ С„РѕСЂРјР°С‚Рµ JSON
            //console.log(result.rows);

        } catch (err) {
            console.error(err);
        } finally {
            if (connection) {
                try {
                    // Connections should always be released when not needed
                    await connection.close();
                } catch (err) {
                    console.error(err);
                }
            }
        }
    }
    run();
})*/

//БАЛАНС СЧЕТА
app.use('/api/balance', function (req, res) {
    let otb;

    async function run_balance() {
        await (async () => {
            try {
                const request = await require('request');

                var options = {
                    url: 'https://business.tinkoff.ru/openapi/api/v3/bank-accounts',
                    method: 'GET',
                    Authorization: 'Bearer t._FlApN6LT6wbk1ouD5M2dezOavJZoTzOO-Zx9TYZE-vwH9z5MeslYYAg9d7xemgyxYlX3MsLhdFsQaUGZYV_uA',
                    headers: {
                        'Authorization': 'Bearer t._FlApN6LT6wbk1ouD5M2dezOavJZoTzOO-Zx9TYZE-vwH9z5MeslYYAg9d7xemgyxYlX3MsLhdFsQaUGZYV_uA',
                        'accountNumber': '40802810400003198839',
                        'Content-Type': 'application/json',
                    }
                };

                var callback = (error, response, body) => {
                    //otb=String(body['balance'['balance']['otb']})
                    var obj = JSON.parse(body);
                    var balance = Number(obj[0]['balance']['otb'])
                    var summa = new Number
                    summa = 26617.98
                    if (summa < balance) {
                        return res.status(200).json({
                            balance,
                            message: "Поступление"
                        })
                    } else {
                        console.log(balance)
                        return res.status(200).json({
                            balance,
                            message: "Нет изменений"
                        })
                    }
                    //var keys = Object.keys(obj);
                    // for (var i = 0; i < keys.length; i++) {

                    //obj[keys[i]]
                    //}
                    //console.log(otb);

                }
                request(options, callback);
            } catch (error) {
                console.log(error.response.body);
            }

        })();
    }

    run_balance();

})

//Получение IAM токена
async function getIamToken() {
    await (async () => {
        try {
            const request = await require('request');

            var options = {
                url: 'https://iam.api.cloud.yandex.net/iam/v1/tokens',
                json: {
                    "yandexPassportOauthToken": "AQAEA7qj-3chAATuwVsHVdbgv0DNrAYvWg-KJHs"
                },
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': '*/*',
                }
            };

            var callback = (error, response, body) => {
                //console.log(body['iamToken']);
                iamToken = body['iamToken']
                console.log(iamToken)
            }
            request(options, callback);
        } catch (error) {
            console.log(error.response.body);
        }

    })();
}

getIamToken().then(r => this)

//let timerId = setInterval(() => getIamToken(), '1m');

/*var job = new CronJob(
    '0 /1 * * * *',
    getIamToken(),
    null,
    true,
    'Europe/Astrakhan'
);*/

cron.schedule('0 */50 * * *', function () {
    getIamToken().then(r => (this))
});


function getLsNumber(callback) {
    const request = require('request');
    var options = {
        url: 'https://translate.api.cloud.yandex.net/translate/v2/translate',
        json: {
            targetLanguageCode: "en",
            texts: [
                ls_text
            ],
            folderId: "b1gnj3tqjnuor6rj0v2m"
        },
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + iamToken,
            'Accept': 'text/plain',
        }
    };
    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            lsnum_yapi = JSON.stringify(JSON.parse(body));
            return callback(lsnum_yapi, false);
        } else {
            return callback(null, error);
            ;
        }
    });
}


//РАСПОЗНОВАНИЕ ЛС ИЗ ТЕКСТА В ЦИФРУ

app.use('/api/:token/pk_bot.texttonum', function (req, res) {
    //var cookie = req.cookies;
    let lsnum_en, lsnum_converted, lsresult;

    async function run_translate() {
        //req.params.token = tokenKey;
        ls_text = req.body.lstext;
        let phoneNum = req.body.phonenum;

//--------------------------------НУЛИ-------------------------------------------------
        /*ls_text = ls_text.replace(' ноль один ','01');
        ls_text = ls_text.replace(' ноль два ','02');
        ls_text = ls_text.replace(' ноль три ','03');
        ls_text = ls_text.replace(' ноль четыре ','04');
        ls_text = ls_text.replace(' ноль пять ','05');
        ls_text = ls_text.replace(' ноль шесть ','06');
        ls_text = ls_text.replace(' ноль семь ','07');
        ls_text = ls_text.replace(' ноль восемь ','08');
        ls_text = ls_text.replace(' ноль девять ','09');
        ls_text = ls_text.replace(' ноль десять ','010');
        ls_text = ls_text.replace(' ноль одинадцать ','011');
        ls_text = ls_text.replace(' ноль двенадцать ','012');*/

        ls_text = ls_text.replace('ноль', '0');

        ls_text = ls_text.replace('два нуля', '00');
        ls_text = ls_text.replace('два ноля', '00');
        ls_text = ls_text.replace('two zeros ', '00');
        ls_text = ls_text.replace('2zeros', '00');

//---------------------------------------------------------------------------------

        ls_text = ls_text.replace('три нуля', '000');
        ls_text = ls_text.replace('три ноля', '000');
        ls_text = ls_text.replace('three zeros ', '000');
        ls_text = ls_text.replace('3zeros', '000');

//---------------------------------------------------------------------------------

        ls_text = ls_text.replace('четыре нуля', '0000');
        ls_text = ls_text.replace('четыре ноля', '0000');
        ls_text = ls_text.replace('четыре нулей', '0000');
        ls_text = ls_text.replace('четыре нолей', '0000');
        ls_text = ls_text.replace('four zeros', '0000');
        ls_text = ls_text.replace('4zeros', '0000');

//---------------------------------------------------------------------------------

        ls_text = ls_text.replace('пять нуля', '00000');
        ls_text = ls_text.replace('пять ноля', '00000');
        ls_text = ls_text.replace('пять нулей', '00000');
        ls_text = ls_text.replace('пять нолей', '00000');
        ls_text = ls_text.replace('five zeros', '00000');
        ls_text = ls_text.replace('5zeros', '00000');

//---------------------------------------------------------------------------------

        ls_text = ls_text.replace('шесть нуля', '000000');
        ls_text = ls_text.replace('шесть ноля', '000000');
        ls_text = ls_text.replace('шесть нулей', '000000');
        ls_text = ls_text.replace('шесть нолей', '000000');
        ls_text = ls_text.replace('six zeros', '000000');
        ls_text = ls_text.replace('6zeros', '000000');

//---------------------------------------------------------------------------------
        if (ls_text)
            ls_text = ls_text.replace('семь нуля', '0000000');
        ls_text = ls_text.replace('семь ноля', '0000000');
        ls_text = ls_text.replace('семь нулей', '0000000');
        ls_text = ls_text.replace('семь нолей', '0000000');
        ls_text = ls_text.replace('seven zeros', '0000000');
        ls_text = ls_text.replace('7zeros', '0000000');

//---------------------------------------------------------------------------------
        ls_text = ls_text.replace('восемь нуля', '00000000');
        ls_text = ls_text.replace('восемь ноля', '00000000');
        ls_text = ls_text.replace('восемь нулей', '00000000');
        ls_text = ls_text.replace('восемь нолей', '00000000');
        ls_text = ls_text.split(new RegExp('во0000000', 'g')).join('00000000')
        ls_text = ls_text.replace('eight zeros', '00000000');
        ls_text = ls_text.replace('8 zeros', '00000000');
        ls_text = ls_text.replace('8zeros', '00000000');
        ls_text = ls_text.replace('8 zero', '00000000');
        ls_text = ls_text.replace('8zero', '00000000');
//-----------------------------ЕДИНИЦЫ----------------------------------------------------

        ls_text = ls_text.replace('единичка', '1');
        ls_text = ls_text.replace('единица', '1');
        ls_text = ls_text.replace('одна единичек', '1');
        ls_text = ls_text.replace('одна единичка', '1');
        ls_text = ls_text.replace('одна единицы', '1');
        ls_text = ls_text.replace('один единицы', '1');
        ls_text = ls_text.replace('один единиц', '1');
        ls_text = ls_text.replace('одна единиц', '1');
        ls_text = ls_text.replace('одна единица', '1');
        ls_text = ls_text.replace('один единица', '1');
        ls_text = ls_text.replace('one units ', '1');
        ls_text = ls_text.replace('1units', '1');
//---------------------------------------------------------------------------------

        ls_text = ls_text.replace('две единичек', '11');
        ls_text = ls_text.replace('две единички', '11');
        ls_text = ls_text.replace('две единицы', '11');
        ls_text = ls_text.replace('два единицы', '11');
        ls_text = ls_text.replace('две единиц', '11');
        ls_text = ls_text.replace('два единица', '11');
        ls_text = ls_text.replace('два единиц', '11');
        ls_text = ls_text.replace('two units ', '11');
        ls_text = ls_text.replace('2units', '11');

//---------------------------------------------------------------------------------

        ls_text = ls_text.replace('три единички', '111');
        ls_text = ls_text.replace('три единичек', '111');
        ls_text = ls_text.replace('три единицы', '111');
        ls_text = ls_text.replace('три единиц', '111');
        ls_text = ls_text.replace('три единица', '111');

//---------------------------------------------------------------------------------

        ls_text = ls_text.replace('четыре единички', '1111');
        ls_text = ls_text.replace('четыре единичек', '1111');
        ls_text = ls_text.replace('четыре единицы', '1111');
        ls_text = ls_text.replace('четыре единиц', '1111');
        ls_text = ls_text.replace('четыре единица', '1111');

//---------------------------------------------------------------------------------

        ls_text = ls_text.replace('пять единички', '11111');
        ls_text = ls_text.replace('пять единичек', '11111');
        ls_text = ls_text.replace('пять единицы', '11111');
        ls_text = ls_text.replace('пять единиц', '11111');
        ls_text = ls_text.replace('пять единица', '11111');

//---------------------------------------------------------------------------------

        ls_text = ls_text.replace('шесть единичек', '111111');
        ls_text = ls_text.replace('шесть единицы', '111111');
        ls_text = ls_text.replace('шесть единиц', '111111');
        ls_text = ls_text.replace('шесть единица', '111111');

//---------------------------------------------------------------------------------

        ls_text = ls_text.replace('семь единичек', '1111111');
        ls_text = ls_text.replace('семь единицы', '1111111');
        ls_text = ls_text.replace('семь единиц', '1111111');
        ls_text = ls_text.replace('семь единица', '1111111');

//---------------------------------------------------------------------------------

        ls_text = ls_text.replace('восемь единичек', '11111111');
        ls_text = ls_text.replace('восемь единицы', '11111111');
        ls_text = ls_text.replace('восемь единиц', '11111111');
        ls_text = ls_text.replace('восемь единица', '11111111');

//---------------------------------------------------------------------------------

        ls_text = ls_text.replace('девять единичек', '111111111');
        ls_text = ls_text.replace('девять единицы', '111111111');
        ls_text = ls_text.replace('девять единицы', '111111111');
        ls_text = ls_text.replace('девять единиц', '111111111');
        ls_text = ls_text.replace('девять единица', '111111111');
        ls_text = ls_text.replace('девять единиц', '111111111');

//---------------------------ДВОЙКИ------------------------------------------------------

        ls_text = ls_text.replace('двойка', '2');
        ls_text = ls_text.replace('двоечка', '2');
        ls_text = ls_text.replace('двойбан', '2');
        ls_text = ls_text.replace('одна двоечка', '2');
        ls_text = ls_text.replace('одна двойка', '2');
        ls_text = ls_text.replace('одна двойки', '2');
        ls_text = ls_text.replace('один двойка', '2');
        ls_text = ls_text.replace('один двойки', '2');
        ls_text = ls_text.replace('один раз два', '2');
        ls_text = ls_text.replace('один раз двойка', '2');
        ls_text = ls_text.replace('одна раз двойка', '2');
        ls_text = ls_text.replace('один раз двойки', '2');
        ls_text = ls_text.replace('одна раз двойки', '2');
        ls_text = ls_text.replace('один раза двойка', '2');
        ls_text = ls_text.replace('одна раза двойка', '2');

//---------------------------------------------------------------------------------

        ls_text = ls_text.replace('две двоечки', '22');
        ls_text = ls_text.replace('две двоечка', '22');
        ls_text = ls_text.replace('два двоечки', '22');
        ls_text = ls_text.replace('два двоечка', '22');
        ls_text = ls_text.replace('две двойка', '22');
        ls_text = ls_text.replace('два двойки', '22');
        ls_text = ls_text.replace('два раза два', '22');
        ls_text = ls_text.replace('два раза два', '22');
        ls_text = ls_text.replace('два раза двойки', '22');
        ls_text = ls_text.replace('две раза двойки', '22');

//---------------------------------------------------------------------------------

        ls_text = ls_text.replace('три двойка', '222');
        ls_text = ls_text.replace('три двойки', '222');
        ls_text = ls_text.replace('три двоечки', '222');
        ls_text = ls_text.replace('три раза два', '222');
        ls_text = ls_text.replace('три раза по два', '222');
        ls_text = ls_text.replace('три раза двойка', '222');
        ls_text = ls_text.replace('три раза двойки', '222');

//---------------------------------------------------------------------------------

        ls_text = ls_text.replace('четыре двоечки', '2222');
        ls_text = ls_text.replace('четыре двойка', '2222');
        ls_text = ls_text.replace('четыре двойки', '2222');
        ls_text = ls_text.replace('четыре раза два', '2222');
        ls_text = ls_text.replace('четыре раза по два', '2222');
        ls_text = ls_text.replace('четыре раза двойка', '2222');
        ls_text = ls_text.replace('четыре раза двойки', '2222');

//---------------------------------------------------------------------------------

        ls_text = ls_text.replace('пять двоечек', '22222');
        ls_text = ls_text.replace('пять двоек', '22222');
        ls_text = ls_text.replace('пять двойки', '22222');
        ls_text = ls_text.replace('пять раз два', '22222');
        ls_text = ls_text.replace('пять раза два', '22222');
        ls_text = ls_text.replace('пять раза по два', '22222');
        ls_text = ls_text.replace('пять раз по два', '22222');
        ls_text = ls_text.replace('пять раза двойка', '22222');
        ls_text = ls_text.replace('пять раза двоек', '22222');
        ls_text = ls_text.replace('пять раза двойки', '22222');

//---------------------------------------------------------------------------------

        ls_text = ls_text.replace('шесть двоечек', '222222');
        ls_text = ls_text.replace('шесть двоек', '222222');
        ls_text = ls_text.replace('шесть двойки', '222222');
        ls_text = ls_text.replace('шесть раз два', '222222');
        ls_text = ls_text.replace('шесть раза два', '222222');
        ls_text = ls_text.replace('шесть раза по два', '222222');
        ls_text = ls_text.replace('шесть раз по два', '222222');
        ls_text = ls_text.replace('шесть раза двойка', '222222');
        ls_text = ls_text.replace('шесть раза двоек', '222222');
        ls_text = ls_text.replace('шесть раз двоек', '222222');
        ls_text = ls_text.replace('шесть раза двойки', '222222');
        ``
//---------------------------------------------------------------------------------

        ls_text = ls_text.replace('семь двоечек', '2222222');
        ls_text = ls_text.replace('семь двоек', '2222222');
        ls_text = ls_text.replace('семь двойки', '2222222');
        ls_text = ls_text.replace('семь раз два', '2222222');
        ls_text = ls_text.replace('семь раза два', '2222222');
        ls_text = ls_text.replace('семь раза по два', '2222222');
        ls_text = ls_text.replace('семь раз по два', '2222222');
        ls_text = ls_text.replace('семь раза двойка', '2222222');
        ls_text = ls_text.replace('семь раза двоек', '2222222');
        ls_text = ls_text.replace('семь раз двоек', '2222222');
        ls_text = ls_text.replace('семь раза двойки', '2222222');

//---------------------------------------------------------------------------------

        ls_text = ls_text.replace('восемь двоечек', '22222222');
        ls_text = ls_text.replace('восемь двоек', '22222222');
        ls_text = ls_text.replace('восемь двойки', '22222222');
        ls_text = ls_text.replace('восемь раз два', '22222222');
        ls_text = ls_text.replace('восемь раза два', '22222222');
        ls_text = ls_text.replace('восемь раза по два', '22222222');
        ls_text = ls_text.replace('восемь раз по два', '22222222');
        ls_text = ls_text.replace('восемь раза двойка', '22222222');
        ls_text = ls_text.replace('восемь раза двоек', '22222222');
        ls_text = ls_text.replace('восемь раз двоек', '22222222');
        ls_text = ls_text.replace('восемь раза двойки', '22222222');

//---------------------------------------------------------------------------------

        ls_text = ls_text.replace('девять двоечек', '222222222');
        ls_text = ls_text.replace('девять двоек', '222222222');
        ls_text = ls_text.replace('девять двойки', '222222222');
        ls_text = ls_text.replace('девять раз два', '222222222');
        ls_text = ls_text.replace('девять раза два', '222222222');
        ls_text = ls_text.replace('девять раза по два', '222222222');
        ls_text = ls_text.replace('девять раз по два', '222222222');
        ls_text = ls_text.replace('девять раза двойка', '222222222');
        ls_text = ls_text.replace('девять раза двоек', '222222222');
        ls_text = ls_text.replace('девять раз двоек', '222222222');
        ls_text = ls_text.replace('девять раза двойки', '22222222');

//---------------------------------------------------------------------------------

//---------------------------ТРОЙКИ------------------------------------------------------

        ls_text = ls_text.replace('тройка', '3');
        ls_text = ls_text.replace('троечка', '3');
        ls_text = ls_text.replace('тройбан', '3');
        ls_text = ls_text.replace('одна троечка', '3');
        ls_text = ls_text.replace('одна тройка', '3');
        ls_text = ls_text.replace('одна тройки', '3');
        ls_text = ls_text.replace('один тройка', '3');
        ls_text = ls_text.replace('один тройки', '3');
        ls_text = ls_text.replace('один раз три', '3');
        ls_text = ls_text.replace('один раз тройка', '3');
        ls_text = ls_text.replace('одна раз тройка', '3');
        ls_text = ls_text.replace('один раз тройки', '3');
        ls_text = ls_text.replace('одна раз тройки', '3');
        ls_text = ls_text.replace('один раза тройка', '3');
        ls_text = ls_text.replace('одна раза тройка', '3');

//---------------------------------------------------------------------------------

        ls_text = ls_text.replace('две троечки', '33');
        ls_text = ls_text.replace('две троечка', '33');
        ls_text = ls_text.replace('два троечки', '33');
        ls_text = ls_text.replace('два троечка', '33');
        ls_text = ls_text.replace('две тройка', '33');
        ls_text = ls_text.replace('два тройки', '33');
        ls_text = ls_text.replace('два раза три', '33');
        ls_text = ls_text.replace('два раза три', '33');
        ls_text = ls_text.replace('два раза тройки', '33');
        ls_text = ls_text.replace('две раза тройки', '33');

//---------------------------------------------------------------------------------

        ls_text = ls_text.replace('три тройки', '333');
        ls_text = ls_text.replace('три троечки', '333');
        ls_text = ls_text.replace('три раза три', '333');
        ls_text = ls_text.replace('три раза по три', '333');
        ls_text = ls_text.replace('три раза тройка', '333');
        ls_text = ls_text.replace('три раза тройки', '333');

//---------------------------------------------------------------------------------

        ls_text = ls_text.replace('четыре троечки', '3333');
        ls_text = ls_text.replace('четыре тройка', '3333');
        ls_text = ls_text.replace('четыре тройки', '3333');
        ls_text = ls_text.replace('четыре раза три', '3333');
        ls_text = ls_text.replace('четыре раза по три', '3333');
        ls_text = ls_text.replace('четыри раза по три', '3333');
        ls_text = ls_text.replace('четыре раза тройка', '3333');
        ls_text = ls_text.replace('четыре раза тройки', '3333');

//---------------------------------------------------------------------------------

        ls_text = ls_text.replace('пять троечек', '33333');
        ls_text = ls_text.replace('пять троек', '33333');
        ls_text = ls_text.replace('пять тройки', '33333');
        ls_text = ls_text.replace('пять раз три', '33333');
        ls_text = ls_text.replace('пять раза три', '33333');
        ls_text = ls_text.replace('пять раза по три', '33333');
        ls_text = ls_text.replace('пять раз по три', '33333');
        ls_text = ls_text.replace('пять раза тройка', '33333');
        ls_text = ls_text.replace('пять раза троек', '33333');
        ls_text = ls_text.replace('пять раза тройки', '33333');

//---------------------------------------------------------------------------------

        ls_text = ls_text.replace('шесть троечек', '333333');
        ls_text = ls_text.replace('шесть троек', '333333');
        ls_text = ls_text.replace('шесть тройки', '333333');
        ls_text = ls_text.replace('шесть раз три', '333333');
        ls_text = ls_text.replace('шесть раза три', '333333');
        ls_text = ls_text.replace('шесть раза по три', '333333');
        ls_text = ls_text.replace('шесть раз по три', '333333');
        ls_text = ls_text.replace('шесть раза тройка', '333333');
        ls_text = ls_text.replace('шесть раза троек', '333333');
        ls_text = ls_text.replace('шесть раз троек', '333333');
        ls_text = ls_text.replace('шесть раза тройки', '333333');

//---------------------------------------------------------------------------------

        ls_text = ls_text.replace('семь троечек', '3333333');
        ls_text = ls_text.replace('семь троек', '3333333');
        ls_text = ls_text.replace('семь тройки', '3333333');
        ls_text = ls_text.replace('семь раз три', '3333333');
        ls_text = ls_text.replace('семь раза три', '3333333');
        ls_text = ls_text.replace('семь раза по три', '3333333');
        ls_text = ls_text.replace('семь раз по три', '3333333');
        ls_text = ls_text.replace('семь раза тройка', '3333333');
        ls_text = ls_text.replace('семь раза троек', '3333333');
        ls_text = ls_text.replace('семь раз троек', '3333333');
        ls_text = ls_text.replace('семь раза тройки', '3333333');

//---------------------------------------------------------------------------------

        ls_text = ls_text.replace('восемь троечек', '33333333');
        ls_text = ls_text.replace('восемь троек', '33333333');
        ls_text = ls_text.replace('восемь тройки', '33333333');
        ls_text = ls_text.replace('восемь раз три', '33333333');
        ls_text = ls_text.replace('восемь раза три', '33333333');
        ls_text = ls_text.replace('восемь раза по три', '33333333');
        ls_text = ls_text.replace('восемь раз по три', '33333333');
        ls_text = ls_text.replace('восемь раза тройка', '33333333');
        ls_text = ls_text.replace('восемь раза троек', '33333333');
        ls_text = ls_text.replace('восемь раз троек', '33333333');
        ls_text = ls_text.replace('восемь раза тройки', '33333333');

//---------------------------------------------------------------------------------

        ls_text = ls_text.replace('девять троечек', '333333333');
        ls_text = ls_text.replace('девять троек', '333333333');
        ls_text = ls_text.replace('девять тройки', '333333333');
        ls_text = ls_text.replace('девять раз три', '333333333');
        ls_text = ls_text.replace('девять раза три', '333333333');
        ls_text = ls_text.replace('девять раза по три', '333333333');
        ls_text = ls_text.replace('девять раз по три', '333333333');
        ls_text = ls_text.replace('девять раза тройка', '333333333');
        ls_text = ls_text.replace('девять раза троек', '333333333');
        ls_text = ls_text.replace('девять раз троек', '333333333');
        ls_text = ls_text.replace('девять раза тройки', '333333333');

//---------------------------------------------------------------------------------

//---------------------------ЧЕТВЕРКИ------------------------------------------------------

        ls_text = ls_text.replace('четверочка', '4');
        ls_text = ls_text.replace('четверка', '4');
        ls_text = ls_text.replace('одна четверочка', '4');
        ls_text = ls_text.replace('одна четверка', '4');
        ls_text = ls_text.replace('одна четверки', '4');
        ls_text = ls_text.replace('один четверочка', '4');
        ls_text = ls_text.replace('один четверки', '4');
        ls_text = ls_text.replace('один раз четыре', '4');
        ls_text = ls_text.replace('один раз четверка', '4');
        ls_text = ls_text.replace('одна раз четверка', '4');
        ls_text = ls_text.replace('один раз четверки', '4');
        ls_text = ls_text.replace('одна раз четверки', '4');
        ls_text = ls_text.replace('один раза четверка', '4');
        ls_text = ls_text.replace('одна раза четверка', '4');

//---------------------------------------------------------------------------------

        ls_text = ls_text.replace('две четверки', '44');
        ls_text = ls_text.replace('две четверочки', '44');
        ls_text = ls_text.replace('два четверки', '44');
        ls_text = ls_text.replace('два раза четыре', '44');
        ls_text = ls_text.replace('два раз четыре', '44');
        ls_text = ls_text.replace('два раза четверки', '44');
        ls_text = ls_text.replace('две раза четверочки', '44');

//---------------------------------------------------------------------------------

        ls_text = ls_text.replace('три четверки', '444');
        ls_text = ls_text.replace('три четверочки', '444');
        ls_text = ls_text.replace('три раза четыре', '444');
        ls_text = ls_text.replace('три раза по четыре', '444');
        ls_text = ls_text.replace('три раза четверочки', '444');
        ls_text = ls_text.replace('три раза четверки', '444');

//---------------------------------------------------------------------------------

        ls_text = ls_text.replace('четыре четверочек', '4444');
        ls_text = ls_text.replace('четыре четверки', '4444');
        ls_text = ls_text.replace('четыре четверка', '4444');
        ls_text = ls_text.replace('четыре раза четыре', '4444');
        ls_text = ls_text.replace('четыре раза по четыре', '4444');
        ls_text = ls_text.replace('четыре раза четверка', '4444');
        ls_text = ls_text.replace('четыре раза четверки', '4444');

//---------------------------------------------------------------------------------

        ls_text = ls_text.replace('пять четверки', '44444');
        ls_text = ls_text.replace('пять четверок', '44444');
        ls_text = ls_text.replace('пять четверочек', '44444');
        ls_text = ls_text.replace('пять раз четыре', '44444');
        ls_text = ls_text.replace('пять раз четверки', '44444');
        ls_text = ls_text.replace('пять раза четыре', '44444');
        ls_text = ls_text.replace('пять раза по четыре', '44444');
        ls_text = ls_text.replace('пять раз по четыре', '44444');
        ls_text = ls_text.replace('пять раза четверка', '44444');
        ls_text = ls_text.replace('пять раза четверок', '44444');
        ls_text = ls_text.replace('пять раза четверки', '44444');

//---------------------------------------------------------------------------------

        ls_text = ls_text.replace('шесть четверочек', '444444');
        ls_text = ls_text.replace('шесть четверок', '444444');
        ls_text = ls_text.replace('шесть четверки', '444444');
        ls_text = ls_text.replace('шесть раз четыре', '444444');
        ls_text = ls_text.replace('шесть раза четыре', '444444');
        ls_text = ls_text.replace('шесть раза по четыре', '444444');
        ls_text = ls_text.replace('шесть раз по четыре', '444444');
        ls_text = ls_text.replace('шесть раза четверки', '444444');
        ls_text = ls_text.replace('шесть раза четверок', '444444');

//---------------------------------------------------------------------------------

        ls_text = ls_text.replace('семь четверочек', '4444444');
        ls_text = ls_text.replace('семь четверок', '4444444');
        ls_text = ls_text.replace('семь четверки', '4444444');
        ls_text = ls_text.replace('семь раз четыре', '4444444');
        ls_text = ls_text.replace('семь раза четыре', '4444444');
        ls_text = ls_text.replace('семь раза по четыре', '4444444');
        ls_text = ls_text.replace('семь раз по четыре', '4444444');
        ls_text = ls_text.replace('семь раза четверка', '4444444');
        ls_text = ls_text.replace('семь раза четверок', '4444444');
        ls_text = ls_text.replace('семь раз четверок', '4444444');
        ls_text = ls_text.replace('семь раза четверки', '4444444');

//---------------------------------------------------------------------------------

        ls_text = ls_text.replace('восемь четверочек', '44444444');
        ls_text = ls_text.replace('восемь четверок', '44444444');
        ls_text = ls_text.replace('восемь четверки', '44444444');
        ls_text = ls_text.replace('восемь раз четыре', '44444444');
        ls_text = ls_text.replace('восемь раз четверка', '44444444');
        ls_text = ls_text.replace('восемь раза четыре', '44444444');
        ls_text = ls_text.replace('восемь раза по четыре', '44444444');
        ls_text = ls_text.replace('восемь раз по четыре', '44444444');
        ls_text = ls_text.replace('восемь раза четверка', '44444444');
        ls_text = ls_text.replace('восемь раза четверок', '44444444');
        ls_text = ls_text.replace('восемь раз четверок', '44444444');
        ls_text = ls_text.replace('восемь раза четверки', '44444444');

//---------------------------------------------------------------------------------

        ls_text = ls_text.replace('девять четверочек', '444444444');
        ls_text = ls_text.replace('девять четверок', '444444444');
        ls_text = ls_text.replace('девять четверки', '444444444');
        ls_text = ls_text.replace('девять раз четыре', '444444444');
        ls_text = ls_text.replace('девять раза четыре', '444444444');
        ls_text = ls_text.replace('девять раза по четыре', '444444444');
        ls_text = ls_text.replace('девять раз по четыре', '444444444');
        ls_text = ls_text.replace('девять раза четверка', '444444444');
        ls_text = ls_text.replace('девять раза четверок', '444444444');
        ls_text = ls_text.replace('девять раз четверок', '444444444');
        ls_text = ls_text.replace('девять раза четверки', '444444444');

//---------------------------------------------------------------------------------
//---------------------------ПЯТЕРКИ------------------------------------------------------

        ls_text = ls_text.replace('пятерочка', '5');
        ls_text = ls_text.replace('пятерка', '5');
        ls_text = ls_text.replace('одна пятерочка', '5');
        ls_text = ls_text.replace('одна пятерка', '5');
        ls_text = ls_text.replace('одна пятерки', '5');
        ls_text = ls_text.replace('один пятерочка', '5');
        ls_text = ls_text.replace('один пятерки', '5');
        ls_text = ls_text.replace('один раз пять', '5');
        ls_text = ls_text.replace('один раз пятерка', '5');
        ls_text = ls_text.replace('одна раз пятерка', '5');
        ls_text = ls_text.replace('один раз пятерки', '5');
        ls_text = ls_text.replace('одна раз пятерки', '5');
        ls_text = ls_text.replace('один раза пятерка', '5');
        ls_text = ls_text.replace('одна раза пятерка', '5');

//---------------------------------------------------------------------------------

        ls_text = ls_text.replace('две пятерки', '55');
        ls_text = ls_text.replace('две пятерочки', '55');
        ls_text = ls_text.replace('два пятерки', '55');
        ls_text = ls_text.replace('два раза пять', '55');
        ls_text = ls_text.replace('два раз пять', '55');
        ls_text = ls_text.replace('два раза пятерки', '55');
        ls_text = ls_text.replace('две раза пятерочки', '55');

//---------------------------------------------------------------------------------

        ls_text = ls_text.replace('три пятерки', '555');
        ls_text = ls_text.replace('три пятерочки', '555');
        ls_text = ls_text.replace('три раза пять', '555');
        ls_text = ls_text.replace('три раза по пять', '555');
        ls_text = ls_text.replace('три раза пятерочки', '555');
        ls_text = ls_text.replace('три раза пятерки', '555');

//---------------------------------------------------------------------------------

        ls_text = ls_text.replace('четыре пятерочек', '5555');
        ls_text = ls_text.replace('четыре пятерки', '5555');
        ls_text = ls_text.replace('четыре пятерка', '5555');
        ls_text = ls_text.replace('четыре раза пять', '5555');
        ls_text = ls_text.replace('четыре раза по пять', '5555');
        ls_text = ls_text.replace('четыре раза пятерка', '5555');
        ls_text = ls_text.replace('четыре раза пятерки', '5555');

//---------------------------------------------------------------------------------

        ls_text = ls_text.replace('пять пятерки', '55555');
        ls_text = ls_text.replace('пять пятерок', '55555');
        ls_text = ls_text.replace('пять пятерочек', '55555');
        ls_text = ls_text.replace('пять раз пять', '55555');
        ls_text = ls_text.replace('пять раз пятерки', '55555');
        ls_text = ls_text.replace('пять раза пять', '55555');
        ls_text = ls_text.replace('пять раза по пять', '55555');
        ls_text = ls_text.replace('пять раз по пять', '55555');
        ls_text = ls_text.replace('пять раза пятерка', '55555');
        ls_text = ls_text.replace('пять раза пятерок', '55555');
        ls_text = ls_text.replace('пять раза пятерки', '55555');

//---------------------------------------------------------------------------------

        ls_text = ls_text.replace('шесть пятерочек', '555555');
        ls_text = ls_text.replace('шесть пятерок', '555555');
        ls_text = ls_text.replace('шесть пятерки', '555555');
        ls_text = ls_text.replace('шесть раз пять', '555555');
        ls_text = ls_text.replace('шесть раза пять', '555555');
        ls_text = ls_text.replace('шесть раза по пять', '555555');
        ls_text = ls_text.replace('шесть раз по пять', '555555');
        ls_text = ls_text.replace('шесть раза пятерки', '555555');
        ls_text = ls_text.replace('шесть раза пятерок', '555555');

//---------------------------------------------------------------------------------

        ls_text = ls_text.replace('семь пятерочек', '5555555');
        ls_text = ls_text.replace('семь пятерок', '5555555');
        ls_text = ls_text.replace('семь пятерки', '5555555');
        ls_text = ls_text.replace('семь раз пять', '5555555');
        ls_text = ls_text.replace('семь раза пять', '5555555');
        ls_text = ls_text.replace('семь раза по пять', '5555555');
        ls_text = ls_text.replace('семь раз по пять', '5555555');
        ls_text = ls_text.replace('семь раза пятерка', '5555555');
        ls_text = ls_text.replace('семь раза пятерок', '5555555');
        ls_text = ls_text.replace('семь раз пятерок', '5555555');
        ls_text = ls_text.replace('семь раза пятерки', '5555555');

//---------------------------------------------------------------------------------

        ls_text = ls_text.replace('восемь пятерочек', '55555555');
        ls_text = ls_text.replace('восемь пятерок', '55555555');
        ls_text = ls_text.replace('восемь пятерки', '55555555');
        ls_text = ls_text.replace('восемь раз пять', '55555555');
        ls_text = ls_text.replace('восемь раз пятерка', '55555555');
        ls_text = ls_text.replace('восемь раза пять', '55555555');
        ls_text = ls_text.replace('восемь раза по пять', '55555555');
        ls_text = ls_text.replace('восемь раз по пять', '55555555');
        ls_text = ls_text.replace('восемь раза пятерка', '55555555');
        ls_text = ls_text.replace('восемь раза пятерок', '55555555');
        ls_text = ls_text.replace('восемь раз пятерок', '55555555');
        ls_text = ls_text.replace('восемь раза пятерки', '55555555');

//---------------------------------------------------------------------------------

        ls_text = ls_text.replace('девять пятерочек', '555555555');
        ls_text = ls_text.replace('девять пятерок', '555555555');
        ls_text = ls_text.replace('девять пятерки', '555555555');
        ls_text = ls_text.replace('девять раз пять', '555555555');
        ls_text = ls_text.replace('девять раза пять', '555555555');
        ls_text = ls_text.replace('девять раза по пять', '555555555');
        ls_text = ls_text.replace('девять раз по пять', '555555555');
        ls_text = ls_text.replace('девять раза пятерка', '555555555');
        ls_text = ls_text.replace('девять раза пятерок', '555555555');
        ls_text = ls_text.replace('девять раз пятерок', '555555555');
        ls_text = ls_text.replace('девять раза пятерки', '555555555');

//---------------------------------------------------------------------------------
//---------------------------ШЕСТЕРКИ------------------------------------------------------

        ls_text = ls_text.replace('шестерочка', '6');
        ls_text = ls_text.replace('шестерка', '6');
        ls_text = ls_text.replace('одна шестерочка', '6');
        ls_text = ls_text.replace('одна шестерка', '6');
        ls_text = ls_text.replace('одна шестерки', '6');
        ls_text = ls_text.replace('один шестерочка', '6');
        ls_text = ls_text.replace('один шестерки', '6');
        ls_text = ls_text.replace('один раз шесть', '6');
        ls_text = ls_text.replace('один раз шестерка', '6');
        ls_text = ls_text.replace('одна раз шестерка', '6');
        ls_text = ls_text.replace('один раз шестерки', '6');
        ls_text = ls_text.replace('одна раз шестерки', '6');
        ls_text = ls_text.replace('один раза шестерка', '6');
        ls_text = ls_text.replace('одна раза шестерка', '6');

//---------------------------------------------------------------------------------

        ls_text = ls_text.replace('две шестерки', '66');
        ls_text = ls_text.replace('две шестерочки', '66');
        ls_text = ls_text.replace('два шестерки', '66');
        ls_text = ls_text.replace('два раза шесть', '66');
        ls_text = ls_text.replace('два раз шесть', '66');
        ls_text = ls_text.replace('два раза шестерки', '66');
        ls_text = ls_text.replace('две раза шестерочки', '66');

//---------------------------------------------------------------------------------

        ls_text = ls_text.replace('три шестерки', '666');
        ls_text = ls_text.replace('три шестерочки', '666');
        ls_text = ls_text.replace('три раза шесть', '666');
        ls_text = ls_text.replace('три раза по шесть', '666');
        ls_text = ls_text.replace('три раза шестерочки', '666');
        ls_text = ls_text.replace('три раза шестерки', '666');

//---------------------------------------------------------------------------------

        ls_text = ls_text.replace('четыре шестерочек', '6666');
        ls_text = ls_text.replace('четыре шестерки', '6666');
        ls_text = ls_text.replace('четыре шестерка', '6666');
        ls_text = ls_text.replace('четыре раза шесть', '6666');
        ls_text = ls_text.replace('четыре раза по шесть', '6666');
        ls_text = ls_text.replace('четыре раза шестерка', '6666');
        ls_text = ls_text.replace('четыре раза шестерки', '6666');

//---------------------------------------------------------------------------------

        ls_text = ls_text.replace('пять шестерки', '66666');
        ls_text = ls_text.replace('пять шестерок', '66666');
        ls_text = ls_text.replace('пять шестерочек', '66666');
        ls_text = ls_text.replace('пять раз шесть', '66666');
        ls_text = ls_text.replace('пять раз шестерки', '66666');
        ls_text = ls_text.replace('пять раза шесть', '66666');
        ls_text = ls_text.replace('пять раза по шесть', '66666');
        ls_text = ls_text.replace('пять раз по шесть', '66666');
        ls_text = ls_text.replace('пять раза шестерка', '66666');
        ls_text = ls_text.replace('пять раза шестерок', '66666');
        ls_text = ls_text.replace('пять раза шестерки', '66666');

//---------------------------------------------------------------------------------

        ls_text = ls_text.replace('шесть шестерочек', '666666');
        ls_text = ls_text.replace('шесть шестерок', '666666');
        ls_text = ls_text.replace('шесть шестерки', '666666');
        ls_text = ls_text.replace('шесть раз шесть', '666666');
        ls_text = ls_text.replace('шесть раза шесть', '666666');
        ls_text = ls_text.replace('шесть раза по шесть', '666666');
        ls_text = ls_text.replace('шесть раз по шесть', '666666');
        ls_text = ls_text.replace('шесть раза шестерки', '666666');
        ls_text = ls_text.replace('шесть раза шестерок', '666666');

//---------------------------------------------------------------------------------

        ls_text = ls_text.replace('семь шестерочек', '6666666');
        ls_text = ls_text.replace('семь шестерок', '6666666');
        ls_text = ls_text.replace('семь шестерки', '6666666');
        ls_text = ls_text.replace('семь раз шесть', '6666666');
        ls_text = ls_text.replace('семь раза шесть', '6666666');
        ls_text = ls_text.replace('семь раза по шесть', '6666666');
        ls_text = ls_text.replace('семь раз по шесть', '6666666');
        ls_text = ls_text.replace('семь раза шестерка', '6666666');
        ls_text = ls_text.replace('семь раза шестерок', '6666666');
        ls_text = ls_text.replace('семь раз шестерок', '6666666');
        ls_text = ls_text.replace('семь раза шестерки', '6666666');

//---------------------------------------------------------------------------------

        ls_text = ls_text.replace('восемь шестерочек', '66666666');
        ls_text = ls_text.replace('восемь шестерок', '66666666');
        ls_text = ls_text.replace('восемь шестерки', '66666666');
        ls_text = ls_text.replace('восемь раз шесть', '66666666');
        ls_text = ls_text.replace('восемь раз шестерка', '66666666');
        ls_text = ls_text.replace('восемь раза шесть', '66666666');
        ls_text = ls_text.replace('восемь раза по шесть', '66666666');
        ls_text = ls_text.replace('восемь раз по шесть', '66666666');
        ls_text = ls_text.replace('восемь раза шестерка', '66666666');
        ls_text = ls_text.replace('восемь раза шестерок', '66666666');
        ls_text = ls_text.replace('восемь раз шестерок', '66666666');
        ls_text = ls_text.replace('восемь раза шестерки', '66666666');

//---------------------------------------------------------------------------------

        ls_text = ls_text.replace('девять шестерочек', '666666666');
        ls_text = ls_text.replace('девять шестерок', '666666666');
        ls_text = ls_text.replace('девять шестерки', '666666666');
        ls_text = ls_text.replace('девять раз шесть', '666666666');
        ls_text = ls_text.replace('девять раза шесть', '666666666');
        ls_text = ls_text.replace('девять раза по шесть', '666666666');
        ls_text = ls_text.replace('девять раз по шесть', '666666666');
        ls_text = ls_text.replace('девять раза шестерка', '666666666');
        ls_text = ls_text.replace('девять раза шестерок', '666666666');
        ls_text = ls_text.replace('девять раз шестерок', '666666666');
        ls_text = ls_text.replace('девять раза шестерки', '666666666');

//---------------------------------------------------------------------------------
//---------------------------СЕМЕРКИ------------------------------------------------------

        ls_text = ls_text.replace('семерочка', '7');
        ls_text = ls_text.replace('семерка', '7');
        ls_text = ls_text.replace('одна семерочка', '7');
        ls_text = ls_text.replace('одна семерка', '7');
        ls_text = ls_text.replace('одна семерки', '7');
        ls_text = ls_text.replace('один семерочка', '7');
        ls_text = ls_text.replace('один семерки', '7');
        ls_text = ls_text.replace('один раз семь', '7');
        ls_text = ls_text.replace('один раз семерка', '7');
        ls_text = ls_text.replace('одна раз семерка', '7');
        ls_text = ls_text.replace('один раз семерки', '7');
        ls_text = ls_text.replace('одна раз семерки', '7');
        ls_text = ls_text.replace('один раза семерка', '7');
        ls_text = ls_text.replace('одна раза семерка', '7');

//---------------------------------------------------------------------------------

        ls_text = ls_text.replace('две семерки', '77');
        ls_text = ls_text.replace('две семерочки', '77');
        ls_text = ls_text.replace('два семерки', '77');
        ls_text = ls_text.replace('два раза семь', '77');
        ls_text = ls_text.replace('два раз семь', '77');
        ls_text = ls_text.replace('два раза семерки', '77');
        ls_text = ls_text.replace('две раза семерочки', '77');

//---------------------------------------------------------------------------------

        ls_text = ls_text.replace('три семерки', '777');
        ls_text = ls_text.replace('три семерочки', '777');
        ls_text = ls_text.replace('три раза семь', '777');
        ls_text = ls_text.replace('три раза по семь', '777');
        ls_text = ls_text.replace('три раза семерочки', '777');
        ls_text = ls_text.replace('три раза семерки', '777');

//---------------------------------------------------------------------------------

        ls_text = ls_text.replace('четыре семерочек', '7777');
        ls_text = ls_text.replace('четыре семерки', '7777');
        ls_text = ls_text.replace('четыре семерка', '7777');
        ls_text = ls_text.replace('четыре раза семь', '7777');
        ls_text = ls_text.replace('четыре раза по семь', '7777');
        ls_text = ls_text.replace('четыре раза семерка', '7777');
        ls_text = ls_text.replace('четыре раза семерки', '7777');

//---------------------------------------------------------------------------------

        ls_text = ls_text.replace('пять семерки', '77777');
        ls_text = ls_text.replace('пять семерок', '77777');
        ls_text = ls_text.replace('пять семерочек', '77777');
        ls_text = ls_text.replace('пять раз семь', '77777');
        ls_text = ls_text.replace('пять раз семерки', '77777');
        ls_text = ls_text.replace('пять раза семь', '77777');
        ls_text = ls_text.replace('пять раза по семь', '77777');
        ls_text = ls_text.replace('пять раз по семь', '77777');
        ls_text = ls_text.replace('пять раза семерка', '77777');
        ls_text = ls_text.replace('пять раза семерок', '77777');
        ls_text = ls_text.replace('пять раза семерки', '77777');

//---------------------------------------------------------------------------------

        ls_text = ls_text.replace('шесть семерочек', '777777');
        ls_text = ls_text.replace('шесть семерок', '777777');
        ls_text = ls_text.replace('шесть семерки', '777777');
        ls_text = ls_text.replace('шесть раз семь', '777777');
        ls_text = ls_text.replace('шесть раза семь', '777777');
        ls_text = ls_text.replace('шесть раза по семь', '777777');
        ls_text = ls_text.replace('шесть раз по семь', '777777');
        ls_text = ls_text.replace('шесть раза семерки', '777777');
        ls_text = ls_text.replace('шесть раза семерок', '777777');

//---------------------------------------------------------------------------------

        ls_text = ls_text.replace('семь семерочек', '7777777');
        ls_text = ls_text.replace('семь семерок', '7777777');
        ls_text = ls_text.replace('семь семерки', '7777777');
        ls_text = ls_text.replace('семь раз семь', '7777777');
        ls_text = ls_text.replace('семь раза семь', '7777777');
        ls_text = ls_text.replace('семь раза по семь', '7777777');
        ls_text = ls_text.replace('семь раз по семь', '7777777');
        ls_text = ls_text.replace('семь раза семерка', '7777777');
        ls_text = ls_text.replace('семь раза семерок', '7777777');
        ls_text = ls_text.replace('семь раз семерок', '7777777');
        ls_text = ls_text.replace('семь раза семерки', '7777777');

//---------------------------------------------------------------------------------

        ls_text = ls_text.replace('восемь семерочек', '77777777');
        ls_text = ls_text.replace('восемь семерок', '77777777');
        ls_text = ls_text.replace('восемь семерки', '77777777');
        ls_text = ls_text.replace('восемь раз семь', '77777777');
        ls_text = ls_text.replace('восемь раз семерка', '77777777');
        ls_text = ls_text.replace('восемь раза семь', '77777777');
        ls_text = ls_text.replace('восемь раза по семь', '77777777');
        ls_text = ls_text.replace('восемь раз по семь', '77777777');
        ls_text = ls_text.replace('восемь раза семерка', '77777777');
        ls_text = ls_text.replace('восемь раза семерок', '77777777');
        ls_text = ls_text.replace('восемь раз семерок', '77777777');
        ls_text = ls_text.replace('восемь раза семерки', '77777777');

//---------------------------------------------------------------------------------

        ls_text = ls_text.replace('девять семерочек', '777777777');
        ls_text = ls_text.replace('девять семерок', '777777777');
        ls_text = ls_text.replace('девять семерки', '777777777');
        ls_text = ls_text.replace('девять раз семь', '777777777');
        ls_text = ls_text.replace('девять раза семь', '777777777');
        ls_text = ls_text.replace('девять раза по семь', '777777777');
        ls_text = ls_text.replace('девять раз по семь', '777777777');
        ls_text = ls_text.replace('девять раза семерка', '777777777');
        ls_text = ls_text.replace('девять раза семерок', '777777777');
        ls_text = ls_text.replace('девять раз семерок', '777777777');
        ls_text = ls_text.replace('девять раза семерки', '777777777');

//---------------------------------------------------------------------------------
//---------------------------ВОСМЕРКИ------------------------------------------------------

        ls_text = ls_text.replace('восьмерочка', '8');
        ls_text = ls_text.replace('восьмерка', '8');
        ls_text = ls_text.replace('одна восьмерочка', '8');
        ls_text = ls_text.replace('одна восьмерка', '8');
        ls_text = ls_text.replace('одна восьмерки', '8');
        ls_text = ls_text.replace('один восьмерки', '8');
        ls_text = ls_text.replace('один раз восемь', '8');
        ls_text = ls_text.replace('один раз восьмерка', '8');
        ls_text = ls_text.replace('одна раз восьмерка', '8');
        ls_text = ls_text.replace('один раз восьмерки', '8');
        ls_text = ls_text.replace('одна раз восьмерки', '8');
        ls_text = ls_text.replace('один раза восьмерка', '8');
        ls_text = ls_text.replace('одна раза восьмерка', '8');

//---------------------------------------------------------------------------------

        ls_text = ls_text.replace('две восьмерки', '88');
        ls_text = ls_text.replace('две восьмерочки', '88');
        ls_text = ls_text.replace('два восьмерки', '88');
        ls_text = ls_text.replace('два раза восемь', '88');
        ls_text = ls_text.replace('два раз восемь', '88');
        ls_text = ls_text.replace('два раза восьмерки', '88');
        ls_text = ls_text.replace('две раза восьмерочки', '88');

//---------------------------------------------------------------------------------

        ls_text = ls_text.replace('три восьмерки', '888');
        ls_text = ls_text.replace('три восьмерочки', '888');
        ls_text = ls_text.replace('три раза восемь', '888');
        ls_text = ls_text.replace('три раза по восемь', '888');
        ls_text = ls_text.replace('три раза восьмерочки', '888');
        ls_text = ls_text.replace('три раза восьмерки', '888');

//---------------------------------------------------------------------------------

        ls_text = ls_text.replace('четыре восьмерочек', '8888');
        ls_text = ls_text.replace('четыре восьмерки', '8888');
        ls_text = ls_text.replace('четыре восьмерка', '8888');
        ls_text = ls_text.replace('четыре раза восемь', '8888');
        ls_text = ls_text.replace('четыре раза по восемь', '8888');
        ls_text = ls_text.replace('четыре раза восьмерка', '8888');
        ls_text = ls_text.replace('четыре раза восьмерки', '8888');

//---------------------------------------------------------------------------------

        ls_text = ls_text.replace('пять восьмерки', '88888');
        ls_text = ls_text.replace('пять восьмерок', '88888');
        ls_text = ls_text.replace('пять восьмерочек', '88888');
        ls_text = ls_text.replace('пять раз восемь', '88888');
        ls_text = ls_text.replace('пять раз восьмерки', '88888');
        ls_text = ls_text.replace('пять раза восемь', '88888');
        ls_text = ls_text.replace('пять раза по восемь', '88888');
        ls_text = ls_text.replace('пять раз по восемь', '88888');
        ls_text = ls_text.replace('пять раза восьмерка', '88888');
        ls_text = ls_text.replace('пять раза восьмерок', '88888');
        ls_text = ls_text.replace('пять раза восьмерки', '88888');

//---------------------------------------------------------------------------------

        ls_text = ls_text.replace('шесть восьмерочек', '888888');
        ls_text = ls_text.replace('шесть восьмерок', '888888');
        ls_text = ls_text.replace('шесть восьмерки', '888888');
        ls_text = ls_text.replace('шесть раз восемь', '888888');
        ls_text = ls_text.replace('шесть раза восемь', '888888');
        ls_text = ls_text.replace('шесть раза по восемь', '888888');
        ls_text = ls_text.replace('шесть раз по восемь', '888888');
        ls_text = ls_text.replace('шесть раза восьмерки', '888888');
        ls_text = ls_text.replace('шесть раза восьмерок', '888888');

//---------------------------------------------------------------------------------

        ls_text = ls_text.replace('семь восьмерочек', '8888888');
        ls_text = ls_text.replace('семь восьмерок', '8888888');
        ls_text = ls_text.replace('семь восьмерки', '8888888');
        ls_text = ls_text.replace('семь раз восемь', '8888888');
        ls_text = ls_text.replace('семь раза восемь', '8888888');
        ls_text = ls_text.replace('семь раза по восемь', '8888888');
        ls_text = ls_text.replace('семь раз по восемь', '8888888');
        ls_text = ls_text.replace('семь раза восьмерка', '8888888');
        ls_text = ls_text.replace('семь раза восьмерок', '8888888');
        ls_text = ls_text.replace('семь раз восьмерок', '8888888');
        ls_text = ls_text.replace('семь раза восьмерки', '8888888');

//---------------------------------------------------------------------------------

        ls_text = ls_text.replace('восемь восьмерочек', '88888888');
        ls_text = ls_text.replace('восемь восьмерок', '88888888');
        ls_text = ls_text.replace('восемь восьмерки', '88888888');
        ls_text = ls_text.replace('восемь раз восемь', '88888888');
        ls_text = ls_text.replace('восемь раз восьмерка', '88888888');
        ls_text = ls_text.replace('восемь раза восемь', '88888888');
        ls_text = ls_text.replace('восемь раза по восемь', '88888888');
        ls_text = ls_text.replace('восемь раз по восемь', '88888888');
        ls_text = ls_text.replace('восемь раза восьмерка', '88888888');
        ls_text = ls_text.replace('восемь раза восьмерок', '88888888');
        ls_text = ls_text.replace('восемь раз восьмерок', '88888888');
        ls_text = ls_text.replace('восемь раза восьмерки', '88888888');

//---------------------------------------------------------------------------------

        ls_text = ls_text.replace('девять восьмерочек', '888888888');
        ls_text = ls_text.replace('девять восьмерок', '888888888');
        ls_text = ls_text.replace('девять восьмерки', '888888888');
        ls_text = ls_text.replace('девять раз восемь', '888888888');
        ls_text = ls_text.replace('девять раза восемь', '888888888');
        ls_text = ls_text.replace('девять раза по восемь', '888888888');
        ls_text = ls_text.replace('девять раз по восемь', '888888888');
        ls_text = ls_text.replace('девять раза восьмерка', '888888888');
        ls_text = ls_text.replace('девять раза восьмерок', '888888888');
        ls_text = ls_text.replace('девять раз восьмерок', '888888888');
        ls_text = ls_text.replace('девять раза восьмерки', '888888888');

//---------------------------------------------------------------------------------
//---------------------------ДЕВЯТКИ------------------------------------------------------

        ls_text = ls_text.replace('девяточка', '9');
        ls_text = ls_text.replace('девятка', '9');
        ls_text = ls_text.replace('одна девяточка', '9');
        ls_text = ls_text.replace('одна девятка', '9');
        ls_text = ls_text.replace('одна девятки', '9');
        ls_text = ls_text.replace('один девятки', '9');
        ls_text = ls_text.replace('один раз девять', '9');
        ls_text = ls_text.replace('один раз девятка', '9');
        ls_text = ls_text.replace('одна раз девятка', '9');
        ls_text = ls_text.replace('один раз девятки', '9');
        ls_text = ls_text.replace('одна раз девятки', '9');
        ls_text = ls_text.replace('один раза девятка', '9');
        ls_text = ls_text.replace('одна раза девятка', '9');

//---------------------------------------------------------------------------------

        ls_text = ls_text.replace('две девятки', '99');
        ls_text = ls_text.replace('две девяточки', '99');
        ls_text = ls_text.replace('два девятки', '99');
        ls_text = ls_text.replace('два раза девять', '99');
        ls_text = ls_text.replace('два раз девять', '99');
        ls_text = ls_text.replace('два раза девятки', '99');
        ls_text = ls_text.replace('две раза девяточки', '99');

//---------------------------------------------------------------------------------

        ls_text = ls_text.replace('три девятки', '999');
        ls_text = ls_text.replace('три девяточки', '999');
        ls_text = ls_text.replace('три раза девять', '999');
        ls_text = ls_text.replace('три раза по девять', '999');
        ls_text = ls_text.replace('три раза девяточки', '999');
        ls_text = ls_text.replace('три раза девятки', '999');

//---------------------------------------------------------------------------------

        ls_text = ls_text.replace('четыре девяточек', '9999');
        ls_text = ls_text.replace('четыре девятки', '9999');
        ls_text = ls_text.replace('четыре девятка', '9999');
        ls_text = ls_text.replace('четыре раза девять', '9999');
        ls_text = ls_text.replace('четыре раза по девять', '9999');
        ls_text = ls_text.replace('четыре раза девятка', '9999');
        ls_text = ls_text.replace('четыре раза девятки', '9999');

//---------------------------------------------------------------------------------

        ls_text = ls_text.replace('пять девятки', '99999');
        ls_text = ls_text.replace('пять девяток', '99999');
        ls_text = ls_text.replace('пять девяточек', '99999');
        ls_text = ls_text.replace('пять раз девять', '99999');
        ls_text = ls_text.replace('пять раз девятки', '99999');
        ls_text = ls_text.replace('пять раза девять', '99999');
        ls_text = ls_text.replace('пять раза по девять', '99999');
        ls_text = ls_text.replace('пять раз по девять', '99999');
        ls_text = ls_text.replace('пять раза девятка', '99999');
        ls_text = ls_text.replace('пять раза девяток', '99999');
        ls_text = ls_text.replace('пять раза девятки', '99999');

//---------------------------------------------------------------------------------

        ls_text = ls_text.replace('шесть девяточек', '999999');
        ls_text = ls_text.replace('шесть девяток', '999999');
        ls_text = ls_text.replace('шесть девятки', '999999');
        ls_text = ls_text.replace('шесть раз девять', '999999');
        ls_text = ls_text.replace('шесть раза девять', '999999');
        ls_text = ls_text.replace('шесть раза по девять', '999999');
        ls_text = ls_text.replace('шесть раз по девять', '999999');
        ls_text = ls_text.replace('шесть раза девятки', '999999');
        ls_text = ls_text.replace('шесть раза девяток', '999999');

//---------------------------------------------------------------------------------

        ls_text = ls_text.replace('семь девяточек', '9999999');
        ls_text = ls_text.replace('семь девяток', '9999999');
        ls_text = ls_text.replace('семь девятки', '9999999');
        ls_text = ls_text.replace('семь раз девять', '9999999');
        ls_text = ls_text.replace('семь раза девять', '9999999');
        ls_text = ls_text.replace('семь раза по девять', '9999999');
        ls_text = ls_text.replace('семь раз по девять', '9999999');
        ls_text = ls_text.replace('семь раза девятка', '9999999');
        ls_text = ls_text.replace('семь раза девяток', '9999999');
        ls_text = ls_text.replace('семь раз девяток', '9999999');
        ls_text = ls_text.replace('семь раза девятки', '9999999');

//---------------------------------------------------------------------------------

        ls_text = ls_text.replace('восемь девяточек', '99999999');
        ls_text = ls_text.replace('восемь девяток', '99999999');
        ls_text = ls_text.replace('восемь девятки', '99999999');
        ls_text = ls_text.replace('восемь раз девять', '99999999');
        ls_text = ls_text.replace('восемь раз девятка', '99999999');
        ls_text = ls_text.replace('восемь раза девять', '99999999');
        ls_text = ls_text.replace('восемь раза по девять', '99999999');
        ls_text = ls_text.replace('восемь раз по девять', '99999999');
        ls_text = ls_text.replace('восемь раза девятка', '99999999');
        ls_text = ls_text.replace('восемь раза девяток', '99999999');
        ls_text = ls_text.replace('восемь раз девяток', '99999999');
        ls_text = ls_text.replace('восемь раза девятки', '99999999');

//---------------------------------------------------------------------------------

        ls_text = ls_text.replace('девять девяточек', '999999999');
        ls_text = ls_text.replace('девять девяток', '999999999');
        ls_text = ls_text.replace('девять девятки', '999999999');
        ls_text = ls_text.replace('девять раз девять', '999999999');
        ls_text = ls_text.replace('девять раза девять', '999999999');
        ls_text = ls_text.replace('девять раза по девять', '999999999');
        ls_text = ls_text.replace('девять раз по девять', '999999999');
        ls_text = ls_text.replace('девять раза девятка', '999999999');
        ls_text = ls_text.replace('девять раза девяток', '999999999');
        ls_text = ls_text.replace('девять раз девяток', '999999999');
        ls_text = ls_text.replace('девять раза девятки', '999999999');

        console.log(ls_text)
        //return ls_text
        let pathName = `jsons/${phoneNum}`;
        if (!fs.existsSync(pathName)) {
            fs.mkdir(pathName, err => {
                if (err) throw err; // не удалось создать папку
                console.log('Папка успешно создана');
            });
        } else {
            console.log(`Error - Папка ${pathName} уже существует`)
            var targetRemoveFiles = fs.readdirSync(`jsons/${phoneNum}`);

            for (var file in targetRemoveFiles) {
                fs.unlinkSync(`jsons/${phoneNum}/` + targetRemoveFiles[file]);
            }


            fs.rmdir(`jsons/${phoneNum}`, err => {
                if (err) throw err; // не удалось удалить папку
                console.log('Папка успешно удалена');
            });

            fs.mkdir(`jsons/${phoneNum}`, err => {
                if (err) throw err; // не удалось создать папку
                console.log('Папка успешно создана');
            });

        }

        await (async () => {

            try {

                const request = await require('request');

                var options = {
                    url: 'https://translate.api.cloud.yandex.net/translate/v2/translate',
                    json: {
                        targetLanguageCode: "en",
                        texts: [
                            ls_text
                        ],
                        folderId: "b1gnj3tqjnuor6rj0v2m"
                    },
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + iamToken,
                        'Accept': 'text/plain',
                    }
                };

                var callback = (error, response, body) => {
                    lsnum_translated = body['translations'][0]['text'];
                    lsresult = String(wordsToNumbers(lsnum_translated), {fuzzy: false})

                    let lsnum_yapi_json = {lsnum: lsresult};

                    let data = JSON.stringify(lsnum_yapi_json);

                    fs.writeFileSync('./' + pathName + '/lsnum_yapi_json.json', data);
                    console.log('-----Файл создан-----')
                    data = fs.readFile('./' + pathName + '/lsnum_yapi_json.json', "utf8", function (error, data) {
                        console.log("Асинхронное чтение файла");
                        if (error) throw error; // если возникла ошибка
                        console.log(data);  // выводим считанные данные
                    });

                }
                request(options, callback);
            } catch (e) {
                console.log(e);
            }
        })();
    }

    run_translate()
    return res.status(205).send();
})

//Подготовка Лицевого счета
app.use('/api/:token/pk_bot.readjsonfile', function (req, res) {
    req.params.token = tokenKey
    var phoneNum = req.body.phonenum;
    var data = '';
    var lsnumJson = '';
    console.log(phoneNum)

    async function readJsonFile() {
        const lsnumJsonFile = `./jsons/${phoneNum}/lsnum_yapi_json.json`;
        console.log('-----ЧТЕНИЕ ФАЙЛА-----')
        /*data = fs.readFile(lsnumJsonFile, "utf8",function(error,data){
             console.log("Асинхронное чтение файла");
             if(error) throw error; // если возникла ошибка
             console.log(data);  // выводим считанные данные
             res.status(200).send(data);
         });*/


        if (!fs.existsSync(lsnumJsonFile)) {
            return res.status(200).send({
                lsnum: 0
            });
        } else {
            data = fs.readFileSync(lsnumJsonFile, "utf8");

            lsnumJson = JSON.parse(data);

            var targetRemoveFiles = fs.readdirSync(`jsons/${phoneNum}`);

            for (var file in targetRemoveFiles) {
                fs.unlinkSync(`jsons/${phoneNum}/` + targetRemoveFiles[file]);
            }

            fs.rmdir(`jsons/${phoneNum}`, err => {
                if (err) throw err; // не удалось удалить папку
                console.log('Папка успешно удалена');
            });
            //Отправляем ответ с данными из файла
            return res.status(200).send(lsnumJson);
        }
    }

    setInterval(readJsonFile, 3000);

})


//Подготовка Лицевого счета
app.post('/api/:token/pk_bot.lsnumsplit', function (req, res, next) {
    req.params.token = tokenKey

    async function run_translate() {
        lsNum = req.body.lsnum_not_split;
        lsNumSplited = lsNum.split(' ').join('');

        if (lsNumSplited) {
            res.status(200).json({
                lsnumsplited: lsNumSplited
            });
        } else {
            res.status(404).send();
        }
    }

    run_translate()
})


//ПРОВЕРКА НАЛИЧИЯ ЛС
app.post('/api/:token/pk_bot.get_ls', function (req, res) {
    req.params.token = tokenKey
    let lsNum = String(req.body.ls)

    lsNumSplited = lsNum.split(' ').join('');
    lsNum = lsNumSplited.replace(/[^0-9,\s]/g, '')
    //console.log(lsNum)

    let isnum = /^\d+$/.test(lsNum);

    if (isnum) {
        let strLs = lsNum.toString();

        if (strLs.length == 9) {

            async function run() {

                let connection;

                try {
                    connection = await oracledb.getConnection(dbConfig);

                    await (connection);

                    const sql =
                        `select COUNT(*) AS LSCOUNT from pay_ls where NUM = :idls`;

                    let result;

                    result = await connection.execute(
                        sql,
                        [lsNum],
                        {
                            outFormat: oracledb.OUT_FORMAT_OBJECT
                        }
                    );

                    lsCount = result.rows[0]['LSCOUNT']

                } catch (err) {
                    console.error(err);
                } finally {
                    if (connection) {
                        try {
                            await connection.close();
                        } catch (err) {
                            console.error(err);
                        }
                    }
                }
            }

            run();

            if (lsCount > 0) {
                console.log('Найден ЛС = ' + strLs)
                return res.status(200).json({
                    lsnumber: strLs,
                })
            } else {
                console.log('ЛС не найден ' + strLs)
                return res.status(200).json({
                    lsnumber: 0,
                })
            }
        } else {
            console.log('должен быть 9 ' + strLs)
            return res.status(200).json({
                lsnumber: 300,
                status: false,
                errmess: 'Внимание! Номер лицевого счета должен состоять из 9 цифр.',
            })
        }
    } else {
        console.log('Not number ' + isnum)
    }
})

//ПРОВЕРКА НАЛИЧИЯ ИПУ
//https://lk.cr30.ru/get?token=c549a7-42bd48-a5429f-d5e356-422f23&_act=3&_lssernum=${lsnumber}&_cntsernum=${cntsernumbr}&_phone_num=${chat_id}
app.post('/api/:token/pk_bot.get_ipu', function (req, res, next) {
    req.params.token = tokenKey;
    let lsnum = req.body.ls;
    let serial_num = req.body.cntsernumber;
    //let str_ls = lsnum.toString();
    //let str_serial_num = serial_num.toString();


    async function run() {

        let connection;

        try {
            connection = await oracledb.getConnection(dbConfig);

            await (connection);

            const sql =
                `select COUNT(*) AS CNTCOUNT from pay_counters where LSNUM = :idls and SERIAL_NUM = :idipu`;

            let result;

            result = await connection.execute(
                sql,
                [lsnum, serial_num],
                {
                    outFormat: oracledb.OUT_FORMAT_OBJECT
                }
            );
            let cntcount = result.rows[0]['CNTCOUNT'];
            console.log('1- Найдено ИПУ количество: ' + cntcount);

            if (cntcount > 0) {

                return res.status(200).json({
                    serial_num
                })
            } else {
                console.log('3-ИПУ не найдено: ' + cntcount);
                return res.status(200).json({
                    serial_num: 0,
                    status: false,
                    errmess: "Номер прибора учета не найден."
                })
            }

        } catch (err) {
            console.error(err);
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (err) {
                    console.error(err);
                }
            }
        }
    }

    run();
})

//ПЕРЕДАЧА ПОКАЗАНИЙ
//https://lk.cr30.ru/get?token=c549a7-42bd48-a5429f-d5e356-422f23&_pok_act=3&_pok_lssernum=${lsnumber}&_pok_cntsernum=${cntsernumres}&_pok_cntvalue=${cntvalue}&_pok_phone=${chat_id}
//

app.put('/api/:token/pk_bot.put_cnt_value', function (req, res) {
    req.params.token = tokenKey
    let lsnum = String(req.body.ls)
    let serial_num = req.body.cntsernumber
    let short_val = Number(req.body.cntvalue)
    let chat_id = Number(req.body.chatid)
    let descrText = String(req.body.descr)
    let userallow = Number(req.body.allow)

    let requestIp = require('request-ip');

    let clientIp = String(requestIp.getClientIp(req))

    const sqlNLS = `alter session set nls_date_format = 'dd.mm.yyyy'`;

    const sqlInsertValue = `INSERT INTO t_pok_bot ( SG_REG_ID, IP_ADDR, NUM, DF, DK, POK, STATUS, PHONE_NUM, DT_EDIT, DESCR ) ` +
        `values (:sgregid, :ipaddr, :lsnum, :lsdf, :lsdk, :lspok, 0, :phone, sysdate, : lsdescr)`;

    async function insertLog() {
        let connection;

        try {
            connection = await oracledb.getConnection(dbConfig);

            let resultNLS = await connection.execute(sqlNLS);


            const result = await connection.execute(
                sqlInsertValue,
                {
                    sgregid: 999999,
                    ipaddr: '188.124.55.5',
                    lsnum: lsnum,
                    lsdf: serial_num,
                    lsdk: null,
                    lspok: short_val,
                    phone: chat_id,
                    lsdescr: descrText
                },
                {autoCommit: true}
            );

            console.log("Result is:", result.rowsAffected);

        } catch (err) {
            console.error(err);
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (err) {
                    console.error(err);
                }
            }
        }
    }


    async function run() {

        let connection;

        try {
            connection = await oracledb.getConnection(dbConfig);

            await (connection);

            const sqlShortValue =
                `SELECT SHORT_VALUE FROM PAY_COUNTERS WHERE LSNUM = :idls and SERIAL_NUM = :idipu`;


            let resultShortValue;

            resultShortValue = await connection.execute(
                sqlShortValue,
                [lsnum, serial_num],
                {
                    outFormat: oracledb.OUT_FORMAT_OBJECT
                }
            );

            let shortValResult = resultShortValue.rows[0]['SHORT_VALUE']
            let valueResult = short_val - shortValResult
            console.log('Разность = ' + valueResult)
            if (userallow == 0) {
                if (short_val < shortValResult) {
                    console.log("Передаваемые показания меньше учтенных - " + shortValResult)
                    return res.status(200).json({
                        sendresult: 3001,
                        status: false,
                        errmess: "Передаваемые показания меньше учтенных",
                    })
                } else {
                    if (valueResult >= 50) {
                        return res.status(200).json({
                            sendresult: 5001,
                            status: false,
                            errmess: "Большие показания"
                        })
                    } else {
                        await insertLog()
                        return res.status(200).json({
                            sendresult: 2000,
                            status: true,
                            errmess: "OK"
                        })
                    }
                }
            } else {
                await insertLog()
                return res.status(200).json({
                    sendresult: 2000,
                    status: true,
                    errmess: "Большие показания переданы"
                })
            }
        } catch (err) {
            console.error(err);
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (err) {
                    console.error(err);
                }
            }
        }
    }

    run();
})

app.use('/api/pk_bot.get_bot_session/:id', function (req, res) {
    let lsid = Number(req.params.id);
    console.log(lsid);

    async function run() {

        let connection;

        try {
            connection = await oracledb.getConnection(dbConfig);

            await (connection);  // create the demo table

            const sql =
                `select COUNT(*) from pay_ls where NUM = :idls`;

            let result;

            result = await connection.execute(
                sql,
                [lsid],
                {
                    outFormat: oracledb.OUT_FORMAT_OBJECT,
                    dmlRowCounts: true
                }
            );
            const LSCOUNT = result.rows[0]['COUNT(*)']

            return res.status(200).json({
                lsnumber: LSCOUNT,
                status: true
            })
        } catch (err) {
            console.error(err);
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (err) {
                    console.error(err);
                }
            }
        }
    }

    run();
})

/*
app.use('/api/pk_bot.get_bot_session/:id', function (req, res) {
    let lsid = Number(req.params.id);
    console.log(lsid);
    async function run() {

        let connection;

        try {
            connection = await oracledb.getConnection(dbConfig);

            await (connection);  // create the demo table

            const sql =
                `select * from sg_reg where LS = :idls   order by id desc`;

            let result;

            result = await connection.execute(
                sql,
                [lsid], // A bind parameter is needed to disambiguate the following options parameter and avoid ORA-01036
                {
                    outFormat: oracledb.OUT_FORMAT_OBJECT,     // outFormat can be OBJECT or ARRAY.  The default is ARRAY
                    // prefetchRows:   100,                    // internal buffer allocation size for tuning
                    // fetchArraySize: 100                     // internal buffer allocation size for tuning
                }
            );
            res.json(result.rows); // СЂРµР·СѓР»СЊС‚Р°С‚ РІ С„РѕСЂРјР°С‚Рµ JSON
        } catch (err) {
            console.error(err);
        } finally {
            if (connection) {
                try {
                    // Connections should always be released when not needed
                    await connection.close();
                } catch (err) {
                    console.error(err);
                }
            }
        }
    }
    run();
})

app.use('/api/pk_bot.get_bot_session/:id/info', function (req, res) {
    let lsid=  Number(req.params.id);
    console.log(lsid);
    async function run() {

        let connection;

        try {
            connection = await oracledb.getConnection(dbConfig);

            await (connection);  // create the demo table

            const sql =
                `select * from sg_reg where LS = :idls order by id asc`;

            let result;

            result = await connection.execute(
                sql,
                [lsid], // A bind parameter is needed to disambiguate the following options parameter and avoid ORA-01036
                {
                    outFormat: oracledb.OUT_FORMAT_OBJECT,     // outFormat can be OBJECT or ARRAY.  The default is ARRAY
                    // prefetchRows:   100,                    // internal buffer allocation size for tuning
                    // fetchArraySize: 100                     // internal buffer allocation size for tuning
                }
            );
            res.json(result.rows); // СЂРµР·СѓР»СЊС‚Р°С‚ РІ С„РѕСЂРјР°С‚Рµ JSON
        } catch (err) {
            console.error(err);
        } finally {
            if (connection) {
                try {
                    // Connections should always be released when not needed
                    await connection.close();
                } catch (err) {
                    console.error(err);
                }
            }
        }
    }
    run();
})
*/


