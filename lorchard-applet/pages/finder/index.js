//index.js
//获取应用实例
var requireList = require("../../require.js");
var starscore = requireList.starscore;
var WxSearch = requireList.wxSearch;
var app = getApp()
Page({
  data: {
    page:1,
    pageSize:10000,
    keyword:'',
    loadingHidden: false, // loading
    userInfo: {},
    categories: [],
    goods: [],
    scrollTop: 0,
    loadingMoreHidden: false,
    hasNoCoupons: true,
    couponsTitlePicStr:'',
    coupons: [],
    networkStatus: true, //正常联网
    couponsStatus: 0,
    getCoupStatus: -1
  },

  //初始化
  onLoad: function () {
    var that = this
    //初始化的时候渲染wxSearchdata 第二个为你的search高度
    WxSearch.init(that, 43, app.globalData.hotGoods);
    //获取全部商品名称，做为智能联想输入库
    WxSearch.initMindKeys(app.globalData.goodsName);  
    //that.getCouponsTitlePicStr();
    //that.getCoupons();
    console.log("hasNoCoupons", that.data.hasNoCoupons)
    if (that.data.hasNoCoupons){
      setTimeout(()=>{
        that.setData({
          display: "display:none"
        })
      },500)
    }
  },

  //下拉刷新
  onPullDownRefresh: function () {
    var that = this
    wx.showNavigationBarLoading()
    that.onLoad()
    wx.hideNavigationBarLoading() //完成停止加载
    wx.stopPullDownRefresh() //停止下拉刷新
  },

  //分享
  onShareAppMessage: function () {
    return {
      title: wx.getStorageSync('mallName') + '——' + app.globalData.shareProfile,
      path: '/pages/finder/index',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },

  //显示
  onShow: function () {
    var that = this;
    
  },
  
  //前往商品详情
  toDetailsTap: function (e) {
    wx.navigateTo({
      url: "/pages/goods-details/index?id=" + e.currentTarget.dataset.id
    })
  },

  //前往搜索
  toSearch: function (e) {
    console.log(e)
    wx.navigateTo({
      url: '/pages/search/index?keyword=' + this.data.keyword,
    })
    console.log(e);
  },

  //获取商品集合
  getGoodsList: function () {
    var that = this;
    var goods = app.globalData.goods
    that.setData({
      goods: app.globalData.goods,
      loadingMoreHidden: true
    });
    if (goods.length == 0) {
      that.setData({
        loadingMoreHidden: false,
        prePageBtn: false,
         nextPageBtn: true,
        toBottom: true
      });
      return;
    }
  },

  couponDisplay:function(){
    var that = this
    that.setData({
      display:"display:none"
    })
  },

  //////////////////////////////////////
  wxSearchFn: function (e) {
    var that = this
    console.log("wxSearchFn")
    that.toSearch();
    WxSearch.wxSearchAddHisKey(that);
  },

  wxSearchInput: function (e) {
    var that = this
    WxSearch.wxSearchInput(e, that);
    console.log("wxSearchInput")
    that.setData({
      keyword: that.data.wxSearchData.value,
    })
  },

  wxSerchFocus: function (e) {
    var that = this
    console.log("wxSerchFocus")
    WxSearch.wxSearchFocus(e, that);
  },
  wxSearchBlur: function (e) {
    var that = this
    console.log("wxSearchBlur")
    WxSearch.wxSearchBlur(e, that);
  },

  wxSearchKeyTap: function (e) {
    var that = this
    WxSearch.wxSearchKeyTap(e, that);
    console.log("wxSearchKeyTap")
    that.setData({
      keyword: that.data.wxSearchData.value,
    })
  },
  wxSearchDeleteKey: function (e) {
    var that = this
    WxSearch.wxSearchDeleteKey(e, that);
  },
  wxSearchDeleteAll: function (e) {
    var that = this;
    WxSearch.wxSearchDeleteAll(that);
  },
  wxSearchTap: function (e) {
    var that = this
    WxSearch.wxSearchHiddenPancel(that);
  }
})
