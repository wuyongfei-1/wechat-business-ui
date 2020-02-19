var QQMapWX = require('../../js/qqmap-wx-jssdk.js');
var util = require('../../utils/util.js');
var qqmapsdk;
const { $Toast } = require('../../dist/base/index');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    current: 'buy_water', // 底部工具默认显示key
    smscodeMes: '发送验证码',
    isDisableBtn: false,
    expectTime: '12:00', // 配送时间默认项
    address: '',
    mobile: '',
    sms: '',
    notification: '',
    minHour: 0,
    maxHour: 17,
    minminute: 0
  },

  // 配送时间更新函数
  bindTimeChange: function (event) {
    // console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      // time: e.detail.value,
      expectTime: event.detail
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
  },

  // 表单更新系列函数
  change_address: function (event) {
    var vm = this;
    vm.setData({
      address: event.detail
    })
  },
  change_mobile: function (event) {
    var vm = this;
    vm.setData({
      mobile: event.detail
    })
  },
  change_sms: function (event) {
    var vm = this;
    vm.setData({
      sms: event.detail
    })
  },
  change_time: function (event) {
    var vm = this;
    var time = parseInt(util.formatTime(new Date()).substring(11, 16).substring(0, 2)) + 1;
    var expectTime = event.detail.value;
    if (time < 8 || time > 18) {
      expectTime = "次日 " + expectTime;
    }
    vm.setData({
      expectTime: expectTime
    })
  },

  // 发送短信的验证码
  send_sms_code: function () {
    var vm = this;
    if (vm.data.isDisableBtn === true) {
      return;
    }
    // 表单验证
    if (vm.data.address === "") {
      $Toast({
        content: '地址有误',
        type: 'warning'
      });
      return;
    } else if (vm.data.mobile.length != 11) {
      $Toast({
        content: '联系电话有误',
        type: 'warning'
      });
      return;
    }
    // 倒计时
    var time = setInterval(function () {
      var smsMes = vm.data.smscodeMes === "发送验证码" ? 60 : vm.data.smscodeMes;
      smsMes = smsMes - 1;
      var isDisableBtn = true;
      if (smsMes == 0) {
        smsMes = "发送验证码";
        isDisableBtn = false;
        clearInterval(time);
      }
      vm.setData({
        smscodeMes: smsMes,
        isDisableBtn: isDisableBtn
      })
    }, 1000)
    wx.request({
      method: "POST",
      url: 'https://p5c.top/wechat/smscode/' + vm.data.mobile,
      success: function (obj) {
        if (obj.data.code != 200 || obj.data.status != 'OK') {
          $Toast({
            content: '发送过于频繁，请稍后再次发送',
            type: 'error'
          });
          clearInterval(time);
          vm.setData({
            smscodeMes: "发送验证码",
            isDisableBtn: false
          })
          return;
        }
        // $Toast({
        //   content: '发送成功',
        //   type: 'success'
        // });
      },
      fail: function () {
        $Toast({
          content: '发送失败',
          type: 'error'
        });
        clearInterval(time);
        vm.setData({
          smscodeMes: "发送验证码",
          isDisableBtn: false
        })
      }
    })
  },

  // 确认按钮触发点击事件函数
  on_send: function () {
    var vm = this;
    wx.showModal({
      title: '预定提示',
      content: '确认预定吗？',
      success: function (res) {
        if (res.confirm) {
          // 表单验证
          if (vm.data.address === "") {
            $Toast({
              content: '地址有误',
              type: 'warning'
            });
            return;
          } else if (vm.data.mobile.length != 11) {
            $Toast({
              content: '联系电话有误',
              type: 'warning'
            });
            return;
          } else if (vm.data.sms.length != 4) {
            $Toast({
              content: '验证码有误',
              type: 'warning'
            });
            return;
          }
          wx.showLoading({
            title: '预定中',
          })
          // 发送下单请求到后端
          wx.request({
            method: "POST",
            url: 'https://p5c.top/wechat/water_order',
            data: {
              uid: wx.getStorageSync('uid'),
              toAddress: vm.data.address,
              mobile: vm.data.mobile,
              code: vm.data.sms,
              orderTime: vm.data.expectTime
            },
            success: function (obj) {
              wx.hideLoading();
              if (obj.data.code === 200 && obj.data.status === 'OK') {
                wx.showToast({
                  title: '预定成功',
                  icon: 'success',
                  duration: 2000,
                  success: function () {
                    setTimeout(function () {
                      wx.redirectTo({
                        url: '../order_water/order_water',
                      })
                    }, 1200)
                  }
                })
              } else if (obj.data.code === 13001) {
                $Toast({
                  content: '验证码失效，预定失败，请重新发送',
                  type: 'error'
                });
              }else if (obj.data.code === 13002) {
                $Toast({
                  content: '验证码有误，预定失败',
                  type: 'error'
                });
              } else {
                $Toast({
                  content: '预定失败',
                  type: 'error'
                });
              }
            },
            fail: function () {
              wx.hideLoading();
              $Toast({
                content: '预定失败',
                type: 'error'
              });
            }
          })
        } else if (res.cancel) {
          // console.log('用户点击取消')
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
        let address = res.result.address;
        vm.setData({
          address: address
        })
      },
      fail: function (res) {
        // console.log(res);
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
    var time = parseInt(util.formatTime(new Date()).substring(11, 16).substring(0, 2)) + 1;
    var minute = util.formatTime(new Date()).substring(11, 16).substring(3);
    var minHours = 0;
    var expectTime = "";
    if (time >= 8 && time < 18) {
      minHours = time;
      expectTime = minHours + ":" + minute;
    } else {
      minHours = 8;
      expectTime = "次日 8:30";
    }
    var vm = this;
    vm.setData({
      "notification": wx.getStorageSync('notification'),
      "expectTime": expectTime,
      "minHour": minHours,
      "minminute": minute
    })
    wx.login({
      success(res) {
        if (res.code) {
          wx.request({
            method: 'POST',
            url: 'https://p5c.top/wechat/account/auth',
            data: {
              code: res.code
            },
            success: function (obj) {
              wx.hideLoading();
              // 将Uid放到内存中管理
              wx.setStorage({
                key: 'uid',
                data: obj.data.data.id
              })
            },
            fail: function (obj) {
              wx.hideLoading();
              $Toast({
                content: '获取用户信息失败，请退出重新登录！',
                type: 'error'
              });
              // console.log("获取用户信息失败，请退出重新登录！");
            }
          })
        } else {
          wx.hideLoading();
          // console.log('登录失败！' + res.errMsg)
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