const Koa = require('koa');//导入一个class
const data = require('./data');
const groupData = require('./groupData');
// 注意require('koa-router')返回的是函数:
const router = require('koa-router')();
const bodyParser = require('koa-bodyparser');
const { findUserData, addUserData, addGroupGoods, addUser, addAcivity, success, getGroupSet,getGroupInfo, getJoinGroup, show} = require('./mysql');
const axios = require('axios');
var cors = require('koa2-cors');
const app = new Koa();//创建一个koa对象
app.use(bodyParser());
app.use(cors({
    origin: function (ctx) {
        return '*';
    },
    maxAge: 5,
    credentials: true,
    allowMethods: ['GET', 'POST', 'DELETE'],
    allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
}));
// log request URL:
// 对于任何请求，app将调用该异步函数处理请求
app.use(async (ctx, next) => {
    console.log(`Process ${ctx.request.method} ${ctx.request.url}...`);
    await next();
});
router.get('/goods', async (ctx, next) => {//获取普通商品
    try {
        let goodsList = await findUserData('goods');
        ctx.response.body = goodsList;
    } catch (error) {
        console.log('error')
    }
});
router.get('/groupgoods', async (ctx, next) => {//获取团购商品
    try {
        let goodsList = await findUserData('groupgoods');
        ctx.response.body = goodsList;
    } catch (error) {
        console.log('error')
    }
});
router.post('/user', async (ctx, next) => {//存储用户数据
    try {
        let userData = ctx.request.body;
        let userArray = [];
        for (item in userData) {
            userArray.push(userData[item])
        }
        addUser(userArray);
    } catch (error) {
        console.log(error)
    }
    ctx.response.body = ""
})
router.post('/activity', async (ctx, next) => {//存储团购活动数据
    try {
        let actData = ctx.request.body.activity;
        let actArray = [];
        for (item in actData) {
            actArray.push(actData[item])
        }
        console.log(actArray)
        addAcivity(actArray);
    } catch (error) {
        console.log(error)
    }
    ctx.response.body = ""
})
router.get('/groupset', async (ctx, next) => {//发送团购设置,人数、时间等.
    try {
        let setData = await getGroupSet();
        ctx.response.body = setData;
    } catch (error) {
        console.log('error')
    }
})
router.post('/success', async (ctx, next) => {//拼团成功.
    let actNo = ctx.request.body.actId
    try {
        success(actNo);
        console.log(actNo)
        ctx.response.body = ''
    } catch (error) {
        console.log('error')
    }
})
router.post('/show', async (ctx, next) => {//其他网友拼团展示
    try {
    let id = ctx.request.body.goodsId
    let data = await show(id)
    console.log(data)
    ctx.response.body = data
    } catch (error) {
        
    }
})
router.post('/groupInfo',async (ctx,next) => {//发送团购数据信息
    let actNo = ctx.request.body.actNo;
    ctx.response.body =await getGroupInfo(actNo)
})
router.post('/myGroup',async (ctx,next) => {//发送已经开团的团购数据信息
    let type = ctx.request.body.type;
    let openId = ctx.request.body.openId;
    let arr = [type,openId]
    try {
        let data = await getJoinGroup(arr)
        ctx.response.body = data
    } catch (error) {
        console.log(error)
    }
})

router.get('/login', async (ctx, next) => {//获取openid标识用户身份
    var jsCode = ctx.query.jsCode;
    console.log(jsCode)
    const res = await axios({
        method: 'get',
        url: 'https://api.weixin.qq.com/sns/jscode2session',
        params: {
            appid: 'wx048d589b5ce0e86a',
            secret: '14ebcac52b6fe02e3b7a98a07f366f8a',
            js_code: jsCode,
            grant_type: 'authorization_code'
        }
    })
    ctx.response.body = res.data.openid;
});
// add router middleware:
app.use(router.routes());

app.listen(3000, '127.0.0.1');//3000端口监听
console.log('app started at port 3000...');
// data.data.forEach(item => {
//     addUserData([item.goods_id, item.goods_name, item.group_price, item.hd_thumb_url, item.hd_url, item.short_name]);
// });
// groupData.goodsList.forEach(item => {
//     addGroupGoods([item.goodsId, item.goodsName, parseInt(item.minGroupPrice/100)*10, parseInt(item.minGroupPrice/100)*8, item.goodsImageUrl, item.goodsThumbnailUrl, item.goodsName, item.salesTip])
// });