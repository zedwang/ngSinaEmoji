### ngSinaEmoji
整合新浪远程表情组件
####Useage

```js
$ npm install ngSinaEmoji
```
```js
var Demo = angular.module('Demo',['ngSinaEmoji'])
```
```html
// 必须要绑定model
 <textarea ng-model="emoji" ng-sina-emoji target="#emotion" app-key="1362404091" cols="50" rows="5"></textarea>
<button id="emotion">表情</button>
```
#### Params
| key  |           value           |
| :--: | :--------------------: |
|  target  |          事件触发元素，必填         |
|  appKey  |         新浪授权ID(可不填，有默认ID)          |
#### Service

```js
        .controller('EmojiCtrl',function ($scope,SinaEmoji) {
            $scope.destroy = function(){
                // 销毁实例
                SinaEmoji.destroy();
                // 解析表情
                SinaEmoji.parseEmotions(value)
            }
        })
        //常常使用过滤器来解析
        .filter('parseEmotions',function (SinaEmoji,$sce) {
            return function (value) {
                return $sce.trustAsHtml(SinaEmoji.parseEmotions(value));
            }
        })
```
