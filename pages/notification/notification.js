// pages/notification/notification.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    current: 'remind',
    notificationArray: []
  },
  handleChange({ detail }) {
    this.setData({
      current: detail.key
    });

    if (detail.key === 'order_water') {
      wx.redirectTo({
        url: '../order_water/order_water',
      })
    } else if (detail.key === 'buy_water') {
      wx.redirectTo({
        url: '../buy_water/buy_water',
      })
    } 
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
      url: 'https://p5c.top/wechat/notification',
      success: function (obj) {
        for (var index in obj.data.data) {
          var data = obj.data.data[index];
          var createdOn = new String(data.createdOn);
          obj.data.data[index].createdOn = createdOn.replace('T', ' ').substring(0, 10);
        }
        vm.setData({
          notificationArray: obj.data.data
        })
        wx.hideLoading();
      },
      fail: function () {
        wx.hideLoading();
        wx.showToast({
          title: '公告获取失败',
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