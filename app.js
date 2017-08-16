//app.js
var util = require('/utils/util.js');
App({
  onLaunch: function () {
    
    
    //调用API从本地缓存中获取数据
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
  },
  getUserInfo: function (cb) {
    var that = this
    if (this.globalData.userInfo) {
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else {
      //调用登录接口
      wx.login({
        success: function (res) {
          console.log(res);
          wx.getUserInfo({
            success: function (res) {
              that.globalData.userInfo = res.userInfo
              typeof cb == "function" && cb(that.globalData.userInfo);

              var objz = {};
              objz.avatarUrl = res.userInfo.avatarUrl;
              objz.nickName = res.userInfo.nickName;
              console.log(objz);
              wx.setStorageSync('userInfo', objz);
            }
          });
          var l = 'https://devopsx.coffeelandcn.cn/agilent/web/wechat/get-accessdata?appid=' + that.globalData.appid + '&secret=' + that.globalData.secret + '&js_code=' + res.code;
          wx.request({
            url: l,
            data: {},
            method: 'GET',
            success: function (res) {
              console.log(res)
              if (res.data !== -1) {
                var obj = {};
                obj.openid = res.data.openid;
                obj.expires_in = Date.now() + res.data.expires_in;
                console.log(obj);

                //需要从SAP服务器查询该用户是否注册
                wx.request({
                  url: 'https://devopsx.coffeelandcn.cn/agilent/web/auth/userbind',
                  data: {
                    'openid': obj.openid
                  },
                  success: function (res) {
                    console.log('response');
                    if (res.data == 1) {
                      //验证成功，用户信息添加到缓存
                      //wx.setStorageSync('user', obj);
                    }
                  },
                  fail: function (err) {
                    console.log(err);
                  }
                })
              }
            }
          });

        }
      })
    }
  },
  globalData: {
    userInfo: null,
    appid: 'wxdc8257b9f4a04386',
    secret: 'd140b3cd0ad5b4d07f87e081dafb3b8b',
    //token: wx.getStorageSync('token')
  }
})