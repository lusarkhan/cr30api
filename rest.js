const express = require("express");
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
var csrf = require('csurf');
var session = require('express-session')

const app = express();
var csrfProtect = csrf({cookie: true})
var cors = require('cors')
const port = 3000;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

var lsCount;       

let rnd = Math.random()
const tokenKey = 'token'

const fs = require('fs');
const oracledb = require('oracledb');
const dbConfig = require('./dbconfig.js');

const cron = require('node-cron');

var lsService = require('./ls-service');


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
const oneDay = 1000 * 60 * 60 * 24;
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(__dirname));
app.use(
    session({
        secret: "thisismysecrctekey",
        keys: ['keyskeyskeys'],
        resave: false,
        cookieName: 'demo-session',
        //duration: 30 * 60 * 1000,
        cookie: {maxAge: oneDay},
        saveUninitialized: true,
    })
);
app.use(cors());
app.use(cookieParser());

const isAuthenticated = (session) => {
    return (session === "valid_user")
}

// Get all ls
app.get("/api/v2/ls", csrfProtect, (req, res) => {
    session = req.session;
    if (session.userid) {
        res.send("Welcome User <a href=\'/logout'>click to logout</a>");
    } else
        res.sendFile('index.html', {root: __dirname})
});

// Get LS count by LS_NUM
app.get("/api/v2/ls/:id", csrfProtect, (req, res) => {
    let lsNum = req.params.id;

    if (!lsNum) {
        return res.status(404).send("LS not found.");
    } else {

        lsNum = lsNum.split(' ').join('');
        lsNum = lsNum.replace(/[^0-9,\s]/g, '')

        let isnum = /^\d+$/.test(lsNum);

        if (isnum) {
            let strLs = lsNum.toString();

            if (strLs.length === 9) {

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

                        var lsCount = result.rows[0]['LSCOUNT'];

                        if (lsCount > 0) {
                            const token = req.csrfToken();
                            return res.status(200).json({
                                lsnumber: strLs
                            });


                        } else {
                            console.log('ЛС не найден ' + strLs)
                            return res.status(200).json({
                                lsnumber: 0,
                                status: 'error',
                                errmsg: 'Внимание! Информация не найдена!.',
                            });
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
            } else {
                console.log('должен быть 9 ' + strLs)
                return res.status(401).json({
                    lsnumber: 401,
                    status: 'error',
                    errmsg: 'Внимание! Не верный формат лицевого счета.',
                });
            }
        } else {
            return res.status(401).json({
                status: 'error',
                errmsg: 'Внимание! ЛС не найден',
            })
        }
    }
});


app.get("/api/v2/ls/:lsNum/counters", csrfProtect, (req, res) => {
    var lsNum = String(req.params.lsNum);

    lsNum = lsNum.split(' ').join('');
    lsNum = lsNum.replace(/[^0-9,\s]/g, '')

    if (lsNum.length === 9) {
        let strLs = lsNum.toString();

        if (strLs.length === 9) {
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

                    var lsCount = result.rows[0]['LSCOUNT'];

                    if (lsCount > 0) {
                        const sqlGetCounters =
                            `select * from pay_counters where LSNUM = :idls`;

                        let resultGetCounters;

                        resultGetCounters = await connection.execute(
                            sqlGetCounters,
                            [lsNum],
                            {
                                outFormat: oracledb.OUT_FORMAT_OBJECT
                            }
                        );

                        for (var i = 0; i <= resultGetCounters.rows.length; i++) {
                            let dataP = JSON.stringify()
                            return res.status(200).json({
                                type: "success",
                                msg: "Найдены приборы учета",
                                data: (resultGetCounters.rows),
                                title: "Приборы учета"
                            });
                        }

                    } else {
                        return res.status(200).json({
                            lsnumber: 0,
                            status: 'error',
                            errmsg: 'Внимание! Информация не найдена!.',
                        });
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
        } else {
            return res.status(401).json({
                lsnumber: 401,
                status: 'error',
                errmsg: 'Внимание! Не верный формат лицевого счета.',
            });
        }
    } else {
        return res.status(401).json({
            status: 'error',
            errmsg: 'Внимание! ЛС не найден',
        })
    }

});

//Get Counter Item
app.get("/api/v2/ls/:lsNum/counter/:cntId", csrfProtect, (req, res) => {
    var lsNum = String(req.params.lsNum);
    var cntNum = String(req.params.cntId);

    lsNum = lsNum.split(' ').join('');
    lsNum = lsNum.replace(/[^0-9,\s]/g, '')

    cntNum = cntNum.split(' ').join('');
    cntNum = cntNum.replace(/[^0-9,\s]/g, '')

    if (lsNum.length === 9) {
        let strLs = lsNum.toString();

        if (strLs.length === 9) {

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

                    var lsCount = result.rows[0]['LSCOUNT'];

                    if (lsCount > 0) {
                        const sqlGetCounters =
                            `select * from pay_counters where LSNUM = :idls and SERIAL_NUM = : idnum`;

                        let resultGetCounters;

                        resultGetCounters = await connection.execute(
                            sqlGetCounters,
                            [lsNum, cntNum],
                            {
                                outFormat: oracledb.OUT_FORMAT_OBJECT
                            }
                        );

                        if (resultGetCounters.rows.length > 0) {
                            for (var i = 0; i < resultGetCounters.rows.length; i++) {
                                return res.status(200).json({
                                    success: "true",
                                    msg: "ПУ",
                                    serial_num: resultGetCounters.rows[0]['SERIAL_NUM']
                                });
                            }
                        } else {
                            return res.status(200).json({
                                lsnumber: 0,
                                status: 'error',
                                errmsg: 'Внимание! Информация по ПУ не найдена!.',
                            });
                        }
                    } else {
                        return res.status(200).json({
                            lsnumber: 0,
                            status: 'error',
                            errmsg: 'Внимание! Информация не найдена!.',
                        });
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


        } else {
            return res.status(401).json({
                lsnumber: 401,
                status: 'error',
                errmsg: 'Внимание! Номер лицевого счета должен состоять из 9 цифр.',
            });
        }
    } else {
        return res.status(401).json({
            status: 'error',
            errmsg: 'Внимание! 3 ЛС не найден.',
        })
    }

});

app.get("/api/v2/ls/:lsNum/counter/:cntId/edit", csrfProtect, (req, res) => {
    var lsNum = String(req.params.lsNum);
    var cntNum = String(req.params.cntId);

    lsNum = lsNum.split(' ').join('');
    lsNum = lsNum.replace(/[^0-9,\s]/g, '')

    cntNum = cntNum.split(' ').join('');
    cntNum = cntNum.replace(/[^0-9,\s]/g, '')

    if (lsNum.length === 9) {
        let strLs = lsNum.toString();

        if (strLs.length === 9) {

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

                    var lsCount = result.rows[0]['LSCOUNT'];

                    if (lsCount > 0) {
                        const sqlGetCounters =
                            `select * from pay_counters where LSNUM = :idls and SERIAL_NUM = : idnum`;

                        let resultGetCounters;

                        resultGetCounters = await connection.execute(
                            sqlGetCounters,
                            [lsNum, cntNum],
                            {
                                outFormat: oracledb.OUT_FORMAT_OBJECT
                            }
                        );

                        count();
                        if (resultGetCounters.rows.length > 0) {
                            for (var i = 0; i < resultGetCounters.rows.length; i++) {
                                return res.status(200).send(`<b>Редактирование ПУ № ${cntNum}</b>`);
                            }
                        } else {
                            console.log('ПУ не найден ' + strLs)
                            return res.status(200).json({
                                lsnumber: 0,
                                status: 'error',
                                errmsg: 'Внимание! Информация по ПУ не найдена!.',
                            });
                        }
                    } else {
                        return res.status(200).json({
                            lsnumber: 0,
                            status: 'error',
                            errmsg: 'Внимание! Информация не найдена!.',
                        });
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
        } else {
            console.log('должен быть 9 ' + strLs)
            return res.status(401).json({
                lsnumber: 401,
                status: 'error',
                errmsg: 'Внимание! Номер лицевого счета должен состоять из 9 цифр.',
            });
        }
    } else {
        return res.status(401).json({
            status: 'error',
            errmsg: 'Внимание! 3 ЛС не найден.',
        })
    }
});

//API-запрос статистика переданных показаний
app.get("/api/v2/stat.pok_bot=stat", csrfProtect, (req, res) => {
    async function run() {

        let connection;

        try {
            connection = await oracledb.getConnection(dbConfig);

            await (connection);

            // T_POK_BOT телефонный бот
            const sql_t_pok_bot =
                `select COUNT(*) AS POKCOUNT from t_pok_bot`;
            //T_POK показания с сайта ЛК
            const sql_t_pok =
                `select COUNT(*) AS POKCOUNT from t_pok`;

            let result_sql_t_pok_bot;
            let result_sql_t_pok;

            result_sql_t_pok_bot = await connection.execute(
                sql_t_pok_bot,
                [],
                {
                    outFormat: oracledb.OUT_FORMAT_OBJECT
                }
            );

            result_sql_t_pok = await connection.execute(
                sql_t_pok,
                [],
                {
                    outFormat: oracledb.OUT_FORMAT_OBJECT
                }
            );

            var pokBotCount = result_sql_t_pok_bot.rows[0]['POKCOUNT'];
            var pokLKCount = result_sql_t_pok.rows[0]['POKCOUNT'];

            return res.status(200).send({
                pok_bot: pokBotCount,
                pok_lk: pokLKCount
            });
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
});

//API-запрос статистика переданных показаний за неделю ТЕЛЕФОННЫЙ БОТ
app.get("/api/v2/stat.pok_bot=stat-period-week", csrfProtect, (req, res) => {
    async function run() {

        let connection;

        try {
            connection = await oracledb.getConnection(dbConfig);

            await (connection);

            const alter_sess = "alter session set nls_date_format = 'dd.mm.yyyy'";
            await connection.execute(
                alter_sess,
                [],
                {
                    outFormat: oracledb.OUT_FORMAT_OBJECT
                }
            );

            // T_POK_BOT телефонный бот
            const sql_pok_period =
                `select to_date(dt, 'DD.MM.YYYY','nls_date_language=russian') as dt, count(*) as COUNT from
                 (
                        select id, trunc(dt_add,'DD') dt from t_pok_bot where dt_add>trunc(sysdate-6,'DD')
                        union all
                        select id, trunc(dt_add,'DD') dt from t_pok_bot_all where dt_add>trunc(sysdate-6,'DD')
                 )
                 group by dt order by dt`;


            let result_sql_pok_period;

            result_sql_pok_period = await connection.execute(
                sql_pok_period,
                [],
                {
                    outFormat: oracledb.OUT_FORMAT_OBJECT
                }
            );

            var pokPeriodValues = result_sql_pok_period.rows;
            res.setHeader("Content-Type", "application/json");
            res.writeHead(200);
            res.end(JSON.stringify({pokPeriodValues}, null, 3));
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
});

//API-запрос статистика переданных показаний за неделю ЛИЧНЫЙ КАБИНЕТ
app.get("/api/v2/stat.pok_bot=stat-period-week-lk", csrfProtect, (req, res) => {
    async function run() {

        let connection;

        try {
            connection = await oracledb.getConnection(dbConfig);

            await (connection);

            const alter_sess = "alter session set nls_date_format = 'dd.mm.yyyy'";
            await connection.execute(
                alter_sess,
                [],
                {
                    outFormat: oracledb.OUT_FORMAT_OBJECT
                }
            );

            // T_POK_BOT телефонный бот
            const sql_pok_period =
                `select to_date(dt, 'DD.MM.YYYY','nls_date_language=russian') as dt, count(*) as COUNT from
                 (
                        select id, trunc(dt_add,'DD') dt from t_pok where dt_add>trunc(sysdate-6,'DD')
                        union all
                        select id, trunc(dt_add,'DD') dt from t_pok_all where dt_add>trunc(sysdate-6,'DD')
                 )
                 group by dt order by dt`;


            let result_sql_pok_period;

            result_sql_pok_period = await connection.execute(
                sql_pok_period,
                [],
                {
                    outFormat: oracledb.OUT_FORMAT_OBJECT
                }
            );

            var pokPeriodValues = result_sql_pok_period.rows;
            res.setHeader("Content-Type", "application/json");
            res.writeHead(200);
            res.end(JSON.stringify({pokPeriodValues}, null, 3));


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
});

//API-запрос статистика переданных показаний за период телефонный бот
app.get("/api/v2/stat.pok_bot=stat-period-telbot", csrfProtect, (req, res) => {
    async function run() {

        let connection;

        try {
            connection = await oracledb.getConnection(dbConfig);

            await (connection);

            const alter_sess = "alter session set nls_date_format = 'dd.mm.yyyy'";
            await connection.execute(
                alter_sess,
                [],
                {
                    outFormat: oracledb.OUT_FORMAT_OBJECT
                }
            );

            // T_POK_BOT телефонный бот
            const sql_pok_period =
                `select to_date(dt, 'DD.MM.YYYY') as dt, count(*) as COUNT from
                 (
                        select id, trunc(dt_add,'MM') dt from t_pok_bot where dt_add>trunc(sysdate-150,'MM')
                        union all
                        select id, trunc(dt_add,'MM') dt from t_pok_bot_all where dt_add>trunc(sysdate-150,'MM')
                 )
                 group by dt order by dt`;


            let result_sql_pok_period;

            result_sql_pok_period = await connection.execute(
                sql_pok_period,
                [],
                {
                    outFormat: oracledb.OUT_FORMAT_OBJECT
                }
            );

            var pokPeriodValues = result_sql_pok_period.rows;
            res.setHeader("Content-Type", "application/json");
            res.writeHead(200);
            res.end(JSON.stringify({pokPeriodValues}, null, 3));
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
});

//API-запрос статистика переданных показаний за период личный кабинет
app.get("/api/v2/stat.pok_bot=stat-period-lk", csrfProtect, (req, res) => {
    async function run() {

        let connection;

        try {
            connection = await oracledb.getConnection(dbConfig);

            await (connection);

            const alter_sess = "alter session set nls_date_format = 'dd.mm.yyyy'";
            await connection.execute(
                alter_sess,
                [],
                {
                    outFormat: oracledb.OUT_FORMAT_OBJECT
                }
            );

            // T_POK_BOT телефонный бот
            const sql_pok_period =
                `select to_date(dt, 'DD.MM.YYYY','nls_date_language=russian') as dt, count(*) as COUNT from
                 (
                        select id, trunc(dt_add,'MM') dt from t_pok where dt_add>trunc(sysdate-150,'MM')
                        union all
                        select id, trunc(dt_add,'MM') dt from t_pok_all where dt_add>trunc(sysdate-150,'MM')
                 )
                 group by dt order by dt`;

            let result_sql_pok_period;

            result_sql_pok_period = await connection.execute(
                sql_pok_period,
                [],
                {
                    outFormat: oracledb.OUT_FORMAT_OBJECT
                }
            );
            var pokPeriodValues = result_sql_pok_period.rows;
            res.setHeader("Content-Type", "application/json");
            res.writeHead(200);
            res.end(JSON.stringify({pokPeriodValues}, null, 3));
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
});

app.get("/api/v2/ls/counters", csrfProtect, (req, res) => {
    return res.status(401).send({status: 'error', msg: "Counter required."});
});

app.get("/api/v2/ls/counter", csrfProtect, (req, res) => {
    return res.status(401).send({status: 'error', msg: "Counter required."});
});

app.get("/api/v2/ls/:ls_id/:cnt_id", csrfProtect, (req, res) => {
    req.params.token = tokenKey
    let lsNum = String(req.body.ls)

    lsNum = lsNum.split(' ').join('');
    lsNum = lsNum.replace(/[^0-9,\s]/g, '')

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

                    if (lsCount > 0) {
                        return res.status(200).json({
                            lsnumber: strLs
                        })
                    } else {
                        return res.status(200).json({
                            lsnumber: 0,
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


        } else {
            return res.status(200).json({
                lsnumber: 300,
                status: false,
                errmess: 'Внимание! Номер лицевого счета должен состоять из 9 цифр.',
            })
        }
    } else {
        return res.status(401).json({
            status: 'error',
            errmess: 'Внимание! ЛС не найден.',
        })
    }
})


//ПРОВЕРКА НАЛИЧИЯ ИПУ
app.use('/api/:token/pk_bot.get_ipu', csrfProtect, function (req, res) {
    req.params.token = tokenKey;
    let lsNum = req.body.ls;
    let cntSerialNum = String(req.body.cntsernumber);

    lsNum = lsNum.split(' ').join('');
    lsNum = lsNum.replace(/[^0-9,\s]/g, '')

    cntSerialNum = cntSerialNum.split(' ').join('');
    cntSerialNum = cntSerialNum.replace(/[^0-9,\s]/g, '')

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
                [lsNum, cntSerialNum],
                {
                    outFormat: oracledb.OUT_FORMAT_OBJECT
                }
            );
            let cntcount = result.rows[0]['CNTCOUNT'];

            if (cntcount > 0) {

                return res.status(200).json({
                    serial_num: cntSerialNum
                })
            } else {
                return res.status(200).json({
                    serial_num: 0,
                    status: false,
                    errmess: `Прибор учета с номером ${cntSerialNum} не найден.`
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

// Create a new item
app.post("/api/items", csrfProtect, (req, res) => {
    const item = {
        id: data.length + 1,
        name: req.body.name
    };
    ls.push(item);
    res.send(item);
});

// Update an item
app.put("/api/v2/ls/:id", csrfProtect, (req, res) => {
    const ls_item = ls.find(i => i.num === req.params.id);
    if (!ls_item) return res.status(404).send("Item not found.");
    ls_item.fio = req.body.fio;
    res.send(ls_item);
});

// Delete an item
app.delete("/api/v2/ls/:id", csrfProtect, (req, res) => {
    const ls_item = ls.find(i => i.num === req.params.id);
    if (!ls_item) return res.status(404).send("Item not found.");
    const index = data.indexOf(ls_item);
    data.splice(index, 1);
    res.send(ls_item);
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
