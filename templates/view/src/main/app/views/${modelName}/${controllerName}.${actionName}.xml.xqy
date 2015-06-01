xquery version "1.0-ml";
(:~
 : XML View: <%= modelDisplayName %>
~:)

import module namespace response = "http://xquerrail.com/response" at "/main/node_modules/xquerrail2.framework/dist/_framework/response.xqy";
import module namespace domain = "http://xquerrail.com/domain" at "/main/node_modules/xquerrail2.framework/dist/_framework/domain.xqy";

declare variable $response as map:map external;

response:initialize($response),
let $node := response:body()
return
  if($node) then
  	<response><%= modelName %></response>
  else ()