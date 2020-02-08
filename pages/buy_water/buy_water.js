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
    latitude: '',
    longitude: ''
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

  // 确认按钮触发点击事件函数
  on_send: function () {
    wx.showModal({
      title: '下单提示',
      content: '确认下单吗？',
      success: function (res) {
        if (res.confirm) {
          wx.showToast({
            title: '下单成功',
            icon: 'success',
            duration: 2000
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
        console.log(res);
        console.log(res.result.ad_info);
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
    var vm = this;
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