xquery version "1.0-ml";
(:~
 : <% if (controllerIncludeModel) { %> Controller: <%= modelDisplayName %> <% } %>
~:)
module namespace controller = "<%= controllerNamespace %>/controllers/<%= controllerName %>";

import module namespace request = "http://xquerrail.com/request" at "/main/node_modules/xquerrail2.framework/dist/_framework/request.xqy";
import module namespace response = "http://xquerrail.com/response" at "/main/node_modules/xquerrail2.framework/dist/_framework/response.xqy";
import module namespace base = "http://xquerrail.com/controller/base" at "/main/node_modules/xquerrail2.framework/dist/_framework/base/base-controller.xqy";
<% if (controllerIncludeModel) { %>
import module namespace model = "<%= modelNamespace %>/models/<%= modelName %>" at "/main/app/models/<%= modelName %>-model.xqy";
<% } %>

declare option xdmp:mapping "false";

declare function custom-action() {
	<custom-action/>
};

<% controllerFunctions.forEach( function(f) { %>
declare function controller:<%= f %>() {
	<<%= f %>/>
};
<% }) %>
