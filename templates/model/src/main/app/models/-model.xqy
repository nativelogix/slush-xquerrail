xquery version "1.0-ml";
(:~
 : Model: <%= modelDisplayName %>
~:)
module namespace model = "<%= appNamespace %>/models/<%= modelName %>";

import module namespace domain = "http://xquerrail.com/domain" at "/main/node_modules/xquerrail2.framework/dist/_framework/domain.xqy";
import module namespace base = "http://xquerrail.com/model/base" at "/main/node_modules/xquerrail2.framework/dist/_framework/base/base-model.xqy";

declare option xdmp:mapping "false";

declare function model:model()
{
  domain:get-model("<%= modelName %>")
};
