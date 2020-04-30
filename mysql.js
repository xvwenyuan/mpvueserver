const mysql = require('mysql');
var pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: 'root',
    database: 'bbs'
});
let allServices = {
    query: function (sql, values) {

        return new Promise((resolve, reject) => {
            pool.getConnection(function (err, connection) {
                if (err) {
                    reject(err)
                } else {
                    connection.query(sql, values, (err, rows) => {

                        if (err) {
                            reject(err)
                        } else {
                            resolve(rows)
                        }
                        connection.release()
                    })
                }
            })
        })

    },
    findUserData: function (tableName) {//查询商品
        // let _sql = `select * from user where username="${name}";`
        let _sql = `select * from ${tableName};`
        return allServices.query(_sql)
    },
    addUserData: (obj) => {//插入普通商品
        let _sql = "insert into goods set goods_id=?,goods_desc=?,goods_price=?,goods_url=?,goods_detailurl=?,goods_name=?,issale=1;"
        return allServices.query(_sql, obj)
    },
    addGroupGoods: (obj) => {//插入团购商品
        let _sql = "insert into groupgoods set groupgoods_id=?,groupgoods_desc=?,groupgoods_originalprice=?,groupgoods_groupbuyprice=?,groupgoods_url=?,groupgoods_detailurl=?,groupgoods_name=?,groupgoods_sale=?,issale=1;"
        return allServices.query(_sql, obj)
    },
    addUser: (obj) => {//插入用户
        let _sql = "insert into user set open_id=?,nick_name=?,image=?,gender=?,city=?,province=?;"
        return allServices.query(_sql, obj)
    },
    addAcivity: (obj) => {//团购活动数据
        let _sql = "insert into groupbuyactivity set act_no=?,open_id=?,goods_id=?,captain=?,date=?,issuccess=?;"
        return allServices.query(_sql, obj)
    },
    success: (obj) => {//拼团成功
        let _sql = "update groupbuyactivity set issuccess=1 where captain=1 and act_no=" + obj
        return allServices.query(_sql, obj)
    },
    getGroupSet: (obj) => {//获取团购设置
        let _sql = "select * from groupbuyset";
        return allServices.query(_sql, obj)
    },
    getGroupInfo: (obj) => {
        let _sql = "select groupbuyactivity.open_id,date,nick_name,image,captain,act_no,groupgoods_id,groupgoods_desc,groupgoods_originalprice,groupgoods_groupbuyprice,groupgoods_url from groupbuyactivity,user,groupgoods where groupbuyactivity.open_id = user.open_id and groupbuyactivity.goods_id = groupgoods.groupgoods_id and groupbuyactivity.act_no =" + obj
        return allServices.query(_sql, obj)

    },
    getJoinGroup: (obj) => {//已参团
        console.log(obj[0], obj[1])
        let _sql = `select act_no,goods_id,groupgoods_desc,groupgoods_groupbuyprice,groupgoods_url from groupbuyactivity,groupgoods where groupbuyactivity.goods_id = groupgoods.groupgoods_id and groupbuyactivity.captain=${obj[0]} and groupbuyactivity.open_id = '${obj[1]}'`
        return allServices.query(_sql, obj)
    },
    show: (obj) => {//其他网友的团购信息
        let _sql = "select act_no,goods_id,nick_name,image from groupbuyactivity,user where user.open_id=groupbuyactivity.open_id and captain=1 and issuccess=0 and goods_id=" + obj
        return allServices.query(_sql, obj)
    }
}

module.exports = allServices;