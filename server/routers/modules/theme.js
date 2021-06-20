import Router from 'express'
import Theme from '../../models/Theme.js';
var router = Router();

router.post('/set', (req, res, next) => {
    var key = req.body.key;
    var value = req.body.value;
    var uid = req.uid;
    var searchQuery = {};
    searchQuery['uid'] = uid;
    searchQuery[key] = {
        $exists: true
    }
    let updateQuery = {};
    updateQuery[key] = value;
    /*     console.log(searchQuery, updateQuery)
     */
    Theme.updateOne(searchQuery, updateQuery, { upsert: true }, (err) => {
        if (err) {
            res.json({
                code: 30001,
                message: "DataBase Error!"
            })
            return;
        }
        res.json({
            code: 20000
        });
    })
})

router.post('/get', async (req, res, next) => {
    var uid = req.uid;
    var key = req.body.key;
    var query = {};
    query['uid'] = uid;
    query[key] = {
        $exists: true
    }
    /* console.log(query, key) */

    var defaultSetting = {
        theme: '#1890ff',
        tagsView: true,
        fixedHeader: true
    }
    var setting = await Theme.find(query).then((settings) => {
        if (settings.length == 0) {
            return defaultSetting[key]
        } else {
            return settings[settings.length - 1][key]
        }
    })
    var data = {};
    data['key'] = key;
    data['value'] = setting;
    /*   console.log(data) */
    res.json({
        data,
        code: 20000
    })
})


export default router;