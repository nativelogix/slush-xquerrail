xquery version "1.0-ml";
module namespace test = "http://github.com/robwhitby/xray/test";
import module namespace assert = "http://github.com/robwhitby/xray/assertions" at "/xray/src/assertions.xqy";
import module namespace app = "http://xquerrail.com/application" at "/main/node_modules/xquerrail2.framework/dist/_framework/application.xqy";
import module namespace model = "<%= modelNamespace %>/models/<%= modelName %>" at "/main/app/models/<%= modelName %>-model.xqy";

declare option xdmp:mapping "false";

declare %test:setup function setup() {
  (app:reset(), app:bootstrap())[0]
};

declare %test:case function model-model-test() {
  assert:equal(fn:string(model:model()/@name), "<%= modelName %>")
};
