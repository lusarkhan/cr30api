const express = require('express'),
    app = express(),
    crypto = require('crypto')
const path = require('path')
const {v4} = require('uuid')
const {wordsToNumbers} = require('words-to-numbers');


const createError = require('http-errors');
const bodyParser = require('body-parser');
const cors = require('cors');

let lsnum_en, lsnum_converted, lsresult;
let lsCount;            //Количество найденных ЛС
let cntCounts;

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
    return res.status(404).json({message: 'Action not allowed'})
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

app.post('/api/tran', function (req, res) {
    const translatte = require('translatte');

    translatte('Вы говорите по-русски?', {
        from: 'ru',
        to: 'en',
        agents: [
            'Mozilla/5.0 (Windows NT 10.0; ...',
            'Mozilla/4.0 (Windows NT 10.0; ...',
            'Mozilla/5.0 (Windows NT 10.0; ...'
        ],
        proxies: [
            'LOGIN:PASSWORD@192.0.2.100:12345',
            'LOGIN:PASSWORD@192.0.2.200:54321'
        ]
    }).then(res => {
        console.log(res);
    }).catch(err => {
        console.error(err);
    });
})

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

//РАСПОЗНОВАНИЕ ЛС ИЗ ТЕКСТА В ЦИФРУ
app.post('/api/:token/pk_bot.texttonum', function (req, res) {
    async function run_translate() {
        req.params.token = tokenKey;
        let ls_text = String(req.body.lstext);

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
                    //Authorization: 'Bearer '+iamToken,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + iamToken,
                        'Accept': 'text/plain',
                    }
                };

                var callback = (error, response, body) => {
                    lsnum_en = String(body['translations'][0]['text'])
                    lsresult = String(wordsToNumbers(body['translations'][0]['text']), {fuzzy: false})
                    lsnum_converted = lsresult.split(' ').join('')
                    console.log(lsnum_en);
                }
                request(options, callback);
            } catch (error) {
                console.log(error.response.body);
            }

        })();
    }

    run_translate();

    return res.status(200).json({
        lsnum: lsnum_converted
    })
})

//ПРОВЕРКА НАЛИЧИЯ ЛС
app.post('/api/:token/pk_bot.get_ls', function (req, res) {
    req.params.token = tokenKey
    let lsNum = String(req.body.ls)
    lsNum = lsNum.replace(/[^0-9,\s]/g, "")
    let phoneNumberOrChatId = String(req.body.chatId)

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


