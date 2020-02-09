//app.js
App({
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 获取系统公告，用于app置顶
    wx.request({
      url: 'http://192.168.0.102/wechat/notification',
      success: function (obj) {
        for (var index in obj.data.data) {
          var data = obj.data.data[index];
          var createdOn = new String(data.createdOn);
          obj.data.data[index].createdOn = createdOn.replace('T', ' ').substring(0, 10);
        }
        if(obj.data.data.length > 0) {
          wx.setStorage({
            data: obj.data.data[0].title + "：" + obj.data.data[0].content,
            key: 'notification',
          })
        }
      }
    })

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },
  globalData: {
    userInfo: null
  }
})