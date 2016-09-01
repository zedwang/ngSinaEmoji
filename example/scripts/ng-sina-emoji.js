/**
 * Created by Zed on 2016/8/9.
 */

(function () {
    'use strict'

    var emotionApp = angular.module('ngSinaEmoji',[])

    .directive('ngSinaEmoji',['$document','SinaEmoji','Constant',function ($document,SinaEmoji,Constant) {
            return {
                restrict:'A',
                require:'ngModel',
                scope:{
                    'appKey':'@',
                    'target':'@'
                },
                link:function (scope,elem, attr, ctrl) {
                    var $ = angular.element;
                    Constant.setKey(scope.appKey);
                    var options = {appKey:Constant.getKey()};
                    $(scope.target).click(function (ev) {
                        ev.stopPropagation();
                        scope.$emit('onEmojiShow');
                        SinaEmoji.show(this,options,function (res) {
                            SinaEmoji.insertText(elem[0],res,ctrl);
                            scope.$emit('onEmojiLoaded');
                        });
                    })

                    $document.click(function () {
                        SinaEmoji.hide();
                    })

                }
            }
        }])
    .factory('SinaEmoji',['$window','RemoteEmoji','Constant',function ($window,RemoteEmoji,Constant) {
            var $ = angular.element;
            var cat_current;
            var cat_page;
            var emotions = new Array();
            var categorys = new Array();

            return {

                show: function (elem, options, cb) {
                    var styles = {
                        top: $(elem).offset().top + $(elem).height() + 8,
                        left: $(elem).offset().left
                    }

                    if ($('#emotions').is(':hidden')) {
                        $('#emotions').css(styles).show()
                    } else {
                        $('body').append('<div id="emotions">正在加载,请稍后</div>');

                        $('#emotions').css(styles);

                        if ($window.localStorage.sinaEmotions) {
                            var data = JSON.parse($window.localStorage.sinaEmotions);
                            createDom(data);
                        } else {
                            RemoteEmoji._getRemoteEmotions({appId: Constant.getKey()})
                                .then(function (res) {
                                    createDom(res.data.data);
                                })
                        }

                    }


                    function createDom(jsonData) {
                        $('#emotions').html('<div style="float:right"><a href="javascript:void(0);" id="prev">&laquo;</a><a href="javascript:void(0);" id="next">&raquo;</a></div><div class="categorys"></div><div class="emoji-container"></div><div class="page"></div>');
                        var data = jsonData;
                        if (!angular.isArray(data)) {
                            $('#emotions .emoji-container').html(data.error);
                            return false;
                        }
                        // 写入缓存
                        $window.localStorage.sinaEmotions = JSON.stringify(data);

                        for (var i in data) {
                            if (data[i].category == '') {
                                data[i].category = '默认';
                            }
                            if (emotions[data[i].category] == undefined) {
                                emotions[data[i].category] = new Array();
                                categorys.push(data[i].category);
                            }
                            emotions[data[i].category].push({name: data[i].phrase, icon: data[i].icon});
                        }
                        $('#emotions #prev').click(function (e) {
                            e.stopPropagation();
                            showCategorys(cat_page - 1);
                        });
                        $('#emotions #next').click(function (e) {
                            e.stopPropagation();
                            showCategorys(cat_page + 1);
                        });
                        showCategorys();
                        showEmotions();
                    }
                    function showCategorys() {
                        var page = arguments[0] ? arguments[0] : 0;
                        if (page < 0 || page >= categorys.length / 5) {
                            return;
                        }
                        $('#emotions .categorys').html('');
                        cat_page = page;
                        for (var i = page * 5; i < (page + 1) * 5 && i < categorys.length; ++i) {
                            $('#emotions .categorys').append($('<a href="javascript:void(0);">' + categorys[i] + '</a>'));
                        }
                        $('#emotions .categorys a').click(function (e) {
                            e.stopPropagation();
                            showEmotions($(this).text());
                        });
                        $('#emotions .categorys a').each(function () {
                            if ($(this).text() == cat_current) {
                                $(this).addClass('current');
                            }
                        });
                    }
                    function showEmotions() {
                        var category = arguments[0] ? arguments[0] : '默认';
                        var page = arguments[1] ? arguments[1] - 1 : 0;
                        $('#emotions .emoji-container').html('');
                        $('#emotions .page').html('');
                        cat_current = category;
                        for (var i = page * 72; i < (page + 1) * 72 && i < emotions[category].length; ++i) {
                            $('#emotions .emoji-container').append($('<a href="javascript:void(0);" title="' + emotions[category][i].name + '"><img src="' + emotions[category][i].icon + '" alt="' + emotions[category][i].name + '" width="22" height="22" /></a>'));
                        }
                        $('#emotions .emoji-container a').click(function (e) {
                            e.stopPropagation();
                            cb($(this).attr('title'))
                            $('#emotions').hide();
                        });
                        for (var i = 1; i < emotions[category].length / 72 + 1; ++i) {
                            $('#emotions .page').append($('<a href="javascript:void(0);"' + (i == page + 1 ? ' class="current"' : '') + '>' + i + '</a>'));
                        }
                        $('#emotions .page a').click(function (e) {
                            e.stopPropagation();
                            showEmotions(category, $(this).text());
                        });
                        $('#emotions .categorys a.current').removeClass('current');
                        $('#emotions .categorys a').each(function () {
                            if ($(this).text() == category) {
                                $(this).addClass('current');
                            }
                        });
                    }
                },
                hide: function () {
                    $('#emotions').hide();
                },
                destroy:function () {
                    if ($('body').has('#emotions')) {
                        $('#emotions').remove();
                    }

                },
                parseEmotions: function (value) {
                    var emotionsMap = {};

                    if ($window.localStorage.sinaEmotions) {
                        var data = JSON.parse($window.localStorage.sinaEmotions)
                        generatorEmotionsMap(data)
                    } else {
                        RemoteEmoji._getRemoteEmotions({appId:Constant.getKey()}).then(function (res) {
                            $window.localStorage.sinaEmotions = JSON.stringify(res.data.data);
                            generatorEmotionsMap($window.localStorage.sinaEmotions)
                        })
                    }
                    return RemoteEmoji._parseEmotions(value,emotionsMap)

                    function generatorEmotionsMap(data) {
                        for (var i = 0; i < data.length; i++) {
                            var obj = data[i];
                            emotionsMap[obj.phrase] = obj.icon;
                        }
                    }

                },
                insertText : function(target,text,ctrl){
                    if(target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {return;}
                    if (document.selection) {
                        target.focus();
                        var cr = document.selection.createRange();
                        cr.text = text;
                        cr.collapse();
                        cr.select();
                        ctrl.$setViewValue(target.value);
                    }else if (target.selectionStart || target.selectionStart == '0') {
                        var
                            start = target.selectionStart,
                            end = target.selectionEnd;
                        target.value = target.value.substring(0, start)+ text+ target.value.substring(end, target.value.length);
                        ctrl.$setViewValue(target.value);

                        target.selectionStart = target.selectionEnd = start+text.length;
                    }else {
                        target.value += text;
                        ctrl.$setViewValue(target.value);
                    }

                }

            }
        }])
        .factory('Constant',function () {
            var appKey = '1362404091';
            return {
                setKey:function (key) {
                    if (key) {
                        appKey = key;
                    }
                },
                getKey : function () {
                    return appKey;
                }
            }
        })
    .provider('RemoteEmoji',function () {
            this.$get = ['$http',function ($http) {
                return {
                    _getRemoteEmotions: function (params) {
                        var url = 'https://api.weibo.com/2/emotions.json';
                        return $http({
                            method:'JSONP',
                            url:url,
                            params:{
                                source:params.appId,
                                callback:'JSON_CALLBACK'
                            }
                        })
                    },
                    _parseEmotions: function (value,_emotionsMap) {

                        var html = value;
                        html = html
                            .replace(/<.*?>/g, function($1) {
                                $1 = $1.replace('[', '[');
                                $1 = $1.replace(']', ']');
                                return $1;
                            })
                            .replace(
                                /\[[^\[\]]*?\]/g,
                                function($1) {
                                    var url = _emotionsMap[$1];
                                    if (url) {
                                        return '<img class="sina-emotion" src="'
                                            + url
                                            + '" alt="'
                                            + $1 + '" />';
                                    }
                                    return $1;
                                });

                        return html;
                    }
                }

            }]
        })



}).call(this)
