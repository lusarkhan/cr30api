const oracledb = require('oracledb');
const dbConfig = require('./dbconfig.js');
var promise = require("promise");
const fs = require('fs');

oracledb.extendedMetaData = true;

class LsService {

    async getls(lsNum) {

        let isnum = lsNum;

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
                            return ({
                                lsnumber: strLs
                            });
                        } else {
                            return {
                                lsnumber: 0,
                            }
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
                return {
                    lsnumber: 300,
                    status: false,
                    errmess: 'Внимание! Номер лицевого счета должен состоять из 9 цифр.',
                }
            }
        } else {
            console.log('Not number ' + isnum)
        }
    }
}

module.exports = new LsService();
