
var config = require('../config');
var util = require('util');
var firstCheck=true;
var available=true;

function login(params) {
  console.log('params:', params);
  var that = params;
  that.globalData.syncFlag = true;
  wx.login({
    success: function (res) {
      console.log(res);
      if (res.code) {
        if (firstCheck) {
          // 检查版本
          util.NetRequest({
            url: 'check-version',
            method: 'GET',
            showload: true,
            success: function (res1) {
              console.log('check version返回:', res1);
              config.En = res1.En;
              var check = require('checkVersion');
              check.checkVersion(config);
              console.log('config:', config);
              firstCheck = null;
              available=res1.available;
              if (!res1.available) {
                wx.redirectTo({
                  url: '/pages/system-update/system-update'
                });
              } else {
                // 请求后台login接口
                wxlogin(res,that);
              }
            }
          })
        } else {
          // 请求后台login接口
          if(available){
            wxlogin(res,that);
          }else{
            return;
          }
        }

      } else {
        console.log('获取用户登录态失败！' + res.errMsg)
      }
    }
  });
}
function wxlogin(res,that) {
  //发起网络请求
  util.NetRequest({
    url: 'api/v1/wechat/login',
    data: {
      code: res.code,
      userMobile: JSON.stringify(that.userMobile)
    },
    showload: true,
    success: function (response) {
      console.log('login:', response);
      available=false;
      that.globalData.isLoading = false;
      var pages = getCurrentPages(); //获取加载的页面
      var currentPage = pages[pages.length - 1]; //获取当前页面的对象  
      wx.setStorageSync('AuthFromPage', currentPage.route);
      if (response.status == true) {
        that.globalData.needCheck = false;
        wx.setStorageSync('token', response.data.token);
        wx.setStorageSync('MOBILE', response.data.user.mobile);
        wx.setStorageSync('OPENID', response.data.openid);
        that.globalData.isLogin = true;
        //that.gotoIndex();
        that.globalData.syncFlag = false;
        if (currentPage.route == 'pages/initiate/initiate') {
          wx.switchTab({
            url: '/pages/index/index',
          });
        }
        util.NetRequest({
          url: 'api/v1/wechat/get-global-group',//wechat-mini/get-global-group
          method: "GET",
          showload: false,
          success: function (res1) {
            that.globalData.sobotData = res1.data;
          }
        });

      } else {
        that.globalData.needCheck = true;
        that.globalData.isFollow = false;     
        wx.redirectTo({
          url: '/pages/login/login'
        });//发起网络请求
      }
    },
    fail: function () {
      login();
    }
  })
}
module.exports = {
  login
}