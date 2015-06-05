xquery version "1.0-ml";
(:~
 : JSON View:
~:)

import module namespace response = "http://xquerrail.com/response" at "/main/node_modules/xquerrail2.framework/dist/_framework/response.xqy";
import module namespace domain = "http://xquerrail.com/domain" at "/main/node_modules/xquerrail2.framework/dist/_framework/domain.xqy";
import module namespace js = "http://xquerrail.com/helper/javascript" at "/main/node_modules/xquerrail2.framework/dist/_framework/helpers/javascript-helper.xqy";
import module namespace json = "http://marklogic.com/xdmp/json" at "/MarkLogic/json/json.xqy";

declare variable $response as map:map external;

response:initialize($response),
let $node := response:body()
return
  if($node) then
    <x>{
      js:object((
        js:keyvalue("response",
          ""
        )
      ))
    }</x>/*
  else ()