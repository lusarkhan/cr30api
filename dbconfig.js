module.exports = {
    user: process.env.NODE_ORACLEDB_USER || "USER",
    password: process.env.NODE_ORACLEDB_PASSWORD || "password",
    connectString: process.env.NODE_ORACLEDB_CONNECTIONSTRING || "10.0.0.1/db",
    externalAuth: process.env.NODE_ORACLEDB_EXTERNALAUTH ? true : false
};
