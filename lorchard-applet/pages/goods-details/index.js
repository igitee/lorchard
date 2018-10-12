//index.js
//获取应用实例
var app = getApp();
var requireList = require("../../require.js");
//引入wxParse.js
var WxParse = requireList.wxParse;
var util = requireList.util;
var api = requireList.api;
var getGoodsDetails = requireList.getGoodsDetails;
var getShopCarMap = requireList.getShopCarMap;

Page({
  data: {
    autoplay: true,
    interval: 3000,
    duration: 1000,
    goodsDetail: {},
    swiperCurrent: 0,
    hasMoreSelect: false,
    selectSize: "选择：",
    selectSizePrice: 0,
    shopNum: 0,
    hideShopPopup: true,
    buyNumber: 0,
    buyNumMin: 1,
    buyNumMax: 0,
    shopDeliveryPrice: 0,
    canSubmit: false, //  选中规格尺寸时候是否允许加入购物车
    shopCarInfo: {},
    shopType: "addShopCar", //购物类型，加入购物车或立即购买，默认为加入购物车
  },

  //轮播图切换触发函数
  swiperchange: function(e) {
    this.setData({
      swiperCurrent: e.detail.current
    })
  },

  //监控页面加载函数
  onLoad: function(e) {
    var that = this;
    if (e.merchantId != undefined){
      app.globalData.merchantId = e.merchantId;
    }
    var memberId = app.globalData.memberId;
    if (memberId == 0) {
      wx.showModal({
        title: '当前未登录',
        content: '是否前往登陆',
        success: function(res) {
          if (res.confirm) {
            wx.navigateTo({
              url: "/pages/index/index"
            })
          }
        }
      })
    }
    wx.showShareMenu({
      // 要求小程序返回分享目标信息
      withShareTicket: true
    });
    //获取购物车数据
    wx.getStorage({
      key: 'shopCarInfo' + app.globalData.merchantId,
      success: function(res) {
        that.setData({
          shopCarInfo: res.data,
          shopNum: res.data.shopNum
        });
      }
    })
    getGoodsDetails.getGoodsDetails(e, that);
    //调用获取起送价函数
    this.getDeliveryPrice();
  },

  //前往购物车函数
  goShopCar: function() {
    //打开新页面 关闭所有页面
    wx.reLaunch({
      url: "/pages/shop-cart/index"
    });
  },

  //加入购物车函数
  toAddShopCar: function() {
    this.setData({
      shopType: "addShopCar"
    })
    this.bindGuiGeTap();
  },

  //立即购买函数
  tobuy: function() {
    this.setData({
      shopType: "tobuy"
    });
    this.bindGuiGeTap();
  },

  //规格选择弹出框
  bindGuiGeTap: function() {
    this.setData({
      hideShopPopup: false
    })
  },

  //规格选择弹出框隐藏
  closePopupTap: function() {
    this.setData({
      hideShopPopup: true
    })
  },

  numJianTap: function() {
    if (this.data.buyNumber > this.data.buyNumMin) {
      var currentNum = this.data.buyNumber;
      currentNum--;
      this.setData({
        buyNumber: currentNum
      })
    }
  },

  numJiaTap: function() {
    if (this.data.buyNumber < this.data.buyNumMax) {
      var currentNum = this.data.buyNumber;
      currentNum++;
      this.setData({
        buyNumber: currentNum
      })
    }
  },

  //选择商品规格
  labelItemTap: function(e) {
    var that = this;
    var goodsDetail = that.data.goodsDetail;
    that.setData({
      selectSizePrice: goodsDetail.originalPrice,
      buyNumMax: goodsDetail.stock,
      buyNumber: (goodsDetail.stock > 0) ? 1 : 0,
      goodsDetail: goodsDetail,
      canSubmit: true
    });
  },

  //加入购物车
  addShopCar: function() {
    //提示选择商品规格
    if (!this.data.canSubmit) {
      this.showModalInfo('提示', '请选择商品规格！', false)
      this.bindGuiGeTap();
      return;
    }
    //提示购买不能为0
    if (this.data.buyNumber < 1) {
      this.showModalInfo('提示', '购买数量不能为0！', false);
      return;
    }
    //组建购物车
    var shopCarInfo = this.bulidShopCarInfo();

    this.setData({
      shopCarInfo: shopCarInfo,
      shopNum: shopCarInfo.shopNum
    });

    var merchantId = app.globalData.merchantId
    // 写入本地存储
    wx.setStorage({
      key: "shopCarInfo" + merchantId,
      data: shopCarInfo
    })

    this.closePopupTap();

    wx.showToast({
      title: '加入购物车成功',
      icon: 'success',
      duration: 2000
    })
  },

  //组建购物车信息
  bulidShopCarInfo: function() {
    // 加入购物车
    var shopCarMap = getShopCarMap.getShopCarMap(this);;
    console.log("shopCarMap:", shopCarMap)
    //购物车信息
    var shopCarInfo = this.data.shopCarInfo;
    //判断购物车物品数量
    if (!shopCarInfo.shopNum) {
      shopCarInfo.shopNum = 0;
    }
    //判断购物车物品集合
    if (!shopCarInfo.shopList) {
      shopCarInfo.shopList = [];
    }
    //含有相同物品标识
    var hasSameGoodsIndex = -1;
    //相同物品数量相加
    for (var i = 0; i < shopCarInfo.shopList.length; i++) {
      var tmpShopCarMap = shopCarInfo.shopList[i];
      if (tmpShopCarMap.goodsId == shopCarMap.goodsId) {
        hasSameGoodsIndex = i;
        shopCarMap.itemNum = shopCarMap.itemNum + tmpShopCarMap.itemNum;
        break;
      }
    }
    //购物车物品数量
    shopCarInfo.shopNum = shopCarInfo.shopNum + this.data.buyNumber;
    //如果含有相同商品 删除原来数组替换为新数组
    if (hasSameGoodsIndex > -1) {
      shopCarInfo.shopList.splice(hasSameGoodsIndex, 1, shopCarMap);
      //没有则添加
    } else {
      shopCarInfo.shopList.push(shopCarMap);
    }
    return shopCarInfo;
  },

  //立即购买
  buyNow: function() {
    var canSubmit = this.data.canSubmit;
    if (!canSubmit) {
      this.showModalInfo('提示', '请选择商品规格！', false)
      this.bindGuiGeTap();
      return;
    }

    var buyNumber = this.data.buyNumber;
    if (buyNumber < 1) {
      this.showModalInfo('提示', '购买数量不能为0！', false)
      return;
    }

    var selectSizePrice = this.data.selectSizePrice;
    var shopDeliveryPrice = this.data.shopDeliveryPrice;
    if (selectSizePrice * buyNumber < shopDeliveryPrice) {
      var title = '未达到起送价,起送价:' + shopDeliveryPrice + "元";
      this.showModalInfo(title, '请您再选一些吧！', false)
    } else {
      var buyNowInfo = this.buliduBuyNowInfo();
      var merchantId = app.globalData.merchantId;
      wx.setStorage({
        key: "buyNowInfo" + merchantId,
        data: buyNowInfo
      })
      this.closePopupTap();
      wx.navigateTo({
        url: "/pages/to-pay-order/index?orderType=buyNow"
      })
    }
  },

  //组建立即购买信息
  buliduBuyNowInfo: function() {
    var shopCarMap = getShopCarMap.getShopCarMap(this);
    var buyNowInfo = {};
    if (!buyNowInfo.shopNum) {
      buyNowInfo.shopNum = 0;
    }
    if (!buyNowInfo.shopList) {
      buyNowInfo.shopList = [];
    }
    buyNowInfo.shopList.push(shopCarMap);
    return buyNowInfo;
  },

  showModalInfo: function(title, content, showCancel) {
    wx.showModal({
      title: title,
      content: content,
      showCancel: showCancel,
    })
  },

  //分享转发
  onShareAppMessage: function() {
    var name = this.data.goodsDetail.name;
    var id = this.data.goodsDetail.id;
    var memberId = app.globalData.memberId;
    if (memberId == 0) {
      wx.showModal({
        title: '当前未登录',
        content: '是否前往登陆',
        success: function(res) {
          if (res.confirm) {
            wx.navigateTo({
              url: "/pages/index/index"
            })
          }
        }
      })
    } else {
      return {
        title: name,
        path: '/pages/goods-details/index?id=' + id,
        success: function(res) {

        },
        fail: function(res) {

        }
      }
    }
  },

  //最低配送
  getDeliveryPrice: function() {
    var that = this
    that.setData({
      shopDeliveryPrice: 0
    })
  }
})