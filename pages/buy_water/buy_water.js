const app = getApp();
var QQMapWX = require('../../js/qqmap-wx-jssdk.js');
var qqmapsdk;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    current: 'buy_water', // 底部工具默认显示key
    time: '12:01', // 配送时间默认项
    province: '',
    city: '',
    district: '',
    address: '',
    mobile: '',
    latitude: '',
    longitude: '',
    notification: ''
  },

  // 配送时间更新函数
  bindTimeChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      time: e.detail.value
    })
  },

  // 底部工具栏触发点击事件函数
  handleChange({ detail }) {
    this.setData({
      current: detail.key
    });
    if (detail.key === 'order_water') {
      wx.redirectTo({
        url: '../order_water/order_water',
      })
    } else if (detail.key === 'remind') {
      wx.redirectTo({
        url: '../notification/notification',
      })
    }
    // else if (detail.key === 'mine') {
    //   wx.redirectTo({
    //     url: '../my/my',
    //   })
    // }
  },

  // 表单更新系列函数
  change_address: function (event) {
    var vm = this;
    vm.setData({
      address: event.detail.detail.value
    })
  },
  change_mobile: function (event) {
    var vm = this;
    vm.setData({
      mobile: event.detail.detail.value
    })
  },
  change_time: function (event) {
    var vm = this;
    vm.setData({
      time: event.detail.detail.value
    })
  },

  // 确认按钮触发点击事件函数
  on_send: function () {
    var vm = this;
    wx.showModal({
      title: '下单提示',
      content: '确认下单吗？',
      success: function (res) {
        if (res.confirm) {
          // console.log("address" + vm.data.address);
          // console.log("mobile" + vm.data.mobile);
          // 表单验证
          if (vm.data.address === "") {
            wx.showToast({
              title: '订水地址有误',
              icon: 'loading',
              duration: 500
            })
            return;
          } else if (vm.data.mobile.length != 11) {
            wx.showToast({
              title: '联系电话有误',
              icon: 'loading',
              duration: 500
            })
            return;
          }
          wx.showLoading({
            title: '请求中',
          })
          // 发送下单请求到后端
          wx.request({
            method: "POST",
            url: 'http://192.168.0.102/wechat/water_order',
            data: {
              uid: wx.getStorageSync('uid'),
              toAddress: vm.data.address,
              mobile: vm.data.mobile,
              orderTime: vm.data.time
            },
            success: function (obj) {
              wx.hideLoading();
              if (obj.data.code === 200 && obj.data.status === 'OK') {
                wx.showToast({
                  title: '下单成功',
                  icon: 'success',
                  duration: 2000
                })
              } else {
                wx.showToast({
                  title: '下单失败',
                  icon: 'none',
                  duration: 2000
                })
              }
            },
            fail: function () {
              wx.hideLoading();
              wx.showToast({
                title: '下单失败',
                icon: 'none',
                duration: 2000
              })
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },

  getLocal: function (latitude, longitude) {
    var vm = this;
    qqmapsdk.reverseGeocoder({
      location: {
        latitude: latitude,
        longitude: longitude
      },
      success: function (res) {
        let province = res.result.ad_info.province
        let city = res.result.ad_info.city
        let district = res.result.ad_info.district;
        let address = res.result.address;
        vm.setData({
          province: province,
          city: city,
          district: district,
          latitude: latitude,
          longitude: longitude,
          address: address
        })

      },
      fail: function (res) {
        console.log(res);
      },
      complete: function (res) {
        // console.log(res);
      }
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中',
    })
    var vm = this;
    wx.login({
      success(res) {
        if (res.code) {
          //发起网络请求
          wx.request({
            method: 'POST',
            url: 'http://192.168.0.102/wechat/account/auth',
            data: {
              code: res.code
            },
            success: function (obj) {
              wx.hideLoading();
              console.log("登录成功！");
              console.log("userId:" + obj.data.data.id);
              // 将Uid放到内存中管理
              wx.setStorage({
                key: 'uid',
                data: obj.data.data.id
              })
              vm.setData({
                "notification": wx.getStorageSync('notification')
              })
            },
            fail: function (obj) {
              wx.hideLoading();
              wx.showToast({
                title: '获取用户信息失败，请退出重新登录！',
                icon: 'none',
                duration: 2000
              })
              console.log("获取用户信息失败，请退出重新登录！");
            }
          })
        } else {
          wx.hideLoading();
          console.log('登录失败！' + res.errMsg)
        }
      }
    })
    qqmapsdk = new QQMapWX({
      key: 'HYIBZ-DW2ED-GSI4L-HZ3LK-TOHY6-ZVBZS' //这里自己的key秘钥进行填充
    });
    wx.getLocation({
      type: 'wgs84',
      success(res) {
        const latitude = res.latitude
        const longitude = res.longitude
        const speed = res.speed
        const accuracy = res.accuracy
        vm.getLocal(latitude, longitude);
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
})