module.exports = {
    user: process.env.NODE_ORACLEDB_USER || "SARV_PAY",
    password: process.env.NODE_ORACLEDB_PASSWORD || "pay",
    connectString: process.env.NODE_ORACLEDB_CONNECTIONSTRING || "10.3.2.104/pay",
    externalAuth: process.env.NODE_ORACLEDB_EXTERNALAUTH ? true : false
};