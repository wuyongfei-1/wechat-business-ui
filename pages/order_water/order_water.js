// pages/order_water/order_water.js
var util = require('../../utils/util.js')
time: util.formatTime(new Date)
Page({

  /**
   * 页面的初始数据
   */
  data: {
    current: 'order_water',
    orderArray: [],
  },

  handleChange({ detail }) {
    this.setData({
      current: detail.key
    });

    if (detail.key === 'buy_water') {
      wx.redirectTo({
        url: '../buy_water/buy_water',
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
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中',
    })
    var vm = this;
    wx.request({
      url: 'http://192.168.0.102/wechat/water_order?accountId=' + wx.getStorageSync('uid'),
      success: function (obj) {
        for (var index in obj.data.data) {
          var data = obj.data.data[index];
          var createdOn = new String(data.createdOn);
          var arrivedDateTime = new String(data.arrivedDateTime);
          obj.data.data[index].createdOn = createdOn.replace('T', ' ').substring(0, createdOn.lastIndexOf('.'));
          obj.data.data[index].arrivedDateTime = arrivedDateTime.replace('T', ' ').substring(0, createdOn.lastIndexOf('.'));
        }
        vm.setData({
          orderArray: obj.data.data
        })
        wx.hideLoading();
      },
      fail: function () {
        wx.hideLoading();
        wx.showToast({
          title: '订单获取失败',
          icon: 'none',
          duration: 2000
        })
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

  }
})